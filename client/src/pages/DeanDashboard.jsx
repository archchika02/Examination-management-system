//                                             </div>
//                                             <div>
//                                                 <p className="text-sm text-gray-800 font-medium">{activity.description}</p>
//                                                 <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </section>

//                             {/* Upcoming Deadlines (Optional but good for context) */}
//                             <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//                                 <div className="p-6 border-b border-gray-100 bg-gray-50/50">
//                                     <h3 className="text-lg font-bold text-gray-800">Upcoming Deadlines</h3>
//                                 </div>
//                                 <div className="p-2 space-y-2">
//                                     {upcomingDeadlines.map((deadline) => (
//                                         <div key={deadline.id} className="p-4 border-l-4 border-indigo-500 bg-indigo-50/30 rounded-r-lg m-2 hover:bg-indigo-50 transition-colors">
//                                             <h4 className="text-sm font-bold text-gray-900">{deadline.title}</h4>
//                                             <p className="text-xs text-gray-600 mt-1">{deadline.description}</p>
//                                             <div className="mt-2 text-xs text-indigo-700 font-semibold">
//                                                 Due: {deadline.date}
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </section>
//                         </div>
//                     </div>
//                 );
//         }
//     };

//     return (
//         <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
//             {/* Sidebar */}
//             <aside
//                 className={`flex flex-col fixed h-full shadow-2xl z-50 bg-indigo-900 text-white transition-all duration-300 ease-in-out ${sidebarExpanded ? 'w-64' : 'w-20'}`}
//                 onMouseEnter={() => setSidebarExpanded(true)}
//                 onMouseLeave={() => setSidebarExpanded(false)}
//             >
//                 <div className="p-4 flex items-center justify-center border-b border-indigo-800/50 h-20">
//                     {sidebarExpanded ? (
//                         <div className="text-center animate-fade-in">
//                             <h2 className="text-2xl font-bold tracking-wider">EMS</h2>
//                             <p className="text-xs text-indigo-300">Dean's Dashboard</p>
//                         </div>
//                     ) : (
//                         <h2 className="text-xl font-bold">EMS</h2>
//                     )}
//                 </div>

//                 <nav className="flex-1 py-6 space-y-1 overflow-y-auto no-scrollbar">
//                     {menuItems.map((item) => (
//                         <button
//                             key={item.name}
//                             onClick={() => setActiveSection(item.name)}
//                             className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-all relative overflow-hidden group
//                                 ${activeSection === item.name
//                                     ? 'bg-indigo-800 text-white'
//                                     : 'text-indigo-100 hover:bg-indigo-800/50 hover:text-white'}
//                             `}
//                         >
//                             {activeSection === item.name && (
//                                 <span className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400 rounded-r-full"></span>
//                             )}
//                             <span className="text-xl min-w-[2.5rem] text-center">{item.icon}</span>
//                             <span className={`ml-3 whitespace-nowrap transition-all duration-300 origin-left ${sidebarExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-90 w-0'}`}>
//                                 {item.name}
//                             </span>
//                         </button>
//                     ))}
//                 </nav>

//                 <div className="p-4 border-t border-indigo-800/50">
//                     <button
//                         onClick={handleLogout}
//                         className={`w-full flex items-center px-4 py-3 text-sm font-medium text-red-100 hover:bg-red-900/50 rounded-lg transition-colors cursor-pointer group`}
//                     >
//                         <span className="text-xl min-w-[2.5rem] text-center group-hover:rotate-12 transition-transform">🚪</span>
//                         <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
//                             Logout
//                         </span>
//                     </button>
//                 </div>
//             </aside>

//             {/* Main Content */}
//             <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarExpanded ? 'ml-64' : 'ml-20'}`}>
//                 {/* Header */}
//                 <header className="bg-white/80 backdrop-blur-md shadow-sm z-10 px-8 py-4 flex justify-between items-center sticky top-0">
//                     <div>
//                         <h1 className="text-2xl font-bold text-gray-800 transition-all">{activeSection}</h1>
//                         <p className="text-sm text-gray-500 font-medium">Faculty Dean Portal</p>
//                     </div>
//                     <div className="flex items-center space-x-4">
//                         <div className="h-10 w-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
//                             {user?.name?.charAt(0) || 'D'}
//                         </div>
//                     </div>
//                 </header>

//                 <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 p-8">
//                     {renderContent()}
//                 </main>
//             </div>
//         </div>
//     );
// };

