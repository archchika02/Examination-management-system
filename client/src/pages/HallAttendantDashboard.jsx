
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HallAttendantDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // State for sessions and selections
    const [upcomingSessions, setUpcomingSessions] = useState([
        { id: 1, date: '2026-02-15', time: '09:00 AM - 11:00 AM', courseUnit: 'INTE 22283 - Mobile Applications Development', venue: 'Hall A', selected: false },
        { id: 2, date: '2026-02-18', time: '01:00 PM - 03:00 PM', courseUnit: 'INTE 22263 - Embedded Systems Development', venue: 'Hall B', selected: false },
        { id: 3, date: '2026-02-20', time: '09:00 AM - 12:00 PM', courseUnit: 'INTE 21343 - Software Engineering Concepts', venue: 'Hall C', selected: false },
        { id: 4, date: '2026-02-22', time: '09:00 AM - 11:00 AM', courseUnit: 'INTE 22253 - Distributed Systems and Cloud Computing', venue: 'Hall D', selected: false },
    ]);

    const [updatedAllocations, setUpdatedAllocations] = useState([
        { id: 101, originalDate: '2026-02-10', updatedDate: '2026-02-12', courseUnit: 'INTE 21213 - Information Systems Modelling', venue: 'Hall A', status: 'Pending Request' },
    ]);

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

    const handleConfirmSelected = () => {
        const confirmed = upcomingSessions.filter(session => selectedSessions.includes(session.id));
        const newAllocations = confirmed.map(session => ({
            id: session.id,
            originalDate: session.date,
            updatedDate: session.date,
            courseUnit: session.courseUnit,
            venue: session.venue,
            status: 'Confirmed'
        }));

        setUpdatedAllocations([...updatedAllocations, ...newAllocations]);
        setUpcomingSessions(upcomingSessions.filter(session => !selectedSessions.includes(session.id)));
        setSelectedSessions([]);
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

    const handleRescheduleSubmit = () => {
        if (!rescheduleReason.trim()) return;

        if (rescheduleList.length > 0) {
            const newRequests = rescheduleList.map(session => ({
                id: Date.now() + Math.random(), // Unique ID generation
                originalDate: session.date,
                updatedDate: 'Pending',
                courseUnit: session.courseUnit,
                venue: session.venue,
                status: 'Pending Request'
            }));

            setUpdatedAllocations([...updatedAllocations, ...newRequests]);

            // Remove rescheduled items from upcoming list
            const rescheduledIds = rescheduleList.map(s => s.id);
            setUpcomingSessions(upcomingSessions.filter(session => !rescheduledIds.includes(session.id)));
            setSelectedSessions([]);

            setIsRescheduleModalOpen(false);
            setRescheduleList([]);
            setRescheduleReason('');
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
                                onClick={handleConfirmSelected}
                                disabled={selectedSessions.length === 0}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm
                                    ${selectedSessions.length > 0
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                            >
                                Confirm Selected ({selectedSessions.length})
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
                                {upcomingSessions.length > 0 ? (
                                    upcomingSessions.map((session) => (
                                        <tr key={session.id} className={`hover:bg-blue-50/30 transition-colors ${selectedSessions.includes(session.id) ? 'bg-blue-50/50' : ''}`}>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSessions.includes(session.id)}
                                                    onChange={() => handleCheckboxChange(session.id)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                                                    title="Mark for Confirmation or Reschedule"
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 font-medium">{session.date}</td>
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

                <div className="flex justify-end">
                    <button
                        onClick={openRescheduleModal}
                        disabled={selectedSessions.length === 0}
                        className={`px-4 py-2 border font-medium rounded-lg transition-all text-sm shadow-sm
                             ${selectedSessions.length > 0
                                ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                                : 'bg-gray-100 border-transparent text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Report Concerns ({selectedSessions.length})
                    </button>
                </div>

                {/* Section 2: Rescheduled & Updated Allocations */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800">Rescheduled & Updated Allocations</h2>
                        <p className="text-sm text-gray-500 mt-1">Track status changes and rescheduled duties.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Original Date</th>
                                    <th className="px-6 py-4">Updated Date</th>
                                    <th className="px-6 py-4">Course Unit</th>
                                    <th className="px-6 py-4">Venue</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {updatedAllocations.map((alloc) => (
                                    <tr key={alloc.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500">{alloc.originalDate}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{alloc.updatedDate}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800">{alloc.courseUnit}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{alloc.venue}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                ${alloc.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                                    alloc.status === 'Rescheduled' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                {alloc.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {updatedAllocations.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 text-sm">
                                            No updates or rescheduled sessions.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

            </main>

            {/* Reschedule Request Modal */}
            {isRescheduleModalOpen && rescheduleList.length > 0 && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={() => setIsRescheduleModalOpen(false)}></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <div className="bg-white px-6 pt-6 pb-6">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xl leading-6 font-bold text-gray-900" id="modal-title">
                                                Request Reschedule
                                            </h3>
                                            <button onClick={() => setIsRescheduleModalOpen(false)} className="text-gray-400 hover:text-gray-500">
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
                            <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse border-t border-gray-100">
                                <button
                                    type="button"
                                    disabled={!rescheduleReason.trim()}
                                    className={`w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors
                                        ${rescheduleReason.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
                                    onClick={handleRescheduleSubmit}
                                >
                                    Submit Request ({rescheduleList.length})
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
                                    disabled={!rescheduleReason.trim()}
                                    className={`w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors
                                        ${rescheduleReason.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
                                    onClick={handleRescheduleSubmit}
                                >
                                    Submit Request ({rescheduleList.length})
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
            )
            }
        </div>
    );
};

export default HallAttendantDashboard;
