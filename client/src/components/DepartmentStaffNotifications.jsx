import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const DepartmentStaffNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!user?.user_id) return;
        try {
            const res = await fetch(
                `http://localhost:5000/api/deadlines/notifications?userId=${user.user_id}&role=${encodeURIComponent('Department Staff')}`
            );
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);

                const unreadIds = data.filter(d => !d.is_read).map(d => d.id);
                if (unreadIds.length > 0) {
                    fetch('http://localhost:5000/api/deadlines/mark-all-read', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.user_id, role: 'Department Staff' })
                    }).catch(err => console.error('Failed to mark read:', err));
                }
            }
        } catch (err) {
            console.error('Error loading notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.user_id]);

    useEffect(() => { load(); }, [load]);

    const getStatusColor = (deadline) => {
        const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
        if (diff < 0) return 'bg-gray-100 text-gray-500 border-gray-200';
        if (diff <= 3) return 'bg-red-50 text-red-600 border-red-200';
        if (diff <= 7) return 'bg-orange-50 text-orange-600 border-orange-200';
        return 'bg-blue-50 text-blue-600 border-blue-200';
    };

    const getStatusText = (deadline) => {
        const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
        if (diff < 0) return 'Expired';
        if (diff === 0) return 'Due Today';
        if (diff === 1) return 'Tomorrow';
        return `${diff} Days Left`;
    };

    const getIcon = (formName) => {
        switch (formName) {
            case 'Academic Course Unit': return '📚';
            case 'Add/Drop Form': return '📝';
            case 'Medical/Repeat Form': return '🏥';
            case 'Timetable Finalization': return '📅';
            default: return '⏰';
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading notifications...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Notifications &amp; Alerts</h2>
                <p className="text-sm text-gray-500 mt-1">Deadline reminders for Department Staff</p>
            </div>

            {notifications.length > 0 ? (
                <div className="space-y-4">
                    {notifications.map(n => (
                        <div
                            key={n.id}
                            className={`bg-white rounded-xl border shadow-sm p-5 relative overflow-hidden ${n.is_read ? 'border-gray-100 opacity-80' : 'border-teal-300'}`}
                        >
                            {!n.is_read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-l-xl" />}
                            <div className="flex items-start gap-4 pl-2">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${n.is_read ? 'bg-gray-100' : 'bg-teal-50'}`}>
                                    {getIcon(n.form_name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="font-bold text-gray-900 text-base">{n.form_name}</span>
                                        {!n.is_read && (
                                            <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-bold rounded-full border border-teal-200">New</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{n.description || 'A new deadline has been set.'}</p>
                                    <p className="text-xs text-gray-500 font-mono">
                                        📅 Due: {n.deadline ? n.deadline.substring(0, 10) : ''}
                                    </p>
                                </div>
                                <span className={`flex-shrink-0 px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(n.deadline)}`}>
                                    {getStatusText(n.deadline)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center bg-white rounded-xl border border-dashed border-gray-300">
                    <span className="text-5xl block mb-4">🔔</span>
                    <h3 className="text-lg font-bold text-gray-800">No Notifications</h3>
                    <p className="text-gray-500 text-sm mt-1">Deadline notifications for Department Staff will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default DepartmentStaffNotifications;
