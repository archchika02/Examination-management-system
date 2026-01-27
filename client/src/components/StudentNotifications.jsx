import { useState } from 'react';

const StudentNotifications = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // Mock Notification Data
    const notifications = [

        {
            id: 1,
            type: 'Form Status',
            description: 'Your registration for Semester 1, 2026 has been approved by the department.',
            time: '1 day ago',
            status: 'Approved',
            statusColor: 'green',
            icon: '✅'
        },

        {
            id: 2,
            type: 'Form Status',
            title: 'Medical Request Pending',
            description: 'Your medical submission for missed lectures is currently under review.',
            time: '3 days ago',
            status: 'Pending',
            statusColor: 'yellow',
            icon: '⏳'
        },

    ];

    // Filter Logic
    const filteredNotifications = notifications.filter(notif => {
        const matchesTab = activeTab === 'All' ||
            (activeTab === 'Faculty Notifications' && notif.type === 'Academic Notice') ||
            (activeTab === 'Exam Alerts' && notif.type === 'Exam Alert') ||
            (activeTab === 'General' && notif.type === 'General');

        const matchesSearch = notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notif.description.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesTab && matchesSearch;
    });

    const getStatusBadge = (status, color) => {
        const colors = {
            green: 'bg-green-100 text-green-700',
            blue: 'bg-blue-100 text-blue-700',
            orange: 'bg-orange-100 text-orange-700',
            red: 'bg-red-100 text-red-700',
            yellow: 'bg-yellow-100 text-yellow-700',
            gray: 'bg-gray-100 text-gray-700',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${colors[color] || colors.gray}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Notifications & Alerts</h2>
                    <p className="text-gray-500 mt-1">Stay updated with important information</p>
                </div>

                {/* Global Search Bar (Local to page for now as per design) */}
                <div className="relative w-full md:w-80">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        🔍
                    </span>
                    <input
                        type="text"
                        placeholder="Search notifications..."
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Notification Category Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1">
                {['All', 'Faculty Notifications', 'Exam Alerts', 'General'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative
                            ${activeTab === tab
                                ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
                        `}
                    >
                        {tab}
                        {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
                {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notif) => (
                        <div key={notif.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-4 items-start md:items-center">
                            {/* Icon Indicator */}
                            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl bg-${notif.statusColor}-50 text-${notif.statusColor}-600`}>
                                {notif.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold text-gray-900 truncate pr-2">{notif.title}</h3>
                                    {getStatusBadge(notif.status, notif.statusColor)}
                                </div>
                                <p className="text-gray-600 text-sm mb-2">{notif.description}</p>
                                <p className="text-xs text-gray-400 font-medium">{notif.time}</p>
                            </div>

                            {/* Action Link */}
                            <div className="flex-shrink-0 pt-2 md:pt-0 self-end md:self-center">
                                <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm hover:underline flex items-center gap-1">
                                    View Details <span className="text-lg">→</span>
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                        <div className="text-4xl mb-3">📭</div>
                        <h3 className="text-lg font-medium text-gray-900">No notifications found</h3>
                        <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                    </div>
                )}
            </div>

            {/* Summary Cards (Bottom Section) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg shadow-blue-200">
                    <h4 className="text-blue-100 text-sm font-semibold uppercase tracking-wider">Total Notifications</h4>
                    <p className="text-4xl font-bold mt-2">{notifications.length}</p>
                    <p className="text-blue-100 text-sm mt-1">Across all categories</p>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-xl p-6 text-white shadow-lg shadow-red-200">
                    <h4 className="text-red-100 text-sm font-semibold uppercase tracking-wider">Urgent Alerts</h4>
                    {/* Logic to count 'Urgent' or relevant statuses could go here */}
                    <p className="text-4xl font-bold mt-2">1</p>
                    <p className="text-red-100 text-sm mt-1">Requires immediate attention</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-6 text-white shadow-lg shadow-teal-200">
                    <h4 className="text-emerald-100 text-sm font-semibold uppercase tracking-wider">Pending Approvals</h4>
                    <p className="text-4xl font-bold mt-2">1</p>
                    <p className="text-emerald-100 text-sm mt-1">Forms awaiting review</p>
                </div>
            </div>
        </div>
    );
};

export default StudentNotifications;