// export default DeanDashboard;

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AddDropApproval from '../components/AddDropApproval';
import RoleNotificationsPanel from '../components/RoleNotificationsPanel';

// Professional SVG Icon Library
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
    )
};

const DeanDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const [activeSection, setActiveSection] = useState('Home');
    const [unreadCount, setUnreadCount] = useState(0);

    const [stats, setStats] = useState({ pendingDeanAddDrop: 0, totalFacultyStaff: 0, pendingFacultyStaff: 0 });
    const [activities, setActivities] = useState([]);
    const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [staffRegistrations, setStaffRegistrations] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const activityUrl = user?.user_id
                    ? `http://localhost:5000/api/dashboard/activities?userId=${user.user_id}`
                    : 'http://localhost:5000/api/dashboard/activities';

                const [staffRes, statsRes, activitiesRes, deadlinesRes] = await Promise.all([
                    fetch('http://localhost:5000/api/dashboard/faculty-staff'),
                    fetch('http://localhost:5000/api/dashboard/stats'),
                    fetch(activityUrl),
                    fetch('http://localhost:5000/api/dashboard/deadlines')
                ]);

                if (staffRes.ok) setStaffRegistrations(await staffRes.json());
                if (statsRes.ok) setStats(await statsRes.json());
                if (activitiesRes.ok) setActivities(await activitiesRes.json());
                if (deadlinesRes.ok) setUpcomingDeadlines(await deadlinesRes.json());
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.user_id]);

    useEffect(() => {
        const fetchUnreadCount = async () => {
            if (!user?.user_id) return;
            try {
                const res = await fetch(`http://localhost:5000/api/deadlines/unread-count?userId=${user.user_id}&role=Dean`);
                if (res.ok) {
                    const data = await res.json();
                    setUnreadCount(data.count);
                }
            } catch (error) {
                console.error("Error fetching unread count:", error);
            }
        };
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 10000);
        return () => clearInterval(interval);
    }, [user?.user_id]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleApproveStaff = async (id) => {
        try {
            await fetch(`http://localhost:5000/api/dashboard/faculty-staff/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Approved' })
            });
            setStaffRegistrations(prev => prev.map(staff =>
                staff.id === id ? { ...staff, status: 'Approved' } : staff
            ));
        } catch (error) {
            console.error("Error approving staff:", error);
        }
    };

    const handleRejectStaff = async (id) => {
        try {
            await fetch(`http://localhost:5000/api/dashboard/faculty-staff/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Rejected' })
            });
            setStaffRegistrations(prev => prev.map(staff =>
                staff.id === id ? { ...staff, status: 'Rejected' } : staff
            ));
        } catch (error) {
            console.error("Error rejecting staff:", error);
        }
    };


    const navigationItems = [
        { name: 'Home', icon: <Icons.Dashboard />, label: 'Dashboard' },
        { name: 'Staff Registrations', icon: <Icons.Users />, label: 'Faculty Staff' },
        { name: 'Add/Drop Approvals', icon: <Icons.Approvals />, label: 'Approvals' },
        { name: 'Notifications', icon: <Icons.Bell />, label: 'Notifications' },
    ];

    const renderContent = () => {
        if (loading) return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-12 h-12 border-4 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">Initializing Portal...</p>
            </div>
        );

        switch (activeSection) {
            case 'Notifications':
                return <RoleNotificationsPanel roleName="Dean" onNavigate={setActiveSection} />;
            case 'Add/Drop Approvals':
                return <AddDropApproval />;
            case 'Staff Registrations':
                return (
                    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Faculty Access Governance</h2>
                                <p className="text-sm text-slate-500 mt-1 font-medium">Credential validation and lifecycle management for faculty administrative personnel.</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                                            <th className="px-6 py-4">Personnel Identity</th>
                                            <th className="px-6 py-4">Communication Bridge</th>
                                            <th className="px-6 py-4">Request Timeline</th>
                                            <th className="px-6 py-4 text-center">Status Badge</th>
                                            <th className="px-6 py-4 text-right">Administrative Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {staffRegistrations.length > 0 ? staffRegistrations.map((staff) => (
                                            <tr key={staff.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 tracking-tight">{staff.name}</span>
                                                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">Academic Staff</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-slate-600 font-semibold">{staff.email}</span>
                                                        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">M: {staff.mobile}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-slate-500 font-semibold">{new Date(staff.requestedAt).toLocaleDateString('en-GB')}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium italic uppercase">Validated</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border shadow-sm ${staff.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        staff.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                            'bg-amber-50 text-amber-700 border-amber-200'
                                                        }`}>
                                                        {staff.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {staff.status === 'Pending' ? (
                                                        <div className="flex justify-end space-x-3">
                                                            <button
                                                                onClick={() => handleApproveStaff(staff.id)}
                                                                className="px-4 py-1.5 bg-blue-700 text-white hover:bg-blue-800 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-2"
                                                            >
                                                                <Icons.Check /> Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectStaff(staff.id)}
                                                                className="px-4 py-1.5 bg-white text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-2"
                                                            >
                                                                <Icons.Alert /> Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 text-[10px] font-bold italic uppercase tracking-wider pr-4">
                                                            Record Archived
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="px-8 py-24 text-center">
                                                    <div className="flex flex-col items-center justify-center space-y-4">
                                                        <span className="text-4xl opacity-20">📂</span>
                                                        <div className="space-y-1">
                                                            <p className="text-slate-900 font-bold tracking-tight">Registry Clear</p>
                                                            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">No pending staff credentials discovered</p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'Home':
            default:
                return (
                    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
                        {/* Welcome Banner */}
                        <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-8 text-white shadow-xl">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                            <div className="relative z-10">
                                <h2 className="text-3xl font-semibold mb-2 tracking-tight">Good day, Prof. {user?.name?.split(' ')[0] || 'Dean'}</h2>
                                <p className="text-slate-400 text-base font-medium max-w-7xl leading-relaxed">
                                    Access the Faculty administrative hub to manage credential validation and course code modifications.
                                </p>
                            </div>
                        </div>

                        {/* Professional Metric Grid */}
                        <section className="flex flex-col md:flex-row justify-center gap-6">
                            {/* Metric: Add/Drop */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group transition-all hover:shadow-md relative overflow-hidden w-full md:w-96">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-3xl flex items-center justify-center pl-2 pb-2">
                                    <span className="text-blue-600/60 transition-transform group-hover:scale-110">
                                        <Icons.Approvals />
                                    </span>
                                </div>
                                <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-4">Course code Modifications</h3>
                                <div className="flex items-baseline gap-2 mb-6">
                                    <span className="text-5xl font-bold text-slate-800 tracking-tighter">{stats.pendingDeanAddDrop}</span>
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Pending Review</span>
                                </div>
                                <button
                                    onClick={() => setActiveSection('Add/Drop Approvals')}
                                    className="w-full py-3 bg-blue-700 text-white rounded-xl text-sm font-bold hover:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-sm"
                                >
                                    Process Approvals <span>→</span>
                                </button>
                            </div>

                            {/* Metric: Faculty Staff */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group transition-all hover:shadow-md relative overflow-hidden flex flex-col justify-between w-full md:w-96">
                                <div>
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-teal-50 rounded-bl-3xl flex items-center justify-center pl-2 pb-2">
                                        <span className="text-teal-600/60">
                                            <Icons.Users />
                                        </span>
                                    </div>
                                    <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-4">Academic Faculty</h3>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-5xl font-bold text-slate-800 tracking-tighter">{stats.totalFacultyStaff}</span>
                                        <span className="text-xs font-bold text-teal-600 uppercase tracking-wide">Registered</span>
                                    </div>
                                </div>

                                {stats.pendingFacultyStaff > 0 ? (
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex gap-2 items-center">
                                                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stats.pendingFacultyStaff} Pending Approvals</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setActiveSection('Staff Registrations')}
                                            className="w-full py-2.5 bg-teal-50 text-teal-700 rounded-xl text-xs font-bold hover:bg-teal-100 transition-all flex items-center justify-center gap-2"
                                        >
                                            Verify Members <Icons.ArrowRight />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Verified
                                    </div>
                                )}
                            </div>

                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Unified Activity Stream */}
                            <section className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">Activity Log</h3>
                                    <button
                                        onClick={() => setActiveSection('Notifications')}
                                        className="text-[10px] font-bold uppercase tracking-wider text-blue-700 hover:text-blue-800 px-4 py-2 bg-blue-50 rounded-lg transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        <Icons.Activity /> View Full History
                                    </button>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {activities.length > 0 ? (
                                        activities.slice(0, 4).map((activity, idx) => (
                                            <div key={idx} className="p-4 hover:bg-slate-50 transition-all flex items-start gap-4 group">
                                                <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${activity.type === 'REJECTION' ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                                    }`}>
                                                    {activity.type === 'REJECTION' ? <Icons.Alert /> : <Icons.Activity />}
                                                </div>
                                                <div className="flex-1 flex justify-between items-start">
                                                    <div>
                                                        <p className="text-sm text-slate-800 font-medium leading-relaxed">{activity.description}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wider">
                                                            {new Date(activity.created_at).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            if (activity.description.toLowerCase().includes('add/drop') || activity.description.toLowerCase().includes('course')) {
                                                                setActiveSection('Add/Drop Approvals');
                                                            } else if (activity.description.toLowerCase().includes('staff') || activity.description.toLowerCase().includes('credential')) {
                                                                setActiveSection('Staff Registrations');
                                                            } else {
                                                                setActiveSection('Notifications');
                                                            }
                                                        }}
                                                        className="text-[10px] font-bold text-blue-700 hover:text-blue-900 border border-blue-200 px-2 py-1 rounded bg-blue-50/50 hover:bg-blue-50 transition-all uppercase tracking-wider"
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-12 text-center">
                                            <p className="text-slate-400 text-sm font-medium">No activity recorded.</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-[#F1F5F9] font-sans overflow-hidden">
            {/* Professional Floating Sidebar */}
            <aside
                className="flex flex-col fixed h-full shadow-lg z-50 bg-[#0F172A] text-white transition-all duration-300 w-64"
            >
                <div className="p-6 flex items-center gap-4 h-20 border-b border-slate-800">                    <div className="text-left leading-none">
                    <h2 className="text-sm font-bold items-center tracking-tight text-white uppercase">EMS</h2>
                    <p className="text-[8px] text-blue-400 font-bold items-center uppercase tracking-widest mt-0.5">Dean Portal</p>
                </div>
                </div>

                <nav className="flex-1 py-6 space-y-1.5 px-3 overflow-y-auto no-scrollbar">
                    {navigationItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveSection(item.name)}
                            className={`w-full flex items-center rounded-xl transition-all duration-200 group relative
                                ${activeSection === item.name
                                    ? 'bg-blue-700 text-white shadow-md p-3'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800 p-3'}
                            `}
                        >
                            <span className={`text-xl transition-transform duration-200 ${activeSection === item.name ? 'scale-105' : ''}`}>
                                {item.icon}
                            </span>
                            <span className="ml-3 font-bold text-xs tracking-tight transition-all duration-300 whitespace-nowrap opacity-100 translate-x-0">
                                {item.label}
                            </span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center p-3 text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all group overflow-hidden`}
                    >
                        <span className="text-xl transition-transform group-hover:rotate-6">
                            <Icons.Logout />
                        </span>
                        <span className={`ml-3 whitespace-nowrap transition-all duration-300 opacity-100`}>
                            Log Out
                        </span>
                    </button>
                </div>
            </aside>

            {/* Main Content Viewport */}
            <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ml-64">
                {/* Modern Glassmorphic Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 px-8 py-4 flex justify-between items-center sticky top-0">
                    <div className="flex items-center gap-6">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{activeSection}</h1>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Faculty Dean Portal</p>
                        </div>

                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-900 leading-none">{user?.name || 'Faculty Dean'}</span>
                            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-1">Faculty Dean</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                className={`relative h-9 w-9 rounded-lg flex items-center justify-center transition-all border shadow-sm active:scale-95 group 
                                    ${activeSection === 'Notifications'
                                        ? 'bg-blue-700 text-white border-blue-800 shadow-blue-100'
                                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                                onClick={() => setActiveSection('Notifications')}
                                title="Notifications"
                            >
                                <Icons.Bell />
                                {unreadCount > 0 && (
                                    <span className={`absolute -top-1 -right-1 h-4 w-4 rounded-full text-white text-[8px] font-bold flex items-center justify-center shadow-lg ${activeSection === 'Notifications' ? 'bg-white/20 border border-white/20' : 'bg-rose-600'}`}>
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            <div className="h-9 w-9 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md border border-slate-800">
                                {user?.name?.charAt(0) || 'D'}
                            </div>
                        </div>
                    </div>
                </header>

                <main id="dashboard-viewport" className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F1F5F9] p-8 scroll-smooth">
                    {renderContent()}
                </main>
            </div>

            {/* Fine-tuned Scrollbars */}
            <style>{`
                #dashboard-viewport::-webkit-scrollbar { width: 6px; }
                #dashboard-viewport::-webkit-scrollbar-track { background: transparent; }
                #dashboard-viewport::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
                #dashboard-viewport::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
};

export default DeanDashboard;