import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PersonalizedTimetable from '../components/PersonalizedTimetable';
import GenerateMarkingSheet from '../components/GenerateMarkingSheet';

const DepartmentStaffDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const [activeSection, setActiveSection] = useState('Home');

    // Mock Data for Department Staff Dashboard
    const stats = {
        upcomingExams: 5,
        pendingResults: 12,
        totalCourses: 3
    };

    // Mock Data for Upcoming Examinations
    const upcomingExams = [
        { id: 1, date: '2026-01-28', time: '09:00 AM', courseUnit: 'INTE 21213 - Web Application Development', venue: 'A8 203', role: 'Invigilator' },
        { id: 2, date: '2026-02-02', time: '01:00 PM', courseUnit: 'INTE 22253 - Distributed Systems and cloud Computing', venue: 'A8 203', role: 'Supervisor' },
        { id: 3, date: '2026-02-10', time: '09:00 AM', courseUnit: 'INTE 22283 - Mobile Application Development', venue: 'A8 203', role: 'Invigilator' },
    ];

    // Mock Data for Notifications
    const notifications = [
        { id: 1, type: 'venue', message: 'Personalized timetable released', time: 'Yesterday', urgent: false },
        { id: 2, type: 'meeting', message: 'New reschedule allocated', time: '2 days ago', urgent: false },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { name: 'Home', icon: '🏠' },
        { name: 'Personalized Timetable', icon: '📅' },
        { name: 'Generate Marking Sheet', icon: '📊' },
    ];

    const renderContent = () => {
        if (activeSection === 'Personalized Timetable') {
            return <PersonalizedTimetable enableConcerns={true} />;
        }

        if (activeSection === 'Generate Marking Sheet') {
            return <GenerateMarkingSheet />;
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
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-2">Welcome, {user?.name || 'Staff Member'}</h2>
                        <p className="text-teal-100 text-lg">Your examination duties and tasks overview.</p>
                    </div>
                    {/* Decorative pulsing circles */}
                    <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>
                </div>

                {/* Summary Cards Grid */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Upcoming Exams Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Upcoming Exams</h3>
                                <div className="text-3xl font-extrabold text-gray-900 mt-1">{stats.upcomingExams}</div>
                            </div>
                            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">📅</span>
                        </div>
                        <div className="text-xs font-medium text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded-md">
                            Next: {upcomingExams[0]?.courseUnit}
                        </div>
                    </div>

                    {/* Pending Results Card */}
                    <div
                        onClick={() => setActiveSection('Generate Marking Sheet')}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Pending Results</h3>
                                <div className="text-3xl font-extrabold text-gray-900 mt-1">{stats.pendingResults}</div>
                            </div>
                            <span className="p-2 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-100 transition-colors">📤</span>
                        </div>
                        <div className="text-xs font-medium text-orange-600 bg-orange-50 inline-block px-2 py-1 rounded-md">
                            Uploads Required
                        </div>
                    </div>

                    {/* Total Courses Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Courses</h3>
                                <div className="text-3xl font-extrabold text-gray-900 mt-1">{stats.totalCourses}</div>
                            </div>
                            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">📚</span>
                        </div>
                        <div className="text-xs font-medium text-purple-600 bg-purple-50 inline-block px-2 py-1 rounded-md">
                            Assigned this semester
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Upcoming Examinations Table */}
                    <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">Upcoming Examinations</h3>
                            <button onClick={() => setActiveSection('Personalized Timetable')} className="text-xs text-blue-600 hover:text-blue-800 font-semibold uppercase tracking-wide">View Full Schedule</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                        <th className="p-4 font-semibold">Date</th>
                                        <th className="p-4 font-semibold">Time</th>
                                        <th className="p-4 font-semibold">Course Unit</th>
                                        <th className="p-4 font-semibold">Venue</th>
                                        <th className="p-4 font-semibold">Role</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {upcomingExams.map((exam) => (
                                        <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 text-gray-700 font-medium">{exam.date}</td>
                                            <td className="p-4 text-gray-500">{exam.time}</td>
                                            <td className="p-4 text-gray-800 font-semibold">{exam.courseUnit}</td>
                                            <td className="p-4 text-gray-600"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{exam.venue}</span></td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${exam.role === 'Supervisor' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {exam.role}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Notifications Section */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-800">Notifications</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {notifications.map((notif) => (
                                <div key={notif.id} className="p-5 hover:bg-gray-50 transition-colors relative">
                                    {notif.urgent && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>}
                                    <div className="flex items-start">
                                        <div className={`mt-0.5 flex-shrink-0 w-2 h-2 rounded-full mr-3 ${notif.urgent ? 'bg-red-500' : 'bg-blue-400'}`}></div>
                                        <div>
                                            <p className="text-sm text-gray-800 font-medium leading-snug">{notif.message}</p>
                                            <p className="text-xs text-gray-400 mt-2">{notif.time}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 text-center border-t border-gray-100">
                            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All Notifications</button>
                        </div>
                    </section>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`flex flex-col fixed h-full shadow-2xl z-50 bg-slate-900 text-white transition-all duration-300 ease-in-out ${sidebarExpanded ? 'w-64' : 'w-20'}`}
                onMouseEnter={() => setSidebarExpanded(true)}
                onMouseLeave={() => setSidebarExpanded(false)}
            >
                <div className="p-4 flex items-center justify-center border-b border-slate-800/50 h-20">
                    {sidebarExpanded ? (
                        <div className="text-center animate-fade-in">
                            <h2 className="text-2xl font-bold tracking-wider">EMS</h2>
                            <p className="text-xs text-slate-400">Department Staff</p>
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
                                    ? 'bg-teal-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                            `}
                        >
                            {activeSection === item.name && (
                                <span className="absolute left-0 top-0 bottom-0 w-1 bg-teal-400 rounded-r-full"></span>
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

            {/* Main Content */}
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarExpanded ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md shadow-sm z-10 px-8 py-4 flex justify-between items-center sticky top-0">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 transition-all">{activeSection === 'Home' ? 'Dashboard' : activeSection}</h1>
                        <p className="text-sm text-gray-500 font-medium">Department Staff</p>
                    </div>
                    <div className="flex items-center space-x-6">
                        {/* Notification Icon */}
                        <div className="relative cursor-pointer text-gray-500 hover:text-gray-700 transition-colors">
                            <span className="text-xl">🔔</span>
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">3</span>
                        </div>

                        <div className="flex flex-col items-end mr-2 hidden md:block">
                            <span className="text-sm font-semibold text-gray-700">{user?.name || 'Jane Doe'}</span>
                            <span className="text-xs text-gray-500">{user?.role || 'Department Staff'}</span>
                        </div>
                        <button className="h-10 w-10 bg-gradient-to-tr from-teal-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-shadow">
                            {user?.name?.charAt(0) || 'D'}
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default DepartmentStaffDashboard;
