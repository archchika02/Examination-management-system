import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TimetableSection from '../components/TimetableSection';
import AddDropFormsSection from '../components/AddDropFormsSection';
import AcademicCourseUnits from '../components/AcademicCourseUnits';
import MedicalRepeatFormsSection from '../components/MedicalRepeatFormsSection';
import GenerateReportsSection from '../components/GenerateReportsSection';
import FacultyAttendantAllocation from '../components/FacultyAttendantAllocation';
import DeadlinesSection from '../components/DeadlinesSection';
import EditFormsSection from '../components/EditFormsSection';
import AddCourseUnit from '../components/AddCourseUnit';
import RoleNotificationsPanel from '../components/RoleNotificationsPanel';

// Professional SVG Icon Library (Matching Dean Portal)
const Icons = {
    Dashboard: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
    ),
    Users: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    ),
    Approvals: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 4 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="m9 15 2 2 4-4" /></svg>
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
    Check: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
    ),
    Calendar: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
    ),
    ArrowRight: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" x2="19" y1="12" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
    ),
    Book: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M6.5 2H20v20H6.5" /></svg>
    ),
    Edit: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
    ),
    Report: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="18" y1="20" y2="10" /><line x1="12" x2="12" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="14" /></svg>
    )
};

const FacultyStaffDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('Home');
    const [activities, setActivities] = useState([]);
    const [loadingActivities, setLoadingActivities] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        if (!user?.user_id) return;
        try {
            const deadlineRes = await fetch(
                `http://localhost:5000/api/deadlines/unread-count?userId=${user.user_id}&role=${encodeURIComponent('Faculty Staff')}`
            );
            const activityRes = await fetch(
                `http://localhost:5000/api/dashboard/activities/unread-count?userId=${user.user_id}`
            );

            let count = 0;
            if (deadlineRes.ok) {
                const data = await deadlineRes.json();
                count += data.count || 0;
            }
            if (activityRes.ok) {
                const data = await activityRes.json();
                count += data.count || 0;
            }
            setUnreadCount(count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    // Fetch activities from DB
    const fetchActivities = async () => {
        if (!user?.user_id) return;
        setLoadingActivities(true);
        try {
            const res = await fetch(`http://localhost:5000/api/dashboard/activities?userId=${user.user_id}`);
            if (res.ok) {
                const data = await res.json();
                setActivities(data);
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoadingActivities(false);
        }
    };

    useEffect(() => {
        if (activeSection === 'Home') {
            fetchActivities();
        }
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 10000); // Polling every 10s
        return () => clearInterval(interval);
    }, [activeSection, user?.user_id]);

    const formatRelativeTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        
        const now = new Date();
        const diffInMs = now - date;
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        
        return date.toLocaleDateString();
    };

    // Stats and other state...
    // (Existing stats and activities mock data)
    const stats = {
        timetablesManaged: 12,
        pendingTimetables: 3,
        addDropSubmitted: 45,
        addDropPending: 8,
        courseUnits: 18,
        medicalRequests: 7,
        allocations: 5,
        hallAttendants: 22,
        activeDeadlines: 4,
        pendingDeadlines: 2,
        editForms: 3
    };

    const deadlines = [
        { id: 1, title: 'Course Registration Form', date: '2026-01-28', timeLeft: '3 days left' },
        { id: 2, title: 'Medical Form Submission', date: '2026-02-05', timeLeft: '10 days left' },
        { id: 3, title: 'Add/Drop Period End', date: '2026-02-10', timeLeft: '15 days left' },
    ];

    // Activities are now fetched from DB

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { name: 'Home', icon: <Icons.Dashboard />, label: 'Dashboard' },
        { name: 'Timetable', icon: <Icons.Calendar />, label: 'Exam Timetable' },
        { name: 'Hall Attendants Allocation & Final Timetable', icon: <Icons.Users />, label: 'Staff Allocation' },
        { name: 'Generate Reports', icon: <Icons.Report />, label: 'Generate Reports' },
        { name: 'Add/Drop Forms', icon: <Icons.Approvals />, label: 'Add/Drop Forms' },
        { name: 'Academic Course Units', icon: <Icons.Book />, label: 'Academic Course Units' },
        { name: 'Course unit list', icon: <Icons.Book />, label: 'Course Unit List' },
        { name: 'Medical/Repeat Forms', icon: <Icons.Alert />, label: 'Medical/Repeat' },
        { name: 'Deadlines', icon: <Icons.Activity />, label: 'Manage Deadlines' },
        { name: 'Edit Forms', icon: <Icons.Edit />, label: 'Edit Forms' },
        { name: 'Notifications', icon: <Icons.Bell />, label: 'Notifications' },
    ];

    const renderContent = () => {
        if (activeSection === 'Timetable') {
            return (
                <div className="max-w-7xl mx-auto animate-fade-in-up">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Exam Timetable</h2>
                            <p className="text-gray-500 text-sm">Manage and schedule faculty examinations.</p>
                        </div>
                    </div>
                    <TimetableSection />
                </div>
            );
        }

        if (activeSection === 'Add/Drop Forms') {
            return <AddDropFormsSection />;
        }

        if (activeSection === 'Academic Course Units') {
            return <AcademicCourseUnits />;
        }

        if (activeSection === 'Course unit list') {
            return (
                <div className="max-w-7xl mx-auto animate-fade-in-up">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Course Unit Registry</h2>
                            <p className="text-gray-500 text-sm">View all registered course units across the faculty.</p>
                        </div>
                    </div>
                    <AddCourseUnit isReadOnly={true} />
                </div>
            );
        }

        if (activeSection === 'Medical/Repeat Forms') {
            return <MedicalRepeatFormsSection />;
        }

        if (activeSection === 'Generate Reports') {
            return <GenerateReportsSection />;
        }

        if (activeSection === 'Hall Attendants Allocation & Final Timetable') {
            return <FacultyAttendantAllocation />;
        }

        if (activeSection === 'Deadlines') {
            return <DeadlinesSection />;
        }

        if (activeSection === 'Edit Forms') {
            return <EditFormsSection />;
        }

        if (activeSection === 'Notifications') {
            return <RoleNotificationsPanel roleName="Faculty Staff" />;
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
                <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-1">Welcome, {user?.name || 'Faculty Staff'}</h2>
                        <p className="text-slate-400 text-sm font-medium">Overview of examination management operations.</p>
                    </div>
                    {/* Professional architectural accent */}
                    <div className="absolute top-0 right-0 w-32 h-full bg-white/5 skew-x-12 translate-x-16"></div>
                </div>

                {/* Summary Cards Grid */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Timetable Card */}
                    <div
                        onClick={() => setActiveSection('Timetable')}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Timetables</h3>
                                <div className="text-3xl font-extrabold text-slate-900 mt-1">{stats.timetablesManaged}</div>
                            </div>
                            <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors">
                                <Icons.Calendar />
                            </span>
                        </div>
                        <div className="text-xs font-medium text-orange-500 bg-orange-50 inline-block px-2 py-1 rounded-md">
                            {stats.pendingTimetables} Pending Review
                        </div>
                    </div>

                    {/* Add/Drop Forms Card */}
                    <div
                        onClick={() => setActiveSection('Add/Drop Forms')}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Add/Drop Forms</h3>
                                <div className="text-3xl font-extrabold text-slate-900 mt-1">{stats.addDropSubmitted}</div>
                            </div>
                            <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-100 transition-colors">
                                <Icons.Approvals />
                            </span>
                        </div>
                    </div>

                    {/* Medical/Repeat Forms Card */}
                    <div
                        onClick={() => setActiveSection('Medical/Repeat Forms')}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Medical Requests</h3>
                                <div className="text-3xl font-extrabold text-slate-900 mt-1">{stats.medicalRequests}</div>
                            </div>
                            <span className="p-2.5 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-100 transition-colors">
                                <Icons.Alert />
                            </span>
                        </div>
                        <div className="text-xs font-medium text-red-600 bg-red-50 inline-block px-2 py-1 rounded-md">
                            Action Required
                        </div>
                    </div>

                    {/* Deadlines Card */}
                    <div
                        onClick={() => setActiveSection('Deadlines')}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Active Deadlines</h3>
                                <div className="text-3xl font-extrabold text-slate-900 mt-1">{stats.activeDeadlines}</div>
                            </div>
                            <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 transition-colors">
                                <Icons.Activity />
                            </span>
                        </div>
                        <div className="text-xs font-medium text-yellow-700 bg-yellow-50 inline-block px-2 py-1 rounded-md">
                            {stats.pendingDeadlines} Ending Soon
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Upcoming Deadlines Section */}
                    <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-base font-bold text-slate-900 tracking-tight">Deadlines</h3>
                            <button onClick={() => setActiveSection('Deadlines')} className="text-[10px] text-blue-600 hover:text-blue-800 font-bold uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">View Full List</button>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {deadlines.map((deadline) => (
                                <div key={deadline.id} className="p-5 hover:bg-gray-50 transition-colors group">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{deadline.title}</h4>
                                        <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-full">{deadline.timeLeft}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">Due: {deadline.date}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Recent Activities Section */}
                    <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-base font-bold text-slate-900 tracking-tight">Faculty Activity Log</h3>
                            <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Live Feed
                            </span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {loadingActivities ? (
                                <div className="p-8 text-center text-slate-400">
                                    <div className="animate-spin inline-block w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full mb-2"></div>
                                    <p className="text-xs font-medium uppercase tracking-wider">Refreshing feed...</p>
                                </div>
                            ) : activities.length > 0 ? (
                                activities.slice(0, 4).map((activity, index) => (
                                    <div key={activity.id || index} className="p-4 hover:bg-slate-50 transition-colors flex items-start justify-between group">
                                        <div className="flex items-start space-x-4">
                                            <div className={`mt-1 flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
                                                ${activity.type?.toLowerCase() === 'approval' ? 'bg-emerald-50 text-emerald-600' :
                                                    activity.type?.toLowerCase() === 'rejection' ? 'bg-rose-50 text-rose-600' :
                                                        activity.type?.toLowerCase() === 'creation' ? 'bg-blue-50 text-blue-600' : 
                                                        activity.type?.toLowerCase() === 'notification' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                                                {activity.type?.toLowerCase() === 'approval' ? <Icons.Check /> :
                                                    activity.type?.toLowerCase() === 'rejection' ? <Icons.Alert /> :
                                                        activity.type?.toLowerCase() === 'creation' ? <Icons.Calendar /> : 
                                                        activity.type?.toLowerCase() === 'notification' ? <Icons.Bell /> : <Icons.Activity />}
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-800 font-semibold tracking-tight">{activity.description}</p>
                                                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{formatRelativeTime(activity.created_at)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-slate-400">
                                    <span className="text-3xl mb-3 block">📄</span>
                                    <p className="text-sm font-medium">No recent activities found</p>
                                </div>
                            )}
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
                        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-semibold">Faculty Staff Portal</p>
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
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{activeSection === 'Home' ? 'Faculty Overview' : activeSection}</h1>
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{user?.designation || 'Faculty Administrator'}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        {/* Notification Bell */}
                        <div className="relative group">
                            <button
                                onClick={() => setActiveSection('Notifications')}
                                className={`p-2 rounded-xl transition-all duration-300 relative ${activeSection === 'Notifications'
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                    }`}
                            >
                                <Icons.Bell />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-bold text-slate-900">{user?.name || 'Staff Member'}</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user?.role || 'Faculty Staff'}</span>
                        </div>
                        <div className="h-10 w-10 bg-slate-100 border-2 border-slate-200 rounded-full flex items-center justify-center text-slate-700 font-bold hover:bg-slate-200 transition-colors shadow-sm">
                            {user?.name?.charAt(0) || 'S'}
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

export default FacultyStaffDashboard;
