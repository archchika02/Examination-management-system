import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AddDropApproval from '../components/AddDropApproval';

const DeanDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const [activeSection, setActiveSection] = useState('Home');

    // Mock Data for Dashboard
    const stats = {
        pendingAddDrop: 5,
        totalStaff: 45,
        pendingRequests: 12
    };

    const activities = [
        { id: 1, description: 'New faculty staff created: Michael Johnson', time: 'Yesterday at 4:15 PM' },
        { id: 2, description: 'Student ID: IM/2022/056 submitted Add/Drop request', time: 'Yesterday at 2:30 PM' },
    ];

    const upcomingDeadlines = [
        { id: 1, title: 'Add/Drop Request Registration', date: '2026-01-25', description: 'Monthly review of faculty performance.' },
        { id: 2, title: 'Medical/Repeat Form submittion', date: '2026-02-01', description: 'Deadline for all departments.' },
    ];

    // Data for Staff Registrations
    const [staffRegistrations, setStaffRegistrations] = useState([]);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/dashboard/faculty-staff');
                const data = await response.json();
                setStaffRegistrations(data);
            } catch (error) {
                console.error("Error fetching staff:", error);
            }
        };
        fetchStaff();
    }, []);

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
            setStaffRegistrations(staffRegistrations.map(staff =>
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
            setStaffRegistrations(staffRegistrations.map(staff =>
                staff.id === id ? { ...staff, status: 'Rejected' } : staff
            ));
        } catch (error) {
            console.error("Error rejecting staff:", error);
        }
    };

    const menuItems = [
        { name: 'Home', icon: '🏠' },
        { name: 'Staff Registrations', icon: '👥' },
        { name: 'Add/Drop Approvals', icon: '📝' },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'Add/Drop Approvals':
                return <AddDropApproval />;
            case 'Staff Registrations':
                return (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-gray-800">Staff Registrations as Faculty Staff</h2>
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
                                        {staffRegistrations.map((staff) => (
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
                                                    <td className="px-6 py-4">
                                                        {staff.status === 'Approved' ? (
                                                            <button
                                                                onClick={() => handleRejectStaff(staff.id)}
                                                                className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-semibold transition-colors"
                                                            >
                                                                Deny Access
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleApproveStaff(staff.id)}
                                                                className="px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 rounded-lg text-xs font-semibold transition-colors"
                                                            >
                                                                Enable Access
                                                            </button>
                                                        )}
                                                    </td>
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
                        {/* Welcome Section */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
                            <h2 className="text-3xl font-bold mb-2">Welcome Back, {user?.name || 'Dean'}</h2>
                            <p className="text-indigo-100 text-lg">Here is your faculty overview for today.</p>
                        </div>

                        {/* Metrics Grid */}
                        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Add/Drop Requests</h3>
                                    <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                        📄
                                    </span>
                                </div>
                                <div className="flex items-baseline space-x-2">
                                    <div className="text-4xl font-extrabold text-gray-900">{stats.pendingAddDrop}</div>
                                    <span className="text-sm text-gray-500">Pending</span>
                                </div>
                                <button
                                    onClick={() => setActiveSection('Add/Drop Approvals')}
                                    className="mt-4 text-sm text-indigo-600 font-semibold hover:text-indigo-800 flex items-center group-hover:underline"
                                >
                                    View Requests <span className="ml-1">→</span>
                                </button>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Staff</h3>
                                    <span className="bg-teal-100 text-teal-600 p-2 rounded-lg group-hover:bg-teal-200 transition-colors">
                                        👥
                                    </span>
                                </div>
                                <div className="text-4xl font-extrabold text-gray-900">{stats.totalStaff}</div>
                                <p className="text-xs text-green-600 font-semibold mt-2 flex items-center">
                                    <span className="mr-1">▲</span> 3 new this month
                                </p>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Recent Activities */}
                            <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <h3 className="text-lg font-bold text-gray-800">Recent Activities</h3>
                                    <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View All</button>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {activities.map((activity) => (
                                        <div key={activity.id} className="p-5 hover:bg-gray-50 transition-colors flex items-start space-x-4">
                                            <div className="mt-1 flex-shrink-0">
                                                <span className="block h-2.5 w-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-50"></span>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-800 font-medium">{activity.description}</p>
                                                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Upcoming Deadlines (Optional but good for context) */}
                            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="text-lg font-bold text-gray-800">Upcoming Deadlines</h3>
                                </div>
                                <div className="p-2 space-y-2">
                                    {upcomingDeadlines.map((deadline) => (
                                        <div key={deadline.id} className="p-4 border-l-4 border-indigo-500 bg-indigo-50/30 rounded-r-lg m-2 hover:bg-indigo-50 transition-colors">
                                            <h4 className="text-sm font-bold text-gray-900">{deadline.title}</h4>
                                            <p className="text-xs text-gray-600 mt-1">{deadline.description}</p>
                                            <div className="mt-2 text-xs text-indigo-700 font-semibold">
                                                Due: {deadline.date}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`flex flex-col fixed h-full shadow-2xl z-50 bg-indigo-900 text-white transition-all duration-300 ease-in-out ${sidebarExpanded ? 'w-64' : 'w-20'}`}
                onMouseEnter={() => setSidebarExpanded(true)}
                onMouseLeave={() => setSidebarExpanded(false)}
            >
                <div className="p-4 flex items-center justify-center border-b border-indigo-800/50 h-20">
                    {sidebarExpanded ? (
                        <div className="text-center animate-fade-in">
                            <h2 className="text-2xl font-bold tracking-wider">EMS</h2>
                            <p className="text-xs text-indigo-300">Dean's Dashboard</p>
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

            {/* Main Content */}
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarExpanded ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md shadow-sm z-10 px-8 py-4 flex justify-between items-center sticky top-0">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 transition-all">{activeSection}</h1>
                        <p className="text-sm text-gray-500 font-medium">Faculty Dean Portal</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
                            {user?.name?.charAt(0) || 'D'}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default DeanDashboard;
