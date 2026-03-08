import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StudentPersonalizedTimetable from '../components/StudentPersonalizedTimetable';
import StudentCourseUnitRegistration from '../components/StudentCourseUnitRegistration';
import StudentAddDropForm from '../components/StudentAddDropForm';

import StudentMedicalRepeatForm from '../components/StudentMedicalRepeatForm';
import StudentDeadlines from '../components/StudentDeadlines';
import StudentNotifications from '../components/StudentNotifications';
import StudentExamCalendar from '../components/StudentExamCalendar';
import RoleNotificationsPanel from '../components/RoleNotificationsPanel';

const BatchRepDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const [activeSection, setActiveSection] = useState('Home');
    const [unreadCount, setUnreadCount] = useState(0);

    // New states for Appoint BatchRep
    const [isAppointModalOpen, setIsAppointModalOpen] = useState(false);
    const [studentsLevelList, setStudentsLevelList] = useState([]);
    const [selectedNewRep, setSelectedNewRep] = useState(null);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const openAppointModal = async () => {
        setIsAppointModalOpen(true);
        setLoadingStudents(true);
        setSelectedNewRep(null);
        try {
            const res = await fetch(`http://localhost:5000/api/users/students/level/${user?.level || 1}`);
            if (res.ok) {
                const data = await res.json();
                setStudentsLevelList(data);
            }
        } catch (error) {
            console.error("Error fetching students by level:", error);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleAppointSubmit = async () => {
        if (!selectedNewRep) return;
        try {
            const res = await fetch('http://localhost:5000/api/users/swap-batchrep', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentBatchRepId: user.user_id,
                    newBatchRepId: selectedNewRep
                })
            });
            if (res.ok) {
                alert("Successfully appointed new Batch Representative! You will now be logged out as your role has changed.");
                logout();
                navigate('/login');
            } else {
                alert("Failed to appoint new Batch Representative.");
            }
        } catch (error) {
            console.error("Error swapping roles:", error);
            alert("An error occurred while swapping roles.");
        }
    };

    useEffect(() => {
        const refresh = async () => {
            if (!user?.user_id) return;
            try {
                const [res1, res2] = await Promise.all([
                    fetch(`http://localhost:5000/api/deadlines/unread-count?userId=${user.user_id}&role=${encodeURIComponent('Batch Representative')}`),
                    fetch(`http://localhost:5000/api/deadlines/unread-count?userId=${user.user_id}&role=${encodeURIComponent('Students')}`)
                ]);
                let total = 0;
                if (res1.ok) total += (await res1.json()).count;
                if (res2.ok) total += (await res2.json()).count;
                setUnreadCount(total);
            } catch { /* ignore */ }
        };
        refresh();
        const interval = setInterval(refresh, 10000);
        return () => clearInterval(interval);
    }, [user?.user_id]);

    // Mock Data for Quick Actions
    const quickActions = [
        { id: 1, title: 'View Registered Form State', icon: '📝', color: 'blue', action: 'form-status' },
        { id: 2, title: 'Register Academic Course Unit', icon: '📚', color: 'purple', action: 'register-course' },
        { id: 3, title: 'Add / Drop Course Unit', icon: '🔄', color: 'orange', action: 'add-drop' },
        { id: 4, title: 'Apply for Repeat / Medical', icon: '🏥', color: 'red', action: 'medical-repeat' },
        { id: 5, title: 'Download Timetable', icon: '📅', color: 'indigo', action: 'timetable' },
        { id: 6, title: 'View Deadlines', icon: '⏰', color: 'yellow', action: 'deadlines' },
        { id: 7, title: 'Notifications & Alerts', icon: '🔔', color: 'green', action: 'notifications' },
    ];

    // Mock Data for Upcoming Exams
    const upcomingExams = [
        { id: 1, courseCode: 'CSC301', title: 'Data Structures', date: '2026-02-15', time: '09:00 AM', venue: 'Hall A' },
        { id: 2, courseCode: 'ENG202', title: 'Software Engineering', date: '2026-02-18', time: '01:00 PM', venue: 'Hall B' },
    ];

    // Mock Data for Deadlines
    const deadlines = [
        { id: 1, title: 'Course Registration', date: '2026-01-30', status: 'Upcoming' },
        { id: 2, title: 'Add/Drop Period End', date: '2026-02-05', status: 'Urgent' },
    ];

    // Mock Data for Notifications
    const notifications = [
        { id: 1, message: 'Medical Request Pending', time: '2 hours ago' },
        { id: 2, message: 'Course Registration Approved', time: '1 day ago' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { name: 'Home', icon: '🏠' },
        { name: 'Academic Course Unit', icon: '📚' },
        { name: 'Add / Drop Form', icon: '📝' },
        { name: 'Medical / Repeat Form', icon: '🏥' },
        { name: 'Personalized Timetable', icon: '📅' },
        { name: 'Deadlines', icon: '⏰' },
        { name: 'Notifications & Alerts', icon: '🔔' },
        { name: 'Timetable Configuration', icon: '📅' },
    ];

    const renderContent = () => {
        if (activeSection === 'Personalized Timetable') {
            return <StudentPersonalizedTimetable />;
        }

        if (activeSection === 'Academic Course Unit') {
            return <StudentCourseUnitRegistration />;
        }

        if (activeSection === 'Add / Drop Form') {
            return <StudentAddDropForm />;
        }

        if (activeSection === 'Medical / Repeat Form') {
            return <StudentMedicalRepeatForm />;
        }

        if (activeSection === 'Deadlines') {
            return <StudentDeadlines />;
        }

        if (activeSection === 'Notifications & Alerts') {
            return (
                <div>
                    <StudentNotifications />
                </div>
            );
        }

        if (activeSection !== 'Home') {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center p-10 bg-white rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-400 mb-2">{activeSection}</h2>
                        <p className="text-gray-500">This module is currently under development.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
                {/* Welcome Section */}
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-gray-800">Welcome, {user?.name || 'Representative'}</h2>
                        <p className="text-gray-500 mt-1">Manage your batch responsibilities and academic journey.</p>
                    </div>
                    {/* Simplified Profile for Header Section as requested in UI description essentially */}
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold text-gray-800">{user?.name || 'John Smith'}</span>
                            <span className="text-xs text-gray-500">{user?.studentId || 'ID: 20230001'}</span>
                        </div>
                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                            {user?.name?.charAt(0) || 'J'}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <section>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {quickActions.map((action) => (
                            <div
                                key={action.id}
                                onClick={() => {
                                    if (action.title.includes('Timetable')) setActiveSection('Personalized Timetable');
                                    else if (action.title.includes('Deadlines')) setActiveSection('Deadlines');
                                    else if (action.title.includes('Notifications')) setActiveSection('Notifications & Alerts');
                                    else if (action.title.includes('Register')) setActiveSection('Academic Course Unit');
                                    else if (action.title.includes('Add / Drop')) setActiveSection('Add / Drop Form');
                                    else if (action.title.includes('Medical')) setActiveSection('Medical / Repeat Form');
                                    // Default fallback
                                }}
                                className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1"
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-${action.color}-50 text-${action.color}-600`}>
                                    <span className="text-xl">{action.icon}</span>
                                </div>
                                <h4 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{action.title}</h4>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upcoming Exams */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-800">Upcoming Exams</h3>
                            <button className="text-xs text-blue-600 hover:text-blue-800 font-semibold uppercase tracking-wide">View All</button>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {upcomingExams.map((exam) => (
                                <div key={exam.id} className="p-5 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between">
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{exam.courseCode} - {exam.title}</h4>
                                            <p className="text-sm text-gray-500 mt-1">📍 {exam.venue}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">{exam.date}</p>
                                            <p className="text-sm text-gray-500">{exam.time}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Right Column: Deadlines & Notifications */}
                    <div className="space-y-8">
                        {/* Deadlines Section */}
                        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-lg font-bold text-gray-800">Important Deadlines</h3>
                                <button onClick={() => setActiveSection('Deadlines')} className="text-xs text-blue-600 hover:text-blue-800 font-semibold uppercase tracking-wide">View All</button>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {deadlines.map((deadline) => (
                                    <div key={deadline.id} className="p-5 hover:bg-gray-50 transition-colors flex justify-between items-center">
                                        <div>
                                            <h4 className="font-medium text-gray-800">{deadline.title}</h4>
                                            <p className="text-xs text-gray-500 mt-1">{deadline.date}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${deadline.status === 'Urgent' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                            }`}>
                                            {deadline.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Notifications Section */}
                        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-lg font-bold text-gray-800">Notifications</h3>
                                <button onClick={() => setActiveSection('Notifications & Alerts')} className="text-xs text-blue-600 hover:text-blue-800 font-semibold uppercase tracking-wide">View All</button>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notif) => (
                                    <div key={notif.id} className="p-5 hover:bg-gray-50 transition-colors">
                                        <p className="text-sm text-gray-800 font-medium">{notif.message}</p>
                                        <p className="text-xs text-gray-400 mt-2">{notif.time}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
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
                            <p className="text-xs text-slate-400">Representative Portal</p>
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
                        <h1 className="text-2xl font-bold text-gray-800 transition-all">{activeSection === 'Home' ? 'Batch Representative Dashboard' : activeSection}</h1>
                        <p className="text-sm text-gray-500 font-medium">{user?.departement || 'Department of Industrial Managemnt'}</p>
                    </div>
                    {/* Header Profile Section - Hidden on mobile as it conflicts with content usually, but shown in design */}
                    <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-end mr-2 hidden md:block">
                            <span className="text-sm font-semibold text-gray-700">{user?.name || 'John Smith'}</span>
                            <span className="text-xs text-gray-500">{user?.role || 'Batch Representative'}</span>
                            <button
                                onClick={openAppointModal}
                                className="mt-1 text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-200 hover:bg-indigo-100 transition-colors"
                            >
                                Appoint BatchRep
                            </button>
                        </div>
                        <button
                            className="relative h-10 w-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow"
                            onClick={() => setActiveSection('Notifications & Alerts')}
                            title="Notifications"
                        >
                            {user?.name?.charAt(0) || 'J'}
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 ring-2 ring-white text-white text-[10px] font-bold flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-8">
                    {activeSection === 'Timetable Configuration' ? (
                        <StudentExamCalendar />
                    ) : (
                        renderContent()
                    )}
                </main>
            </div>

            {/* Appoint BatchRep Modal */}
            {isAppointModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 w-full max-w-md mx-4 animate-scale-in flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-4 border-b pb-2 shrink-0">
                            <h3 className="text-xl font-bold text-gray-800">Appoint New Batch Representative</h3>
                            <button
                                onClick={() => setIsAppointModalOpen(false)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 shrink-0">
                            Select a student from your level to transfer your Batch Representative role to.
                            This action will change your account to a regular Student and log you out.
                        </p>

                        <div className="overflow-y-auto mb-4 border rounded-lg bg-gray-50/50 p-2 flex-grow min-h-[150px] max-h-[50vh]">
                            {loadingStudents ? (
                                <div className="p-4 text-center text-gray-500">Loading students...</div>
                            ) : studentsLevelList.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">No available students found in your level.</div>
                            ) : (
                                <div className="space-y-2">
                                    {studentsLevelList.filter(s => s.user_id !== user?.user_id).map((student) => (
                                        <label
                                            key={student.user_id}
                                            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${selectedNewRep === student.user_id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                                        >
                                            <input
                                                type="radio"
                                                name="newRep"
                                                value={student.user_id}
                                                checked={selectedNewRep === student.user_id}
                                                onChange={() => setSelectedNewRep(student.user_id)}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 mr-3"
                                            />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">{student.name}</p>
                                                <p className="text-xs text-gray-500">{student.student_number} • {student.email}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3 mt-2 shrink-0">
                            <button
                                onClick={() => setIsAppointModalOpen(false)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAppointSubmit}
                                disabled={!selectedNewRep}
                                className={`px-4 py-2 font-semibold rounded-lg transition-colors ${!selectedNewRep ? 'bg-indigo-300 text-white cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'}`}
                            >
                                Appoint & Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchRepDashboard;
