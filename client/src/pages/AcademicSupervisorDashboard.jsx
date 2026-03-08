// import { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import PreferredTimetable from '../components/PreferredTimetable';
// import PersonalizedTimetable from '../components/PersonalizedTimetable';
// import UploadResults from '../components/UploadResults';
// import AllocationsDashboard from '../components/AllocationsDashboard';
// import AddDropApproval from '../components/AddDropApproval';
// import AddCourseUnit from '../components/AddCourseUnit';
// import TimetableConfiguration from '../components/TimetableConfiguration';
// import AssignExaminer from '../components/AssignExaminer';
// import SupervisorTimetableManager from '../components/SupervisorTimetableManager';
// import SupervisorAlerts from '../components/SupervisorAlerts';

// const AcademicSupervisorDashboard = () => {
//     const { user, logout } = useAuth();
//     const navigate = useNavigate();
//     const [stats, setStats] = useState({ pendingAddDrop: 0, totalCourseUnits: 0, activeAlerts: 0 });
//     const [activities, setActivities] = useState([]);
//     const [deadlines, setDeadlines] = useState([]);
//     const [loading, setLoading] = useState(true);

//     // New State for Sidebar and Navigation
//     const [sidebarExpanded, setSidebarExpanded] = useState(false);
//     const [activeSection, setActiveSection] = useState('Home');

//     // State for Department Staff Registrations
//     const [deptStaffRegistrations, setDeptStaffRegistrations] = useState([]);

//     const handleApproveStaff = async (id) => {
//         try {
//             await fetch(`http://localhost:5000/api/dashboard/faculty-staff/${id}/status`, {
//                 method: 'PUT',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ status: 'Approved' })
//             });
//             setDeptStaffRegistrations(deptStaffRegistrations.map(staff =>
//                 staff.id === id ? { ...staff, status: 'Approved' } : staff
//             ));
//         } catch (error) {
//             console.error("Error approving staff:", error);
//         }
//     };

