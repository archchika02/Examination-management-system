import React, { useState, useEffect, useRef } from 'react';

const Icons = {
    Calendar: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
    ),
    ChevronLeft: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
    ),
    ChevronRight: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
    ),
    Clock: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    ),
    Check: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
    ),
    Trash: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
    ),
    Send: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
    ),
    Info: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="16" y2="12" /><line x1="12" x2="12" y1="8" y2="8" /></svg>
    )
};

const TimetableConfiguration = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedExamDates, setSelectedExamDates] = useState(new Set());

    // Drag selection state
    const [isDragging, setIsDragging] = useState(false);
    const [isAdding, setIsAdding] = useState(true); // true = adding, false = removing

    const [poyaDays, setPoyaDays] = useState([]);
    const [nationalHolidays, setNationalHolidays] = useState([]);
    const [loadingHolidays, setLoadingHolidays] = useState(false);
    const dateInputRef = useRef(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Adjust logic: 0 is Sunday in JS. We want 0 to be Monday.
    const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7;

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const generateCalendarDays = () => {
        const days = [];
        // Add empty slots for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }
        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const calendarDays = generateCalendarDays();

    const formatDateKey = (date) => {
        if (!date) return null;
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const isSunday = (date) => date && date.getDay() === 0;
    const isPoya = (date) => {
        if (!date) return false;
        const key = formatDateKey(date);
        return poyaDays.includes(key);
    };

    const isHoliday = (date) => {
        if (!date) return false;
        const key = formatDateKey(date);
        return nationalHolidays.includes(key);
    };

    const isUnavailable = (date) => isSunday(date) || isPoya(date) || isHoliday(date);

    const toggleDateSelection = (date) => {
        if (!date || isUnavailable(date)) return;

        const key = formatDateKey(date);
        const newSelected = new Set(selectedExamDates);
        if (newSelected.has(key)) {
            newSelected.delete(key);
        } else {
            newSelected.add(key);
        }
        setSelectedExamDates(newSelected);
    };

    const handleMouseDown = (date) => {
        if (!date || isUnavailable(date)) return;
        setIsDragging(true);
        const key = formatDateKey(date);
        const willAdd = !selectedExamDates.has(key);
        setIsAdding(willAdd);

        const newSelected = new Set(selectedExamDates);
        if (willAdd) {
            newSelected.add(key);
        } else {
            newSelected.delete(key);
        }
        setSelectedExamDates(newSelected);
    };

    const handleMouseEnter = (date) => {
        if (!isDragging || !date || isUnavailable(date)) return;

        const key = formatDateKey(date);
        const newSelected = new Set(selectedExamDates);
        if (isAdding) {
            newSelected.add(key);
        } else {
            newSelected.delete(key);
        }
        setSelectedExamDates(newSelected);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const [deadlineDate, setDeadlineDate] = useState('');
    const [academicYear, setAcademicYear] = useState(''); // New state for academic year

    const formatDateToUK = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    // Fetch global configuration
    const fetchGlobalConfiguration = async () => {
        try {
            const respConfig = await fetch('http://localhost:5000/api/configurations/global-dates');
            const configData = await respConfig.json();
            if (configData.allowed_dates) setSelectedExamDates(new Set(configData.allowed_dates));
            if (configData.deadline) setDeadlineDate(configData.deadline);
            if (configData.academic_year) setAcademicYear(configData.academic_year);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // Fetch holidays dynamically
    useEffect(() => {
        fetchGlobalConfiguration();
        const fetchHolidays = async () => {
            setLoadingHolidays(true);
            try {
                const url = `https://tallyfy.com/national-holidays/api/LK/${year}.json`;
                const response = await fetch(url);

                if (response.ok) {
                    const data = await response.json();
                    const holidayList = data.holidays || [];

                    const poya = holidayList
                        .filter(h => h.name.toLowerCase().includes('poya'))
                        .map(h => h.date);

                    const otherHolidays = holidayList
                        .filter(h => !h.name.toLowerCase().includes('poya'))
                        .map(h => h.date);

                    setPoyaDays(poya);
                    setNationalHolidays(otherHolidays);
                }
            } catch (error) {
                console.error("Error fetching holidays:", error);
            } finally {
                setLoadingHolidays(false);
            }
        };

        fetchHolidays();
    }, [year]);

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    const calculateExactStats = () => {
        let sun = 0;
        let poy = 0;
        let hol = 0;
        let avail = 0;
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const sunBool = isSunday(date);
            const poyaBool = isPoya(date);
            const holBool = isHoliday(date);

            if (sunBool) sun++;
            if (poyaBool) poy++;
            if (holBool) hol++;

            if (!sunBool && !poyaBool && !holBool) {
                avail++;
            }
        }
        return { sun, poy, hol, avail };
    };

    const exactStats = calculateExactStats();

    const handleMonthChange = (e) => {
        setCurrentDate(new Date(year, parseInt(e.target.value), 1));
    };

    const handleYearChange = (newYear) => {
        setCurrentDate(new Date(newYear, month, 1));
    };

    const markAllAvailable = () => {
        const newSelected = new Set(selectedExamDates);
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            if (!isUnavailable(date)) {
                newSelected.add(formatDateKey(date));
            }
        }
        setSelectedExamDates(newSelected);
    };

    const handleDispatchToReps = async () => {
        if (availableDates.length === 0) {
            alert('Please select at least one available date.');
            return;
        }
        if (!submissionDeadline) {
            alert('Please set a submission deadline.');
            return;
        }
        if (!academicYear) {
            alert('Please set the Academic Year.');
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch('http://localhost:5000/api/configurations/global-dates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    allowed_dates: availableDates, 
                    deadline: submissionDeadline,
                    academic_year: academicYear
                })
            });

            if (response.ok) {
                localStorage.setItem('allowed_exam_dates', JSON.stringify(Array.from(selectedExamDates)));
                alert(`Configuration sent to representative! Deadline set to: ${formattedDeadline}`);
            } else {
                alert("Failed to send configuration to representative. Please try again.");
            }
        } catch (error) {
            console.error("Error sending configuration:", error);
            alert("An error occurred while sending the configuration.");
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-fade-in-up">
            {/* Main Calendar Section */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                <Icons.Calendar />
                            </span>
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded-full uppercase tracking-widest leading-none">Scheduler</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Timeline Configuration</h2>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-900 p-1.5 rounded-2xl shadow-xl shadow-slate-200">
                        <select
                            value={month}
                            onChange={handleMonthChange}
                            className="bg-transparent border-none text-white text-xs font-black uppercase tracking-widest px-4 py-2 focus:ring-0 cursor-pointer"
                        >
                            {months.map((m, idx) => (
                                <option key={m} value={idx} className="bg-slate-800 uppercase">{m}</option>
                            ))}
                        </select>

                        <div className="w-[1px] h-6 bg-slate-800"></div>

                        <div className="flex items-center gap-1 px-2">
                            <button
                                onClick={() => handleYearChange(year - 1)}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all active:scale-95"
                                title="Previous Year"
                            >
                                <Icons.ChevronLeft />
                            </button>
                            <span className="text-sm font-black text-blue-400 min-w-[60px] text-center">
                                {year}
                            </span>
                            <button
                                onClick={() => handleYearChange(year + 1)}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all active:scale-95"
                                title="Next Year"
                            >
                                <Icons.ChevronRight />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Refined Legend */}
                <div className="flex flex-wrap gap-4 mb-8 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl shadow-sm border border-slate-100">
                        <div className="w-2.5 h-2.5 bg-slate-200 border border-slate-300 rounded-full"></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Open Session</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 rounded-xl shadow-md shadow-blue-100 border border-blue-500">
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Exam Date</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl shadow-sm border border-slate-100">
                        <div className="w-2.5 h-2.5 bg-rose-500 rounded-full"></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sunday</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl shadow-sm border border-slate-100">
                        <div className="w-2.5 h-2.5 bg-amber-500 rounded-full"></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Poya Day</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl shadow-sm border border-slate-100">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Holiday</span>
                    </div>
                </div>

                {/* Calendar Grid Header */}
                <div className="grid grid-cols-7 gap-3 mb-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Interactive Calendar Body */}
                <div className="grid grid-cols-7 gap-3">
                    {calendarDays.map((date, index) => {
                        if (!date) return <div key={`empty-${index}`} className="p-2 aspect-square"></div>;

                        const key = formatDateKey(date);
                        const isSel = selectedExamDates.has(key);
                        const isSun = isSunday(date);
                        const isPoy = isPoya(date);
                        const isHol = isHoliday(date);
                        const unavail = isSun || isPoy || isHol;

                        let styleClass = "bg-white border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 group/day";
                        let textClass = "text-slate-900";
                        let indicator = null;

                        if (isSel) {
                            styleClass = "bg-blue-600 border-blue-500 shadow-xl shadow-blue-200 scale-105 z-10 hover:bg-blue-700";
                            textClass = "text-white";
                            indicator = "Exam Date";
                        } else if (isSun) {
                            styleClass = "bg-rose-50/30 border-rose-100 cursor-not-allowed grayscale-[0.5] opacity-80";
                            textClass = "text-rose-400";
                            indicator = "Sunday";
                        } else if (isPoy) {
                            styleClass = "bg-amber-50/30 border-amber-100 cursor-not-allowed shadow-inner shadow-amber-50";
                            textClass = "text-amber-500";
                            indicator = "Poya Day";
                        } else if (isHol) {
                            styleClass = "bg-emerald-50/30 border-emerald-100 cursor-not-allowed";
                            textClass = "text-emerald-500";
                            indicator = "Holiday";
                        }

                        return (
                            <div
                                key={key}
                                onMouseDown={() => handleMouseDown(date)}
                                onMouseEnter={() => handleMouseEnter(date)}
                                onMouseUp={handleMouseUp}
                                className={`
                                    relative p-2 rounded-2xl border flex flex-col items-center justify-center aspect-square transition-all duration-300 select-none cursor-pointer
                                    ${styleClass}
                                `}
                            >
                                <span className={`text-xl font-black ${textClass} transition-transform group-hover/day:scale-110`}>
                                    {date.getDate()}
                                </span>
                                {indicator && (
                                    <span className={`text-[7px] font-black uppercase tracking-widest mt-1 opacity-70 ${isSel ? 'text-blue-100' : ''}`}>
                                        {indicator}
                                    </span>
                                )}

                                {isSel && (
                                    <div className="absolute top-2 right-2">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar Summary */}
            <div className="w-full lg:w-80 flex flex-col gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                        <Icons.Info />
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Session Summary</h3>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sundays</span>
                            <span className="text-sm font-black text-rose-600">{exactStats.sun}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Poya Days</span>
                            {loadingHolidays ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-500"></div>
                            ) : (
                                <span className="text-sm font-black text-amber-500">{exactStats.poy}</span>
                            )}
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Holidays</span>
                            {loadingHolidays ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-emerald-500"></div>
                            ) : (
                                <span className="text-sm font-black text-emerald-500">{exactStats.hol}</span>
                            )}
                        </div>

                        <div className="h-px bg-slate-100 my-4"></div>

                        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm shadow-blue-50">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1">Allocated Slots</span>
                                <span className="text-2xl font-black text-blue-900 leading-none">{selectedExamDates.size}</span>
                            </div>
                            <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                                <Icons.Check />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900 rounded-2xl shadow-xl p-8 flex flex-col gap-5 border border-slate-800">
                    <div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Configuration Controls</h3>

                        <div className="space-y-4">
                            <div className="group">
                                <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Target Academic Year</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none">
                                        <Icons.Clock />
                                    </div>
                                    <input
                                        type="text"
                                        value={academicYear}
                                        onChange={(e) => setAcademicYear(e.target.value)}
                                        placeholder="e.g. 2024/2025"
                                        readOnly
                                        className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border-none rounded-xl text-slate-400 text-xs font-bold focus:ring-0 transition-all cursor-default"
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Submission Deadline</label>
                                <div
                                    className="relative cursor-pointer group/picker"
                                    onClick={() => dateInputRef.current?.showPicker()}
                                >
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none transition-transform group-hover/picker:scale-110">
                                        <Icons.Calendar />
                                    </div>
                                    <input
                                        type="text"
                                        value={deadlineDate.includes('-') ? formatDateToUK(deadlineDate) : deadlineDate}
                                        placeholder="Pick a date..."
                                        readOnly
                                        className="w-full pl-11 pr-4 py-3 bg-slate-800 border-none rounded-xl text-white text-xs font-bold focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer placeholder:text-slate-600"
                                    />
                                    <input
                                        ref={dateInputRef}
                                        type="date"
                                        value={deadlineDate}
                                        onChange={(e) => setDeadlineDate(e.target.value)}
                                        className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={markAllAvailable}
                            className="flex flex-col items-center justify-center gap-2 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-all border border-slate-700/50 group active:scale-95"
                        >
                            <span className="p-2 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                                <Icons.Check />
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest">Mark All</span>
                        </button>

                        <button
                            onClick={() => setSelectedExamDates(new Set())}
                            className="flex flex-col items-center justify-center gap-2 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-all border border-slate-700/50 group active:scale-95"
                        >
                            <span className="p-2 bg-rose-500/10 text-rose-400 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-all">
                                <Icons.Trash />
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest">Clear All</span>
                        </button>
                    </div>

                    <button
                        onClick={async () => {
                            if (selectedExamDates.size === 0) {
                                alert('Please select at least one available date.');
                                return;
                            }
                            if (!deadlineDate) {
                                alert('Please set a submission deadline.');
                                return;
                            }
                            if (!academicYear) {
                                alert('Please set the Academic Year.');
                                return;
                            }

                            try {
                                const response = await fetch('http://localhost:5000/api/configurations/global-dates', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ 
                                        allowed_dates: Array.from(selectedExamDates), 
                                        deadline: deadlineDate,
                                        academic_year: academicYear
                                    })
                                });

                                if (response.ok) {
                                    alert(`Configuration sent to representative!`);
                                } else {
                                    alert("Failed to send configuration. Please try again.");
                                }
                            } catch (error) {
                                console.error("Error sending configuration:", error);
                            }
                        }}
                        className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-900/40 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-3 group"
                    >
                        <Icons.Send />
                        <span className="text-xs uppercase tracking-widest">Submit to batch rep</span>
                    </button>

                    <p className="text-[9px] font-bold text-slate-500 text-center leading-relaxed">
                        * Dispatching will broadcast allowed dates to all Batch Representatives for departmental coordination.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TimetableConfiguration;
