import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * RoleNotificationsPanel
 * Fetches per-user deadline notifications from the DB API.
 * No shared mark-as-read — each user's read state is independent.
 *
 * Props:
 *   roleName {string} — The DB role_name to filter by (e.g. 'Academic Supervisor')
 */
const RoleNotificationsPanel = ({ roleName, hideHeader = false }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = useCallback(async () => {
        if (!user?.user_id || !roleName) return;
        try {
            const res = await fetch(
                `http://localhost:5000/api/deadlines/notifications?userId=${user.user_id}&role=${encodeURIComponent(roleName)}`
            );
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);

                const unreadIds = data.filter(d => !d.is_read).map(d => d.id);
                if (unreadIds.length > 0) {
                    fetch('http://localhost:5000/api/deadlines/mark-all-read', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.user_id, role: roleName })
                    }).catch(err => console.error('Failed to mark read:', err));
                }
            }
        } catch (err) {
            console.error('Failed to load notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.user_id, roleName]);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const getStatusColor = (deadlineDate) => {
        const today = new Date();
        const due = new Date(deadlineDate);
        const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return 'bg-gray-100 text-gray-500 border-gray-200';
        if (diffDays <= 3) return 'bg-red-50 text-red-600 border-red-200';
        if (diffDays <= 7) return 'bg-orange-50 text-orange-600 border-orange-200';
        return 'bg-blue-50 text-blue-600 border-blue-200';
    };

    const getStatusText = (deadlineDate) => {
        const today = new Date();
        const due = new Date(deadlineDate);
        const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return 'Expired';
        if (diffDays === 0) return 'Due Today';
        if (diffDays === 1) return 'Tomorrow';
        return `${diffDays} Days Left`;
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

    const getFormIcon = (formName) => {
        switch (formName) {
            case 'Academic Course Unit': return '📚';
            case 'Add/Drop Form': return '📝';
            case 'Medical/Repeat Form': return '🏥';
            case 'Timetable Finalization': return '📅';
            default: return '⏰';
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading notifications...</div>;

    return (
        <div className="max-w-4xl mx-auto animate-fade-in-up space-y-6">
            {/* Header */}
            {!hideHeader && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Notifications &amp; Alerts</h2>
                    <p className="text-gray-500 text-sm mt-1">Deadline reminders for {roleName}</p>
                </div>
            )}

            {/* Notification Cards */}
            {notifications.length > 0 ? (
                <div className="space-y-4">
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`bg-white rounded-xl border shadow-sm p-5 transition-all relative overflow-hidden ${notif.is_read ? 'border-gray-100 opacity-80' : 'border-blue-200'}`}
                        >
                            {!notif.is_read && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl"></div>
                            )}
                            <div className="flex items-start justify-between gap-4 pl-2">
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${notif.is_read ? 'bg-gray-100' : 'bg-blue-50'}`}>
                                        {getFormIcon(notif.form_name)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center flex-wrap gap-2 mb-1">
                                            <h4 className="font-bold text-gray-900 text-base">{notif.form_name}</h4>
                                            {!notif.is_read && (
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full border border-blue-200">New</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {notif.description || 'A new deadline has been set for this form.'}
                                        </p>
                                        <div className="flex items-center flex-wrap gap-3 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">🕐 {formatTimeAgo(notif.created_at)}</span>
                                            <span className="flex items-center gap-1 font-medium text-gray-600">
                                                📅 Due: <span className="font-mono">{notif.deadline ? notif.deadline.substring(0, 10) : ''}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(notif.deadline)}`}>
                                        {getStatusText(notif.deadline)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center bg-white rounded-xl border border-dashed border-gray-300">
                    <span className="text-5xl block mb-3">🔔</span>
                    <h3 className="text-lg font-bold text-gray-800">No Notifications Yet</h3>
                    <p className="text-gray-500 mt-1 text-sm">
                        When Faculty Staff post deadlines tagged to {roleName}, they&apos;ll appear here.
                    </p>
                </div>
            )}
        </div>
    );
};

export default RoleNotificationsPanel;
