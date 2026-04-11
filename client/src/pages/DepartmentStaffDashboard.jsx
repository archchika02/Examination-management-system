import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PersonalizedTimetable from '../components/PersonalizedTimetable';
import GenerateMarkingSheet from '../components/GenerateMarkingSheet';
import DepartmentStaffNotifications from '../components/DepartmentStaffNotifications';
import ExaminationIrregularities from '../components/ExaminationIrregularities';

// Professional SVG Icon Library
const Icons = {
    Dashboard: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
    ),
    Calendar: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
    ),
    Report: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="18" y1="20" y2="10" /><line x1="12" x2="12" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="14" /></svg>
    ),
    Bell: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
    ),
    Logout: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
    ),
    Activity: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
    ),
    Alert: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
    ),
    Upload: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
    ),
    Book: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M6.5 2H20v20H6.5" /></svg>
    ),
    FileWarning: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
    )
};

const DepartmentStaffDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('Home');
    const [unreadCount, setUnreadCount] = useState(0);
    const [timetableData, setTimetableData] = useState([]);
    const [loadingTimetable, setLoadingTimetable] = useState(true);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Fetch live data
    useEffect(() => {
        const fetchData = async () => {
            if (!user?.user_id) return;
            try {
                // Fetch Notifications Unread Count (Deadlines)
                const unreadRes = await fetch(
                    `http://localhost:5000/api/deadlines/unread-count?userId=${user.user_id}&role=${encodeURIComponent('Department Staff')}`
                );
                
                // Fetch Activity Notifications Unread Count
                const activityUnreadRes = await fetch(
                    `http://localhost:5000/api/dashboard/activities/unread-count?userId=${user.user_id}`
                );

                let totalUnread = 0;

                if (unreadRes.ok) {
                    const { count } = await unreadRes.json();
                    totalUnread += count;
                }

                if (activityUnreadRes.ok) {
                    const { count } = await activityUnreadRes.json();
                    totalUnread += count;
                }

                setUnreadCount(totalUnread);

                // Fetch Personalized Timetable
                const timetableRes = await fetch(`http://localhost:5000/api/configurations/personalized-timetable/${user.user_id}`);
                if (timetableRes.ok) {
                    const data = await timetableRes.json();
                    setTimetableData(data);
                }
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoadingTimetable(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [user?.user_id]);

    const stats = {
        upcomingExams: timetableData.length,
        pendingResults: 12,
        totalCourses: 3
    };

    const notifications = [
        { id: 1, type: 'venue', message: 'Personalized timetable released', time: 'Yesterday', urgent: false },
        { id: 2, type: 'meeting', message: 'New reschedule allocated', time: '2 days ago', urgent: false },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { name: 'Home', icon: <Icons.Dashboard />, label: 'Dashboard' },
        { name: 'Personalized Timetable', icon: <Icons.Calendar />, label: 'My Timetable' },
        { name: 'Generate Marking Sheet', icon: <Icons.Report />, label: 'Marking Sheets' },
        { name: 'Examination Irregularities', icon: <Icons.FileWarning />, label: 'Irregularities' },
        { name: 'Notifications & Alerts', icon: <Icons.Bell />, label: 'Notifications' },
    ];

    const renderContent = () => {
        if (activeSection === 'Personalized Timetable') {
            return <PersonalizedTimetable enableConcerns={true} />;
        }

        if (activeSection === 'Generate Marking Sheet') {
            return <GenerateMarkingSheet />;
        }

        if (activeSection === 'Notifications & Alerts') {
            return <DepartmentStaffNotifications />;
        }

        if (activeSection === 'Examination Irregularities') {
            return <ExaminationIrregularities />;
        }

        if (activeSection !== 'Home') {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center p-10 bg-white rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-400 mb-2">{activeSection} Module</h2>
                        <p className="text-gray-500">This module is currently under development.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
                {/* Welcome Section */}
                <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden text-left">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-1">Welcome, {user?.name || 'Staff Member'}</h2>
                        <p className="text-blue-400 text-sm font-medium">Your examination duties and tasks overview.</p>
                    </div>
                    {/* Professional architectural accent */}
                    <div className="absolute top-0 right-0 w-32 h-full bg-blue-500/10 skew-x-12 translate-x-16"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Upcoming Examinations Table */}
                    <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-base font-bold text-slate-900 tracking-tight">Confirmed Exam Duties</h3>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1 bg-white border border-slate-200 rounded">Official Schedule</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Course Unit</th>
                                        <th className="px-6 py-4 text-center">Schedule</th>
                                        <th className="px-6 py-4 text-center">Venue</th>
                                        <th className="px-6 py-4 text-center">Role</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loadingTimetable ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                                                <div className="animate-spin inline-block w-5 h-5 border-2 border-slate-200 border-t-blue-600 rounded-full mb-2"></div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest">Loading Duties...</p>
                                            </td>
                                        </tr>
                                    ) : timetableData.length > 0 ? (
                                        timetableData.slice(0, 5).map((exam) => (
                                            <tr key={exam.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-slate-900">{exam.courseUnit}</span>
                                                    <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{exam.courseTitle}</p>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="text-sm font-bold text-slate-900">{formatDate(exam.date)}</div>
                                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter bg-slate-100 px-1 inline-block rounded mt-1">{exam.time}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-blue-50 text-blue-700">
                                                        {exam.venue}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                        ${exam.role === 'Supervisor' ? 'bg-indigo-50 text-indigo-700' : 'bg-teal-50 text-teal-700'}`}>
                                                        {exam.role}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium italic text-sm">
                                                No confirmed duties found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Notifications Section */}
                    <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Alerts</h3>
                            <button onClick={() => setActiveSection('Notifications & Alerts')} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest">
                                Manage
                            </button>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {notifications.map((notif) => (
                                <div key={notif.id} className="p-5 hover:bg-slate-50 transition-all cursor-pointer group">
                                    <div className="flex items-start space-x-3">
                                        <div className={`mt-1 p-2 rounded-lg transition-colors
                                            ${notif.type === 'venue' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' : 'bg-slate-50 text-slate-600 group-hover:bg-slate-100'}`}>
                                            {notif.type === 'venue' ? <Icons.Activity /> : <Icons.Bell />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-slate-800 font-semibold tracking-tight">{notif.message}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{notif.time}</span>
                                                {notif.urgent && (
                                                    <span className="flex items-center gap-1 text-[9px] font-bold text-rose-500 uppercase tracking-widest">
                                                        <span className="w-1 h-1 rounded-full bg-rose-500 animate-ping"></span>
                                                        Action Required
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-[#F1F5F9] font-sans overflow-hidden">
            {/* Sidebar (Permanently Expanded) */}
            <aside className="flex flex-col fixed h-full shadow-xl z-50 bg-slate-900 text-white w-64 transition-all duration-300">
                <div className="p-4 flex items-center justify-center border-b border-slate-800/50 h-20">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold tracking-wider">EMS</h2>
                        <p className="text-[10px] text-blue-400 uppercase tracking-[0.2em] font-semibold">Department Staff Portal</p>
                    </div>
                </div>

                <nav className="flex-1 py-6 space-y-1 overflow-y-auto no-scrollbar">
                    {menuItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveSection(item.name)}
                            className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-all relative group
                                ${activeSection === item.name
                                    ? 'bg-blue-700 text-white shadow-lg'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                            `}
                        >
                            {activeSection === item.name && (
                                <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-r-full"></span>
                            )}
                            <div className="flex items-center gap-3">
                                <span className={`transition-transform duration-300 ${activeSection === item.name ? 'scale-110 text-white' : 'group-hover:scale-110'}`}>
                                    {item.icon}
                                </span>
                                <span className="whitespace-nowrap flex-1 text-left">
                                    {item.label}
                                </span>
                            </div>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer group"
                    >
                        <span className="text-xl min-w-[2.5rem] text-center group-hover:rotate-12 transition-transform">
                            <Icons.Logout />
                        </span>
                        <span className="ml-2 font-semibold">Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden ml-64 transition-all duration-300">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 z-10 px-8 py-4 flex justify-between items-center sticky top-0">
                    <div className="flex items-center gap-4">
                        <div className="lg:hidden">
                            <h2 className="text-xl font-bold text-slate-900">EMS</h2>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{activeSection === 'Home' ? 'Operations Overview' : activeSection}</h1>
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Department Administration</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        {/* Notification Icon */}
                        <div
                            className={`relative cursor-pointer transition-all duration-300 p-2 rounded-xl group ${activeSection === 'Notifications & Alerts' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:bg-slate-50 hover:text-blue-600'}`}
                            onClick={() => setActiveSection('Notifications & Alerts')}
                            title="Notifications & Alerts"
                        >
                            <Icons.Bell />
                            {unreadCount > 0 && (
                                <span className={`absolute -top-0.5 -right-0.5 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white ${activeSection === 'Notifications & Alerts' ? 'bg-white text-blue-600' : 'bg-rose-500 text-white'}`}>
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </div>

                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-bold text-slate-900">{user?.name || 'Staff Member'}</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user?.role || 'Department Staff'}</span>
                        </div>
                        <div className="h-10 w-10 bg-slate-100 border-2 border-slate-200 rounded-full flex items-center justify-center text-slate-700 font-bold hover:bg-slate-200 transition-colors shadow-sm cursor-pointer">
                            {user?.name?.charAt(0) || 'D'}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DepartmentStaffDashboard;
