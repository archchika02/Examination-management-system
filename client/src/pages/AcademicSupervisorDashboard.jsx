import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PreferredTimetable from '../components/PreferredTimetable';
import AllocationsDashboard from '../components/AllocationsDashboard';
import AddDropApproval from '../components/AddDropApproval';
import AddCourseUnit from '../components/AddCourseUnit';
import TimetableConfiguration from '../components/TimetableConfiguration';
import AssignExaminer from '../components/AssignExaminer';
import SupervisorTimetableManager from '../components/SupervisorTimetableManager';

const AcademicSupervisorDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ pendingAddDrop: 0, totalCourseUnits: 0, activeAlerts: 0 });
    const [activities, setActivities] = useState([]);
    const [deadlines, setDeadlines] = useState([]);
    const [loading, setLoading] = useState(true);

    // New State for Sidebar and Navigation
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const [activeSection, setActiveSection] = useState('Home');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, activitiesRes, deadlinesRes] = await Promise.all([
                    fetch('http://localhost:5000/api/dashboard/stats'),
                    fetch('http://localhost:5000/api/dashboard/activities'),
                    fetch('http://localhost:5000/api/dashboard/deadlines')
                ]);

                if (statsRes.ok) setStats(await statsRes.json());
                if (activitiesRes.ok) setActivities(await activitiesRes.json());
                if (deadlinesRes.ok) setDeadlines(await deadlinesRes.json());
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { name: 'Home', icon: '🏠' },
        { name: 'Preferred Timetable', icon: '📅' },
        { name: 'Assign Examiner', icon: '👨‍🏫' },
        { name: 'Allocations Dashboard', icon: '📊' },
        { name: 'Add/Drop Form Approval', icon: '📝' },
        { name: 'Staff Registrations', icon: '👥' },
        { name: 'Add Course Unit', icon: '➕' },
        { name: 'Alerts', icon: '🔔' },
        { name: 'Timetable Configuration', icon: '⚙️' }
    ];

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    const renderContent = () => {
        switch (activeSection) {
            case 'Allocations Dashboard':
                return <AllocationsDashboard />;
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
            case 'Home':
            default:
                return (
                    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
                        {/* Stats Grid */}
                        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Add/Drop Pending</h3>
                                    <span className="bg-orange-100 text-orange-600 p-2 rounded-lg group-hover:bg-orange-200 transition-colors">
                                        📄
                                    </span>
                                </div>
                                <div className="text-4xl font-extrabold text-gray-900">{stats.pendingAddDrop}</div>
                                <p className="text-xs text-gray-400 mt-2">Forms awaiting approval</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Course Units</h3>
                                    <span className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                                        📚
                                    </span>
                                </div>
                                <div className="text-4xl font-extrabold text-gray-900">{stats.totalCourseUnits}</div>
                                <p className="text-xs text-gray-400 mt-2">Currently being managed</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Active Alerts</h3>
                                    <span className="bg-red-100 text-red-600 p-2 rounded-lg group-hover:bg-red-200 transition-colors">
                                        🔔
                                    </span>
                                </div>
                                <div className="text-4xl font-extrabold text-gray-900">{stats.activeAlerts}</div>
                                <p className="text-xs text-gray-400 mt-2">System notifications</p>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Recent Activity */}
                            <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <h3 className="text-lg font-bold text-gray-800">Recent Activity Feed</h3>
                                    <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View All</button>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {activities.length > 0 ? (
                                        activities.map((activity) => (
                                            <div key={activity.id} className="p-5 hover:bg-gray-50 transition-colors flex items-start space-x-4">
                                                <div className="mt-1 flex-shrink-0">
                                                    <span className="block h-2.5 w-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-50"></span>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-800 font-medium">{activity.description}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{new Date(activity.created_at).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-6 text-gray-500 text-center text-sm">No recent activity</div>
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
                                        deadlines.map((deadline) => (
                                            <div key={deadline.id} className="p-4 border-l-4 border-indigo-500 bg-indigo-50/30 rounded-r-lg m-2 hover:bg-indigo-50 transition-colors">
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
                className={`flex flex-col fixed h-full shadow-2xl z-50 bg-indigo-900 text-white transition-all duration-300 ease-in-out ${sidebarExpanded ? 'w-64' : 'w-20'}`}
                onMouseEnter={() => setSidebarExpanded(true)}
                onMouseLeave={() => setSidebarExpanded(false)}
            >
                <div className="p-4 flex items-center justify-center border-b border-indigo-800/50 h-20">
                    {sidebarExpanded ? (
                        <div className="text-center animate-fade-in">
                            <h2 className="text-2xl font-bold tracking-wider">EMS</h2>
                            <p className="text-xs text-indigo-300">Academic Dashboard</p>
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
                                    ? 'bg-indigo-800 text-white'
                                    : 'text-indigo-100 hover:bg-indigo-800/50 hover:text-white'}
                            `}
                        >
                            {/* Active indicator */}
                            {activeSection === item.name && (
                                <span className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400 rounded-r-full"></span>
                            )}

                            <span className="text-xl min-w-[2.5rem] text-center">{item.icon}</span>

                            <span className={`ml-3 whitespace-nowrap transition-all duration-300 origin-left ${sidebarExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-90 w-0'}`}>
                                {item.name}
                            </span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-indigo-800/50">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium text-red-100 hover:bg-red-900/50 rounded-lg transition-colors cursor-pointer group`}
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
                        <p className="text-sm text-gray-500 font-medium">Welcome, {user?.name || 'Dr. Smith'}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                            🔔
                        </button>
                        <div className="h-10 w-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30 ring-2 ring-white cursor-pointer hover:ring-indigo-100 transition-all">
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
