import { useState, useMemo } from 'react';

// Raw data from the user request
const RAW_DATA = [
    { date: '2025-11-17', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'MGTE 12222', stdNonRepeat: null, stdRepeat: 4 },
    { date: '2025-11-17', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'MGTE 12263', stdNonRepeat: 117, stdRepeat: 3 },
    { date: '2025-11-17', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'MGTE 42252', stdNonRepeat: 41, stdRepeat: null },
    { date: '2025-11-17', time: '13:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'INTE 22263', stdNonRepeat: 64, stdRepeat: 4 },
    { date: '2025-11-17', time: '13:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'INTE 42222', stdNonRepeat: 7, stdRepeat: null },
    { date: '2025-11-18', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'GNCT 22212', stdNonRepeat: null, stdRepeat: 9 },
    { date: '2025-11-18', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'MGTE 22212', stdNonRepeat: null, stdRepeat: 2 },
    { date: '2025-11-18', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'MGTE 22273', stdNonRepeat: 53, stdRepeat: null },
    { date: '2025-11-19', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'MGTE 22242', stdNonRepeat: null, stdRepeat: 5 },
    { date: '2025-11-19', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'MGTE 44373', stdNonRepeat: 15, stdRepeat: null },
    { date: '2025-11-20', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'INTE 12213', stdNonRepeat: 117, stdRepeat: 4 },
    { date: '2025-11-20', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'INTE 22242', stdNonRepeat: null, stdRepeat: 3 },
    { date: '2025-11-21', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'INTE 22222', stdNonRepeat: null, stdRepeat: 1 },
    { date: '2025-11-21', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'INTE 22253', stdNonRepeat: 64, stdRepeat: 5 },
    { date: '2025-11-21', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'INTE 22273', stdNonRepeat: null, stdRepeat: 6 },
    { date: '2025-11-22', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'MGTE 44273', stdNonRepeat: 85, stdRepeat: null },
    { date: '2025-11-24', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'MGTE 12273', stdNonRepeat: 117, stdRepeat: 1 },
    { date: '2025-11-24', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'MGTE 22222', stdNonRepeat: null, stdRepeat: 1 },
    { date: '2025-11-25', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'INTE 22343', stdNonRepeat: 117, stdRepeat: null },
    { date: '2025-11-25', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'INTE 42252', stdNonRepeat: 30, stdRepeat: null },
    { date: '2025-11-27', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'INTE 12223', stdNonRepeat: 117, stdRepeat: 10 },
    { date: '2025-11-27', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'INTE 22232', stdNonRepeat: null, stdRepeat: 1 },
    { date: '2025-11-28', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'INTE 22212', stdNonRepeat: null, stdRepeat: 8 },
    { date: '2025-11-28', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'INTE 22313', stdNonRepeat: null, stdRepeat: 3 },
    { date: '2025-11-28', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'INTE 22213', stdNonRepeat: 64, stdRepeat: null },
    { date: '2025-11-28', time: '13:00', duration: 2, acYear: '2023/2024', sem: 2, code: 'ACLT 12022', stdNonRepeat: 77, stdRepeat: 8 },
    { date: '2025-11-29', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'MGTE 22252', stdNonRepeat: null, stdRepeat: 4 },
    { date: '2025-11-29', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'MGTE 44242', stdNonRepeat: 30, stdRepeat: null },
    { date: '2025-12-01', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'INTE 12243', stdNonRepeat: 117, stdRepeat: 4 },
    { date: '2025-12-01', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'INTE 12232', stdNonRepeat: null, stdRepeat: 4 },
    { date: '2025-12-01', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'INTE 34223', stdNonRepeat: null, stdRepeat: 1 },
    { date: '2025-12-01', time: '13:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'INTE 22303', stdNonRepeat: 117, stdRepeat: 4 },
    { date: '2025-12-03', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'MGTE 12253', stdNonRepeat: 117, stdRepeat: 1 },
    { date: '2025-12-03', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'MGTE 24213', stdNonRepeat: null, stdRepeat: 1 },
    { date: '2025-12-03', time: '13:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'INTE 22293', stdNonRepeat: 64, stdRepeat: 4 },
    { date: '2025-12-03', time: '13:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'INTE 44363', stdNonRepeat: 32, stdRepeat: null },
    { date: '2025-12-03', time: '13:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'MGTE 42213', stdNonRepeat: 10, stdRepeat: null },
    { date: '2025-12-06', time: '09:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'PMAT 12212', stdNonRepeat: 117, stdRepeat: 18 },
    { date: '2025-12-06', time: '13:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'INTE 22283', stdNonRepeat: 117, stdRepeat: 1 },
    { date: '2025-12-06', time: '13:00', duration: 3, acYear: '2023/2024', sem: 2, code: 'MGTE 42292', stdNonRepeat: 54, stdRepeat: null },
];

const TimetableSection = () => {
    const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)); // Start at Nov 2025
    const [selectedDate, setSelectedDate] = useState(null);
    const [exams, setExams] = useState(RAW_DATA.map((exam, i) => ({ ...exam, id: i })));

    // Helper to get days in month
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

    // Generate calendar grid
    const calendarDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
        }
        return days;
    }, [currentDate, firstDay, daysInMonth]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const formatDate = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('en-CA'); // YYYY-MM-DD
    };

    const getExamsForDate = (date) => {
        if (!date) return [];
        const dateStr = formatDate(date);
        return exams.filter(e => e.date === dateStr);
    };

    // Helper to extract Year from Course Code (e.g., "INTE 12213" -> Year 1)
    const getYearFromCode = (code) => {
        const match = code.match(/\d/);
        return match ? match[0] : null;
    };

    // Conflict Detection Logic
    // Conflict if same Date + same Time + same Student Year (from Course Code)
    const checkConflict = (exam) => {
        const examYear = getYearFromCode(exam.code);
        if (!examYear) return false;

        // Find other exams at the same time on the same date
        const sameTimeExams = exams.filter(e =>
            e.date === exam.date &&
            e.time === exam.time &&
            e.id !== exam.id
        );

        // If any of those share the same Student Year, it's a conflict
        const conflicters = sameTimeExams.filter(e => {
            const otherYear = getYearFromCode(e.code);
            return otherYear === examYear;
        });

        return conflicters.length > 0;
    };

    const onTimeChange = (id, newTime) => {
        setExams(prev => prev.map(e => e.id === id ? { ...e, time: newTime } : e));
    };

    const selectedExams = useMemo(() => {
        if (!selectedDate) return [];
        return getExamsForDate(selectedDate);
    }, [selectedDate, exams]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Calendar Side */}
                <div className="md:w-2/3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                            ←
                        </button>
                        <h2 className="text-xl font-bold text-gray-800">
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                            →
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-sm font-semibold text-gray-400 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((date, idx) => {
                            if (!date) return <div key={`empty-${idx}`} className="h-24 bg-gray-50/50 rounded-lg" />;

                            const dayExams = getExamsForDate(date);
                            const hasConflict = dayExams.some(e => checkConflict(e));
                            const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
                            const isToday = new Date().toDateString() === date.toDateString();

                            return (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedDate(date)}
                                    className={`
                                        h-24 p-2 rounded-lg border cursor-pointer transition-all hover:shadow-md relative
                                        ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:border-blue-200'}
                                    `}
                                >
                                    <div className={`flex justify-between items-start mb-1`}>
                                        <span className={`
                                            text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full
                                            ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}
                                        `}>
                                            {date.getDate()}
                                        </span>
                                        {hasConflict && (
                                            <span className="text-xs text-red-500 font-bold" title="Conflict Detected">⚠️</span>
                                        )}
                                    </div>
                                    <div className="space-y-1 overflow-hidden h-12">
                                        {dayExams.slice(0, 2).map((exam, i) => (
                                            <div key={i} className="text-[10px] truncate bg-gray-100 px-1 rounded text-gray-600 font-medium border border-gray-200">
                                                {exam.time} {exam.code}
                                            </div>
                                        ))}
                                        {dayExams.length > 2 && (
                                            <div className="text-[10px] text-gray-400 pl-1">
                                                +{dayExams.length - 2} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Details Side */}
                <div className="md:w-1/3 space-y-4">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                            {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date'}
                        </h3>

                        {!selectedDate ? (
                            <div className="text-center text-gray-400 py-10">
                                Click on a date to manage exams
                            </div>
                        ) : selectedExams.length === 0 ? (
                            <div className="text-center text-gray-400 py-10">
                                No exams scheduled for this date
                            </div>
                        ) : (
                            <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
                                {selectedExams.map(exam => {
                                    const isConflict = checkConflict(exam);
                                    return (
                                        <div
                                            key={exam.id}
                                            className={`p-4 rounded-lg border-l-4 shadow-sm transition-all
                                                ${isConflict ? 'border-l-red-500 bg-red-50' : 'border-l-blue-500 bg-white border border-gray-100'}
                                            `}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-gray-800">{exam.code}</h4>
                                                <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-gray-200 text-gray-600">
                                                    {exam.acYear} S{exam.sem}
                                                </span>
                                            </div>

                                            {isConflict && (
                                                <div className="text-xs text-red-600 font-bold mb-2 flex items-center">
                                                    <span className="mr-1">⚠</span> Time Conflict Detected
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-1">Start Time</label>
                                                    <input
                                                        type="time"
                                                        value={exam.time}
                                                        onChange={(e) => onTimeChange(exam.id, e.target.value)}
                                                        className="w-full text-sm border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-1">Students</label>
                                                    <div className="text-sm font-medium text-gray-700">
                                                        {exam.stdNonRepeat || 0} (N) / {exam.stdRepeat || 0} (R)
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button className="bg-slate-900 text-white px-6 py-2 rounded-lg font-semibold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 flex items-center">
                    <span className="mr-2">💾</span> Save Timetable
                </button>
            </div>
        </div>
    );
};

export default TimetableSection;