//     const handleRejectStaff = async (id) => {
//         try {
//             await fetch(`http://localhost:5000/api/dashboard/faculty-staff/${id}/status`, {
//                 method: 'PUT',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ status: 'Rejected' })
//             });
//             setDeptStaffRegistrations(deptStaffRegistrations.map(staff =>
//                 staff.id === id ? { ...staff, status: 'Rejected' } : staff
//             ));
//         } catch (error) {
//             console.error("Error rejecting staff:", error);
//         }
//     };

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const [statsRes, activitiesRes, deadlinesRes, staffRes] = await Promise.all([
//                     fetch('http://localhost:5000/api/dashboard/stats'),
//                     fetch('http://localhost:5000/api/dashboard/activities'),
//                     fetch('http://localhost:5000/api/dashboard/deadlines'),
//                     fetch('http://localhost:5000/api/dashboard/department-staff')
//                 ]);

//                 if (statsRes.ok) setStats(await statsRes.json());
//                 if (activitiesRes.ok) setActivities(await activitiesRes.json());
//                 if (deadlinesRes.ok) setDeadlines(await deadlinesRes.json());
//                 if (staffRes.ok) setDeptStaffRegistrations(await staffRes.json());
//             } catch (error) {
//                 console.error("Failed to fetch dashboard data", error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, []);

//     const handleLogout = () => {
//         logout();
//         navigate('/login');
//     };

//     const menuItems = [
//         { name: 'Home', icon: '🏠' },
//         { name: 'Timetable Configuration', icon: '⚙️' },
//         { name: 'Preferred Timetable', icon: '🗓️' },
//         { name: 'Assign Examiner', icon: '👨‍🏫' },
//         { name: 'Allocations Dashboard', icon: '📊' },
//         { name: 'Personalized Timetable', icon: '📅' },
//         { name: 'Upload Results', icon: '📤' },
//         { name: 'Add/Drop Form Approval', icon: '📝' },
//         { name: 'Department Staff Registrations', icon: '👥' },
//         { name: 'Add Course Unit', icon: '➕' },
//         { name: 'Alerts', icon: '🔔' }
//     ];

//     if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

//     const renderContent = () => {
//         switch (activeSection) {
//             case 'Allocations Dashboard':
//                 return <AllocationsDashboard />;
//             case 'Personalized Timetable':
//                 return <PersonalizedTimetable enableConcerns={false} />;
//             case 'Upload Results':
//                 return <UploadResults />;
//             case 'Preferred Timetable':
//                 return <PreferredTimetable />;
//             case 'Assign Examiner':
//                 return <AssignExaminer />;
//             case 'Add/Drop Form Approval':
//                 return <AddDropApproval />;
//             case 'Add Course Unit':
//                 return <AddCourseUnit />;
//             case 'Timetable Configuration':
//                 return <TimetableConfiguration />;
//             case 'Alerts':
//                 return <SupervisorAlerts />;
//             case 'Department Staff Registrations':
//                 return (
//                     <div className="space-y-6 animate-fade-in-up">
//                         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//                             <div className="flex justify-between items-center mb-4">
//                                 <h2 className="text-lg font-bold text-gray-800">Department Staff Registrations</h2>
//                             </div>
//                             <div className="overflow-x-auto">
//                                 <table className="w-full text-left border-collapse">
//                                     <thead>
//                                         <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
//                                             <th className="px-6 py-4">Name</th>
//                                             <th className="px-6 py-4">Email</th>
//                                             <th className="px-6 py-4">Mobile Number</th>
//                                             <th className="px-6 py-4">Requested At</th>
//                                             <th className="px-6 py-4">Status</th>
//                                             <th className="px-6 py-4">Actions</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody className="divide-y divide-gray-100 text-sm md:text-base">
//                                         {deptStaffRegistrations.map((staff) => (
//                                             <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
//                                                 <td className="px-6 py-4 font-medium text-gray-900">{staff.name}</td>
//                                                 <td className="px-6 py-4 text-gray-700">{staff.email}</td>
//                                                 <td className="px-6 py-4 text-gray-700">{staff.mobile}</td>
//                                                 <td className="px-6 py-4 text-gray-500">{new Date(staff.requestedAt).toLocaleDateString()}</td>
//                                                 <td className="px-6 py-4">
//                                                     <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${staff.status === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' :
//                                                         staff.status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' :
//                                                             'bg-yellow-100 text-yellow-700 border-yellow-200'
//                                                         }`}>
//                                                         {staff.status}
//                                                     </span>
//                                                 </td>
//                                                 <td className="px-6 py-4">
//                                                     {staff.status === 'Approved' ? (
//                                                         <button
//                                                             onClick={() => handleRejectStaff(staff.id)}
//                                                             className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-semibold transition-colors"
//                                                         >
//                                                             Deny Access
//                                                         </button>
//                                                     ) : (
//                                                         <button
//                                                             onClick={() => handleApproveStaff(staff.id)}
//                                                             className="px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 rounded-lg text-xs font-semibold transition-colors"
//                                                         >
//                                                             Enable Access
//                                                         </button>
//                                                     )}
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>
//                     </div>
//                 );
//             case 'Home':
//             default:
//                 return (
//                     <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
//                         {/* Stats Grid */}
//                         <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
//                                 <div className="flex items-center justify-between mb-4">
//                                     <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Add/Drop Pending</h3>
//                                     <span className="bg-orange-100 text-orange-600 p-2 rounded-lg group-hover:bg-orange-200 transition-colors">
//                                         📄
//                                     </span>
//                                 </div>
//                                 <div className="text-4xl font-extrabold text-gray-900">{stats.pendingAddDrop}</div>
//                                 <p className="text-xs text-gray-400 mt-2">Forms awaiting approval</p>
//                             </div>

//                             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
//                                 <div className="flex items-center justify-between mb-4">
//                                     <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Course Units</h3>
//                                     <span className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
//                                         📚
//                                     </span>
//                                 </div>
//                                 <div className="text-4xl font-extrabold text-gray-900">{stats.totalCourseUnits}</div>
//                                 <p className="text-xs text-gray-400 mt-2">Currently being managed</p>
//                             </div>

//                             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
//                                 <div className="flex items-center justify-between mb-4">
//                                     <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Active Alerts</h3>
//                                     <span className="bg-red-100 text-red-600 p-2 rounded-lg group-hover:bg-red-200 transition-colors">
//                                         🔔
//                                     </span>
//                                 </div>
//                                 <div className="text-4xl font-extrabold text-gray-900">{stats.activeAlerts}</div>
//                                 <p className="text-xs text-gray-400 mt-2">System notifications</p>
//                             </div>
//                         </section>

//                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                             {/* Recent Activity */}
//                             <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//                                 <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
//                                     <h3 className="text-lg font-bold text-gray-800">Recent Activity Feed</h3>
//                                     <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View All</button>
//                                 </div>
//                                 <div className="divide-y divide-gray-100">
//                                     {activities.length > 0 ? (
//                                         activities.map((activity) => (
//                                             <div key={activity.id} className="p-5 hover:bg-gray-50 transition-colors flex items-start space-x-4">
//                                                 <div className="mt-1 flex-shrink-0">
//                                                     <span className="block h-2.5 w-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-50"></span>
//                                                 </div>
//                                                 <div>
//                                                     <p className="text-sm text-gray-800 font-medium">{activity.description}</p>
//                                                     <p className="text-xs text-gray-500 mt-1">{new Date(activity.created_at).toLocaleString()}</p>
//                                                 </div>
//                                             </div>
//                                         ))
//                                     ) : (
//                                         <div className="p-6 text-gray-500 text-center text-sm">No recent activity</div>
//                                     )}
//                                 </div>
//                             </section>

//                             {/* Upcoming Deadlines */}
//                             <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//                                 <div className="p-6 border-b border-gray-100 bg-gray-50/50">
//                                     <h3 className="text-lg font-bold text-gray-800">Upcoming Deadlines</h3>
//                                 </div>
//                                 <div className="p-2 space-y-2">
//                                     {deadlines.length > 0 ? (
//                                         deadlines.map((deadline) => (
//                                             <div key={deadline.id} className="p-4 border-l-4 border-indigo-500 bg-indigo-50/30 rounded-r-lg m-2 hover:bg-indigo-50 transition-colors">
//                                                 <h4 className="text-sm font-bold text-gray-900">{deadline.title}</h4>
//                                                 <p className="text-xs text-gray-600 mt-1 break-words">{deadline.description}</p>
//                                                 <div className="mt-2 flex items-center text-xs text-indigo-700 font-semibold">
//                                                     <span className={`mr-2 w-2 h-2 rounded-full ${new Date(deadline.due_date) < new Date() ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
//                                                     Due: {new Date(deadline.due_date).toLocaleDateString()}
//                                                 </div>
//                                             </div>
//                                         ))
//                                     ) : (
//                                         <div className="p-6 text-gray-500 text-center text-sm">No upcoming deadlines</div>
//                                     )}
//                                 </div>
//                             </section>
//                         </div>
//                     </div>
//                 );
//         }
//     };

//     return (
//         <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
//             {/* Interactive Sidebar */}
//             <aside
//                 className={`flex flex-col fixed h-full shadow-2xl z-50 bg-indigo-900 text-white transition-all duration-300 ease-in-out ${sidebarExpanded ? 'w-64' : 'w-20'}`}
//                 onMouseEnter={() => setSidebarExpanded(true)}
//                 onMouseLeave={() => setSidebarExpanded(false)}
//             >
//                 <div className="p-4 flex items-center justify-center border-b border-indigo-800/50 h-20">
//                     {sidebarExpanded ? (
//                         <div className="text-center animate-fade-in">
//                             <h2 className="text-2xl font-bold tracking-wider">EMS</h2>
//                             <p className="text-xs text-indigo-300">Academic Dashboard</p>
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
//                             {/* Active indicator */}
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

//             {/* Main Content Wrapper */}
//             <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarExpanded ? 'ml-64' : 'ml-20'}`}>
//                 {/* Header */}
//                 <header className="bg-white/80 backdrop-blur-md shadow-sm z-10 px-8 py-4 flex justify-between items-center sticky top-0">
//                     <div>
//                         <h1 className="text-2xl font-bold text-gray-800 transition-all">{activeSection}</h1>
//                         <p className="text-sm text-gray-500 font-medium">Welcome, {user?.name || 'Dr. Smith'}</p>
//                     </div>
//                     <div className="flex items-center space-x-4">
//                         <button className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors">
//                             <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
//                             🔔
//                         </button>
//                         <div className="h-10 w-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30 ring-2 ring-white cursor-pointer hover:ring-indigo-100 transition-all">
//                             {user?.name?.charAt(0) || 'U'}
//                         </div>
//                     </div>
//                 </header>

//                 {/* Content Area */}
//                 <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 p-8">
//                     <div className="max-w-7xl mx-auto h-full">
//                         {renderContent()}
//                     </div>
//                 </main>
//             </div>
//         </div>
//     );
// };

// export default AcademicSupervisorDashboard;

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PreferredTimetable from '../components/PreferredTimetable';
import PersonalizedTimetable from '../components/PersonalizedTimetable';
import GenerateMarkingSheet from '../components/GenerateMarkingSheet';
import AllocationsDashboard from '../components/AllocationsDashboard';
import AddDropApproval from '../components/AddDropApproval';
import AddCourseUnit from '../components/AddCourseUnit';
import TimetableConfiguration from '../components/TimetableConfiguration';
import AssignExaminer from '../components/AssignExaminer';
import SupervisorTimetableManager from '../components/SupervisorTimetableManager';
import SupervisorAlerts from '../components/SupervisorAlerts';
import RoleNotificationsPanel from '../components/RoleNotificationsPanel';

const AcademicSupervisorDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ pendingAddDrop: 0, totalCourseUnits: 0, latestAcademicYear: null });
    const [recentNotifications, setRecentNotifications] = useState([]);
    const [deadlines, setDeadlines] = useState([]);
    const [loading, setLoading] = useState(true);

    // New State for Sidebar and Navigation
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const [activeSection, setActiveSection] = useState('Home');
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const refresh = async () => {
            if (!user?.user_id) return;
            try {
                const res = await fetch(
                    `http://localhost:5000/api/deadlines/unread-count?userId=${user.user_id}&role=${encodeURIComponent('Academic Supervisor')}`
                );
                if (res.ok) {
                    const { count } = await res.json();
                    setUnreadCount(count);
                }
            } catch { /* ignore */ }
        };
        refresh();
        const interval = setInterval(refresh, 10000);
        return () => clearInterval(interval);
    }, [user?.user_id]);

    // State for Department Staff Registrations
    const [deptStaffRegistrations, setDeptStaffRegistrations] = useState([]);

    const handleApproveStaff = async (id) => {
        try {
            await fetch(`http://localhost:5000/api/dashboard/faculty-staff/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Approved' })
            });
            setDeptStaffRegistrations(deptStaffRegistrations.map(staff =>
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
            setDeptStaffRegistrations(deptStaffRegistrations.map(staff =>
                staff.id === id ? { ...staff, status: 'Rejected' } : staff
            ));
        } catch (error) {
            console.error("Error rejecting staff:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchList = [
                    fetch('http://localhost:5000/api/dashboard/stats'),
                    fetch('http://localhost:5000/api/dashboard/deadlines'),
                    fetch('http://localhost:5000/api/dashboard/department-staff')
                ];
                // Fetch notifications for the home tab (up to 3)
                if (user?.user_id) {
                    fetchList.push(
                        fetch(`http://localhost:5000/api/deadlines/notifications?userId=${user.user_id}&role=${encodeURIComponent('Academic Supervisor')}`)
                    );
                }

                const results = await Promise.all(fetchList);

                if (results[0].ok) setStats(await results[0].json());
                if (results[1].ok) setDeadlines(await results[1].json());
                if (results[2].ok) setDeptStaffRegistrations(await results[2].json());
                if (results[3] && results[3].ok) {
                    const notifs = await results[3].json();
                    setRecentNotifications(notifs.slice(0, 3));
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.user_id]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { name: 'Home', icon: '🏠' },
        { name: 'Timetable Configuration', icon: '⚙️' },
        { name: 'Preferred Timetable', icon: '🗓️' },
        { name: 'Assign Examiner', icon: '👨‍🏫' },
        { name: 'Allocations Dashboard', icon: '📊' },
        { name: 'Personalized Timetable', icon: '📅' },
        { name: 'Generate Marking Sheet', icon: '📊' },
        { name: 'Add/Drop Form Approval', icon: '📝' },
        { name: 'Department Staff Registrations', icon: '👥' },
        { name: 'Add Course Unit', icon: '➕' },
        { name: 'Alerts', icon: '🔔' }
    ];

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    const renderContent = () => {
        switch (activeSection) {
            case 'Allocations Dashboard':
                return <AllocationsDashboard />;
            case 'Personalized Timetable':
                return <PersonalizedTimetable enableConcerns={false} />;
            case 'Generate Marking Sheet':
                return <GenerateMarkingSheet />;
            case 'Preferred Timetable':
                return <PreferredTimetable />;
            case 'Assign Examiner':
                return <AssignExaminer />;
            case 'Add/Drop Form Approval':
                return <AddDropApproval />;
            case 'Add Course Unit':
                return <AddCourseUnit />;
            case 'Timetable Configuration':
                return <TimetableConfiguration />;
            case 'Alerts':
                return <RoleNotificationsPanel roleName="Academic Supervisor" />;
            case 'Department Staff Registrations':
                return (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-gray-800">Department Staff Registrations</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Email</th>
                                            <th className="px-6 py-4">Mobile Number</th>
                                            <th className="px-6 py-4">Requested At</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm md:text-base">
                                        {deptStaffRegistrations.map((staff) => (
                                            <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900">{staff.name}</td>
                                                <td className="px-6 py-4 text-gray-700">{staff.email}</td>
                                                <td className="px-6 py-4 text-gray-700">{staff.mobile}</td>
                                                <td className="px-6 py-4 text-gray-500">{new Date(staff.requestedAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${staff.status === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                                        staff.status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                                            'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                        }`}>
                                                        {staff.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {staff.status === 'Pending' ? (
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleApproveStaff(staff.id)}
                                                                className="px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 rounded-lg text-xs font-semibold transition-colors"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectStaff(staff.id)}
                                                                className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-semibold transition-colors"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs italic font-medium">
                                                            {staff.status === 'Approved' ? 'Access Granted' : 'Access Denied'}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
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
                        {/* Stats Grid - 2 cards centered */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                            <div
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer"
                                onClick={() => setActiveSection('Add/Drop Form Approval')}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Add/Drop Pending</h3>
                                    <span className="bg-orange-100 text-orange-600 p-2 rounded-lg group-hover:bg-orange-200 transition-colors">
                                        📄
                                    </span>
                                </div>
                                <div className="text-4xl font-extrabold text-gray-900">{stats.pendingAddDrop}</div>
                                <p className="text-xs text-gray-400 mt-2">Forms awaiting approval</p>
                            </div>

                            <div
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer"
                                onClick={() => setActiveSection('Add Course Unit')}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Course Units</h3>
                                    <span className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                                        📚
                                    </span>
                                </div>
                                <div className="text-4xl font-extrabold text-gray-900">{stats.totalCourseUnits}</div>
                                <p className="text-xs text-gray-400 mt-2">
                                    {stats.latestAcademicYear ? `Academic Year ${stats.latestAcademicYear}` : 'No academic year data'}
                                </p>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Recent Notifications */}
                            <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <h3 className="text-lg font-bold text-gray-800">Recent Notifications</h3>
                                    <button
                                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                                        onClick={() => setActiveSection('Alerts')}
                                    >
                                        View All
                                    </button>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {recentNotifications.length > 0 ? (
                                        recentNotifications.map((notif) => {
                                            const getIcon = (formName) => {
                                                switch (formName) {
                                                    case 'Academic Course Unit': return '📚';
                                                    case 'Add/Drop Form': return '📝';
                                                    case 'Medical/Repeat Form': return '🏥';
                                                    case 'Timetable Finalization': return '📅';
                                                    default: return '⏰';
                                                }
                                            };
                                            const formatTimeAgo = (isoString) => {
                                                const diffMs = new Date() - new Date(isoString);
                                                const diffMins = Math.floor(diffMs / 60000);
                                                if (diffMins < 1) return 'Just now';
                                                if (diffMins < 60) return `${diffMins}m ago`;
                                                const diffHours = Math.floor(diffMins / 60);
                                                if (diffHours < 24) return `${diffHours}h ago`;
                                                return `${Math.floor(diffHours / 24)}d ago`;
                                            };
                                            return (
                                                <div key={notif.id} className="p-3 hover:bg-gray-50 transition-colors flex items-start space-x-3">
                                                    <div className="mt-0.5 flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-blue-50">
                                                        {getIcon(notif.form_name)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <p className="text-sm text-gray-900 font-semibold">{notif.form_name}</p>
                                                            {!notif.is_read && (
                                                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">New</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-600 truncate">{notif.description || 'A new deadline has been set.'}</p>
                                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                                            <span>🕐 {formatTimeAgo(notif.created_at)}</span>
                                                            <span>📅 Due: {notif.deadline ? notif.deadline.substring(0, 10) : '-'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="p-6 text-gray-500 text-center text-sm">No recent notifications</div>
                                    )}
                                </div>
                            </section>

                            {/* Upcoming Deadlines */}
                            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="text-lg font-bold text-gray-800">Upcoming Deadlines</h3>
                                </div>
                                <div className="p-2 space-y-2">
                                    {deadlines.length > 0 ? (
                                        deadlines.slice(0, 3).map((deadline) => (
                                            <div key={deadline.id} className="p-3 border-l-4 border-blue-500 bg-blue-50/30 rounded-r-lg m-2 hover:bg-blue-50 transition-colors">
                                                <h4 className="text-sm font-bold text-gray-900">{deadline.title}</h4>
                                                <p className="text-xs text-gray-600 mt-1 break-words">{deadline.description}</p>
                                                <div className="mt-2 flex items-center text-xs text-indigo-700 font-semibold">
                                                    <span className={`mr-2 w-2 h-2 rounded-full ${new Date(deadline.due_date) < new Date() ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                                                    Due: {new Date(deadline.due_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-6 text-gray-500 text-center text-sm">No upcoming deadlines</div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            {/* Interactive Sidebar */}
            <aside
                className={`flex flex-col fixed h-full shadow-2xl z-50 bg-slate-900 text-white transition-all duration-300 ease-in-out ${sidebarExpanded ? 'w-64' : 'w-20'}`}
                onMouseEnter={() => setSidebarExpanded(true)}
                onMouseLeave={() => setSidebarExpanded(false)}
            >
                <div className="p-4 flex items-center justify-center border-b border-slate-800/50 h-20">
                    {sidebarExpanded ? (
                        <div className="text-center animate-fade-in">
                            <h2 className="text-2xl font-bold tracking-wider">EMS</h2>
                            <p className="text-xs text-slate-400">Academic Dashboard</p>
                        </div>
                    ) : (
                        <h2 className="text-xl font-bold">EMS</h2>
                    )}
                </div>

                <nav className="flex-1 py-6 space-y-1 overflow-y-auto no-scrollbar">
                    {menuItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveSection(item.name)}
                            className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-all relative overflow-hidden group
                                ${activeSection === item.name
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                            `}
                        >
                            {/* Active indicator */}
                            {activeSection === item.name && (
                                <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-r-full"></span>
                            )}

                            <span className="text-xl min-w-[2.5rem] text-center">{item.icon}</span>

                            <span className={`ml-3 whitespace-nowrap transition-all duration-300 origin-left ${sidebarExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-90 w-0'}`}>
                                {item.name}
                            </span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800/50">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium text-red-200 hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer group`}
                    >
                        <span className="text-xl min-w-[2.5rem] text-center group-hover:rotate-12 transition-transform">🚪</span>
                        <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                            Logout
                        </span>
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarExpanded ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md shadow-sm z-10 px-8 py-4 flex justify-between items-center sticky top-0">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 transition-all">{activeSection}</h1>
                        <p className="text-sm text-gray-500 font-medium">Welcome, {user?.name || 'Academic Supervisor'}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            onClick={() => setActiveSection('Alerts')}
                            title="Notifications & Alerts"
                        >
                            🔔
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 ring-2 ring-white text-white text-[10px] font-bold flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                        <div className="h-10 w-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 ring-2 ring-white cursor-pointer hover:ring-blue-100 transition-all">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 p-8">
                    <div className="max-w-7xl mx-auto h-full">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AcademicSupervisorDashboard;