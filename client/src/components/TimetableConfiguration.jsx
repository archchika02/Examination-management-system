import { useState, useEffect } from 'react';

const TimetableConfiguration = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedExamDates, setSelectedExamDates] = useState(new Set());
    const [showHolidays, setShowHolidays] = useState(false);

    // Mock Poya days for 2026 (Example dates)
    const poyaDays2026 = [
        '2026-01-03', '2026-02-01', '2026-03-03', '2026-04-02',
        '2026-05-01', '2026-05-31', '2026-06-29', '2026-07-28',
        '2026-08-27', '2026-09-25', '2026-10-24', '2026-11-23', '2026-12-23'
    ];

    // Mock National Holidays for 2026
    const holidays2026 = [
        '2026-01-14', '2026-02-04', '2026-04-13', '2026-04-14',
        '2026-05-01', '2026-12-25'
    ];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Adjust logic: 0 is Sunday in JS. We want 0 to be Monday.
    // Sunday (0) -> 6
    // Monday (1) -> 0
    // ...
    // Saturday (6) -> 5
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
        return date.toISOString().split('T')[0];
    };

    const isSunday = (date) => date && date.getDay() === 0;
    const isPoya = (date) => {
        if (!date) return false;
        const key = formatDateKey(date);
        return poyaDays2026.includes(key);
    };

    const isHoliday = (date) => {
        if (!date) return false;
        const key = formatDateKey(date);
        return holidays2026.includes(key);
    };

    const isUnavailable = (date) => isSunday(date) || isPoya(date) || (showHolidays && isHoliday(date));

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

    const countUnavailable = () => {
        let sundays = 0;
        let poyas = 0;

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            if (isSunday(date)) sundays++;
            if (isPoya(date)) poyas++;
        }
        return { sundays, poyas };
    };

    const stats = countUnavailable();
    const totalUnavailable = stats.sundays + stats.poyas; // Simplified overlap logic for now
    const totalAvailable = daysInMonth - totalUnavailable; // Assuming poya doesn't fall on sunday for simplicity logic here, mostly distinct
    // Refined Available calc:
    // Actually need to iterate to account for overlaps if Poya is on Sunday
    const calculateExactStats = () => {
        let sun = 0;
        let poy = 0;
        let hol = 0;
        let avail = 0;
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const sunBool = isSunday(date);
            const poyaBool = isPoya(date);
            const holBool = showHolidays && isHoliday(date);

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

    const handleYearChange = (e) => {
        setCurrentDate(new Date(parseInt(e.target.value), month, 1));
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

    const clearAll = () => {
        setSelectedExamDates(new Set());
    };

    const [deadlineDate, setDeadlineDate] = useState('');

    const formatDateToUK = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const sendToRepresentative = () => {
        if (!deadlineDate) {
            alert("Please set a deadline date before sending.");
            return;
        }
        const formattedDeadline = formatDateToUK(deadlineDate);

        // Mock Backend: Save to localStorage so Batch Rep can see it
        localStorage.setItem('exam_deadline', formattedDeadline);

        // In a real app, you would send this to the backend
        console.log("Sending configuration to BatchRep with deadline:", formattedDeadline);
        alert(`Configuration sent to representative! Deadline set to: ${formattedDeadline}`);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 animate-fade-in-up">
            {/* Main Calendar Section */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Timetable Configuration</h2>
                    <div className="flex gap-3">
                        <select
                            value={month}
                            onChange={handleMonthChange}
                            className="px-4 py-2 border rounded-lg bg-gray-50 text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            {months.map((m, idx) => (
                                <option key={m} value={idx}>{m}</option>
                            ))}
                        </select>
                        <select
                            value={year}
                            onChange={handleYearChange}
                            className="px-4 py-2 border rounded-lg bg-gray-50 text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            {[2025, 2026, 2027].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex gap-4 mb-4 text-sm flex-wrap">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
                        <span className="text-gray-600">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-indigo-500 rounded"></div>
                        <span className="text-gray-600">Selected Exam</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-100 text-red-600 flex items-center justify-center rounded text-xs">S</div>
                        <span className="text-gray-600">Sunday</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-100 text-yellow-600 flex items-center justify-center rounded text-xs">P</div>
                        <span className="text-gray-600">Poya Day</span>
                    </div>
                    {showHolidays && (
                        <div className="flex items-center gap-2 animate-fade-in">
                            <div className="w-4 h-4 bg-pink-100 text-pink-600 flex items-center justify-center rounded text-xs">H</div>
                            <span className="text-gray-600">Holiday</span>
                        </div>
                    )}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="text-center font-semibold text-gray-500 py-2">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((date, index) => {
                        if (!date) return <div key={`empty-${index}`} className="p-2"></div>;

                        const key = formatDateKey(date);
                        const isSel = selectedExamDates.has(key);
                        const isSun = isSunday(date);
                        const isPoy = isPoya(date);
                        const isHol = showHolidays && isHoliday(date);
                        const unavail = isSun || isPoy || isHol;

                        let bgClass = "bg-white hover:bg-gray-50 border-gray-200 text-gray-700 cursor-pointer";
                        let content = date.getDate();

                        if (isSel) {
                            bgClass = "bg-indigo-500 text-white border-indigo-600 hover:bg-indigo-600 shadow-md transform scale-105 transition-all";
                        } else if (isSun) {
                            bgClass = "bg-red-50 text-red-300 border-red-100 cursor-not-allowed";
                        } else if (isPoy) {
                            bgClass = "bg-yellow-50 text-yellow-600 border-yellow-100 cursor-not-allowed";
                        } else if (isHol) {
                            bgClass = "bg-pink-50 text-pink-600 border-pink-100 cursor-not-allowed";
                        }

                        // Combine indicator if needs specific marker
                        return (
                            <div
                                key={key}
                                onClick={() => toggleDateSelection(date)}
                                className={`
                                    relative p-2 rounded-xl border flex flex-col items-center justify-center h-24 transition-all duration-200
                                    ${bgClass}
                                `}
                            >
                                <span className={`text-lg font-bold ${isSel ? 'text-white' : ''} ${isSun ? 'text-red-400' : ''}`}>
                                    {content}
                                </span>
                                {isSun && <span className="text-[10px] font-medium mt-1">Sunday</span>}
                                {isPoy && <span className="text-[10px] font-medium mt-1">Poya</span>}
                                {isHol && <span className="text-[10px] font-medium mt-1">Holiday</span>}
                                {isSel && <span className="text-[10px] font-medium mt-1">Exam</span>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar Summary */}
            <div className="w-full lg:w-80 flex flex-col gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Summary</h3>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                            <span className="text-red-700 font-medium">Total Sundays</span>
                            <span className="text-xl font-bold text-red-700">{exactStats.sun}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                            <span className="text-yellow-700 font-medium">Total Poya Days</span>
                            <span className="text-xl font-bold text-yellow-700">{exactStats.poy}</span>
                        </div>
                        {showHolidays && (
                            <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg animate-fade-in">
                                <span className="text-pink-700 font-medium">National Holidays</span>
                                <span className="text-xl font-bold text-pink-700">{exactStats.hol}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span className="text-green-700 font-medium">Available Days</span>
                            <span className="text-xl font-bold text-green-700">{exactStats.avail}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                            <span className="text-indigo-700 font-medium">Selected for Exams</span>
                            <span className="text-2xl font-extrabold text-indigo-700">{selectedExamDates.size}</span>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t">
                        <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showHolidays}
                                onChange={(e) => setShowHolidays(e.target.checked)}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Show National Holidays</span>
                        </label>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-3">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Actions</h3>

                    <div className="mb-2 relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Set Deadline</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formatDateToUK(deadlineDate)}
                                placeholder="dd/mm/yyyy"
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-gray-50 text-gray-700"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </div>
                            <input
                                type="date"
                                value={deadlineDate}
                                onChange={(e) => setDeadlineDate(e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    <button
                        onClick={markAllAvailable}
                        className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <span>✓</span> Mark All Available
                    </button>

                    <button
                        onClick={clearAll}
                        className="w-full py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <span>✕</span> Clear All
                    </button>

                    <div className="h-px bg-gray-200 my-2"></div>

                    <button
                        onClick={sendToRepresentative}
                        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                        <span>📤</span> Send to Representative
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimetableConfiguration;
