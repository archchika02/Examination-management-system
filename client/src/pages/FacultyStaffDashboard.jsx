import { useState } from 'react';
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

const FacultyStaffDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const [activeSection, setActiveSection] = useState('Home');

    // Mock Data for Dashboard Summary Cards
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

    // Mock Data for Upcoming Deadlines
    const deadlines = [
        { id: 1, title: 'Course Registration Form', date: '2026-01-28', timeLeft: '3 days left' },
        { id: 2, title: 'Medical Form Submission', date: '2026-02-05', timeLeft: '10 days left' },
        { id: 3, title: 'Add/Drop Period End', date: '2026-02-10', timeLeft: '15 days left' },
    ];

    // Mock Data for Recent Activities
    const activities = [
        { id: 1, type: 'approval', description: 'Timetable finalized ', time: '2 hours ago' },
        { id: 2, type: 'rejection', description: 'Rejected medical form for Student 2023015', time: 'Yesterday at 10:00 AM' },
        { id: 3, type: 'creation', description: 'Created new deadline for Exam Registration', time: 'Yesterday at 3:30 PM' },
        { id: 4, type: 'assignment', description: 'Assigned Hall Attendant to A8 103', time: '2 days ago' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { name: 'Home', icon: '🏠' },
        { name: 'Timetable', icon: '📅' },
        { name: 'Hall Attendants Allocation & Final Timetable', icon: '👥' },
        { name: 'Generate Reports', icon: '📊' },
        { name: 'Add/Drop Forms', icon: '📝' },
        { name: 'Academic Course Units', icon: '📚' },
        { name: 'Medical/Repeat Forms', icon: '🏥' },
        { name: 'Deadlines', icon: '⏰' },
        { name: 'Edit Forms', icon: '✏️' },
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
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-2">Welcome Back, {user?.name || 'Faculty Staff'}</h2>
                        <p className="text-blue-100 text-lg">Overview of examination management operations.</p>
                    </div>
                    {/* Decorative pulsing circles */}
                    <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>
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
                                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Timetables</h3>
                                <div className="text-3xl font-extrabold text-gray-900 mt-1">{stats.timetablesManaged}</div>
                            </div>
                            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">📅</span>
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
                                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Add/Drop Forms</h3>
                                <div className="text-3xl font-extrabold text-gray-900 mt-1">{stats.addDropSubmitted}</div>
                            </div>
                            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">📝</span>
                        </div>
                        <div className="text-xs font-medium text-purple-600 bg-purple-50 inline-block px-2 py-1 rounded-md">
                            {stats.addDropPending} Pending Action
                        </div>
                    </div>

                    {/* Medical/Repeat Forms Card */}
                    <div
                        onClick={() => setActiveSection('Medical/Repeat Forms')}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Medical Requests</h3>
                                <div className="text-3xl font-extrabold text-gray-900 mt-1">{stats.medicalRequests}</div>
                            </div>
                            <span className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100 transition-colors">🏥</span>
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
                                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Active Deadlines</h3>
                                <div className="text-3xl font-extrabold text-gray-900 mt-1">{stats.activeDeadlines}</div>
                            </div>
                            <span className="p-2 bg-yellow-50 text-yellow-600 rounded-lg group-hover:bg-yellow-100 transition-colors">⏰</span>
                        </div>
                        <div className="text-xs font-medium text-yellow-700 bg-yellow-50 inline-block px-2 py-1 rounded-md">
                            {stats.pendingDeadlines} Ending Soon
                        </div>
                    </div>
                </section>

                {/* Secondary Metrics Grid */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div onClick={() => setActiveSection('Academic Course Units')} className="bg-white p-4 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase">Course Units</p>
                            <p className="text-xl font-bold text-gray-800">{stats.courseUnits}</p>
                        </div>
                        <span className="text-gray-300">📚</span>
                    </div>
                    <div onClick={() => setActiveSection('Generate Reports')} className="bg-white p-4 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase">Allocations</p>
                            <p className="text-xl font-bold text-gray-800">{stats.allocations}</p>
                        </div>
                        <span className="text-gray-300">📊</span>
                    </div>
                    <div onClick={() => setActiveSection('Hall Attendants')} className="bg-white p-4 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase">Attendants</p>
                            <p className="text-xl font-bold text-gray-800">{stats.hallAttendants}</p>
                        </div>
                        <span className="text-gray-300">👥</span>
                    </div>
                    <div onClick={() => setActiveSection('Edit Forms')} className="bg-white p-4 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase">Edit Forms</p>
                            <p className="text-xl font-bold text-gray-800">{stats.editForms}</p>
                        </div>
                        <span className="text-gray-300">✏️</span>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Upcoming Deadlines Section */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-800">Upcoming Deadlines</h3>
                            <button onClick={() => setActiveSection('Deadlines')} className="text-xs text-blue-600 hover:text-blue-800 font-semibold uppercase tracking-wide">View All</button>
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
                    <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-800">Recent Activities</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {activities.map((activity) => (
                                <div key={activity.id} className="p-5 hover:bg-gray-50 transition-colors flex items-start space-x-4">
                                    <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs
                                        ${activity.type === 'approval' ? 'bg-green-100 text-green-600' :
                                            activity.type === 'rejection' ? 'bg-red-100 text-red-600' :
                                                activity.type === 'creation' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                        {activity.type === 'approval' ? '✓' :
                                            activity.type === 'rejection' ? '✕' :
                                                activity.type === 'creation' ? '+' : '•'}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-800 font-medium">{activity.description}</p>
                                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
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
                            <p className="text-xs text-slate-400">Faculty Staff</p>
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
                            {activeSection === item.name && (
                                <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-r-full"></span>
                            )}
                            <div className="relative">
                                <span className="text-xl min-w-[2.5rem] text-center">{item.icon}</span>
                                {item.name === 'Hall Attendants' && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                )}
                            </div>
                            <span className={`ml-3 whitespace-nowrap transition-all duration-300 origin-left flex-1 text-left ${sidebarExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-90 w-0'}`}>
                                {item.name}
                                {item.name === 'Hall Attendants' && sidebarExpanded && (
                                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        2
                                    </span>
                                )}
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
                        <p className="text-sm text-gray-500 font-medium">{user?.designation || 'Faculty Staff'}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-end mr-2 hidden md:block">
                            <span className="text-sm font-semibold text-gray-700">{user?.name || 'Dr. Sarah Johnson'}</span>
                            <span className="text-xs text-gray-500">{user?.role || 'Faculty Staff'}</span>
                        </div>
                        <button className="h-10 w-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow">
                            {user?.name?.charAt(0) || 'S'}
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

export default FacultyStaffDashboard;
