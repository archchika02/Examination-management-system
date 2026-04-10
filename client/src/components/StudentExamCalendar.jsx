import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Icons = {
    Calendar: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
    ),
    History: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>
    ),
    Settings: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
    ),
    ChevronLeft: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
    ),
    ChevronRight: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
    ),
    AlertCircle: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12" y1="16" y2="16" /></svg>
    ),
    Check: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
    ),
    Plus: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" /></svg>
    ),
    Trash: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
    ),
    Send: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
    ),
    FileText: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14.5 2 14.5 7.5 20 7.5" /><line x1="8" x2="16" y1="13" y2="13" /><line x1="8" x2="16" y1="17" y2="17" /><line x1="8" x2="10" y1="9" y2="9" /></svg>
    )
};

const StudentExamCalendar = () => {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [courseCode, setCourseCode] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [drafts, setDrafts] = useState([]);
    const [history, setHistory] = useState([]);
    const [allowedDates, setAllowedDates] = useState(new Set());
    const [examDeadline, setExamDeadline] = useState(null);
    const [academicYear, setAcademicYear] = useState(''); // Added missing state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const [poyaDays, setPoyaDays] = useState([]);
    const [nationalHolidays, setNationalHolidays] = useState([]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7;

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const fetchConfig = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/configurations/global-dates');
            if (response.ok) {
                const data = await response.json();
                setAllowedDates(new Set(data.allowed_dates || []));
                setExamDeadline(data.deadline);
                if (data.academic_year) setAcademicYear(data.academic_year);
            }
        } catch (error) {
            console.error("Error fetching global config:", error);
        }
    };

    const fetchSubmittedHistory = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/configurations/list');
            if (response.ok) {
                const data = await response.json();
                const repId = user?.user_id || 1;
                // Filter for current rep
                const myHistory = data.filter(item => item.batch_rep_id === repId);
                setHistory(myHistory);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };

    const formatDateToUK = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    useEffect(() => {
        fetchConfig();
        fetchSubmittedHistory();
    }, []);

    const formatDateKey = (date) => {
        if (!date) return null;
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const isSunday = (date) => date && date.getDay() === 0;
    const isPoya = (date) => date && poyaDays.includes(formatDateKey(date));
    const isHoliday = (date) => date && nationalHolidays.includes(formatDateKey(date));
    const isAllowed = (date) => date && allowedDates.has(formatDateKey(date));

    const handleDateClick = (date) => {
        if (!isAllowed(date)) return;
        setSelectedDate(date);
    };

    const addToDraft = () => {
        if (!courseCode || !selectedDate) {
            setMessage({ text: "Assign both Course Code and Date", type: 'error' });
            return;
        }

        const dateStr = formatDateKey(selectedDate);
        if (drafts.some(d => d.date === dateStr || d.code === courseCode.toUpperCase())) {
            setMessage({ text: "Conflict: Date or Course already drafted", type: 'error' });
            return;
        }

        setDrafts([...drafts, { code: courseCode.toUpperCase(), date: dateStr }]);
        setCourseCode('');
        setSelectedDate(null);
        setMessage({ text: "Added to draft", type: 'success' });
    };

    const removeFromDraft = (index) => {
        const newDrafts = [...drafts];
        newDrafts.splice(index, 1);
        setDrafts(newDrafts);
    };

    const submitToAS = async () => {
        if (drafts.length === 0) return;
        setIsSubmitting(true);

        const payload = drafts.map(d => ({
            batch_rep_id: user?.user_id || 1,
            course_code: d.code,
            preferred_dates: [d.date],
            level: user?.level || 1,
            academic_year: academicYear, // Include academic year
            status: 'SENT'
        }));

        try {
            const response = await fetch('http://localhost:5000/api/configurations/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setMessage({ text: "Preferences dispatched successfully!", type: 'success' });
                setDrafts([]);
                fetchSubmittedHistory();
            } else {
                setMessage({ text: "Submission failed. Please try again.", type: 'error' });
            }
        } catch (error) {
            console.error("Submission Error:", error);
            setMessage({ text: `Connection error (${error.message}). Check console.`, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const calendarDays = (() => {
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
        return days;
    })();

    return (
        <div className="flex flex-col xl:flex-row gap-8 animate-fade-in-up pb-12">
            {/* Left Section: Allocation Workspace */}
            <div className="flex-1 flex flex-col gap-6">
                {/* Header Card */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                <Icons.Calendar />
                            </span>
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded-full uppercase tracking-widest leading-none">Scheduler</span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Timeline Configuration</h2>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Level {user?.level || 'N/A'} Academic Session Allocation</p>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-2xl shadow-xl shadow-slate-900/20">
                        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 text-slate-400 hover:text-white transition-colors">
                            <Icons.ChevronLeft />
                        </button>
                        <span className="text-sm font-black text-blue-400 min-w-[120px] text-center uppercase tracking-widest">
                            {months[month]} {year}
                        </span>
                        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 text-slate-400 hover:text-white transition-colors">
                            <Icons.ChevronRight />
                        </button>
                    </div>
                </div>

                {/* Calendar & Entry Workspace */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100">
                    <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
                        {/* Calendar Side */}
                        <div className="lg:col-span-5">
                            <div className="grid grid-cols-7 gap-3 mb-6">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                                    <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-3">
                                {calendarDays.map((date, idx) => {
                                    if (!date) return <div key={idx} className="aspect-square"></div>;
                                    const allowed = isAllowed(date);
                                    const selected = selectedDate && formatDateKey(date) === formatDateKey(selectedDate);
                                    const isSun = isSunday(date);

                                    let contentClass = "bg-white border-slate-100 text-slate-900 hover:border-blue-300 hover:bg-blue-50/50";
                                    if (!allowed) contentClass = "bg-slate-50 border-transparent text-slate-300 opacity-40 cursor-not-allowed";
                                    if (selected) contentClass = "bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-200 scale-105 z-10";
                                    if (isSun) contentClass += " text-rose-400";

                                    return (
                                        <button
                                            key={idx}
                                            disabled={!allowed}
                                            onClick={() => handleDateClick(date)}
                                            className={`relative aspect-square rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 group ${contentClass}`}
                                        >
                                            <span className="text-xl font-black">{date.getDate()}</span>
                                            {allowed && !selected && (
                                                <div className="absolute bottom-2">
                                                    <div className="w-1 h-1 bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                </div>
                                            )}
                                            {selected && (
                                                <span className="text-[7px] font-black uppercase tracking-widest mt-1 text-blue-100">Selected</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-slate-50">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Choice</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 bg-slate-100 border border-slate-200 rounded-full"></div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Unavailable</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Entry Side */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col gap-5">
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                                    Slot Staging
                                </h3>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Code</label>
                                        <input
                                            type="text"
                                            value={courseCode}
                                            onChange={(e) => setCourseCode(e.target.value)}
                                            placeholder="INTE21233..."
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Allocation Date</label>
                                        <div className="w-full px-4 py-3 bg-slate-100 text-slate-900 rounded-xl text-xs font-bold tracking-widest border border-transparent">
                                            {selectedDate ? selectedDate.toLocaleDateString() : 'Pick on Calendar'}
                                        </div>
                                    </div>

                                    <button
                                        onClick={addToDraft}
                                        className="w-full py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                                    >
                                        <Icons.Plus />
                                        Stage Preference
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex flex-col gap-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-blue-900">Current Draft ({drafts.length})</span>
                                    <button onClick={() => setDrafts([])} className="text-blue-400 hover:text-blue-600 transition-colors">Clear</button>
                                </div>

                                <div className="flex-1 space-y-2 overflow-y-auto max-h-[220px] pr-2 custom-scrollbar">
                                    {drafts.length === 0 ? (
                                        <p className="text-[9px] font-bold text-blue-400/60 uppercase tracking-widest italic text-center py-8">No slots staged yet</p>
                                    ) : (
                                        drafts.map((d, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-100 group">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{d.code}</span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{d.date}</span>
                                                </div>
                                                <button onClick={() => removeFromDraft(i)} className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors">
                                                    <Icons.Trash />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <button
                                    onClick={submitToAS}
                                    disabled={drafts.length === 0 || isSubmitting}
                                    className="w-full py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-blue-200 hover:bg-blue-700 disabled:bg-blue-200 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                                >
                                    <Icons.Send />
                                    {isSubmitting ? 'Dispatching...' : 'Dispatch to AS'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Sidebar Monitoring */}
            <div className="w-full xl:w-96 flex flex-col gap-6">
                {/* Status Card */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-900/40 text-white border border-slate-800">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                        <Icons.AlertCircle />
                        Dispatch Protocol
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/30">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 shadow-sm block">Academic Year</span>
                            <div className="text-lg font-black text-white tracking-tight">{academicYear || 'Not Set'}</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/30">
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 shadow-sm block">Submission Deadline</span>
                            <div className="text-lg font-black text-rose-500 tracking-tight">
                                {examDeadline ? (examDeadline.includes('-') ? formatDateToUK(examDeadline) : examDeadline) : 'Not Set'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* History Card */}
                <div className="flex-1 bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2">
                        <Icons.History />
                        Submission History
                    </h3>

                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                        {history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 opacity-20">
                                <Icons.FileText />
                                <span className="text-[10px] font-black uppercase tracking-widest mt-2">No past records</span>
                            </div>
                        ) : (
                            history.map((record, i) => (
                                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{record.course_code}</span>
                                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[8px] font-black uppercase">Sent</span>
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{record.preferred_dates[0]}</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                                        <Icons.Check />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {message.text && (
                        <div className={`mt-6 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-center animate-bounce ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                            {message.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentExamCalendar;
