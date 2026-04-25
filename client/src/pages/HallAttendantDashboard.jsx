import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import RoleNotificationsPanel from '../components/RoleNotificationsPanel';

// Professional SVG Icon Library
const Icons = {
    Bell: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
    ),
    Logout: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
    ),
    Download: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
    ),
    FileText: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
    ),
    MapPin: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
    ),
    AlertCircle: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12" y1="16" y2="16" /></svg>
    ),
    Eye: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
    ),
    Clock: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    ),
    Calendar: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
    ),
    Check: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
    ),
    X: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" /></svg>
    )
};

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
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [supervisorFilter, setSupervisorFilter] = useState('');

    // Poll unread count from API per user
    useEffect(() => {
        const refresh = async () => {
            if (!user?.user_id) return;
            try {
                // Fetch Deadline unread count
                const res = await fetch(
                    `http://localhost:5000/api/deadlines/unread-count?userId=${user.user_id}&role=${encodeURIComponent('Hall Attendant')}`
                );

                // Fetch Activity unread count
                const activityRes = await fetch(
                    `http://localhost:5000/api/dashboard/activities/unread-count?userId=${user.user_id}`
                );

                let totalCount = 0;
                if (res.ok) {
                    const { count } = await res.json();
                    totalCount += count;
                }
                if (activityRes.ok) {
                    const { count } = await activityRes.json();
                    totalCount += count;
                }

                setUnreadCount(totalCount);
            } catch { /* ignore */ }
        };
        refresh();
        const interval = setInterval(refresh, 10000);
        return () => clearInterval(interval);
    }, [user?.user_id]);

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

    const handleGenerateSummaryReport = () => {
        if (upcomingSessions.length === 0) return;

        const doc = new jsPDF('landscape');

        // Format today's date (DD/MM/YYYY)
        const now = new Date();
        const today = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

        const firstSession = upcomingSessions[0];
        const academicYearDisplay = firstSession?.academicYear || 'N/A';

        // Add University Logo in top left
        // Note: Using the logo moved to public folder.
        // For jspdf in browser context, /uni-logo.png should be accessible
        doc.addImage('/uni-logo.png', 'PNG', 15, 10, 25, 25);

        // Heading
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("UNIVERSITY OF KELANIYA", 148, 15, { align: 'center' });
        doc.setFontSize(14);
        doc.text("Faculty of Science", 148, 22, { align: 'center' });
        doc.setFontSize(12);
        doc.text("Department of Industrial Management", 148, 29, { align: 'center' });

        doc.setFontSize(14);
        doc.text(`Duty Schedule Summary Report - Academic Year: ${academicYearDisplay}`, 148, 38, { align: 'center' });

        // Hall Attendant Name
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(`Hall Attendant Name: ${user?.name || 'N/A'}`, 15, 43);

        // Table headers: No Date Venue Course Unit Start Time End Time Duration Supervisor Name Supervisor Signature
        const tableColumn = [
            "No", "Date", "Venue", "Course Unit", "Start Time", "End Time", "Duration", "Supervisor Name", "Supervisor Signature"
        ];

        const tableRows = upcomingSessions.map((session, index) => {
            let durationStr = 'N/A';
            if (session.durationMinutes !== null && session.durationMinutes !== undefined) {
                const h = Math.floor(session.durationMinutes / 60);
                const m = session.durationMinutes % 60;
                durationStr = `${h}h ${m}m`;
            }
            return [
                index + 1,
                session.date || 'N/A',
                session.venue || 'N/A',
                session.courseUnit || 'N/A',
                session.startTime || 'N/A',
                session.endTime || 'N/A',
                durationStr,
                session.supervisorName || 'N/A',
                "" // Placeholder for signature
            ];
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'grid',
            headStyles: { fillColor: [241, 245, 249], textColor: [0, 0, 0], lineWidth: 0.1 },
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: {
                8: { cellWidth: 40 } // Give more space for signature
            }
        });

        // Bottom left: date generated
        const finalY = doc.lastAutoTable.finalY || 150;
        doc.setFontSize(10);
        doc.text(`Report Generated Date: ${today}`, 25, finalY + 20);

        // Bottom right: signature of hall attendants
        doc.text('..................................................', 230, finalY + 20);
        doc.text('Signature of Hall Attendant', 235, finalY + 25);

        doc.save(`Duty_Schedule_Summary_${user?.name || 'HA'}.pdf`);
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

    const uniqueSupervisors = [...new Set(upcomingSessions.map(s => s.supervisorName).filter(Boolean))].sort();
 
     const filteredSessions = upcomingSessions.filter(s =>
         !supervisorFilter || s.supervisorName === supervisorFilter
     );
 
     return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-xl font-black text-white tracking-tight uppercase tracking-widest text-xs">EMS | Registry</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hall Attendant Services</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <button
                            className="relative p-2.5 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all group"
                            onClick={() => setShowNotifications(prev => !prev)}
                        >
                            <Icons.Bell />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-600 border-2 border-slate-900 rounded-full text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        <div className="flex items-center gap-4 pl-4 border-l border-slate-800">
                            <div className="flex flex-col items-end hidden md:flex">
                                <span className="text-xs font-black text-white uppercase tracking-widest">{user?.name}</span>                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all group"
                            title="Logout"
                        >
                            <Icons.Logout />
                            <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">Log Out</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Notifications Panel */}
            {showNotifications && (
                <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowNotifications(false)}></div>
                    <div className="relative w-full max-w-lg bg-white shadow-2xl h-full flex flex-col animate-slide-in-right">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest text-xs">Security & Alerts</h2>
                                <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">System Broadcasts</p>
                            </div>
                            <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                                <Icons.X />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <RoleNotificationsPanel roleName="Hall Attendant" />
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">

                {/* Section 1: Assignments */}
                <section className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-fade-in-up">
                    <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:justify-between md:items-center gap-6 bg-slate-50/30">
                        <div className="flex items-center gap-5">
                            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-200">
                                <Icons.FileText />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest text-xs">Exam Duties</h2>
                                <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Personal Schedule</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Supervisor Filter */}
                            <div className="relative min-w-[200px]">
                                <select
                                    value={supervisorFilter}
                                    onChange={(e) => setSupervisorFilter(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-sm"
                                >
                                    <option value="">All Supervisors</option>
                                    {uniqueSupervisors.map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                </div>
                            </div>

                            <button
                                onClick={handleDownloadPDF}
                                disabled={upcomingSessions.length === 0}
                                className="group relative overflow-hidden inline-flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-slate-800 active:scale-95 shadow-xl shadow-slate-200"
                            >
                                <Icons.Download />
                                <span>Export Timetable</span>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-8 py-5 w-16"></th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Time</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Course Unit</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Supervisor</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Location</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching assignments...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredSessions.length > 0 ? (
                                    filteredSessions.map((session) => (
                                        <tr key={session.id} className={`hover:bg-slate-50/50 transition-all group ${selectedSessions.includes(session.id) ? 'bg-blue-50/30' : ''}`}>
                                            <td className="px-8 py-5">
                                                {session.has_pending_concern > 0 ? (
                                                    <div className="  bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm" title="Reported">
                                                        Reported
                                                    </div>
                                                ) : (
                                                    <div className="relative">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedSessions.includes(session.id)}
                                                            onChange={() => handleCheckboxChange(session.id)}
                                                            className="peer h-6 w-6 rounded-lg border-2 border-slate-200 text-blue-600 focus:ring-0 transition-all cursor-pointer opacity-0 absolute inset-0 z-10"
                                                        />
                                                        <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedSessions.includes(session.id) ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200 group-hover:border-slate-300'}`}>
                                                            {selectedSessions.includes(session.id) && <Icons.Check />}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                                        <Icons.Calendar />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-900">{session.date}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                                        <Icons.Clock />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-600">{session.time}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 leading-tight">{session.courseUnit.split(' - ')[0]}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{session.courseUnit.split(' - ')[1]}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500 font-bold text-[9px] uppercase">
                                                        SV
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700">{session.supervisorName || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl font-black text-[10px] uppercase tracking-widest border border-blue-100">
                                                    <Icons.MapPin />
                                                    {session.venue}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="p-4 bg-slate-50 rounded-2xl text-slate-300">
                                                    <Icons.Eye />
                                                </div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                                                    {supervisorFilter ? `No sessions found for ${supervisorFilter}` : 'No upcoming duties found'}
                                                    <br />Check back later for updates
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer Actions */}
                    <div className="p-8 bg-slate-50/30 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsMyConcernsModalOpen(true)}
                                className="group inline-flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-slate-50 active:scale-95 shadow-sm"
                            >
                                <Icons.AlertCircle />
                                <span>My Reported Concerns</span>
                            </button>

                            <button
                                onClick={handleGenerateSummaryReport}
                                disabled={upcomingSessions.length === 0}
                                className="group inline-flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-slate-50 active:scale-95 shadow-sm disabled:opacity-50"
                            >
                                <Icons.FileText />
                                <span>Summary Report</span>
                            </button>
                        </div>

                        <button
                            onClick={openRescheduleModal}
                            disabled={selectedSessions.length === 0}
                            className={`group inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-200 active:scale-95
                                 ${selectedSessions.length > 0 ? 'hover:bg-blue-700' : 'opacity-50 grayscale cursor-not-allowed'}
                            `}
                        >
                            <Icons.AlertCircle />
                            <span>Report Concern ({selectedSessions.length})</span>
                        </button>
                    </div>
                </section>
            </main>

            {/* Reschedule Request Modal */}
            {isRescheduleModalOpen && rescheduleList.length > 0 && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsRescheduleModalOpen(false)}></div>
                    <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-modal-pop">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-200">
                                    <Icons.AlertCircle />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest text-xs">Report Duty Concern</h2>
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Reschedule Request</p>
                                </div>
                            </div>
                            <button onClick={() => setIsRescheduleModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                                <Icons.X />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-6 space-y-4 max-h-[12rem] overflow-y-auto custom-scrollbar">
                                {rescheduleList.map(session => (
                                    <div key={session.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <div>
                                            <p className="text-sm font-black text-slate-900">{session.courseUnit.split(' - ')[0]}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{session.date} • {session.time}</p>
                                        </div>
                                        <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-xl font-black text-[9px] uppercase tracking-widest border border-blue-100">
                                            {session.venue}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Reason for Concern</label>
                                <textarea
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-900 placeholder:text-slate-300 text-sm resize-none"
                                    rows="4"
                                    placeholder="Explain your situation briefly..."
                                    value={rescheduleReason}
                                    onChange={(e) => setRescheduleReason(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex flex-col sm:flex-row-reverse gap-4">
                            <button
                                onClick={handleRescheduleSubmit}
                                disabled={!rescheduleReason.trim() || submitting}
                                className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-50"
                            >
                                {submitting ? 'Processing...' : `Submit Request (${rescheduleList.length})`}
                            </button>
                            <button
                                onClick={() => setIsRescheduleModalOpen(false)}
                                className="flex-1 px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-slate-50 active:scale-95 shadow-sm"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Concerns Summary Modal */}
            {isMyConcernsModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsMyConcernsModalOpen(false)}></div>
                    <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-modal-pop h-[80vh] flex flex-col">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-200">
                                    <Icons.FileText />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest text-xs">Registry Status</h2>
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Reported Concerns</p>
                                </div>
                            </div>
                            <button onClick={() => setIsMyConcernsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                                <Icons.X />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                            {loadingConcerns ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Updating data...</p>
                                </div>
                            ) : myConcerns.length > 0 ? (
                                myConcerns.map((concern) => (
                                    <div key={concern.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group hover:border-blue-200 transition-all">
                                        <div className="p-6 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 leading-tight">{concern.course || concern.courseUnit}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{concern.examDate || concern.date} • {concern.time}</p>
                                                </div>
                                                <div className={`px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest border ${concern.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    concern.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                        'bg-orange-50 text-orange-700 border-orange-100'
                                                    }`}>
                                                    {concern.status}
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 rounded-2xl p-5 space-y-2 border border-slate-50">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">My Reported Statement:</p>
                                                <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{concern.reason || concern.description}"</p>
                                            </div>

                                            {concern.status === 'Approved' && concern.replacementName && (
                                                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50/50 rounded-2xl border border-emerald-50">
                                                    <div className="p-1.5 bg-emerald-500 rounded-lg text-white">
                                                        <Icons.Check />
                                                    </div>
                                                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Reassigned: {concern.replacementName}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                                    <Icons.Eye />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No active concerns found</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-slate-50/30 border-t border-slate-50">
                            <button
                                onClick={() => setIsMyConcernsModalOpen(false)}
                                className="w-full px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-slate-50 active:scale-95 shadow-sm"
                            >
                                Close Summary
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HallAttendantDashboard;
