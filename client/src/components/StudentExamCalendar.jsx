import { useState, useEffect } from 'react';

const StudentExamCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedExam, setSelectedExam] = useState(null); // For modal
    const [courseCode, setCourseCode] = useState('');
    const [selectedDates, setSelectedDates] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState(1); // Default Level 1
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // New Feature: List of drafted configurations (Drafts are local until submitted)
    const [draftList, setDraftList] = useState([]);
    // Submitted list (history)
    const [submittedList, setSubmittedList] = useState([]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Monday start correction: (day + 6) % 7 ensures Mon=0, Sun=6
    const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7;

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Mock Exams Data (keep existing for display)
    const exams = [
        {
            date: '2026-02-15',
            courseCode: 'CSC101',
            title: 'Intro to Programming',
            time: '09:00 AM - 12:00 PM',
            venue: 'Main Hall A'
        },
    ];

    // Mock Poya days for 2026
    const poyaDays2026 = [
        '2026-01-03', '2026-02-01', '2026-03-03', '2026-04-02',
        '2026-05-01', '2026-05-31', '2026-06-29', '2026-07-28',
        '2026-08-27', '2026-09-25', '2026-10-24', '2026-11-23', '2026-12-23'
    ];

    // Fetch existing configurations on mount (Persistence)
    useEffect(() => {
        fetchSubmittedConfigs();
    }, []);

    const fetchSubmittedConfigs = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/configurations/list');
            if (response.ok) {
                const data = await response.json();
                // Ideally this endpoints filters by user_id on backend, or we filter here if needed.
                // Assuming backend returns all for now, we might filter by batch_rep_id=1 effectively.
                const myConfigs = data.filter(c => c.batch_rep_id === 1);
                setSubmittedList(myConfigs);
            }
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    };

    const [examDeadline, setExamDeadline] = useState(null);

    useEffect(() => {
        const deadline = localStorage.getItem('exam_deadline');
        if (deadline) {
            setExamDeadline(deadline);
        }
    }, []);

    const generateCalendarDays = () => {
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const calendarDays = generateCalendarDays();

    const formatDateKey = (date) => {
        if (!date) return null;
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        return adjustedDate.toISOString().split('T')[0];
    };

    const isSunday = (date) => date && date.getDay() === 0;
    const isPoya = (date) => {
        if (!date) return false;
        const key = formatDateKey(date);
        return poyaDays2026.includes(key);
    };

    const handleMonthChange = (e) => {
        setCurrentDate(new Date(year, parseInt(e.target.value), 1));
    };

    const handleYearChange = (e) => {
        setCurrentDate(new Date(parseInt(e.target.value), month, 1));
    };

    const handleDateClick = (calendarDate) => {
        if (!calendarDate) return;
        const dateKey = formatDateKey(calendarDate);

        // Strict: ONLY ONE DATE ALLOWED
        if (selectedDates.includes(dateKey)) {
            setSelectedDates([]);
        } else {
            setSelectedDates([dateKey]);
        }
    };

    const handleAddToDraft = () => {
        if (!courseCode.trim()) {
            setMessage({ text: 'Please enter a Course Code', type: 'error' });
            return;
        }
        if (selectedDates.length === 0) {
            setMessage({ text: 'Please select one date', type: 'error' });
            return;
        }

        // Add to local draft
        const newItem = {
            batch_rep_id: 1,
            course_code: courseCode,
            preferred_dates: selectedDates,
            level: selectedLevel, // Use manually selected level
            status: 'DRAFT',
            tempId: Date.now() // temporary ID for UI
        };

        setDraftList([...draftList, newItem]);
        setCourseCode('');
        setSelectedDates([]);
        setMessage({ text: '', type: '' });
    };

    const handleSubmitAll = async () => {
        if (draftList.length === 0) {
            setMessage({ text: 'Draft list is empty', type: 'error' });
            return;
        }

        setIsSubmitting(true);
        setMessage({ text: '', type: '' });

        try {
            // Bulk Submit
            const payload = draftList.map(({ tempId, ...rest }) => ({
                ...rest,
                status: 'SENT'
            }));

            const response = await fetch('http://localhost:5000/api/configurations/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setMessage({ text: 'Timetable configuration sent successfully!', type: 'success' });
                setDraftList([]); // Clear drafts
                fetchSubmittedConfigs(); // Refresh history
            } else {
                setMessage({ text: 'Failed to submit timetable', type: 'error' });
            }
        } catch (error) {
            console.error(error);
            setMessage({ text: 'Network error occurred', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        setSelectedExam(null);
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in-up h-full">
            <div className="flex gap-6 h-full">
                {/* Left Panel: Calendar & Input */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                    {/* Header Section */}
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Timetable Configuration</h2>
                                <p className="text-gray-500 text-sm mt-1">Select dates and add modules to your list</p>
                                {examDeadline && (
                                    <div className="mt-2 inline-block bg-red-50 border border-red-200 rounded-lg px-3 py-1 animate-pulse">
                                        <p className="text-sm font-bold text-red-700 flex items-center gap-2">
                                            <span>⏰</span> Deadline: {examDeadline}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <select
                                    value={month}
                                    onChange={handleMonthChange}
                                    className="px-4 py-2 border rounded-lg bg-gray-50 text-gray-700 outline-none"
                                >
                                    {months.map((m, idx) => (
                                        <option key={m} value={idx}>{m}</option>
                                    ))}
                                </select>
                                <select
                                    value={year}
                                    onChange={handleYearChange}
                                    className="px-4 py-2 border rounded-lg bg-gray-50 text-gray-700 outline-none"
                                >
                                    {[2025, 2026, 2027].map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Configuration Inputs */}
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex flex-col gap-4">
                            <div className="flex gap-4 items-end flex-wrap">
                                {/* Level Selector - RESTORED */}
                                <div className="w-full md:w-auto">
                                    <label className="block text-xs font-semibold text-indigo-800 uppercase mb-1">Level</label>
                                    <select
                                        value={selectedLevel}
                                        onChange={(e) => setSelectedLevel(Number(e.target.value))}
                                        className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white min-w-[100px]"
                                    >
                                        {[1, 2, 3, 4].map(l => (
                                            <option key={l} value={l}>Lvl {l}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex-1 min-w-[150px]">
                                    <label className="block text-xs font-semibold text-indigo-800 uppercase mb-1">Course Code</label>
                                    <input
                                        type="text"
                                        value={courseCode}
                                        onChange={(e) => setCourseCode(e.target.value)}
                                        placeholder="e.g. CSC303"
                                        className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div className="flex-1 min-w-[150px]">
                                    <label className="block text-xs font-semibold text-indigo-800 uppercase mb-1">Selected Date</label>
                                    <div className="px-4 py-2 text-indigo-700 text-sm font-medium bg-white/50 border border-indigo-100 rounded-lg">
                                        {selectedDates.length > 0 ? selectedDates[0] : 'None'}
                                    </div>
                                </div>
                                <div>
                                    <button
                                        onClick={handleAddToDraft}
                                        disabled={isSubmitting}
                                        className="px-6 py-2 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                        {message.text && (
                            <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}
                    </div>

                    {/* Legend */}
                    <div className="flex gap-4 mb-4 text-sm flex-wrap p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-indigo-600 rounded"></div>
                            <span className="text-gray-600">Selected (Max 1)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-50 border border-red-100 rounded"></div>
                            <span className="text-gray-600">Sunday</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-50 border border-yellow-100 rounded"></div>
                            <span className="text-gray-600">Poya Day</span>
                        </div>
                    </div>

                    {/* Calendar Grid - Starts Monday */}
                    <div className="flex-1 overflow-auto">
                        <div className="grid grid-cols-7 gap-2 mb-2 sticky top-0 bg-white z-10">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                <div key={day} className="text-center font-bold text-gray-500 py-3 uppercase text-xs tracking-wider">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {calendarDays.map((date, index) => {
                                if (!date) return <div key={`empty-${index}`} className="p-2 min-h-[100px] bg-gray-50/30 rounded-xl"></div>;

                                const dateKey = formatDateKey(date);
                                const isSun = isSunday(date);
                                const isPoy = isPoya(date);
                                const isSelected = selectedDates.includes(dateKey);

                                let bgClass = "bg-white hover:border-indigo-300 border-gray-200";
                                let cursorClass = "cursor-pointer";

                                if (isSun) {
                                    bgClass = "bg-red-50/50 text-red-300 border-red-100 opacity-60 cursor-not-allowed";
                                } else if (isPoy) {
                                    bgClass = "bg-yellow-50/50 text-yellow-600 border-yellow-100 opacity-60 cursor-not-allowed";
                                } else if (isSelected) {
                                    bgClass = "bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-[1.02]";
                                }

                                const canClick = !isSun && !isPoy;

                                return (
                                    <div
                                        key={index}
                                        onClick={() => canClick && handleDateClick(date)}
                                        className={`
                                            relative p-3 rounded-xl border flex flex-col min-h-[100px]
                                            ${bgClass} ${canClick ? cursorClass : ''} transition-all duration-200
                                        `}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-700'} ${isSun && !isSelected ? 'text-red-400' : ''}`}>
                                                {date.getDate()}
                                            </span>
                                            {isSun && <span className="text-[10px] font-bold text-red-400 uppercase">Sun</span>}
                                            {isPoy && <span className="text-[10px] font-bold text-yellow-600 uppercase">Poya</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Drafts & Submitted List */}
                <div className="w-80 flex flex-col gap-4 h-full">

                    {/* Draft List Panel */}
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden max-h-[50%]">
                        <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-indigo-900">Draft List</h3>
                                <p className="text-xs text-indigo-600">Pending submission</p>
                            </div>
                            <span className="bg-white text-indigo-600 text-xs px-2 py-1 rounded-full font-bold">{draftList.length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {draftList.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center italic mt-4">Add modules to build your timetable draft.</p>
                            ) : (
                                draftList.map((item) => (
                                    <div key={item.tempId} className="p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                        <div className="flex justify-between font-bold text-sm text-gray-800">
                                            <span>{item.course_code}</span>
                                            <span className="text-indigo-600">Lvl {item.level}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {item.preferred_dates[0]}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-100">
                            <button
                                onClick={handleSubmitAll}
                                disabled={draftList.length === 0 || isSubmitting}
                                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Sending...' : 'Submit Timetable'}
                            </button>
                        </div>
                    </div>

                    {/* Submitted History Panel */}
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="font-bold text-gray-800">Sent History</h3>
                            <p className="text-xs text-gray-500">Previously submitted</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {submittedList.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center italic mt-4">No history yet.</p>
                            ) : (
                                submittedList.map((config, idx) => (
                                    <div key={idx} className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 opacity-75">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-gray-700">{config.course_code}</h4>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">SENT</span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            <span className="font-medium">Level {config.level || 1}</span> • {config.preferred_dates && (Array.isArray(config.preferred_dates) ? config.preferred_dates[0] : config.preferred_dates)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {selectedExam && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in p-4">
                        <button onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentExamCalendar;
