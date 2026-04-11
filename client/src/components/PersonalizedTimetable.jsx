import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../context/AuthContext';

// Professional SVG Icon Library
const Icons = {
    Search: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
    ),
    Download: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
    ),
    Alert: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
    ),
    Eye: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
    ),
    Book: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M6.5 2H20v20H6.5" /></svg>
    )
};

const PersonalizedTimetable = ({ enableConcerns = false }) => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [timetableData, setTimetableData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load Data
    useEffect(() => {
        const fetchPersonalizedTimetable = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const response = await fetch(`http://localhost:5000/api/configurations/personalized-timetable/${user.user_id}`);
                if (response.ok) {
                    const data = await response.json();
                    setTimetableData(data);
                }

                // Fetch My Concerns
                const concernsRes = await fetch(`http://localhost:5000/api/configurations/my-concerns/${user.user_id}`);
                if (concernsRes.ok) {
                    const concernsData = await concernsRes.json();
                    setMyConcerns(concernsData);
                }
            } catch (error) {
                console.error("Error fetching personalized timetable:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPersonalizedTimetable();
    }, [user]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const filteredData = timetableData.filter(exam => {
        const term = searchTerm.toLowerCase();
        const code = (exam.courseUnit || '').toLowerCase();
        const title = (exam.courseTitle || '').toLowerCase();
        const venue = (exam.venue || '').toLowerCase();
        return code.includes(term) || title.includes(term) || venue.includes(term);
    });

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.text('UNIVERSITY OF KELANIYA', 105, 20, null, null, 'center');
        doc.setFontSize(14);
        doc.text('Faculty of Science', 105, 30, null, null, 'center');
        doc.setFontSize(12);
        doc.text('Department of Industrial Management', 105, 40, null, null, 'center');
        doc.setFontSize(12);

        const academicYear = filteredData.length > 0 && filteredData[0].academicYear
            ? filteredData[0].academicYear
            : '202X/202X';

        doc.text(`Examination Timetable ${academicYear}`, 105, 50, null, null, 'center');

        // Downloader Info
        doc.setFontSize(10);
        doc.text(`Schedule for: ${user?.name || 'Department Staff'}`, 105, 60, null, null, 'center');

        // Table
        const tableColumn = ["Course Unit", "Course Title", "Date", "Time", "Venue", "Assigned Role"];
        const tableRows = filteredData.map(exam => [
            exam.courseUnit,
            exam.courseTitle || 'Unknown Title',
            formatDate(exam.date),
            exam.time,
            exam.venue,
            exam.examinerRole ? `${exam.role}\n(${exam.examinerRole})` : exam.role
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 70,
        });

        doc.save('Personalized_Timetable.pdf');
    };


    const [selectedSessions, setSelectedSessions] = useState([]);
    const [isConcernModalOpen, setIsConcernModalOpen] = useState(false);
    const [isMyConcernsModalOpen, setIsMyConcernsModalOpen] = useState(false);
    const [myConcerns, setMyConcerns] = useState([]);
    const [concernReason, setConcernReason] = useState('');

    const handleCheckboxChange = (id) => {
        if (selectedSessions.includes(id)) {
            setSelectedSessions(selectedSessions.filter(sessionId => sessionId !== id));
        } else {
            setSelectedSessions([...selectedSessions, id]);
        }
    };

    const openConcernModal = () => {
        if (selectedSessions.length === 0) {
            alert("Please select at least one session to report a concern.");
            return;
        }
        setIsConcernModalOpen(true);
        setConcernReason('');
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitConcern = async () => {
        if (!concernReason.trim() || !user) return;

        setIsSubmitting(true);
        try {
            const concernsToReport = selectedSessions.map(allocId => {
                const sessionData = timetableData.find(s => s.allocId === allocId);
                return {
                    allocId: allocId,
                    examId: sessionData.examId,
                    staffId: user.user_id,
                    role: sessionData.role,
                    reason: concernReason
                };
            });

            const response = await fetch('http://localhost:5000/api/configurations/report-concern', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ concerns: concernsToReport })
            });

            if (response.ok) {
                alert('Concerns successfully reported to the Academic Supervisor.');
                setSelectedSessions([]);
                setIsConcernModalOpen(false);
                setConcernReason('');
            } else {
                const data = await response.json();
                alert(`Failed to report concern: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Error reporting concerns:", error);
            alert('An error occurred while reporting concerns.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Personalized Timetable</h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">Review your examination duties and schedule.</p>
                </div>
            </div>

            {/* Filter & Action Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                {/* Search Field */}
                <div className="relative w-full md:w-80">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Icons.Search />
                    </span>
                    <input
                        type="text"
                        placeholder="Search exam or venue..."
                        className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {enableConcerns && (
                        <button
                            onClick={() => setIsMyConcernsModalOpen(true)}
                            className="flex-1 md:flex-none px-4 py-2.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center justify-center gap-2 border border-slate-200 uppercase tracking-wider"
                        >
                            <Icons.Eye />
                            My Concerns
                            {myConcerns.length > 0 && (
                                <span className="ml-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                    {myConcerns.length}
                                </span>
                            )}
                        </button>
                    )}
                    {enableConcerns && (
                        <button
                            onClick={openConcernModal}
                            disabled={selectedSessions.length === 0}
                            className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-wider
                                ${selectedSessions.length > 0
                                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200'}`}
                        >
                            <Icons.Alert />
                            Report ({selectedSessions.length})
                        </button>
                    )}

                    {/* Download Button */}
                    <button
                        onClick={handleDownloadPDF}
                        className="flex-1 md:flex-none px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                    >
                        <Icons.Download />
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Timetable Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                {enableConcerns && <th className="px-6 py-4 w-12 text-center">Select</th>}
                                <th className="px-6 py-4">Course Unit</th>
                                <th className="px-6 py-4">Course Title</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Venue</th>
                                <th className="px-6 py-4">Assigned Role</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={enableConcerns ? "7" : "6"} className="px-6 py-12 text-center text-gray-500">
                                        Loading your timetable...
                                    </td>
                                </tr>
                            ) : filteredData.length > 0 ? (
                                filteredData.map((exam) => {
                                    const reportedConcern = myConcerns.find(c => c.allocId === exam.id);
                                    return (
                                        <tr key={exam.id} className={`transition-colors ${selectedSessions.includes(exam.id) ? 'bg-blue-50/50' : 'hover:bg-blue-50/30'}`}>
                                            {enableConcerns && (
                                                <td className="px-6 py-4">
                                                    {reportedConcern ? (
                                                        <div className="flex flex-col items-start gap-1">
                                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reported</span>
                                                        </div>
                                                    ) : (
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedSessions.includes(exam.id)}
                                                            onChange={() => handleCheckboxChange(exam.id)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                                                        />
                                                    )}
                                                </td>
                                            )}
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-slate-900">{exam.courseUnit}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-slate-600">{exam.courseTitle || 'Unknown Title'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-slate-900">{formatDate(exam.date)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                                                    {exam.time}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-blue-50 text-blue-700">
                                                    {exam.venue}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                    ${exam.role === 'Supervisor' ? 'bg-indigo-50 text-indigo-700' :
                                                            exam.role === 'Invigilator' ? 'bg-teal-50 text-teal-700' :
                                                                'bg-slate-100 text-slate-700'}`}>
                                                        {exam.role}
                                                    </span>
                                                    {exam.examinerRole && (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700">
                                                            {exam.examinerRole}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={enableConcerns ? "7" : "6"} className="px-6 py-12 text-center text-gray-400">
                                        <p className="text-lg mb-2">No exams found matching your search.</p>
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="text-blue-600 hover:underline font-medium"
                                        >
                                            Clear filters to view all
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">
                        Showing {filteredData.length} of {timetableData.length} exams
                    </span>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors block"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Concern Reporting Modal */}
            {isConcernModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">

                    {/* Background overlay */}
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={() => setIsConcernModalOpen(false)}></div>

                    {/* Modal Panel Container - Flex Centering */}
                    <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
                        <div className="relative bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-lg w-full z-50">
                            <div className="bg-white px-6 pt-6 pb-6">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xl leading-6 font-bold text-gray-900" id="modal-title">
                                                Report Concern to Supervisor
                                            </h3>
                                            <button onClick={() => setIsConcernModalOpen(false)} className="text-gray-400 hover:text-gray-500 bg-transparent border-0 cursor-pointer">
                                                <span className="text-2xl">×</span>
                                            </button>
                                        </div>

                                        <p className="text-sm text-gray-500 mb-4">
                                            You are reporting a concern for <span className="font-bold text-gray-800">{selectedSessions.length}</span> session(s).
                                        </p>

                                        {/* Scrollable List of Selected Sessions */}
                                        <div className="max-h-60 overflow-y-auto mb-6 bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200">
                                            {filteredData.filter(exam => selectedSessions.includes(exam.id)).map(session => (
                                                <div key={session.id} className="p-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-800">{session.courseUnit}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">{session.courseTitle || 'Unknown Title'}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">{formatDate(session.date)} • {session.time}</p>
                                                        </div>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white border border-gray-200 text-gray-600">
                                                            {session.venue}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="concern-reason" className="block text-sm font-bold text-gray-900 mb-2">
                                                    Reason for Concern <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    id="concern-reason"
                                                    rows="4"
                                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-3"
                                                    placeholder="Please explain the reason for requesting reschedule..."
                                                    value={concernReason}
                                                    onChange={(e) => setConcernReason(e.target.value)}
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse border-t border-gray-100">
                                <button
                                    type="button"
                                    disabled={!concernReason.trim() || isSubmitting}
                                    className={`w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors
                                        ${concernReason.trim() && !isSubmitting ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-300 cursor-not-allowed'}`}
                                    onClick={handleSubmitConcern}
                                >
                                    {isSubmitting ? 'Submitting...' : `Submit Request (${selectedSessions.length})`}
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setIsConcernModalOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* My Concerns Summary Modal */}
            {isMyConcernsModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    {/* Background overlay */}
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={() => setIsMyConcernsModalOpen(false)}></div>

                    {/* Modal Panel Container */}
                    <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
                        <div className="relative bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-2xl w-full z-50">
                            <div className="bg-white px-6 pt-6 pb-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl leading-6 font-bold text-gray-900 flex items-center">
                                        <span className="mr-2">📝</span> My Reported Concerns
                                    </h3>
                                    <button onClick={() => setIsMyConcernsModalOpen(false)} className="text-gray-400 hover:text-gray-500 transition-colors">
                                        <span className="text-2xl">×</span>
                                    </button>
                                </div>

                                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                    {myConcerns.length > 0 ? (
                                        myConcerns.map((concern) => (
                                            <div key={concern.id} className={`p-4 rounded-xl border-l-4 shadow-sm ${concern.status === 'Resolved' ? 'bg-gray-50 border-green-500' : 'bg-white border-amber-500 ring-1 ring-gray-100'}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="text-sm font-bold text-gray-900">{concern.course}</h4>
                                                        <p className="text-xs text-gray-500">{concern.courseTitle}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${concern.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {concern.status}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-600 mb-3">
                                                    <span className="inline-block mr-4">📅 {concern.examDate}</span>
                                                    <span className="inline-block">⏰ {concern.time}</span>
                                                    <span className="inline-block ml-4 text-indigo-600 font-medium">🎭 Role: {concern.role}</span>
                                                </div>
                                                <div className="bg-amber-50 rounded p-3 text-sm text-gray-700 border border-amber-100">
                                                    <p className="font-semibold text-xs text-amber-800 mb-1">Reason for concern:</p>
                                                    {concern.description}
                                                </div>
                                                {concern.status === 'Resolved' && concern.replacementName && (
                                                    <div className="mt-3 text-sm text-green-700 font-medium flex items-center bg-green-50/50 p-2 rounded">
                                                        <span className="mr-2">✅</span> Reassigned to: {concern.replacementName}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>You haven't reported any concerns yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PersonalizedTimetable;
