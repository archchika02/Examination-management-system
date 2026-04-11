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
import ExaminationIrregularities from '../components/ExaminationIrregularities';

// Professional SVG Icon Library
const Icons = {
    Home: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
    ),
    Settings: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
    ),
    Calendar: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
    ),
    UserCheck: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></svg>
    ),
    BarChart: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="18" y1="20" y2="10" /><line x1="12" x2="12" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="14" /></svg>
    ),
    Upload: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
    ),
    FileText: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
    ),
    Users: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    ),
    Plus: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" /></svg>
    ),
    Bell: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
    ),
    FileWarning: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
    )
};

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

    const menuItems = [
        { name: 'Home', icon: <Icons.Home /> },
        { name: 'Timetable Configuration', icon: <Icons.Settings /> },
        { name: 'Preferred Timetable', icon: <Icons.Calendar /> },
        { name: 'Assign Examiner', icon: <Icons.UserCheck /> },
        { name: 'Allocations Dashboard', icon: <Icons.BarChart /> },
        { name: 'Personalized Timetable', icon: <Icons.Calendar /> },
        { name: 'Generate Marking Sheet', icon: <Icons.BarChart /> },
        { name: 'Add/Drop Form Approval', icon: <Icons.FileText /> },
        { name: 'Department Staff Registrations', icon: <Icons.Users /> },
        { name: 'Add Course Unit', icon: <Icons.Plus /> },
        { name: 'Examination Irregularities', icon: <Icons.FileWarning /> },
        { name: 'Alerts', icon: <Icons.Bell /> }
    ];

    useEffect(() => {
        const refresh = async () => {
            if (!user?.user_id) return;
            try {
                const unreadRes = await fetch(
                    `http://localhost:5000/api/deadlines/unread-count?userId=${user.user_id}&role=${encodeURIComponent('Academic Supervisor')}`
                );
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
            case 'Examination Irregularities':
                return <ExaminationIrregularities />;
            case 'Department Staff Registrations':
                return (
                    <div className="space-y-6 animate-fade-in-up">
                        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                        <Icons.Users />
                                    </span>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">Department Staff Registrations</h2>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">Manage access requests from department personnel</p>
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase text-slate-500 font-black tracking-widest">
                                            <th className="px-8 py-4">Personnel</th>
                                            <th className="px-8 py-4">Contact Info</th>
                                            <th className="px-8 py-4">Requested On</th>
                                            <th className="px-8 py-4">Status</th>
                                            <th className="px-8 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {deptStaffRegistrations.length > 0 ? (
                                            deptStaffRegistrations.map((staff) => (
                                                <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200 group-hover:bg-white transition-colors uppercase">
                                                                {staff.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-slate-900 leading-none mb-1">{staff.name}</div>
                                                                <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-tighter inline-block">DEPARTMENT STAFF</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="text-xs font-medium text-slate-900 mb-1">{staff.email}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold">{staff.mobile}</div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="text-xs font-bold text-slate-600">{new Date(staff.requestedAt).toLocaleDateString('en-GB')}</div>
                                                        <div className="text-[10px] text-slate-400 font-medium">Request Date</div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                                                            ${staff.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                                staff.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                                    'bg-amber-50 text-amber-700 border-amber-100'
                                                            }`}>
                                                            <span className={`w-1 h-1 rounded-full mr-1.5 ${staff.status === 'Approved' ? 'bg-emerald-500' : staff.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                                                            {staff.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        {staff.status === 'Pending' ? (
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleApproveStaff(staff.id)}
                                                                    className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-bold shadow-sm shadow-emerald-100 transition-all hover:-translate-y-0.5 active:translate-y-0"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRejectStaff(staff.id)}
                                                                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 rounded-lg text-xs font-bold transition-all"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md">
                                                                    {staff.status === 'Approved' ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-8 py-12 text-center">
                                                    <p className="text-sm font-bold text-slate-400 italic">No registrations requests found</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                );
            case 'Home':
            default:
                return (
                    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
                        {/* Welcome Section */}
                        <div className="bg-gradient-to-r from-slate-900 to-blue-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold mb-2">Welcome, {user?.name || 'Supervisor'}</h2>
                                    <p className="text-blue-100 text-lg font-medium">Academic Management & Approvals Portal</p>
                                </div>
                            </div>
                            {/* Decorative pulsing circles */}
                            <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>
                        </div>
                        {/* Stats Grid - 2 cards centered */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            <div
                                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group cursor-pointer relative overflow-hidden"
                                onClick={() => setActiveSection('Add/Drop Form Approval')}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Add/Drop Pending</h3>
                                    <span className="p-2.5 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-100 transition-colors">
                                        <Icons.FileText />
                                    </span>
                                </div>
                                <div className="text-4xl font-extrabold text-slate-900 mb-1">{stats.pendingAddDrop}</div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full">ACTION REQUIRED</span>
                                    <p className="text-xs text-slate-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Forms awaiting your approval</p>
                                </div>
                            </div>

                            <div
                                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group cursor-pointer relative overflow-hidden"
                                onClick={() => setActiveSection('Add Course Unit')}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <div className="flex flex-col">
                                        <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Course Registry</h3>
                                        <p className="text-[9px] text-blue-600 font-black tracking-tighter uppercase mt-0.5">Academic year: {stats.latestAcademicYear || '---'}</p>
                                    </div>
                                    <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors">
                                        <Icons.Plus />
                                    </span>
                                </div>

                                <div className="flex items-baseline gap-2 mb-4">
                                    <div className="text-3xl font-extrabold text-slate-900">{stats.totalCourseUnits}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Modules</div>
                                </div>

                                <div className="space-y-2.5 border-t border-slate-50 pt-4">
                                    {[1, 2, 3, 4].map((lvl) => {
                                        const data = stats.levelBreakdown?.[lvl] || { written: 0, nonWritten: 0, year: '---' };
                                        return (
                                            <div key={lvl} className="flex items-center justify-between group/row">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Level {lvl}</span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{data.year}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-100/50">
                                                        <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                                                        <span className="text-[9px] font-black text-emerald-700">W: {data.written}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-50 rounded-lg border border-purple-100/50">
                                                        <span className="w-1 h-1 rounded-full bg-purple-500"></span>
                                                        <span className="text-[9px] font-black text-purple-700">NW: {data.nonWritten}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Recent Notifications */}
                            <section className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <div className="flex items-center gap-2">
                                        <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                            <Icons.Bell />
                                        </span>
                                        <h3 className="text-sm font-bold text-slate-900">Recent Notifications</h3>
                                    </div>
                                    <button
                                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider px-3 py-1 bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                        onClick={() => setActiveSection('Alerts')}
                                    >
                                        View All
                                    </button>
                                </div>
                                <div className="divide-y divide-slate-100">
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
                                                <div key={notif.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4">
                                                    <div className="mt-0.5 flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-blue-50/50 text-blue-600 border border-blue-100/50">
                                                        {getIcon(notif.form_name)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <p className="text-sm font-bold text-slate-900">{notif.form_name}</p>
                                                            <div className="flex items-center gap-2">
                                                                {!notif.is_read && (
                                                                    <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded-full uppercase tracking-tighter shadow-sm shadow-blue-200">New</span>
                                                                )}
                                                                <span className="text-[10px] font-bold text-slate-400">{formatTimeAgo(notif.created_at)}</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-2">{notif.description || 'A new deadline has been set.'}</p>
                                                        <div className="flex items-center gap-3">
                                                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                                DUE: {notif.deadline ? new Date(notif.deadline).toLocaleDateString('en-GB') : '-'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="p-12 flex flex-col items-center justify-center text-center">
                                            <div className="p-4 bg-slate-50 rounded-full mb-3 text-slate-300">
                                                <Icons.Bell />
                                            </div>
                                            <p className="text-sm font-bold text-slate-900">All caught up!</p>
                                            <p className="text-xs text-slate-400 mt-1">No new notifications at the moment.</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Upcoming Deadlines */}
                            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                                    <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                        <Icons.Calendar />
                                    </span>
                                    <h3 className="text-sm font-bold text-slate-900">Upcoming Deadlines</h3>
                                </div>
                                <div className="p-4 space-y-4">
                                    {deadlines.length > 0 ? (
                                        deadlines.slice(0, 3).map((deadline) => (
                                            <div key={deadline.id} className="group p-4 border border-slate-100 bg-slate-50/30 rounded-xl hover:border-blue-200 hover:bg-blue-50/20 transition-all">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <h4 className="text-[13px] font-bold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">{deadline.title}</h4>
                                                    <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${new Date(deadline.due_date) < new Date() ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">{deadline.description}</p>
                                                <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
                                                    <span className="text-slate-400">Due Date</span>
                                                    <span className={new Date(deadline.due_date) < new Date() ? 'text-rose-600' : 'text-blue-600'}>
                                                        {new Date(deadline.due_date).toLocaleDateString('en-GB')}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-12 text-center">
                                            <p className="text-xs font-bold text-slate-400">No deadlines set</p>
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
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            {/* Interactive Sidebar */}
            <aside
                className={`flex flex-col fixed h-full shadow-[0_0_40px_rgba(0,0,0,0.1)] z-50 bg-slate-900 text-white transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebarExpanded ? 'w-64' : 'w-20'}`}
                onMouseEnter={() => setSidebarExpanded(true)}
                onMouseLeave={() => setSidebarExpanded(false)}
            >
                <div className="p-4 flex items-center justify-center border-b border-slate-800/50 h-24">
                    {sidebarExpanded ? (
                        <div className="text-center animate-fade-in">
                            <h2 className="text-2xl font-black tracking-tighter text-white">EMS<span className="text-blue-500">.</span></h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supervisor Portal</p>
                        </div>
                    ) : (
                        <h2 className="text-xl font-black text-blue-500">E.</h2>
                    )}
                </div>

                <nav className="flex-1 py-6 space-y-1 overflow-y-auto no-scrollbar px-3">
                    {menuItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveSection(item.name)}
                            className={`w-full flex items-center px-3 py-3 rounded-xl text-sm font-bold transition-all relative overflow-hidden group mb-1
                                ${activeSection === item.name
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
                            `}
                        >
                            <span className={`transition-transform duration-300 ${activeSection === item.name ? 'scale-110' : 'group-hover:scale-110'}`}>
                                {item.icon}
                            </span>

                            <span className={`ml-3 whitespace-nowrap transition-all duration-300 origin-left ${sidebarExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-90 w-0'}`}>
                                {item.name}
                            </span>

                            {!sidebarExpanded && activeSection === item.name && (
                                <span className="absolute right-2 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.6)]"></span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800/50">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center px-3 py-3 text-sm font-bold text-slate-400 hover:bg-rose-900/20 hover:text-rose-400 rounded-xl transition-all cursor-pointer group`}
                    >
                        <span className="group-hover:rotate-12 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                        </span>
                        <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                            Log Out
                        </span>
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebarExpanded ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 z-10 px-8 py-4 flex justify-between items-center sticky top-0 h-24">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{activeSection}</h1>
                    </div>
                    <div className="flex items-center space-x-6">
                        <button
                            className="relative p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group"
                            onClick={() => setActiveSection('Alerts')}
                            title="Notifications & Alerts"
                        >
                            <Icons.Bell />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 h-4 w-4 rounded-full bg-rose-600 ring-4 ring-white text-white text-[9px] font-black flex items-center justify-center shadow-lg shadow-rose-200 animate-bounce">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        <div className="h-8 w-[1px] bg-slate-100 hidden md:block"></div>

                        <div className="hidden md:flex items-center space-x-4">
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">{user?.name || 'Supervisor'}</span>
                                <span className="text-[10px] font-bold text-blue-600/70 uppercase tracking-widest">Academic Authority</span>
                            </div>
                            <div className="h-12 w-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center text-white font-black shadow-xl shadow-slate-200 ring-4 ring-white overflow-hidden group cursor-pointer hover:ring-blue-100 transition-all relative">
                                <span className="relative z-10 group-hover:scale-110 transition-transform">{user?.name?.charAt(0) || 'S'}</span>
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
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