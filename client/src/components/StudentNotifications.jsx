import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const StudentNotifications = () => {
    const { user } = useAuth();

    // Mock Data for Notifications
    const notifications = [
        {
            id: 1,
            type: 'Exam Alerts',
            title: 'INTE 21323: Data Structures - Exam Rescheduled',
            description: 'The exam for Data Structures has been rescheduled to next Monday due to hall availability.', // Added description to match use in map
            time: '2 hours ago',
            status: 'Rescheduled',
            statusColor: 'orange',
            icon: '📅'
        },
        {
            id: 2,
            type: 'Form Status',
            category: 'Faculty Notifications',
            title: 'Course Registration Approved',
            description: 'Your course registration for the current semester has been approved by the Faculty Board.', // Added description
            time: '1 day ago',
            status: 'Approved',
            statusColor: 'green',
            icon: '✅'
        }
    ];

    // Derived State for Summary Cards
    const totalNotifications = notifications.length;
    const urgentAlerts = notifications.filter(n => n.status === 'Rescheduled' || n.status === 'Alert').length;
    const pendingApprovals = 1;

    const getStatusBadge = (status, color) => {
        if (!status) return null;
        const colors = {
            green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            blue: 'bg-blue-100 text-blue-700 border-blue-200',
            orange: 'bg-amber-100 text-amber-700 border-amber-200',
            red: 'bg-rose-100 text-rose-700 border-rose-200',
            gray: 'bg-slate-100 text-slate-700 border-slate-200',
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[color] || colors.gray}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative animate-fade-in-up">
            {/* Header Section */}
            <div className="bg-white px-8 py-6 border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Notifications & Alerts</h1>
                        <p className="text-slate-500 text-sm mt-1">Stay updated with important information</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        {/* Profile Avatar (Small) */}
                        <div className="flex items-center gap-3 pl-4 border-l border-gray-100 hidden sm:flex">
                            <div className="text-right hidden lg:block">
                                <div className="text-sm font-bold text-slate-700">{user?.name || 'Student'}</div>
                                <div className="text-xs text-slate-400">{user?.studentId || 'ID: 20230001'}</div>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 ring-2 ring-white">
                                {user?.name?.charAt(0) || 'S'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">

                {/* Notifications List */}
                <div className="space-y-4">
                    {notifications.length > 0 ? (
                        notifications.map((notif, index) => (
                            <div
                                key={notif.id}
                                className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 relative overflow-hidden"
                                style={{ animationDelay: `${index * 50}ms` }} // Staggered pop-in
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-blue-500 transition-colors"></div>
                                <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                                    {/* Icon */}
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl 
                                        ${notif.type === 'Exam Alerts' ? 'bg-amber-50 text-amber-600' :
                                            notif.type === 'Faculty Notifications' ? 'bg-indigo-50 text-indigo-600' :
                                                notif.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                                                    'bg-slate-50 text-slate-600'}`}>
                                        {notif.icon}
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1 min-w-0 pt-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{notif.title}</h3>
                                            {getStatusBadge(notif.status, notif.statusColor)}
                                        </div>
                                        <p className="text-slate-500 text-sm leading-relaxed mb-2">{notif.description}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                            <span>📅 {notif.time}</span>
                                            <span>•</span>
                                            <span>{notif.type}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <span className="text-4xl">🔔</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No notifications found</h3>
                            <p className="text-slate-500 max-w-sm">
                                No updates available.
                            </p>
                        </div>
                    )}
                </div>
                <div className="h-10"></div> {/* Bottom Spacer */}
            </div>
        </div>
    );
};

export default StudentNotifications;
