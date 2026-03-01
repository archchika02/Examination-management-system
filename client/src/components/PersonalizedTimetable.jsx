import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useAuth } from '../context/AuthContext';

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
            } catch (error) {
                console.error("Error fetching personalized timetable:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPersonalizedTimetable();
    }, [user]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        try {
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (e) {
            return dateString;
        }
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
        doc.text('Examination Timetable 2023/2024', 105, 40, null, null, 'center');

        // Table
        const tableColumn = ["Course Unit", "Course Title", "Date", "Time", "Venue", "Role"];
        const tableRows = filteredData.map(exam => [
            exam.courseUnit,
            exam.courseTitle || 'Unknown Title',
            formatDate(exam.date),
            exam.time,
            exam.venue,
            exam.role
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 50,
        });

        doc.save('Personalized_Timetable.pdf');
    };


    const [selectedSessions, setSelectedSessions] = useState([]);
    const [isConcernModalOpen, setIsConcernModalOpen] = useState(false);
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

    const handleSubmitConcern = () => {
        if (!concernReason.trim()) return;

        // Mock submission logic
        alert(`Concern reported for ${selectedSessions.length} session(s).\nReason: ${concernReason}`);

        // Reset selection and close modal
        setSelectedSessions([]);
        setIsConcernModalOpen(false);
        setConcernReason('');
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up pb-10">
            {/* Header Section */}
            <div>
                <h2 className="text-3xl font-bold text-gray-800">Personalized Timetable</h2>
                <p className="text-gray-500 mt-1">View and download your examination timetable</p>
            </div>

            {/* Filter & Action Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                {/* Search Field */}
                <div className="relative w-full md:w-96">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        🔍
                    </span>
                    <input
                        type="text"
                        placeholder="Search course or venue..."
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    {enableConcerns && (
                        <button
                            onClick={openConcernModal}
                            disabled={selectedSessions.length === 0}
                            className={`w-full md:w-auto px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-95
                                ${selectedSessions.length > 0
                                    ? 'bg-orange-500 hover:bg-orange-600 text-white hover:shadow-orange-500/30'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
                        >
                            <span className="text-xl">⚠️</span>
                            Report Concerns ({selectedSessions.length})
                        </button>
                    )}

                    {/* Download Button */}
                    <button
                        onClick={handleDownloadPDF}
                        className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                    >
                        <span className="text-xl">⬇️</span>
                        Download Timetable
                    </button>
                </div>
            </div>

            {/* Timetable Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                                {enableConcerns && <th className="px-6 py-4 w-12">Select</th>}
                                <th className="px-6 py-4 font-bold">Course Unit</th>
                                <th className="px-6 py-4 font-bold">Course Title</th>
                                <th className="px-6 py-4 font-bold">Date</th>
                                <th className="px-6 py-4 font-bold">Time</th>
                                <th className="px-6 py-4 font-bold">Venue</th>
                                <th className="px-6 py-4 font-bold">Assigned Role</th>
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
                                filteredData.map((exam) => (
                                    <tr key={exam.id} className={`transition-colors ${selectedSessions.includes(exam.id) ? 'bg-blue-50/50' : 'hover:bg-blue-50/30'}`}>
                                        {enableConcerns && (
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSessions.includes(exam.id)}
                                                    onChange={() => handleCheckboxChange(exam.id)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                                                />
                                            </td>
                                        )}
                                        <td className="px-6 py-4 font-bold text-gray-800">{exam.courseUnit}</td>
                                        <td className="px-6 py-4 text-gray-700">{exam.courseTitle || 'Unknown Title'}</td>
                                        <td className="px-6 py-4 text-gray-600">{formatDate(exam.date)}</td>
                                        <td className="px-6 py-4 text-gray-600 font-mono bg-gray-50/50 rounded">{exam.time}</td>
                                        <td className="px-6 py-4 text-indigo-600 font-medium">{exam.venue}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                                                ${exam.role === 'Supervisor' ? 'bg-purple-100 text-purple-800' :
                                                    exam.role === 'Invigilator' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'}`}>
                                                {exam.role}
                                            </span>
                                        </td>
                                    </tr>
                                ))
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
                                    disabled={!concernReason.trim()}
                                    className={`w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors
                                        ${concernReason.trim() ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-300 cursor-not-allowed'}`}
                                    onClick={handleSubmitConcern}
                                >
                                    Submit Request ({selectedSessions.length})
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
        </div>
    );
};

export default PersonalizedTimetable;
