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
import DeadlineExpiryMessage from '../components/DeadlineExpiryMessage';

// Professional SVG Icon Library
const Icons = {
    Home: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
    ),
    Book: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
    ),
    FileText: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
    ),
    Hospital: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" x2="15" y1="12" y2="12" /><line x1="12" x2="12" y1="9" y2="15" /></svg>
    ),
    Calendar: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
    ),
    Clock: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    ),
    Bell: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
    ),
    Refresh: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /></svg>
    ),
    Logout: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
    ),
    ChevronRight: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
    ),
    MapPin: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
    ),
    UserPlus: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
    ),
    Settings: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
    ),
    X: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
    )
};

const BatchRepDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarExpanded] = useState(true);
    const [activeSection, setActiveSection] = useState('Home');
    const [unreadCount, setUnreadCount] = useState(0);
    const [allDeadlines, setAllDeadlines] = useState([]);

    // Appoint BatchRep States
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

    // Effect for unread notification count polling
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

    const [homeData, setHomeData] = useState({
        exams: [],
        deadlines: [],
        notifications: [],
        isLoading: true
    });

    const fetchHomeData = async () => {
        if (!user?.user_id) return;
        setHomeData(prev => ({ ...prev, isLoading: true }));
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // 1. Fetch Exams
            const examsRes = await fetch(`http://localhost:5000/api/configurations/personalized-timetable/${user.user_id}`);
            let upcoming3Exams = [];
            if (examsRes.ok) {
                const exams = (await examsRes.json()) || [];
                const now = new Date();
                upcoming3Exams = exams
                    .filter(e => new Date(e.date) >= now.setHours(0, 0, 0, 0))
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(0, 3);
            }

            // 2. Fetch Deadlines
            const deadlinesRes = await fetch(`http://localhost:5000/api/deadlines`);
            let urgent2Deadlines = [];
            let relevantDeadlines = [];
            if (deadlinesRes.ok) {
                const fetchedDeadlines = (await deadlinesRes.json()) || [];
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                relevantDeadlines = fetchedDeadlines.filter(d =>
                    d.roles.includes('Batch Representative') || d.roles.includes('Students')
                );
                setAllDeadlines(relevantDeadlines);

                urgent2Deadlines = relevantDeadlines
                    .filter(d => new Date(d.deadline) >= today)
                    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                    .slice(0, 2);
            }

            // 3. Fetch Notifications (Unread only from both roles)
            const [deadlineNotifRes, deadlineNotifBRRes] = await Promise.all([
                fetch(`http://localhost:5000/api/deadlines/notifications?userId=${user.user_id}&role=${encodeURIComponent('Students')}`),
                fetch(`http://localhost:5000/api/deadlines/notifications?userId=${user.user_id}&role=${encodeURIComponent('Batch Representative')}`)
            ]);

            const d1 = deadlineNotifRes.ok ? await deadlineNotifRes.json() : [];
            const d2 = deadlineNotifBRRes.ok ? await deadlineNotifBRRes.json() : [];

            const unread = [];
            [...d1, ...d2].filter(n => !n.is_read).forEach(n => {
                unread.push({ id: `d_${n.id}`, message: `${n.form_name}`, detail: `Due ${new Date(n.deadline).toLocaleDateString('en-GB')}`, time: 'New' });
            });

            setHomeData({
                exams: upcoming3Exams,
                deadlines: urgent2Deadlines,
                notifications: unread.slice(0, 2),
                isLoading: false
            });
        } catch (error) {
            console.error("Error fetching home data:", error);
            setHomeData(prev => ({ ...prev, isLoading: false }));
        }
    };

    useEffect(() => {
        fetchHomeData();
    }, [user?.user_id]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { name: 'Home', icon: <Icons.Home /> },
        { name: 'Academic Course Unit', icon: <Icons.Book /> },
        { name: 'Add / Drop Form', icon: <Icons.Refresh /> },
        { name: 'Medical / Repeat Form', icon: <Icons.Hospital /> },
        { name: 'Personalized Timetable', icon: <Icons.Calendar /> },
        { name: 'Timetable Configuration', icon: <Icons.Settings /> },
        { name: 'Deadlines', icon: <Icons.Clock /> },
        { name: 'Notifications & Alerts', icon: <Icons.Bell /> },
    ];

    const quickActions = [
        { id: 1, title: 'Academic Registration', icon: <Icons.Book />, color: 'blue', action: 'Academic Course Unit' },
        { id: 2, title: 'Course code Modification', icon: <Icons.Refresh />, color: 'indigo', action: 'Add / Drop Form' },
        { id: 3, title: 'Repeat & Medical', icon: <Icons.Hospital />, color: 'slate', action: 'Medical / Repeat Form' },
    ];

    const renderContent = () => {
        // Deadline checking logic
        const checkDeadline = (sectionName) => {
            const sectionToFormMap = {
                'Academic Course Unit': 'Academic Course Unit',
                'Add / Drop Form': 'Add/Drop Form',
                'Medical / Repeat Form': 'Medical/Repeat Form'
            };

            const formName = sectionToFormMap[sectionName];
            if (!formName) return true; // Not a restricted form

            const deadlineObj = allDeadlines.find(d => d.form_name === formName);
            if (!deadlineObj) return true; // No deadline set, assume open

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const deadlineDate = new Date(deadlineObj.deadline);
            deadlineDate.setHours(0, 0, 0, 0);

            return today <= deadlineDate;
        };

        const isAccessible = checkDeadline(activeSection);

        if (activeSection === 'Personalized Timetable') return <StudentPersonalizedTimetable />;
        if (activeSection === 'Timetable Configuration') return <StudentExamCalendar />;

        if (activeSection === 'Academic Course Unit') {
            return isAccessible ? <StudentCourseUnitRegistration /> : <DeadlineExpiryMessage title="Academic Registration Closed" />;
        }
        if (activeSection === 'Add / Drop Form') {
            return isAccessible ? <StudentAddDropForm /> : <DeadlineExpiryMessage title="Course code Modification Period Ended" />;
        }
        if (activeSection === 'Medical / Repeat Form') {
            return isAccessible ? <StudentMedicalRepeatForm /> : <DeadlineExpiryMessage title="Medical/Repeat Submission Closed" />;
        }

        if (activeSection === 'Deadlines') return <StudentDeadlines />;
        if (activeSection === 'Notifications & Alerts') return <StudentNotifications />;

        if (activeSection !== 'Home') {
            return (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center p-12 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 max-w-md w-full animate-fade-in-up">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Icons.Book />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest mb-3">{activeSection}</h2>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-loose">This high-fidelity module is currently undergoing final optimization.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="max-w-7xl mx-auto space-y-10 animate-fade-in-up">
                {/* Welcome Section */}
                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none"></div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/20 rounded-full border border-blue-400/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                                Batch Representative Portal
                            </div>
                            <h2 className="text-4xl font-black mb-3 tracking-tight">Welcome, {user?.name?.split(' ')[0] || 'Representative'}</h2>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest opacity-80">Managing Level {user?.level || 'N/A'} Academic Operations</p>
                        </div>
                        <div className="hidden lg:block">
                            <div className="h-24 w-24 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 flex items-center justify-center rotate-3 group-hover:rotate-6 transition-transform">
                                <Icons.Book />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <section>
                    <div className="flex items-center justify-between mb-6 px-4">
                        <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Administrative Core</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Quick Access Channels</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {quickActions.map((action) => (
                            <button
                                key={action.id}
                                onClick={() => setActiveSection(action.action)}
                                className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-blue-100 hover:-translate-y-2 transition-all text-left group"
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-slate-900 text-white shadow-xl transition-all group-hover:bg-blue-600 group-hover:rotate-6`}>
                                    {action.icon}
                                </div>
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2 group-hover:text-blue-600 transition-colors">{action.title}</h4>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 tracking-widest uppercase">
                                    <span>Open Request</span>
                                    <Icons.ChevronRight />
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-10">
                    {/* Upcoming Exams */}
                    <section className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                            <div>
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Scheduled Examinations</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Next 3 Sessions</p>
                            </div>
                            <button onClick={() => setActiveSection('Personalized Timetable')} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-400 hover:text-blue-600 shadow-sm">
                                <Icons.Calendar />
                            </button>
                        </div>
                        <div className="divide-y divide-slate-50 min-h-[300px]">
                            {homeData.isLoading ? (
                                <div className="p-20 text-center flex flex-col items-center gap-4">
                                    <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syncing Schedule...</p>
                                </div>
                            ) : homeData.exams.length > 0 ? (
                                homeData.exams.map((exam) => (
                                    <div key={exam.id} className="p-8 hover:bg-slate-50/50 transition-all group">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">{exam.courseUnit}</span>
                                                </div>
                                                <h4 className="text-sm font-black text-slate-900 leading-tight uppercase tracking-tight">{exam.courseTitle || 'Examination Session'}</h4>
                                                <div className="flex items-center gap-4 pt-2">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        <Icons.Clock />
                                                        {exam.time}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        <Icons.MapPin />
                                                        {exam.venue}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="bg-slate-900 text-white p-3 rounded-2xl flex flex-col items-center min-w-[60px] shadow-lg shadow-slate-200">
                                                    <span className="text-lg font-black leading-none">{new Date(exam.date).getDate()}</span>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">{new Date(exam.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-20 text-center flex flex-col items-center gap-4 opacity-40">
                                    <div className="p-4 bg-slate-50 rounded-2xl">
                                        <Icons.Calendar />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Active Sessions</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
            {/* Professional Sidebar */}
            <aside
                className={`flex flex-col fixed h-full z-50 bg-slate-900 text-white transition-all duration-500 ease-in-out w-64 border-r border-slate-800 shadow-2xl`}
            >
                <div className="px-6 flex items-center gap-4 border-b border-slate-800 h-24">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                        <Icons.Book />
                    </div>
                    <div className="animate-fade-in truncate">
                        <h2 className="text-xl font-black tracking-tight text-white uppercase tracking-widest text-xs">EMS | Registry</h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">
                            Batch Representative
                        </p>
                    </div>
                </div>

                <nav className="flex-1 py-8 space-y-2 overflow-y-auto custom-scrollbar px-4">
                    {menuItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveSection(item.name)}
                            className={`w-full flex items-center px-5 py-4 text-[10px] font-black uppercase tracking-widest transition-all rounded-2xl relative group
                                ${activeSection === item.name
                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20'
                                    : 'text-slate-500 hover:bg-slate-800/50 hover:text-white'}
                            `}
                        >
                            <span className={`transition-transform duration-300 ${activeSection === item.name ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
                            <span className={`ml-4 transition-all duration-300 truncate`}>
                                {item.name}
                            </span>
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all group"
                    >
                        <span className="group-hover:rotate-12 transition-transform"><Icons.Logout /></span>
                        <span className="ml-4">Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Body */}
            <div className="flex-1 flex flex-col overflow-hidden ml-64 bg-[#F8FAFC]">
                {/* Modern Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 z-40 px-10 h-24 flex justify-between items-center sticky top-0 transition-all">
                    <div>
                        <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest">{activeSection === 'Home' ? 'Representative Dashboard' : activeSection}</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-80">{user?.departement || 'Department of Industrial Management'}</p>
                    </div>

                    <div className="flex items-center space-x-8">
                        {/* Appoint BatchRep Action */}
                        <button
                            onClick={openAppointModal}
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
                        >
                            <Icons.UserPlus />
                            Appoint Batch Rep
                        </button>

                        {/* Notifications */}
                        <button
                            className="relative group p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            onClick={() => setActiveSection('Notifications & Alerts')}
                        >
                            <Icons.Bell />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-600 border-2 border-white rounded-full text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* User Profile */}
                        <div className="flex items-center gap-5 pl-8 border-l border-slate-100">
                            <div className="flex flex-col items-end hidden md:flex">
                                <span className="text-xs font-black text-slate-900 uppercase tracking-widest mb-0.5">{user?.name}</span>
                                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">Batch Representative</span>
                            </div>
                            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-xl shadow-blue-500/20 border border-white/20">
                                {user?.name?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-10 custom-scrollbar overflow-x-hidden">
                    {renderContent()}
                </main>
            </div>

            {/* Premium Appoint BatchRep Modal */}
            {isAppointModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fade-in p-6">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-white/20 p-10 w-full max-w-xl animate-scale-in flex flex-col relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl"></div>

                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Appoint Batch Rep</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Level {user?.level || 'N/A'} Representative Transfer</p>
                            </div>
                            <button
                                onClick={() => setIsAppointModalOpen(false)}
                                className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                            >
                                <Icons.X />
                            </button>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-8 relative z-10">
                            <div className="flex gap-4">
                                <div className="p-2 bg-amber-100 text-amber-600 rounded-xl h-fit">
                                    <Icons.Bell />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-1">Critical Transition</h4>
                                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest leading-loose opacity-80">
                                        Selecting a new representative will immediately revoke your administrative privileges and transition your account to standard student status.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 mb-8 relative z-10 max-h-[40vh]">
                            {loadingStudents ? (
                                <div className="p-12 text-center flex flex-col items-center gap-4">
                                    <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Querying Student Registry...</p>
                                </div>
                            ) : studentsLevelList.length === 0 ? (
                                <div className="p-12 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 rounded-3xl">No eligible candidates available</div>
                            ) : (
                                <div className="space-y-3">
                                    {studentsLevelList.filter(s => s.user_id !== user?.user_id).map((student) => (
                                        <label
                                            key={student.user_id}
                                            className={`flex items-center p-5 rounded-2xl border transition-all cursor-pointer group ${selectedNewRep === student.user_id ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-500/10' : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50/50'}`}
                                        >
                                            <div className="relative flex items-center justify-center mr-5">
                                                <input
                                                    type="radio"
                                                    name="newRep"
                                                    value={student.user_id}
                                                    checked={selectedNewRep === student.user_id}
                                                    onChange={() => setSelectedNewRep(student.user_id)}
                                                    className="peer appearance-none w-6 h-6 border-2 border-slate-200 rounded-full checked:border-blue-600 transition-all cursor-pointer"
                                                />
                                                <div className="absolute w-3 h-3 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                                            </div>
                                            <div className="flex items-center gap-4 flex-grow">
                                                <div className="h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs uppercase shadow-lg shadow-slate-200 group-hover:bg-blue-600 transition-colors">
                                                    {student.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{student.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{student.student_number} • {student.email}</p>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between gap-6 relative z-10 border-t border-slate-100 pt-8 shrink-0">
                            <button
                                onClick={() => setIsAppointModalOpen(false)}
                                className="px-8 py-4 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-900 transition-all"
                            >
                                Abort
                            </button>
                            <button
                                onClick={handleAppointSubmit}
                                disabled={!selectedNewRep}
                                className={`px-10 py-4 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-xl flex items-center gap-2 ${!selectedNewRep ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none' : 'bg-slate-900 text-white hover:bg-blue-600 shadow-slate-200 hover:shadow-blue-500/20 active:scale-95'}`}
                            >
                                <Icons.UserPlus />
                                Confirm Appointment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchRepDashboard;
