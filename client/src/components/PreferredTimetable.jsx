import React, { useState, useEffect } from 'react';

const Icons = {
    Calendar: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
    ),
    ChevronLeft: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
    ),
    ChevronRight: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
    ),
    Clock: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    ),
    Search: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
    ),
    Send: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
    ),
    Info: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="16" y2="12" /><line x1="12" x2="12" y1="8" y2="8" /></svg>
    ),
    CheckCircle: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
    )
};

const PreferredTimetable = () => {
    // academicYear is now an array to support multi-select
    const [academicYears, setAcademicYears] = useState([1]);
    const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [draggedExam, setDraggedExam] = useState(null);
    const [receivedConfigs, setReceivedConfigs] = useState([]);
    const [activeConfig, setActiveConfig] = useState(null); // The one currently being viewed
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('');
    const [facultyAcademicYear, setFacultyAcademicYear] = useState('');

    const [exams, setExams] = useState({
        1: [],
        2: [],
        3: [],
        4: []
    });

    useEffect(() => {
        fetchConfigurations();
        const fetchGlobalConfig = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/configurations/global-dates');
                if (response.ok) {
                    const data = await response.json();
                    if (data.academic_year) setFacultyAcademicYear(data.academic_year);
                }
            } catch (error) {
                console.error("Failed to fetch global config", error);
            }
        };
        fetchGlobalConfig();
    }, []);

    const fetchConfigurations = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/configurations/list');
            if (response.ok) {
                const data = await response.json();
                setReceivedConfigs(data);
            }
        } catch (error) {
            console.error("Failed to fetch configurations", error);
        } finally {
            setLoading(false);
        }
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    // Monday start correction: (day + 6) % 7 ensures Mon=0, Sun=6
    const firstDayOfMonth = (month, year) => (new Date(year, month, 1).getDay() + 6) % 7;

    const handlePrevYear = () => setCalendarYear(prev => prev - 1);
    const handleNextYear = () => setCalendarYear(prev => prev + 1);

    const handleDragStart = (e, exam) => {
        setDraggedExam(exam);
    };

    const handleDrop = (e, day) => {
        e.preventDefault();
        if (draggedExam) {
            const dateString = `${calendarYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            setExams(prev => {
                // Since exams are stored by year, we just apply drop to the first selected year if dragging a generic item, 
                // or we identify its original year. For simplicity in multi-select, assume we drop into the primary/first selected year.
                const targetYear = academicYears[0] || 1;
                const yearExams = prev[targetYear].filter(ex => ex.id !== draggedExam.id);
                return {
                    ...prev,
                    [targetYear]: [...yearExams, { ...draggedExam, date: dateString }]
                };
            });
            setDraggedExam(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    // Find the latest academic year from the received configurations
    const latestAcademicYearFromData = [...new Set(receivedConfigs.map(c => c.academic_year).filter(Boolean))]
        .sort((a, b) => b.localeCompare(a))[0] || '';

    // Filter configurations based on ALL selected Levels AND the latest Academic Year
    const filteredConfigs = receivedConfigs.filter(config =>
        academicYears.includes(config.level || 1) &&
        (config.academic_year === latestAcademicYearFromData || !latestAcademicYearFromData)
    );

    const handleSubmitToFaculty = async () => {
        setIsSubmitting(true);
        setSubmitStatus('Validating...');

        try {
            // Check if all 4 levels are selected
            if (academicYears.length < 4) {
                const missing = [1, 2, 3, 4].filter(y => !academicYears.includes(y));
                setSubmitStatus(`Error: Select all 4 levels before submitting (Missing: ${missing.join(', ')})`);
                setIsSubmitting(false);
                return;
            }

            const examsToSubmit = [];

            filteredConfigs.forEach(config => {
                let examDateStr = null;
                // preferred_dates might be an array or a string representing dates
                if (Array.isArray(config.preferred_dates) && config.preferred_dates.length > 0) {
                    examDateStr = config.preferred_dates[0];
                } else if (typeof config.preferred_dates === 'string') {
                    // Try parsing if it's stringified json
                    try {
                        const parsed = JSON.parse(config.preferred_dates);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            examDateStr = parsed[0];
                        } else {
                            examDateStr = config.preferred_dates;
                        }
                    } catch (e) {
                        examDateStr = config.preferred_dates;
                    }
                }

                if (examDateStr) {
                    examsToSubmit.push({
                        code: config.course_code,
                        date: examDateStr
                    });
                }
            });

            // Fallback to local exams if any mock dragging was done
            academicYears.forEach(year => {
                if (exams[year]) {
                    exams[year].forEach(ex => {
                        // Avoid duplicates if config already pulled it
                        if (!examsToSubmit.find(e => e.code === ex.code)) {
                            examsToSubmit.push({
                                code: ex.code,
                                date: ex.date
                            });
                        }
                    });
                }
            });

            if (examsToSubmit.length === 0) {
                setSubmitStatus('Error: No exams found for levels 1-4.');
                setIsSubmitting(false);
                return;
            }

            if (!facultyAcademicYear.trim()) {
                setSubmitStatus('Error: Target Academic Year text is required.');
                setIsSubmitting(false);
                return;
            }

            setSubmitStatus('Submitting to Faculty...');

            const response = await fetch('http://localhost:5000/api/configurations/faculty-submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    exams: examsToSubmit,
                    academicYear: facultyAcademicYear
                })
            });

            if (response.ok) {
                setSubmitStatus(`Successfully submitted complete timetable to Faculty!`);
            } else {
                const data = await response.json();
                setSubmitStatus(`Failed to submit: ${data.message || 'Server Error'}`);
            }

            setTimeout(() => setSubmitStatus(''), 5000);

        } catch (error) {
            console.error('Submission failed', error);
            setSubmitStatus('Failed to submit (Network Error)');
            setTimeout(() => setSubmitStatus(''), 5000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderCalendar = () => {
        const days = [];
        const totalDays = daysInMonth(currentMonth, calendarYear);
        const firstDay = firstDayOfMonth(currentMonth, calendarYear);

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="bg-slate-50/30 border border-slate-100 flex flex-col"></div>);
        }

        for (let day = 1; day <= totalDays; day++) {
            const dateString = `${calendarYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayExams = academicYears.flatMap(year => exams[year]?.filter(exam => exam.date === dateString) || []);
            const configsForDate = filteredConfigs.filter(config =>
                Array.isArray(config.preferred_dates)
                    ? config.preferred_dates.includes(dateString)
                    : config.preferred_dates === dateString
            );

            const isSel = activeConfig && configsForDate.some(c => c.id === activeConfig.id);
            const hasAny = configsForDate.length > 0;

            days.push(
                <div
                    key={day}
                    className={`p-2 border border-slate-100 transition-all duration-300 relative group flex flex-col min-h-[90px]
                        ${isSel
                            ? 'bg-blue-50 border-blue-200 ring-1 ring-inset ring-blue-300/50 shadow-[inset_0_0_12px_rgba(59,130,246,0.1)]'
                            : (hasAny ? 'bg-slate-50/80 hover:bg-slate-100/80' : 'bg-white hover:bg-slate-50')}
                    `}
                    onDrop={(e) => handleDrop(e, day)}
                    onDragOver={handleDragOver}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-black shrink-0 px-2 py-0.5 rounded-lg
                            ${isSel || hasAny
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                : 'text-slate-400 group-hover:text-slate-600 transition-colors'}
                        `}>
                            {day}
                        </span>
                        {isSel && (
                            <div className="absolute top-2 right-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1 overflow-y-auto min-h-0 flex-1 custom-scrollbar pr-0.5">
                        {configsForDate.map(config => (
                            <div
                                key={`conf-${config.id}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveConfig(config.id === activeConfig?.id ? null : config);
                                }}
                                className={`text-[8px] font-black p-1 rounded-lg border uppercase tracking-tighter text-center transition-all cursor-pointer select-none leading-tight
                                    ${activeConfig?.id === config.id
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-xl'
                                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-600'
                                    }
                                `}
                            >
                                {config.course_code}
                            </div>
                        ))}

                        {dayExams.map(exam => (
                            <div
                                key={exam.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, exam)}
                                className="text-[9px] font-black p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all flex items-center justify-center uppercase tracking-tighter"
                            >
                                {exam.code}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return days;
    };

    // filteredConfigs moved above

    return (
        <div className="flex gap-6 h-full">
            {/* Sidebar for Received Configurations */}
            <div className="w-80 bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col">
                <div className="p-5 bg-slate-900 border-b border-slate-800">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                            <Icons.Info />
                        </div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Suggestions</h3>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Levels: {academicYears.sort().join(', ')}</p>
                        {latestAcademicYearFromData && (
                            <p className="text-[9px] font-black text-blue-500 uppercase tracking-tighter leading-none mt-1">Session: {latestAcademicYearFromData}</p>
                        )}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                        </div>
                    ) : filteredConfigs.length === 0 ? (
                        <div className="text-center py-10 px-4">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-relaxed">No data for selected levels</p>
                        </div>
                    ) : (
                        filteredConfigs.map(config => (
                            <div
                                key={config.id}
                                onClick={() => setActiveConfig(activeConfig?.id === config.id ? null : config)}
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer group
                                    ${activeConfig?.id === config.id
                                        ? 'bg-blue-600 border-blue-500 shadow-xl shadow-blue-900/40 translate-x-1'
                                        : 'bg-slate-800/40 border-transparent hover:border-slate-700 hover:bg-slate-800'}
                                `}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className={`text-sm font-black tracking-tight ${activeConfig?.id === config.id ? 'text-white' : 'text-slate-200'}`}>
                                        {config.course_code}
                                    </h4>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border
                                        ${activeConfig?.id === config.id
                                            ? 'bg-blue-500 text-white border-blue-400'
                                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}
                                    `}>
                                        {config.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-3">
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <div className={activeConfig?.id === config.id ? 'text-blue-100' : 'text-slate-400'}>
                                            <Icons.Clock />
                                        </div>
                                        <span className={`text-[10px] font-bold ${activeConfig?.id === config.id ? 'text-blue-100' : ''}`}>
                                            {config.preferred_dates?.length || 0} SELECTIONS
                                        </span>
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-tighter ${activeConfig?.id === config.id ? 'text-blue-200' : 'text-slate-500'}`}>
                                        LVL {config.level || 1}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Calendar View */}
            <div className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 h-full flex flex-col">
                <div className="bg-white border-b border-slate-100 p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                            {[1, 2, 3, 4].map(year => {
                                const isSelected = academicYears.includes(year);
                                return (
                                    <button
                                        key={year}
                                        onClick={() => {
                                            if (isSelected) {
                                                if (academicYears.length > 1) {
                                                    setAcademicYears(prev => prev.filter(y => y !== year));
                                                }
                                            } else {
                                                setAcademicYears(prev => [...prev, year]);
                                            }
                                        }}
                                        className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                            ${isSelected
                                                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                                                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}
                                        `}
                                    >
                                        Level {year}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex items-center gap-3 bg-slate-900 p-1.5 rounded-2xl">
                            <button
                                onClick={handlePrevYear}
                                className="p-2 hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-white"
                            >
                                <Icons.ChevronLeft />
                            </button>
                            <span className="text-sm font-black text-white px-2 uppercase tracking-widest">{calendarYear}</span>
                            <button
                                onClick={handleNextYear}
                                className="p-2 hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-white"
                            >
                                <Icons.ChevronRight />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center px-8 py-2 bg-slate-50/50 border-b border-slate-100">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                        {months[currentMonth]}
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentMonth(prev => Math.max(0, prev - 1))}
                            disabled={currentMonth === 0}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm active:scale-95"
                        >
                            <Icons.ChevronLeft />
                        </button>
                        <button
                            onClick={() => setCurrentMonth(prev => Math.min(11, prev + 1))}
                            disabled={currentMonth === 11}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm active:scale-95"
                        >
                            <Icons.ChevronRight />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-slate-50/20">
                    <div className="grid grid-cols-7 grid-rows-[auto_repeat(6,minmax(90px,1fr))] gap-3 min-h-full">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} className="pb-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {day}
                            </div>
                        ))}
                        {renderCalendar()}
                    </div>
                </div>

                <div className="bg-white border-t border-slate-100 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="group">
                            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Target Academic Year</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">
                                    <Icons.Calendar />
                                </div>
                                <input
                                    type="text"
                                    placeholder="e.g. 2024/2025"
                                    value={facultyAcademicYear}
                                    onChange={(e) => setFacultyAcademicYear(e.target.value)}
                                    readOnly
                                    className="pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-500 outline-none w-48 placeholder:text-slate-400 cursor-default"
                                />
                            </div>
                        </div>

                        {submitStatus && (
                            <div className={`px-4 py-3 rounded-xl flex items-center gap-2 border shadow-sm animate-fade-in
                                ${submitStatus.toLowerCase().includes('succes')
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    : 'bg-rose-50 text-rose-700 border-rose-100'}
                            `}>
                                {submitStatus.toLowerCase().includes('succes') ? <Icons.CheckCircle /> : <Icons.Info />}
                                <span className="text-[10px] font-black uppercase tracking-widest">{submitStatus}</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSubmitToFaculty}
                        disabled={isSubmitting || !facultyAcademicYear.trim()}
                        className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center gap-3 active:scale-95
                            ${(isSubmitting || !facultyAcademicYear.trim())
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 hover:-translate-y-0.5'}
                        `}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                <Icons.Send />
                                Submit to Faculty
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreferredTimetable;
