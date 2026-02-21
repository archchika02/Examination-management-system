import React, { useState, useEffect } from 'react';

const PreferredTimetable = () => {
    const [academicYear, setAcademicYear] = useState(1);
    const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [draggedExam, setDraggedExam] = useState(null);
    const [receivedConfigs, setReceivedConfigs] = useState([]);
    const [activeConfig, setActiveConfig] = useState(null); // The one currently being viewed
    const [loading, setLoading] = useState(true);

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
                const yearExams = prev[academicYear].filter(ex => ex.id !== draggedExam.id);
                return {
                    ...prev,
                    [academicYear]: [...yearExams, { ...draggedExam, date: dateString }]
                };
            });
            setDraggedExam(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
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
            const dayExams = exams[academicYear]?.filter(exam => exam.date === dateString) || [];

            // Highlight if activeConfig recommends this date
            const isPreferred = activeConfig && activeConfig.preferred_dates && activeConfig.preferred_dates.includes(dateString);

            days.push(
                <div
                    key={day}
                    className={`p-2 border border-gray-100 transition-all duration-300 relative group flex flex-col overflow-hidden min-h-[80px]
                        ${isPreferred ? 'bg-indigo-50 border-indigo-200 shadow-inner' : 'bg-white hover:bg-gray-50'}
                    `}
                    onDrop={(e) => handleDrop(e, day)}
                    onDragOver={handleDragOver}
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-sm font-semibold shrink-0 ${isPreferred ? 'text-indigo-600' : 'text-gray-400'}`}>{day}</span>
                        {isPreferred && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1 rounded">Preferred</span>}
                    </div>

                    <div className="mt-1 space-y-1 overflow-y-auto min-h-0 flex-1 custom-scrollbar">
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

    // Filter configurations based on selected Academic Year (Level)
    const filteredConfigs = receivedConfigs.filter(config => (config.level || 1) === academicYear);

    return (
        <div className="flex gap-6 h-full">
            {/* Sidebar for Received Configurations */}
            <div className="w-80 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">Received Suggestions</h3>
                    <p className="text-xs text-gray-500">From Batch Representatives - Year {academicYear}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <p className="text-sm text-gray-500 text-center">Loading...</p>
                    ) : filteredConfigs.length === 0 ? (
                        <div className="text-center py-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">No suggestions for Year {academicYear}</p>
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
                        {/* Academic Year Tabs (Restored) */}
                        <div className="flex space-x-2">
                            {[1, 2, 3, 4].map(year => (
                                <button
                                    key={year}
                                    onClick={() => {
                                        setAcademicYear(year);
                                        setActiveConfig(null); // Clear selection on year change
                                    }}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform scale-100 hover:scale-105
                                        ${academicYear === year
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-indigo-200'}
                                    `}
                                >
                                    Year {year}
                                </button>
                            ))}
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
                <div className="flex-1 overflow-hidden p-6 flex flex-col min-h-0">
                    <div className="grid grid-cols-7 grid-rows-[auto_repeat(6,minmax(0,1fr))] h-full gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} className="bg-gray-50 p-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">
                                {day}
                            </div>
                        ))}
                        {renderCalendar()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreferredTimetable;
