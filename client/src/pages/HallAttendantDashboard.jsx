import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const HallAttendantDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // State for sessions and concerns
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [myConcerns, setMyConcerns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingConcerns, setLoadingConcerns] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isMyConcernsModalOpen, setIsMyConcernsModalOpen] = useState(false);

    const fetchData = async () => {
        if (!user?.user_id) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/configurations/attendant-published-exams?attendantId=${user.user_id}`);
            if (res.ok) {
                const data = await res.json();
                setUpcomingSessions(data.map(s => ({ ...s, selected: false })));
            }
        } catch (err) {
            console.error("Error fetching sessions:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyConcerns = async () => {
        if (!user?.user_id) return;
        setLoadingConcerns(true);
        try {
            const response = await fetch(`http://localhost:5000/api/configurations/my-concerns/${user.user_id}`);
            if (response.ok) {
                const data = await response.json();
                setMyConcerns(data);
            }
        } catch (err) {
            console.error("Error fetching my concerns:", err);
        } finally {
            setLoadingConcerns(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchMyConcerns();
    }, [user?.user_id]);

    const [selectedSessions, setSelectedSessions] = useState([]);
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [rescheduleList, setRescheduleList] = useState([]); // List of sessions being rescheduled
    const [rescheduleReason, setRescheduleReason] = useState('');

    // Handlers
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleCheckboxChange = (id) => {
        if (selectedSessions.includes(id)) {
            setSelectedSessions(selectedSessions.filter(sessionId => sessionId !== id));
        } else {
            setSelectedSessions([...selectedSessions, id]);
        }
    };

    const handleDownloadPDF = () => {
        if (upcomingSessions.length === 0) return;

        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.text('UNIVERSITY OF KELANIYA', 105, 20, null, null, 'center');
        doc.setFontSize(14);
        doc.text('Faculty of Science', 105, 30, null, null, 'center');
        doc.setFontSize(12);
        doc.text('Hall Attendant Examination Timetable', 105, 40, null, null, 'center');

        // Downloader Info
        doc.setFontSize(10);
        doc.text(`Schedule for: ${user?.name || 'Hall Attendant'}`, 105, 50, null, null, 'center');

        // Table
        const tableColumn = ["Date", "Time", "Course Unit", "Venue"];
        const tableRows = upcomingSessions.map(session => [
            session.date,
            session.time,
            session.courseUnit,
            session.venue
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 60,
            theme: 'striped',
            headStyles: { fillColor: [30, 64, 175] }, // Blue-800
            styles: { fontSize: 9 }
        });

        doc.save(`${user?.name || 'Hall_Attendant'}_Timetable.pdf`);
    };

    const openRescheduleModal = () => {
        if (selectedSessions.length === 0) {
            alert("Please select at least one session to reschedule.");
            return;
        }
        const sessionsToReschedule = upcomingSessions.filter(s => selectedSessions.includes(s.id));
        if (sessionsToReschedule.length > 0) {
            setRescheduleList(sessionsToReschedule);
            setIsRescheduleModalOpen(true);
            setRescheduleReason('');
        }
    };

    const handleRescheduleSubmit = async () => {
        if (!rescheduleReason.trim() || submitting) return;

        setSubmitting(true);
        try {
            const idsSubmitted = rescheduleList.map(s => s.id);

            // Submit each concern to the backend
            // Note: Using for...of ensures sequential and predictable execution
            for (const session of rescheduleList) {
                const response = await fetch('http://localhost:5000/api/configurations/report-concern', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.user_id,
                        role: user.role,
                        allocId: session.id, // session.id is the alloc_id
                        examId: session.exam_id,
                        reason: rescheduleReason
                    })
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || `Failed to report concern for ${session.courseUnit}`);
                }
            }

            // If we reach here, all reports succeeded
            alert("Your concern has been reported to the Faculty Staff.");

            // Refresh lists to show the "Reported" labels without removing rows
            await fetchData();
            setSelectedSessions([]);
            fetchMyConcerns();

            setIsRescheduleModalOpen(false);
            setRescheduleList([]);
            setRescheduleReason('');
        } catch (err) {
            console.error("Error in handleRescheduleSubmit:", err);
            // Distinguish between backend error and frontend logic error
            alert(`Error: ${err.message || "Failed to report concern. Please try again."}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm z-10 sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">EMS | Hall Attendant</h1>
                    </div>

                    <div className="flex items-center space-x-6">
                        <button className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors">
                            <span className="text-xl">🔔</span>
                            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                        </button>

                        <div className="flex items-center space-x-3">
                            <div className="flex flex-col items-end hidden md:flex">
                                <span className="text-sm font-semibold text-gray-700">{user?.name || 'Hall Attendant'}</span>
                                <span className="text-xs text-gray-500">{user?.userId || 'ID: HA-001'}</span>
                            </div>
                            <div className="h-9 w-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                                {user?.name?.charAt(0) || 'H'}
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="text-gray-500 hover:text-red-600 transition-colors"
                            title="Logout"
                        >
                            <span className="text-xl">🚪<b>Logout</b></span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Section 1: Upcoming Exams */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Upcoming Exams</h2>
                            <p className="text-sm text-gray-500 mt-1">Select and confirm your assigned duties.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleDownloadPDF}
                                disabled={upcomingSessions.length === 0}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2
                                    ${upcomingSessions.length > 0
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                            >
                                <span className="text-lg">⬇️</span>
                                Download Timetable
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 w-12">

                                    </th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Time</th>
                                    <th className="px-6 py-4">Course Unit</th>
                                    <th className="px-6 py-4">Venue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 text-sm">
                                            <div className="flex flex-col items-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                                Loading your assignments...
                                            </div>
                                        </td>
                                    </tr>
                                ) : upcomingSessions.length > 0 ? (
                                    upcomingSessions.map((session) => (
                                        <tr key={session.id} className={`hover:bg-blue-50/30 transition-colors ${selectedSessions.includes(session.id) ? 'bg-blue-50/50' : ''}`}>
                                            <td className="px-6 py-4">
                                                {session.has_pending_concern > 0 ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200">
                                                        REPORTED
                                                    </span>
                                                ) : (
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSessions.includes(session.id)}
                                                        onChange={() => handleCheckboxChange(session.id)}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                                                        title="Mark for Confirmation or Reschedule"
                                                    />
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 font-medium whitespace-nowrap">
                                                {session.date}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{session.time}</td>
                                            <td className="px-6 py-4 text-sm text-gray-800 font-semibold">{session.courseUnit}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    📍 {session.venue}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 text-sm">
                                            No upcoming sessions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className="flex justify-between items-center">
                    <button
                        onClick={() => setIsMyConcernsModalOpen(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-sm font-bold hover:bg-orange-100 transition-all shadow-sm"
                    >
                        <span>📝</span>
                        <span>View My Concerns</span>
                    </button>

                    <button
                        onClick={openRescheduleModal}
                        disabled={selectedSessions.length === 0}
                        className={`px-4 py-2 border font-medium rounded-lg transition-all text-sm shadow-sm
                             ${selectedSessions.length > 0
                                ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                                : 'bg-gray-100 border-transparent text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Report Selected ({selectedSessions.length})
                    </button>
                </div>

            </main>

            {/* Reschedule Request Modal */}
            {isRescheduleModalOpen && rescheduleList.length > 0 && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">

                    {/* Background overlay */}
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={() => setIsRescheduleModalOpen(false)}></div>

                    {/* Modal Panel Container - Flex Centering */}
                    <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">

                        <div className="relative bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-lg w-full z-50">

                            {/* Modal Content */}
                            <div className="bg-white px-6 pt-6 pb-6">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xl leading-6 font-bold text-gray-900" id="modal-title">
                                                Request Reschedule
                                            </h3>
                                            <button onClick={() => setIsRescheduleModalOpen(false)} className="text-gray-400 hover:text-gray-500 bg-transparent border-0 cursor-pointer">
                                                <span className="text-2xl">×</span>
                                            </button>
                                        </div>

                                        <p className="text-sm text-gray-500 mb-4">
                                            You are requesting to reschedule <span className="font-bold text-gray-800">{rescheduleList.length}</span> session(s).
                                        </p>

                                        {/* Scrollable List of Selected Sessions */}
                                        <div className="max-h-60 overflow-y-auto mb-6 bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200">
                                            {rescheduleList.map(session => (
                                                <div key={session.id} className="p-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-800">{session.courseUnit}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">{session.date} • {session.time}</p>
                                                        </div>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white border border-gray-200 text-gray-600">
                                                            {session.venue}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-4">
                                            {/* Reason Input */}
                                            <div>
                                                <label htmlFor="reason" className="block text-sm font-bold text-gray-900 mb-2">Reason<span className="text-red-500">*</span></label>
                                                <textarea
                                                    id="reason"
                                                    rows="4"
                                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-3"
                                                    placeholder="Please explain the reason for requesting reschedule..."
                                                    value={rescheduleReason}
                                                    onChange={(e) => setRescheduleReason(e.target.value)}
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse border-t border-gray-100">
                                <button
                                    type="button"
                                    disabled={!rescheduleReason.trim() || submitting}
                                    className={`w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors
                                        ${rescheduleReason.trim() && !submitting ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
                                    onClick={handleRescheduleSubmit}
                                >
                                    {submitting ? 'Submitting...' : `Submit Request (${rescheduleList.length})`}
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setIsRescheduleModalOpen(false)}
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
                                    {loadingConcerns ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
                                            Loading your concerns...
                                        </div>
                                    ) : myConcerns.length > 0 ? (
                                        myConcerns.map((concern) => (
                                            <div key={concern.id} className={`p-4 rounded-xl border-l-4 shadow-sm ${concern.status === 'Approved' ? 'bg-gray-50 border-green-500' : concern.status === 'Rejected' ? 'bg-red-50 border-red-500' : 'bg-white border-amber-500 ring-1 ring-gray-100'}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="text-sm font-bold text-gray-900">{concern.course || concern.courseUnit}</h4>
                                                        <p className="text-xs text-gray-500">{concern.courseTitle}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${concern.status === 'Approved' ? 'bg-green-100 text-green-700' : concern.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {concern.status}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-600 mb-3">
                                                    <span className="inline-block mr-4">📅 {concern.examDate || concern.date}</span>
                                                    <span className="inline-block">⏰ {concern.time}</span>
                                                    <span className="inline-block ml-4 text-indigo-600 font-medium font-bold">📍 {concern.venue}</span>
                                                </div>
                                                <div className="bg-amber-50 rounded p-3 text-sm text-gray-700 border border-amber-100">
                                                    <p className="font-semibold text-xs text-amber-800 mb-1">Reason for concern:</p>
                                                    {concern.reason || concern.description}
                                                </div>
                                                {concern.status === 'Approved' && concern.replacementName && (
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
                            <div className="bg-gray-50 px-6 py-4 flex justify-end">
                                <button
                                    type="button"
                                    className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                                    onClick={() => setIsMyConcernsModalOpen(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HallAttendantDashboard;
