import React, { useState, useEffect } from 'react';

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

    // Mock Data for Exams
    const [exams, setExams] = useState({
        1: [
            { id: 1, code: 'CS101', name: 'Intro to CS', date: '2025-01-15', type: 'Written' },
            { id: 2, code: 'MATH101', name: 'Calculus I', date: '2025-01-20', type: 'Written' },
        ],
        2: [],
        3: [],
        4: []
    });

    useEffect(() => {
        fetchConfigurations();
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

    // Filter configurations based on ALL selected Academic Years
    const filteredConfigs = receivedConfigs.filter(config => academicYears.includes(config.level || 1));

    const handleSubmitToFaculty = async () => {
        setIsSubmitting(true);
        setSubmitStatus('Submitting...');

        try {
            // We want to submit the actual suggested configurations from batch reps that are currently filtered by the selected academic years.
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
                        examsToSubmit.push({
                            code: ex.code,
                            date: ex.date
                        });
                    });
                }
            });

            if (examsToSubmit.length === 0) {
                setSubmitStatus('Error: No exams scheduled to submit.');
                setIsSubmitting(false);
                return;
            }

            if (!facultyAcademicYear.trim()) {
                setSubmitStatus('Error: Academic Year text is required.');
                setIsSubmitting(false);
                return;
            }

            const response = await fetch('http://localhost:5000/api/configurations/faculty-submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    exams: examsToSubmit,
                    academicYear: facultyAcademicYear
                })
            });

            if (response.ok) {
                const submittedYears = [...academicYears].sort().map(y => `Year ${y}`).join(', ');
                setSubmitStatus(`Successfully submitted ${submittedYears} to Faculty!`);
            } else {
                const data = await response.json();
                setSubmitStatus(`Failed to submit: ${data.message}`);
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
            days.push(<div key={`empty-${i}`} className="bg-gray-50/50 border border-gray-100 flex flex-col"></div>);
        }

        for (let day = 1; day <= totalDays; day++) {
            // Format: YYYY-MM-DD
            const dateString = `${calendarYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            // Gather all local exams for all selected years
            const dayExams = academicYears.flatMap(year => exams[year]?.filter(exam => exam.date === dateString) || []);

            // Find all matching configs for this date
            const configsForDate = filteredConfigs.filter(config =>
                Array.isArray(config.preferred_dates)
                    ? config.preferred_dates.includes(dateString)
                    : config.preferred_dates === dateString
            );

            // Highlight if activeConfig recommends this date, or if any config is present
            const isPreferred = activeConfig && configsForDate.some(c => c.id === activeConfig.id);
            const hasAnyConfig = configsForDate.length > 0;

            days.push(
                <div
                    key={day}
                    className={`p-2 border border-gray-100 transition-all duration-300 relative group flex flex-col overflow-hidden min-h-[80px]
                        ${isPreferred ? 'bg-indigo-50 border-indigo-200 ring-1 ring-inset ring-indigo-300/50' : (hasAnyConfig ? 'bg-slate-50' : 'bg-white hover:bg-gray-50')}
                    `}
                    onDrop={(e) => handleDrop(e, day)}
                    onDragOver={handleDragOver}
                >
                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-semibold shrink-0 ${isPreferred || hasAnyConfig ? 'text-indigo-700' : 'text-gray-400'}`}>{day}</span>
                        {isPreferred && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold shadow-sm">Selected</span>}
                    </div>

                    <div className="mt-1 space-y-1 overflow-y-auto min-h-0 flex-1 custom-scrollbar">
                        {/* Display Received Configurations */}
                        {configsForDate.map(config => (
                            <div
                                key={`conf-${config.id}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveConfig(config.id === activeConfig?.id ? null : config);
                                }}
                                className={`text-[11px] leading-tight p-1.5 rounded border font-bold text-center break-words shadow-sm transition-all cursor-pointer
                                    ${activeConfig?.id === config.id
                                        ? 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-200 ring-offset-1'
                                        : 'bg-indigo-100/80 text-indigo-800 border-indigo-200 hover:bg-indigo-200'
                                    }
                                `}
                                title={config.course_code}
                            >
                                {config.course_code}
                            </div>
                        ))}

                        {/* Existing Local Exams */}
                        {dayExams.map(exam => (
                            <div
                                key={exam.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, exam)}
                                className="text-xs p-1.5 rounded-md bg-yellow-100 text-yellow-800 border border-yellow-200 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all flex items-center justify-between group/item"
                            >
                                <span className="font-bold">{exam.code}</span>
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
            <div className="w-80 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">Received Suggestions</h3>
                    <p className="text-xs text-gray-500">From Batch Representatives - Year(s): {academicYears.sort().join(', ')}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <p className="text-sm text-gray-500 text-center">Loading...</p>
                    ) : filteredConfigs.length === 0 ? (
                        <div className="text-center py-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">No suggestions for Year(s): {academicYears.join(', ')}</p>
                        </div>
                    ) : (
                        filteredConfigs.map(config => (
                            <div
                                key={config.id}
                                onClick={() => setActiveConfig(activeConfig?.id === config.id ? null : config)}
                                className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md
                                    ${activeConfig?.id === config.id ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' : 'bg-white border-gray-100'}
                                `}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-800">{config.course_code}</h4>
                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{config.status}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-gray-500">{config.preferred_dates?.length || 0} date(s)</p>
                                    <p className="text-[10px] text-gray-400">{new Date(config.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="text-[10px] text-indigo-500 font-medium mt-1">Level {config.level || 1}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Calendar View */}
            <div className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 h-full flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Preferred Timetable</h2>
                            <div className="flex items-center space-x-2 mt-1">
                                {activeConfig && (
                                    <p className="text-sm text-indigo-600 font-bold animate-pulse">
                                        Viewing suggestions for {activeConfig.course_code}
                                    </p>
                                )}
                            </div>
                        </div>
                        {/* Search / Filter Placeholder - Innovative UI */}
                        <div className="flex items-center bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                            <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            <input type="text" placeholder="Search exams..." className="bg-transparent border-none text-sm outline-none placeholder-gray-400 w-48" />
                        </div>
                    </div>

                    <div className="flex justify-between items-center w-full">
                        {/* Academic Year Tabs (Multi-Select) */}
                        <div className="flex space-x-2">
                            {[1, 2, 3, 4].map(year => {
                                const isSelected = academicYears.includes(year);
                                return (
                                    <button
                                        key={year}
                                        onClick={() => {
                                            if (isSelected) {
                                                // Prevent deselecting if it's the only one left
                                                if (academicYears.length > 1) {
                                                    setAcademicYears(prev => prev.filter(y => y !== year));
                                                }
                                            } else {
                                                setAcademicYears(prev => [...prev, year]);
                                            }
                                        }}
                                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform scale-100 hover:scale-105
                                            ${isSelected
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-300 ring-offset-1'
                                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-indigo-200'}
                                        `}
                                    >
                                        Year {year}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Calendar Year Controls */}
                        <div className="flex items-center space-x-4 bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={handlePrevYear}
                                className="p-2 hover:bg-white rounded-lg shadow-sm transition-all text-gray-500 hover:text-indigo-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                            </button>
                            <span className="text-lg font-bold text-gray-700 min-w-[4rem] text-center">{calendarYear}</span>
                            <button
                                onClick={handleNextYear}
                                className="p-2 hover:bg-white rounded-lg shadow-sm transition-all text-gray-500 hover:text-indigo-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Calendar Controls */}
                <div className="flex justify-between items-center px-6 py-4 bg-gray-50/30 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-700">{months[currentMonth]} {calendarYear}</h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setCurrentMonth(prev => Math.max(0, prev - 1))}
                            disabled={currentMonth === 0}
                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        </button>
                        <button
                            onClick={() => setCurrentMonth(prev => Math.min(11, prev + 1))}
                            disabled={currentMonth === 11}
                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50/30 custom-scrollbar">
                    <div className="grid grid-cols-7 grid-rows-[auto_repeat(6,minmax(110px,1fr))] min-h-full gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} className="bg-gray-50 p-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">
                                {day}
                            </div>
                        ))}
                        {renderCalendar()}
                    </div>
                </div>

                {/* Footer Action Area */}
                <div className="bg-white border-t border-gray-100 p-4 md:px-6 flex justify-between items-center rounded-b-2xl">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1">Academic Year</label>
                            <input
                                type="text"
                                placeholder="e.g. 2026/2027"
                                value={facultyAcademicYear}
                                onChange={(e) => setFacultyAcademicYear(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-40"
                            />
                        </div>

                        {submitStatus && (
                            <span className={`px-3 py-1.5 mt-4 rounded-md text-sm font-medium ${submitStatus.includes('success')
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : submitStatus.includes('Error') || submitStatus.includes('Failed')
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : 'text-indigo-600 animate-pulse'
                                }`}>
                                {submitStatus}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleSubmitToFaculty}
                        disabled={isSubmitting || !facultyAcademicYear.trim()}
                        className={`mt-4 px-8 py-3 rounded-xl font-bold text-white shadow-md transition-all duration-300 flex items-center gap-2
                            ${(isSubmitting || !facultyAcademicYear.trim())
                                ? 'bg-indigo-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-lg hover:-translate-y-0.5'
                            }
                        `}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <span>Submit to Faculty</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreferredTimetable;
