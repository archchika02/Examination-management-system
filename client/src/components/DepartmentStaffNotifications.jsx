import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

// Professional SVG Icon Library
const Icons = {
    Book: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M6.5 2H20v20H6.5" /></svg>
    ),
    Edit: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
    ),
    Alert: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
    ),
    Calendar: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
    ),
    CheckCircle: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
    ),
    Bell: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
    )
};

const DepartmentStaffNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!user?.user_id) return;
        try {
            // Fetch Deadlines
            const res = await fetch(
                `http://localhost:5000/api/deadlines/notifications?userId=${user.user_id}&role=${encodeURIComponent('Department Staff')}`
            );

            // Fetch Activities
            const actRes = await fetch(
                `http://localhost:5000/api/dashboard/activities?userId=${user.user_id}`
            );

            let allNotifs = [];

            if (res.ok) {
                const data = await res.json();
                allNotifs = data.map(d => ({
                    ...d,
                    receivedAt: d.created_at
                }));

                const unreadIds = data.filter(d => !d.is_read).map(d => d.id);
                if (unreadIds.length > 0) {
                    fetch('http://localhost:5000/api/deadlines/mark-all-read', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.user_id, role: 'Department Staff' })
                    }).catch(err => console.error('Failed to mark read:', err));
                }
            }

            if (actRes.ok) {
                const actData = await actRes.json();
                const notificationActivities = actData
                    .filter(a => a.type === 'notification' || a.type === 'NOTIFICATION')
                    .map((a) => ({
                        id: a.id,
                        realId: a.id,
                        form_name: 'System Alert',
                        description: a.description,
                        deadline: a.created_at,
                        receivedAt: a.created_at,
                        is_read: a.is_read,
                        isActivity: true
                    }));

                allNotifs = [...allNotifs, ...notificationActivities];

                // Mark unread activities as read
                const unreadActivities = notificationActivities.filter(a => !a.is_read);
                for (const act of unreadActivities) {
                    fetch(`http://localhost:5000/api/dashboard/activities/${act.realId}/mark-read`, {
                        method: 'POST'
                    }).catch(err => console.error('Failed to mark activity read:', err));
                }
            }

            // Sort combined notifications by received date descending (Latest First)
            allNotifs.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));

            setNotifications(allNotifs);

        } catch (err) {
            console.error('Error loading notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.user_id]);

    useEffect(() => { load(); }, [load]);

    const getStatusColor = (deadline) => {
        const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
        if (diff < 0) return 'bg-slate-100 text-slate-500 border-slate-200';
        if (diff <= 3) return 'bg-rose-50 text-rose-600 border-rose-100';
        if (diff <= 7) return 'bg-amber-50 text-amber-600 border-amber-100';
        return 'bg-blue-50 text-blue-600 border-blue-100';
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
            case 'Academic Course Unit': return <Icons.Book />;
            case 'Add/Drop Form': return <Icons.Edit />;
            case 'Medical/Repeat Form': return <Icons.Alert />;
            case 'Timetable Finalization': return <Icons.Calendar />;
            default: return <Icons.CheckCircle />;
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading notifications...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-10">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications &amp; Alerts</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Deadline reminders and administrative updates for Department Staff.</p>
            </div>

            {notifications.length > 0 ? (
                <div className="space-y-4">
                    {notifications.map(n => (
                        <div
                            key={n.id}
                            className={`group bg-white rounded-xl border-b-[3px] border-x border-t shadow-sm px-6 py-5 relative transition-all hover:bg-slate-50
                                ${n.is_read ? 'border-slate-100 opacity-90' : 'border-blue-200 border-b-blue-500 bg-blue-50/10'}`}
                        >
                            {!n.is_read && <div className="absolute right-4 top-4 w-2 h-2 rounded-full bg-blue-600 animate-pulse" />}
                            <div className="flex items-start gap-5">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                                    ${n.is_read ? 'bg-slate-100 text-slate-400 group-hover:bg-slate-200' : 'bg-blue-100 text-blue-600'}`}>
                                    {getIcon(n.form_name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                        <h4 className="text-base font-bold text-slate-900 tracking-tight leading-none">{n.form_name}</h4>
                                        {!n.isActivity && (
                                            <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${getStatusColor(n.deadline)}`}>
                                                {getStatusText(n.deadline)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium mb-3 leading-relaxed">{n.description || 'A new deadline has been set.'}</p>
                                    {!n.isActivity && (
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 w-fit px-2 py-1 rounded">
                                            <span className="flex items-center gap-1.5">
                                                <Icons.Calendar />
                                                Due: {n.deadline ? new Date(n.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + ' 00:00:00' : 'N/A'}
                                            </span>
                                        </div>
                                    )}
                                    {n.isActivity && (
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 w-fit px-2 py-1 rounded">
                                            <span className="flex items-center gap-1.5">
                                                <Icons.CheckCircle />
                                                Received: {new Date(n.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} {new Date(n.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300 shadow-inner">
                    <div className="mx-auto w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
                        <Icons.Bell />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">All caught up!</h3>
                    <p className="text-slate-500 text-sm font-medium mt-1">There are no urgent deadline notifications or alerts for you right now.</p>
                </div>
            )}
        </div>
    );
};

export default DepartmentStaffNotifications;
