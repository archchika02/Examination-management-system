import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

// Local SVG Icon Library
const Icons = {
    Book: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M8 7h6" /><path d="M8 11h8" /></svg>
    ),
    FileText: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>
    ),
    Hospital: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M9 12h6" /><path d="M12 9v6" /></svg>
    ),
    Calendar: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
    ),
    Clock: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    ),
    Bell: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
    ),
    Check: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
    ),
    Alert: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
    )
};

/**
 * RoleNotificationsPanel
 * Fetches per-user deadline notifications from the DB API.
 * No shared mark-as-read — each user's read state is independent.
 *
 * Props:
 *   roleName {string} — The DB role_name to filter by (e.g. 'Academic Supervisor')
 */
const RoleNotificationsPanel = ({ roleName, hideHeader = false, onNavigate }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [combinedItems, setCombinedItems] = useState([]);

    const loadData = useCallback(async () => {
        if (!user?.user_id || !roleName) return;
        setLoading(true);
        try {
            // Fetch notifications (deadlines)
            const notifRes = await fetch(
                `http://localhost:5000/api/deadlines/notifications?userId=${user.user_id}&role=${encodeURIComponent(roleName)}`
            );
            let notifs = [];
            if (notifRes.ok) {
                notifs = await notifRes.json();

                const unreadIds = notifs.filter(d => !d.is_read).map(d => d.id);
                if (unreadIds.length > 0) {
                    fetch('http://localhost:5000/api/deadlines/mark-all-read', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.user_id, role: roleName })
                    }).catch(err => console.error('Failed to mark read:', err));
                }
            }

            // If Dean, Academic Supervisor, Faculty Staff or Hall Attendant, also fetch activities
            let activities = [];
            if (roleName === 'Dean' || roleName === 'Academic Supervisor' || roleName === 'FacultyStaff' || roleName === 'Faculty Staff' || roleName === 'Hall Attendant') {
                const activityRes = await fetch(`http://localhost:5000/api/dashboard/activities?userId=${user.user_id}`);
                if (activityRes.ok) {
                    activities = await activityRes.json();
                }
            }

            // Combine and format
            const standardNotifs = notifs.map(n => ({
                id: `notif-${n.id}`,
                title: n.form_name,
                description: n.description || 'A new deadline has been set for this form.',
                date: n.created_at,
                type: 'NOTIFICATION',
                icon: getFormIcon(n.form_name),
                deadline: n.deadline,
                is_read: n.is_read,
                status: getStatusText(n.deadline),
                statusColor: getStatusBadgeColor(n.deadline)
            }));

            const activityItems = activities.map((a, idx) => ({
                id: `activity-${a.id || idx}`,
                realId: a.id,
                title: a.type === 'APPROVAL' ? 'Approval Finalized' : a.type === 'REJECTION' ? 'Form Declined' : 'System Alert',
                description: a.description,
                date: a.created_at,
                type: a.type,
                icon: a.type === 'APPROVAL' ? <Icons.Check /> : a.type === 'REJECTION' ? <Icons.Alert /> : <Icons.Bell />,
                is_read: a.is_read !== undefined ? a.is_read : true,
                status: a.type === 'APPROVAL' ? 'Approved' : a.type === 'REJECTION' ? 'Declined' : 'Update',
                statusColor: a.type === 'APPROVAL' ? 'green' : a.type === 'REJECTION' ? 'red' : 'blue'
            }));

            // If Academic Supervisor, FacultyStaff, Dean or Hall Attendant, mark activities as read
            if (roleName === 'Academic Supervisor' || roleName === 'FacultyStaff' || roleName === 'Faculty Staff' || roleName === 'Dean' || roleName === 'Hall Attendant') {
                const unreadActs = activityItems.filter(a => !a.is_read && a.realId);
                for (const act of unreadActs) {
                    fetch(`http://localhost:5000/api/dashboard/activities/${act.realId}/mark-read`, {
                        method: 'POST'
                    }).catch(err => console.error('Failed to mark activity read:', err));
                }
            }

            const merged = [...standardNotifs, ...activityItems]
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            setCombinedItems(merged);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.user_id, roleName]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const getStatusBadgeColor = (deadlineDate) => {
        if (!deadlineDate) return 'blue';
        const today = new Date();
        const due = new Date(deadlineDate);
        const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return 'gray';
        if (diffDays <= 3) return 'red';
        if (diffDays <= 7) return 'orange';
        return 'blue';
    };

    const getStatusText = (deadlineDate) => {
        if (!deadlineDate) return 'Update';
        const today = new Date();
        const due = new Date(deadlineDate);
        const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return 'Expired';
        if (diffDays === 0) return 'Due Today';
        if (diffDays === 1) return 'Tomorrow';
        return `${diffDays} Days Left`;
    };

    const getStatusBadge = (status, color) => {
        if (!status) return null;
        const colors = {
            green: 'bg-emerald-600 text-white border-emerald-700',
            blue: 'bg-blue-700 text-white border-blue-800',
            orange: 'bg-amber-500 text-white border-amber-600',
            red: 'bg-rose-600 text-white border-rose-700',
            gray: 'bg-slate-600 text-white border-slate-700',
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[color] || colors.gray}`}>
                {status}
            </span>
        );
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
            case 'Academic Course Unit': return <Icons.Book />;
            case 'Add/Drop Form': return <Icons.FileText />;
            case 'Medical/Repeat Form': return <Icons.Hospital />;
            case 'Timetable Finalization': return <Icons.Calendar />;
            default: return <Icons.Clock />;
        }
    };

    if (loading) return (
        <div className="bg-white rounded-2xl p-12 border shadow-sm text-center max-w-4xl mx-auto">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-medium">Loading notifications...</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto animate-fade-in-up space-y-10">
            {/* Professional Header Section */}
            {!hideHeader && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/50 rounded-full -mr-24 -mt-24 blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-blue-700 text-white text-[9px] font-bold uppercase tracking-wider rounded-full">Official Feed</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{roleName} Portal</span>
                        </div>
                        <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Intelligence & Communications</h2>
                        <p className="text-sm text-slate-600 mt-2 font-medium max-w-2xl leading-relaxed italic border-l-2 border-blue-100 pl-4">
                            Real-time synchronization of academic deadlines, administrative approvals, and faculty communications.
                        </p>
                    </div>
                </div>
            )}

            {/* Notification Stream */}
            {combinedItems.length > 0 ? (
                <div className="space-y-4">
                    {combinedItems.map((item) => (
                        <div
                            key={item.id}
                            className={`bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex gap-4 items-start border border-slate-200 relative group
                                ${!item.is_read ? 'bg-blue-50/20 ring-1 ring-blue-100' : ''}`}
                        >
                            <div className="flex-shrink-0 w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-lg text-slate-600 border border-slate-100 group-hover:bg-white group-hover:scale-105 transition-all">
                                {item.icon}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-4 mb-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-slate-900 text-lg tracking-tight">
                                            {item.title}
                                        </h3>
                                        {!item.is_read && (
                                            <span className="px-1.5 py-0.5 bg-blue-700 text-white text-[8px] font-bold uppercase rounded tracking-wider">New</span>
                                        )}
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-2">{formatTimeAgo(item.date)}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-end">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                                                {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-xs text-slate-600 mb-2 font-medium leading-normal max-w-3xl" dangerouslySetInnerHTML={{
                                    __html: item.description
                                        .replace(/([A-Z]{2,}\/\d{4,}\/\d+)/g, '<span class="font-bold text-slate-900">$1</span>')
                                        .replace(/([A-Z][a-z]+ [A-Z][a-z]+)/g, '<span class="text-slate-900">$1</span>')
                                }} />

                                <div className="flex items-center gap-4 border-t border-slate-50 pt-3">
                                    {getStatusBadge(item.status, item.statusColor)}
                                    <div className="h-4 w-px bg-slate-100"></div>
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                        {item.type}
                                    </span>
                                    {item.deadline && (
                                        <div className="flex items-center gap-2 ml-auto">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Due Date:</span>
                                            <span className="text-[10px] font-bold text-slate-700 bg-slate-50 px-2.5 py-0.5 rounded">
                                                {new Date(item.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Visual Accent */}
                            <div className="absolute right-0 top-0 h-full w-1 bg-blue-700 opacity-0 group-hover:opacity-100 rounded-r-2xl transition-opacity"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-3xl p-16 border border-dashed border-slate-200 text-center flex flex-col items-center justify-center group">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                        <span className="text-slate-300 group-hover:text-blue-500 transition-all">
                            <Icons.Bell />
                        </span>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Intelligence Stream Empty</h3>
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                            No critical updates or communications discovered at this time.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleNotificationsPanel;
