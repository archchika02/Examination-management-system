import React from 'react';
import { useAuth } from '../context/AuthContext';

const SupervisorAlerts = () => {
    const { user } = useAuth();

    // Mock Data for Alerts
    const alerts = [
        {
            id: 1,
            type: 'Timetable',
            category: 'Allocations',
            title: 'Final Timetable Received',
            description: 'The final exam timetable for Semester 1 has been released by the Examination Division.',
            time: '2 hours ago',
            status: 'New',
            statusColor: 'green',
            icon: '🗓️'
        },
        {
            id: 2,
            type: 'Staffing',
            category: 'Allocations',
            title: 'Hall Attendants Allocated',
            description: 'Hall attendants have been allocated for the upcoming "Web Application Development" exam.',
            time: '4 hours ago',
            status: 'Confirmed',
            statusColor: 'blue',
            icon: '👥'
        },
        {
            id: 3,
            type: 'Concerns',
            category: 'Staff Concerns',
            title: 'Department Staff Concern - Dr. Smith',
            description: 'Dr. Smith has reported a scheduling conflict for the "Data Structures" exam invigilation.',
            time: '1 day ago',
            status: 'Action Required',
            statusColor: 'red',
            icon: '⚠️'
        },
        {
            id: 4,
            type: 'Timetable',
            category: 'Timetable Updates',
            title: 'Preferred Timetable Received - Level 1',
            description: 'Level 1 coordinators have submitted their preferred timetable slots for approval.',
            time: '1 day ago',
            status: 'Pending Review',
            statusColor: 'orange',
            icon: '📄'
        }
    ];

    const getStatusBadge = (status, color) => {
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
                        <h1 className="text-2xl font-bold text-slate-800">Alerts & Notifications</h1>
                        <p className="text-slate-500 text-sm mt-1">Manage critical updates and staff concerns</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">

                {/* Alerts List */}
                <div className="space-y-4">
                    {alerts.length > 0 ? (
                        alerts.map((alert, index) => (
                            <div
                                key={alert.id}
                                className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-indigo-500 transition-colors"></div>
                                <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl 
                                        ${alert.statusColor === 'red' ? 'bg-red-50 text-red-600' :
                                            alert.statusColor === 'orange' ? 'bg-orange-50 text-orange-600' :
                                                alert.statusColor === 'green' ? 'bg-emerald-50 text-emerald-600' :
                                                    'bg-blue-50 text-blue-600'}`}>
                                        {alert.icon}
                                    </div>

                                    <div className="flex-1 min-w-0 pt-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h3 className="text-base font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{alert.title}</h3>
                                            {getStatusBadge(alert.status, alert.statusColor)}
                                        </div>
                                        <p className="text-slate-500 text-sm leading-relaxed mb-2">{alert.description}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                            <span>📅 {alert.time}</span>
                                            <span>•</span>
                                            <span>{alert.category}</span>
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
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No alerts found</h3>
                            <p className="text-slate-500 max-w-sm">
                                No updates available.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupervisorAlerts;
