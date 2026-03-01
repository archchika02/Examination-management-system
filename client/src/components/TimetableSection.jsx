import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
// Removed RAW_DATA as we now use actual database entries

const TimetableSection = () => {
    const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)); // Start at Nov 2025
    const [selectedDate, setSelectedDate] = useState(null);
    const [editableExams, setEditableExams] = useState([]);
    const [draggedExam, setDraggedExam] = useState(null);
    const [allowedDates, setAllowedDates] = useState(new Set());
    const [finalTimetables, setFinalTimetables] = useState([]);
    const [courseEnrollments, setCourseEnrollments] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);

    useEffect(() => {
        const fetchAllowedDates = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/configurations/global-dates');
                if (response.ok) {
                    const data = await response.json();
                    setAllowedDates(new Set(data.allowed_dates || []));
                } else {
                    // Fallback to localStorage if API fails
                    const storedDates = localStorage.getItem('allowed_exam_dates');
                    if (storedDates) setAllowedDates(new Set(JSON.parse(storedDates)));
                }
            } catch (e) {
                console.error('Failed to fetch global dates:', e);
                // Fallback to localStorage
                const storedDates = localStorage.getItem('allowed_exam_dates');
                if (storedDates) setAllowedDates(new Set(JSON.parse(storedDates)));
            }
        };

        const fetchFinalTimetables = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/configurations/final-timetables');
                if (response.ok) {
                    const data = await response.json();
                    setFinalTimetables(data);

                    // Map the retrieved data into our local editable layout state
                    const mappedExams = data.map(item => ({
                        id: item.timetable_id || Math.random().toString(),
                        code: item.course_code,
                        date: (() => {
                            const d = new Date(item.date);
                            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                        })(),
                        acYear: item.academic_year,
                        sem: item.semester || 1,
                        time: item.start_time || '', // Default empty
                        endTime: item.end_time || '', // Default empty
                        duration: item.duration || 3,
                        stdNonRepeat: item.stdNonRepeat || '',
                        stdRepeat: item.stdRepeat || ''
                    }));
                    setEditableExams(mappedExams);

                    // Automatically focus calendar on the month of the first available exam
                    if (data.length > 0) {
                        const firstDate = new Date(data[0].date);
                        setCurrentDate(new Date(firstDate.getFullYear(), firstDate.getMonth(), 1));
                    }
                }
            } catch (e) {
                console.error('Failed to fetch final timetables:', e);
            }
        };

        const fetchCourseEnrollments = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/configurations/course-enrollments');
                if (response.ok) {
                    const data = await response.json();
                    setCourseEnrollments(data);
                }
            } catch (e) {
                console.error('Failed to fetch course enrollments', e);
            }
        };

        fetchAllowedDates();
        fetchFinalTimetables();
        fetchCourseEnrollments();
    }, []);

    const handleDragStart = (e, exam) => {
        setDraggedExam(exam);
    };

    const handleDrop = (e, date) => {
        e.preventDefault();
        if (draggedExam && date) {
            const dateStr = formatDate(date);
            setEditableExams(prev => prev.map(ex =>
                ex.id === draggedExam.id ? { ...ex, date: dateStr } : ex
            ));
            setDraggedExam(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    // Helper to get days in month
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => {
        const day = new Date(year, month, 1).getDay();
        // JS getDay() returns 0 for Sunday. Shift it to make Monday = 0, Sunday = 6
        return day === 0 ? 6 : day - 1;
    };

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
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const getExamsForDate = (date) => {
        if (!date) return [];
        const dateStr = formatDate(date);
        return editableExams.filter(e => e.date === dateStr);
    };

    // Helper to extract Year from Course Code (e.g., "INTE 12213" -> Year 1)
    const getYearFromCode = (code) => {
        if (!code) return null;
        const match = code.match(/\d/);
        return match ? match[0] : null;
    };

    // Conflict Detection Logic
    // Conflict if same Date + overlapping Time + intersecting Students
    const checkConflict = (exam) => {
        if (!exam.time || !exam.endTime || !exam.date) return false;

        // Convert "HH:MM" to minutes for reliable comparison
        const timeToMins = (timeStr) => {
            if (!timeStr) return 0;
            const [h, m] = timeStr.split(':').map(Number);
            return h * 60 + m;
        };

        const examStartMins = timeToMins(exam.time);
        const examEndMins = timeToMins(exam.endTime);

        // Find other exams on the same date with overlapping times
        const overlappingExams = editableExams.filter(e => {
            if (e.id === exam.id || e.date !== exam.date || !e.time || !e.endTime) return false;
            const eStartMins = timeToMins(e.time);
            const eEndMins = timeToMins(e.endTime);
            // Overlap condition: (StartA < EndB) and (EndA > StartB)
            return (examStartMins < eEndMins) && (examEndMins > eStartMins);
        });

        if (overlappingExams.length === 0) return false;

        // Convert lookup keys to uppercase and remove spaces for robust matching
        const parseCode = (code) => code ? code.replace(/\s+/g, '').toUpperCase() : '';

        // Ensure our dictionary lookup works case-insensitively by capitalizing the enrolled dictionary
        const getStudents = (code) => {
            const parsed = parseCode(code);
            // Search all keys in courseEnrollments ignoring case
            for (const key in courseEnrollments) {
                if (key.toUpperCase() === parsed) {
                    return courseEnrollments[key] || [];
                }
            }
            return [];
        };

        const examStudents = getStudents(exam.code);

        // If no students are known for this exam, we assume no precise conflict
        if (examStudents.length === 0) return false;

        // Check for student intersections
        const conflicters = overlappingExams.filter(e => {
            const otherStudents = getStudents(e.code);
            // Only care about valid student IDs (not null)
            const intersection = examStudents.filter(studentId =>
                studentId && otherStudents.includes(studentId)
            );

            if (intersection.length > 0) {
                console.log(`Conflict Detected between ${exam.code} and ${e.code}! Overlapping students:`, intersection);
                return true;
            }
            return false;
        });

        return conflicters.length > 0;
    };

    const onTimeChange = (id, newTime) => {
        setEditableExams(prev => prev.map(e => e.id === id ? { ...e, time: newTime } : e));
    };

    const onEndTimeChange = (id, newEndTime) => {
        setEditableExams(prev => prev.map(e => e.id === id ? { ...e, endTime: newEndTime } : e));
    };

    const onStdChange = (id, field, value) => {
        setEditableExams(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const { user } = useAuth(); // NEW: Grab user from auth context

    const handleSaveTimetable = async () => {
        setIsSaving(true);
        setSaveStatus('Saving...');
        try {
            const response = await fetch('http://localhost:5000/api/configurations/save-exam-slots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slots: editableExams,
                    userId: user?.id || user?.user_id // Pass the currently logged in user ID
                })
            });
            if (response.ok) {
                setSaveStatus('Exam slots saved successfully!');
            } else {
                const data = await response.json();
                setSaveStatus(`Failed to save: ${data.message}`);
            }
        } catch (error) {
            console.error('Error saving timetable:', error);
            setSaveStatus('Error connecting to server.');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveStatus(null), 8000);
        }
    };

    const handleSubmitToDepartment = async () => {
        if (!window.confirm("Are you sure you want to submit the timetable to the department? This action will make it visible to the Academic Supervisor.")) {
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/configurations/submit-timetable', {
                method: 'POST'
            });
            if (response.ok) {
                alert('Timetable successfully submitted to the department!');
            } else {
                const data = await response.json();
                alert(`Failed to submit: ${data.message}`);
            }
        } catch (error) {
            console.error('Error submitting timetable:', error);
            alert('Error connecting to server.');
        }
    };

    const selectedExams = useMemo(() => {
        if (!selectedDate) return [];
        return getExamsForDate(selectedDate);
    }, [selectedDate, editableExams]);

    // Extract unique academic years from the final timetables to display at the top right
    const uniqueAcademicYears = useMemo(() => {
        const years = new Set();
        finalTimetables.forEach(t => {
            if (t.academic_year) years.add(t.academic_year);
        });
        return Array.from(years).sort();
    }, [finalTimetables]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Calendar Side */}
                <div className="md:w-2/3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h2 className="text-xl font-bold text-gray-800 w-48 text-center">
                                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h2>
                            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                        {/* Display Academic Year(s) at Top Right here */}
                        {uniqueAcademicYears.length > 0 && (
                            <div className="bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-lg">
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block leading-tight">Academic Year</span>
                                <span className="text-sm font-extrabold text-indigo-700 leading-tight block">
                                    {uniqueAcademicYears.join(', ')}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
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

                            const dateStr = formatDate(date);
                            // If allowedDates is empty, we act as if no dates are allowed based on requirement
                            const isAllowed = allowedDates.has(dateStr);

                            // Group day exams by academic year for rendering
                            const groupedByAcYear = dayExams.reduce((acc, exam) => {
                                const yr = exam.acYear || 'Unknown Year';
                                if (!acc[yr]) acc[yr] = [];
                                acc[yr].push(exam);
                                return acc;
                            }, {});

                            return (
                                <div
                                    key={idx}
                                    onClick={() => isAllowed && setSelectedDate(date)}
                                    onDrop={(e) => handleDrop(e, date)}
                                    onDragOver={handleDragOver}
                                    className={`
                                        h-28 p-2 rounded-lg border transition-all relative flex flex-col overflow-hidden
                                        ${isAllowed ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed bg-gray-50 opacity-50'}
                                        ${isSelected ? 'border-blue-500 bg-blue-50' : (isAllowed ? 'border-gray-100 bg-white hover:border-blue-200' : 'border-gray-200')}
                                        ${draggedExam ? 'border-dashed border-2 border-indigo-300' : ''}
                                    `}
                                >
                                    <div className={`flex justify-between items-start mb-1 shrink-0`}>
                                        <span className={`
                                            text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full
                                            ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}
                                            ${!isAllowed && !isToday ? 'text-gray-400' : ''}
                                        `}>
                                            {date.getDate()}
                                        </span>
                                        {hasConflict && (
                                            <span className="text-xs text-red-500 font-bold" title="Conflict Detected">⚠️</span>
                                        )}
                                    </div>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 mt-1">
                                        {Object.entries(groupedByAcYear).map(([acYear, examsInYear]) => (
                                            <div key={`yr-${acYear}`} className="text-[10px] px-1.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium space-y-1">
                                                {examsInYear.map((exam, i) => (
                                                    <div
                                                        key={i}
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, exam)}
                                                        className="truncate cursor-grab active:cursor-grabbing hover:bg-indigo-100 px-1 py-0.5 rounded transition-colors"
                                                        title={`${exam.code} at ${exam.time || 'TBD'}`}
                                                    >
                                                        <span className="opacity-70 mr-1">{exam.time || '--:--'}</span>
                                                        {exam.code}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}

                                        {Object.keys(groupedByAcYear).length === 0 && dayExams.slice(0, 2).map((exam, i) => (
                                            <div key={i} className="text-[10px] truncate bg-gray-100 px-1 rounded text-gray-600 font-medium border border-gray-200">
                                                {exam.time || '--:--'} {exam.code}
                                            </div>
                                        ))}
                                        {Object.keys(groupedByAcYear).length === 0 && dayExams.length > 2 && (
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
                                                        value={exam.time || ''}
                                                        onChange={(e) => onTimeChange(exam.id, e.target.value)}
                                                        className="w-full text-sm border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-1">End Time</label>
                                                    <input
                                                        type="time"
                                                        value={exam.endTime || ''}
                                                        onChange={(e) => onEndTimeChange(exam.id, e.target.value)}
                                                        className="w-full text-sm border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 mb-1">
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-1">Non-Repeat Students</label>
                                                    <input
                                                        type="number"
                                                        value={exam.stdNonRepeat}
                                                        disabled={true}
                                                        className="w-full text-sm border-gray-200 rounded-md bg-gray-50 cursor-not-allowed text-gray-500"
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-1">Repeat Students</label>
                                                    <input
                                                        type="number"
                                                        value={exam.stdRepeat}
                                                        disabled={true}
                                                        className="w-full text-sm border-gray-200 rounded-md bg-gray-50 cursor-not-allowed text-gray-500"
                                                        placeholder="0"
                                                    />
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

            <div className="flex justify-between pt-4 items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSaveTimetable}
                        disabled={isSaving}
                        className="bg-slate-900 text-white px-6 py-2 rounded-lg font-semibold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 flex items-center disabled:opacity-50"
                    >
                        <span className="mr-2">💾</span> {isSaving ? 'Saving...' : 'Save Timetable Details'}
                    </button>
                    {saveStatus && (
                        <span className={`text-sm font-semibold ${saveStatus.includes('Error') || saveStatus.includes('Failed') ? 'text-red-500' : 'text-green-500'} animate-fade-in`}>
                            {saveStatus}
                        </span>
                    )}
                </div>

                <button
                    onClick={handleSubmitToDepartment}
                    className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/30 transition-all active:scale-95 flex items-center group"
                >
                    <span>Submit to Department</span>
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default TimetableSection;
