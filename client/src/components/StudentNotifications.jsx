import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateAddDropPDF, generateCourseUnitPDF, generateMedicalRepeatPDF } from '../utils/pdfGenerator';
import { fetchDeadlines, getDeadlineForForm } from '../utils/deadlineHelper';

const StudentNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user?.user_id) return;
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const headers = { 'Authorization': `Bearer ${token}` };

                // Fetch all endpoints concurrently
                const isBatchRep = user.role === 'BatchRepresentative';
                const fetchPromises = [
                    fetch(`http://localhost:5000/api/course-registration/student/${user.user_id}`, { headers }),
                    fetch(`http://localhost:5000/api/add-drop/list`, { headers }),
                    fetch(`http://localhost:5000/api/medical-repeat/student/${user.user_id}`, { headers }),
                    fetch(`http://localhost:5000/api/deadlines/notifications?userId=${user.user_id}&role=${encodeURIComponent('Students')}`)
                ];

                if (isBatchRep) {
                    fetchPromises.push(fetch(`http://localhost:5000/api/deadlines/notifications?userId=${user.user_id}&role=${encodeURIComponent('Batch Representative')}`));
                }

                const responses = await Promise.all(fetchPromises);
                const [courseRes, addDropRes, medicalRes, deadlineRes, deadlineBRRes] = responses;

                const courseData = courseRes.ok ? await courseRes.json() : [];
                const addDropData = addDropRes.ok ? await addDropRes.json() : [];
                const medicalData = medicalRes.ok ? await medicalRes.json() : [];
                const deadlineData = deadlineRes.ok ? await deadlineRes.json() : [];
                const deadlineBRData = (isBatchRep && deadlineBRRes && deadlineBRRes.ok) ? await deadlineBRRes.json() : [];

                let allNotifications = [];

                // 1. Process Course Registration
                const mappedCourses = courseData.map((reg) => {
                    let title, description, statusColor, icon;

                    if (reg.status === 'Approved') {
                        title = 'Course Registration Approved ✅';
                        description = 'Good news! Your course registration for the current academic year has been reviewed and APPROVED by the Faculty Board.';
                        statusColor = 'green';
                        icon = '🎉';
                    } else if (reg.status === 'Rejected') {
                        title = 'Course Registration Rejected ❌';
                        description = `Your course registration form has been REJECTED. Reason: "${reg.reject_reason || 'No specific reason provided'}". Please revise and resubmit.`;
                        statusColor = 'red';
                        icon = '⚠️';
                    } else {
                        title = 'Course Registration Under Review ⏳';
                        description = 'Your course registration form is currently PENDING review.';
                        statusColor = 'orange';
                        icon = '📝';
                    }

                    return {
                        id: `course_${reg.id}`,
                        type: 'Registration',
                        title,
                        description,
                        dateObj: new Date(reg.created_at),
                        time: new Date(reg.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                        status: reg.status,
                        statusColor,
                        icon,
                        rawData: reg
                    };
                });

                // 2. Process Add/Drop Forms
                const mappedAddDrop = addDropData.map((reg) => {
                    let title, description, statusColor, icon;

                    if (reg.status === 'Approved') {
                        title = 'Add/Drop Form Approved ✅';
                        description = 'Your Add/Drop request has been thoroughly reviewed and APPROVED.';
                        statusColor = 'green';
                        icon = '✅';
                    } else if (reg.status?.includes('Rejected')) {
                        title = 'Add/Drop Form Rejected ❌';
                        description = `Your Add/Drop request has been REJECTED. Reason: "${reg.reject_reason || 'No specific reason provided'}".`;
                        statusColor = 'red';
                        icon = '⚠️';
                    } else {
                        title = 'Add/Drop Form Under Review ⏳';
                        description = `Your Add/Drop request is currently in review process (${reg.status}).`;
                        statusColor = 'orange';
                        icon = '🔄';
                    }

                    return {
                        id: `adddrop_${reg.id}`,
                        type: 'Add/Drop',
                        title,
                        description,
                        dateObj: new Date(reg.created_at),
                        time: new Date(reg.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                        status: reg.status,
                        statusColor,
                        icon,
                        rawData: reg
                    };
                });

                // 3. Process Medical/Repeat Forms
                const mappedMedical = medicalData.map((reg) => {
                    let title, description, statusColor, icon;
                    const isMedical = reg.form_type === 'Medical';

                    if (reg.status === 'Approved') {
                        title = `REPEAT/MEDICAL EXAMINATIONS form Approved ✅`;
                        description = `Your REPEAT/MEDICAL EXAMINATIONS form has been reviewed and APPROVED by the Faculty.`;
                        statusColor = 'green';
                        icon = isMedical ? '🏥' : '📑';
                    } else if (reg.status === 'Rejected') {
                        title = `REPEAT/MEDICAL EXAMINATIONS form Rejected ❌`;
                        description = `Your REPEAT/MEDICAL EXAMINATIONS form has been REJECTED. Reason: "${reg.reject_reason || 'No specific reason provided'}".`;
                        statusColor = 'red';
                        icon = '⚠️';
                    } else {
                        title = `REPEAT/MEDICAL EXAMINATIONS form Under Review ⏳`;
                        description = `Your REPEAT/MEDICAL EXAMINATIONS form is currently PENDING review by the Faculty Staff.`;
                        statusColor = 'orange';
                        icon = isMedical ? '🏥' : '📑';
                    }

                    return {
                        id: `medrep_${reg.id}`,
                        type: reg.form_type,
                        title,
                        description,
                        dateObj: new Date(reg.created_at),
                        time: new Date(reg.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                        status: reg.status,
                        statusColor,
                        icon,
                        rawData: reg
                    };
                });

                // 4. Process Deadlines
                const mappedDeadlines = deadlineData.map((n) => ({
                    id: `deadline_${n.id}`,
                    type: 'Deadline',
                    title: `⏰ ${n.form_name}`,
                    description: `${n.description || 'A new deadline has been set.'} Due: ${n.deadline ? n.deadline.substring(0, 10) : ''}`,
                    dateObj: new Date(n.created_at),
                    time: new Date(n.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                    status: n.is_read ? 'Read' : 'New Reminder',
                    statusColor: n.is_read ? 'gray' : 'blue',
                    icon: '⏰',
                    isUnread: !n.is_read
                }));

                const mappedDeadlinesBR = deadlineBRData.map((n) => ({
                    id: `deadline_br_${n.id}`,
                    type: 'Deadline',
                    title: `⏰ ${n.form_name}`,
                    description: `${n.description || 'A new deadline has been set.'} Due: ${n.deadline ? n.deadline.substring(0, 10) : ''}`,
                    dateObj: new Date(n.created_at),
                    time: new Date(n.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                    status: n.is_read ? 'Read' : 'New Reminder',
                    statusColor: n.is_read ? 'gray' : 'blue',
                    icon: '⏰',
                    isUnread: !n.is_read
                }));

                // Merge and Sort by Date (newest first)
                allNotifications = [...mappedCourses, ...mappedAddDrop, ...mappedMedical, ...mappedDeadlines, ...mappedDeadlinesBR];
                allNotifications.sort((a, b) => b.dateObj - a.dateObj);

                setNotifications(allNotifications);

                // Auto-mark deadlines as read
                const unreadIds = deadlineData.filter(d => !d.is_read).map(d => d.id);
                const unreadBRIds = deadlineBRData.filter(d => !d.is_read).map(d => d.id);

                if (unreadIds.length > 0) {
                    fetch('http://localhost:5000/api/deadlines/mark-all-read', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.user_id, role: 'Students' })
                    }).catch(err => console.error('Failed to mark Students read', err));
                }

                if (unreadBRIds.length > 0) {
                    fetch('http://localhost:5000/api/deadlines/mark-all-read', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.user_id, role: 'Batch Representative' })
                    }).catch(err => console.error('Failed to mark Batch Representative read', err));
                }

            } catch (error) {
                console.error("Error fetching aggregated notifications:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, [user?.user_id]);

    const handleViewForm = async (notif) => {
        try {
            let doc;
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // 1. Fetch Deadlines to get the correct due_date
            const deadlines = await fetchDeadlines();

            if (notif.type === 'Registration') {
                const reg = { ...notif.rawData };
                if (typeof reg.form_data === 'string') {
                    reg.form_data = JSON.parse(reg.form_data);
                }
                
                // Get the most specific academic year available
                const academicYear = reg.academic_year || reg.academicYear || reg.form_data?.academicYear || '';
                
                reg.deadlineDate = getDeadlineForForm('Academic Course Unit', academicYear, deadlines);
                doc = await generateCourseUnitPDF(reg);
            } else if (notif.type === 'Add/Drop') {
                const addDrop = { ...notif.rawData };
                const academicYear = addDrop.academic_year || '';
                addDrop.deadlineDate = getDeadlineForForm('Add/Drop Form', academicYear, deadlines);
                
                doc = await generateAddDropPDF(addDrop);
            } else if (notif.type === 'Medical' || notif.type === 'Repeat') {
                const res = await fetch(`http://localhost:5000/api/medical-repeat/${notif.rawData.id}`, { headers });
                if (res.ok) {
                    const fullData = await res.json();
                    const academicYear = fullData.academic_year || '';
                    
                    fullData.deadlineDate = getDeadlineForForm('Medical/Repeat Form', academicYear, deadlines);
                    doc = await generateMedicalRepeatPDF(fullData);
                } else {
                    throw new Error("Failed to fetch application details");
                }
            }

            if (doc) {
                window.open(doc.output('bloburl'), '_blank');
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Could not generate PDF. Please try again later.");
        }
    };

    // Derived State for Summary Cards
    const totalNotifications = notifications.length;
    const urgentAlerts = notifications.filter(n => n.status === 'Rescheduled' || n.status === 'Alert' || n.isUnread).length;
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
        <div className="bg-slate-50 min-h-full py-8 text-left animate-fade-in-up">
            <div className="max-w-5xl mx-auto px-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Notifications & Alerts</h1>
                        <p className="text-sm text-slate-500 mt-1">Stay updated on your academics and course approvals.</p>
                    </div>
                </div>

                {/* Main Content Area */}
                {isLoading ? (
                    <div className="bg-white rounded-2xl p-12 border shadow-sm text-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-500">Loading notifications...</p>
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="space-y-4">
                        {notifications.map((notif) => (
                            <div key={notif.id} className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex gap-5 items-start">
                                <div className="flex-shrink-0 w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-xl border border-slate-100">
                                    {notif.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-4 mb-1">
                                        <h3 className="font-semibold text-slate-800 text-base">{notif.title}</h3>
                                        <span className="text-xs font-medium text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-1 rounded-full">{notif.time}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-3 pr-4 leading-relaxed">
                                        {notif.description}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(notif.status, notif.statusColor)}
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {notif.type}
                                        </span>
                                    </div>
                                    {(notif.type === 'Registration' || notif.type === 'Add/Drop' || notif.type === 'Medical' || notif.type === 'Repeat') && (
                                        <button 
                                            onClick={() => handleViewForm(notif)}
                                            className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors group"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            View My Form
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-16 border shadow-sm text-center">
                        <div className="text-5xl mb-4">📭</div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">You're all caught up!</h3>
                        <p className="text-slate-500">You don't have any notifications or alerts at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentNotifications;
