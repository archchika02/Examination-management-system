import React, { useState } from 'react';

const AllocationsDashboard = () => {
    // Mock Staff Database
    const staffList = [
        { id: 's1', name: 'Dr. Alan Smith', dept: 'CS' },
        { id: 's2', name: 'Prof. Sarah Jones', dept: 'MATH' },
        { id: 's3', name: 'Mr. James Doe', dept: 'CS' },
        { id: 's4', name: 'Ms. Emily White', dept: 'ENG' },
        { id: 's5', name: 'Dr. Robert Brown', dept: 'MATH' },
    ];

    const venuesList = [
        { name: 'Main Hall', capacity: 120 },
        { name: 'Room 201', capacity: 50 },
        { name: 'Lab 1', capacity: 30 },
    ];

    // Initial Data with nested allocations
    // Added root-level totals that are fixed
    const [exams, setExams] = useState([
        {
            id: 1,
            date: '2025-01-15',
            time: '09:00 AM',
            course: 'INTE 21323 - Web application ',
            totalNonRepeat: 100,
            totalRepeat: 10,
            allocations: [
                { id: 'a1', venue: 'Main Hall', assignedNonRepeat: 100, assignedRepeat: 10, supervisor: 's1', invigilator: 's3', attendants: 'Staff A, Staff B' }
            ]
        },
        {
            id: 2,
            date: '2025-01-16',
            time: '01:00 PM',
            course: 'INTE 21333 - Event Driven Programming',
            totalNonRepeat: 45,
            totalRepeat: 5,
            allocations: [
                { id: 'a2', venue: 'Room 201', assignedNonRepeat: 45, assignedRepeat: 5, supervisor: 's2', invigilator: '', attendants: 'Staff C' }
            ]
        }
    ]);

    // Helper: Check for conflicts
    // Helper: Check for conflicts
    const checkConflict = (staffId, examDate, examTime, currentAllocationId, role, currentAlloc) => {
        if (!staffId) return false;

        // 1. Overlap Conflict: Staff is busy elsewhere at the same time
        for (const exam of exams) {
            if (exam.date === examDate && exam.time === examTime) {
                for (const alloc of exam.allocations) {
                    if (alloc.id !== currentAllocationId) {
                        if (alloc.supervisor === staffId || alloc.invigilator === staffId) return 'Overlap';
                    }
                }
            }
        }

        // 2. Intra-Allocation Conflicts (Same Venue/Row)
        if (currentAlloc) {
            const supervisorId = role === 'supervisor' ? staffId : currentAlloc.supervisor;
            const invigilatorId = role === 'invigilator' ? staffId : currentAlloc.invigilator;

            if (supervisorId && invigilatorId) {
                // Self-Conflict: Same person
                if (supervisorId === invigilatorId) return 'Self';
            }
        }

        return false;
    };

    const handleSaveDraft = () => {
        console.log("Saving draft:", exams);
        const btn = document.getElementById('save-draft-btn');
        if (btn) {
            const originalText = btn.innerText;
            btn.innerText = "Saving...";
            setTimeout(() => {
                btn.innerText = "Saved! ✓";
                setTimeout(() => btn.innerText = originalText, 2000);
            }, 800);
        }
        localStorage.setItem('allocationDraft', JSON.stringify(exams));
    };

    const handleAddVenue = (examId) => {
        setExams(prev => prev.map(exam => {
            if (exam.id === examId) {
                return {
                    ...exam,
                    allocations: [
                        ...exam.allocations,
                        {
                            id: `new-${Date.now()}`,
                            venue: '',
                            assignedNonRepeat: 0,
                            assignedRepeat: 0,
                            supervisor: '',
                            invigilator: '',
                            attendants: 'Not Assigned', // Read-only from faculty
                        }
                    ]
                };
            }
            return exam;
        }));
    };

    const handleRemoveVenue = (examId, allocId) => {
        setExams(prev => prev.map(exam => {
            if (exam.id === examId) {
                return {
                    ...exam,
                    allocations: exam.allocations.filter(a => a.id !== allocId)
                };
            }
            return exam;
        }));
    };

    const updateAllocation = (examId, allocId, field, value) => {
        setExams(prev => prev.map(exam => {
            if (exam.id === examId) {
                return {
                    ...exam,
                    allocations: exam.allocations.map(alloc =>
                        alloc.id === allocId ? { ...alloc, [field]: value } : alloc
                    )
                };
            }
            return exam;
        }));
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col h-full overflow-hidden animate-fade-in-up">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Exam Allocations & Staffing</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage exam venues and staff assignments.</p>
                </div>
                <div>
                    <button className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-md transition-all text-sm flex items-center">
                        <span className="mr-2">🗓️</span> Publish Personalized Timetable
                    </button>
                </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 sticky top-0 z-20">
                        <tr>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">Date</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">Time</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 w-40">Course</th>

                            {/* Fixed Totals */}
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 bg-gray-100/50 w-24 border-r">Total NR</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 bg-gray-100/50 w-24 border-r">Total Rep</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 bg-gray-100/50 w-20 border-r-2 border-gray-300">Total</th>

                            {/* Split Columns */}
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 bg-indigo-50/30 w-48">Venue</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 bg-indigo-50/30 w-24">Alloc NR</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 bg-indigo-50/30 w-24">Alloc Rep</th>

                            {/* Staff Columns */}
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 bg-green-50/30 w-48">Supervisor</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 bg-green-50/30 w-48">Invigilator</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 bg-green-50/30 w-32">Hall Attendants</th>
                            <th className="px-1 py-3 border-b border-gray-200 w-8"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {exams.map((exam) => (
                            <React.Fragment key={exam.id}>
                                {exam.allocations.map((alloc, index) => {
                                    const isFirst = index === 0;
                                    const rowClass = isFirst ? "bg-white" : "bg-gray-50/30";
                                    const borderClass = index === exam.allocations.length - 1 ? "border-b-2 border-gray-200" : "border-b border-gray-100 dashed";

                                    // Conflict Detection
                                    // Conflict Detection
                                    const supervisorConflict = checkConflict(alloc.supervisor, exam.date, exam.time, alloc.id, 'supervisor', alloc);
                                    const invigilatorConflict = checkConflict(alloc.invigilator, exam.date, exam.time, alloc.id, 'invigilator', alloc);

                                    const getConflictTitle = (code) => {
                                        if (code === 'Overlap') return 'Staff is busy in another venue at this time';
                                        if (code === 'Self') return 'Same person cannot be Supervisor and Invigilator';
                                        return 'Conflict detected';
                                    };

                                    return (
                                        <tr key={alloc.id} className={`${rowClass} ${borderClass} hover:bg-gray-50 transition-colors group`}>
                                            {/* Common Exam Info (Only show on first row) */}
                                            <td className="px-4 py-3 text-sm text-gray-900 font-medium align-top">
                                                {isFirst && exam.date}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 align-top">
                                                {isFirst && exam.time}
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                {isFirst && (
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-800">{exam.course.split(' - ')[0]}</div>
                                                        <div className="text-xs text-gray-500">{exam.course.split(' - ')[1]}</div>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Fixed Totals */}
                                            <td className="px-4 py-3 text-sm text-gray-500 align-top bg-gray-50/50 border-r border-gray-200">
                                                {isFirst && exam.totalNonRepeat}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 align-top bg-gray-50/50 border-r border-gray-200">
                                                {isFirst && exam.totalRepeat}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-bold text-gray-800 align-top bg-gray-50/50 border-r-2 border-gray-300">
                                                {isFirst && (exam.totalNonRepeat + exam.totalRepeat)}
                                            </td>

                                            {/* Venue Logic */}
                                            <td className="px-4 py-3 align-top">
                                                <select
                                                    value={alloc.venue}
                                                    onChange={(e) => updateAllocation(exam.id, alloc.id, 'venue', e.target.value)}
                                                    className="w-full text-sm border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                                >
                                                    <option value="">Select Venue...</option>
                                                    {venuesList.map(v => (
                                                        <option key={v.name} value={v.name}>{v.name} ({v.capacity})</option>
                                                    ))}
                                                </select>
                                                {!isFirst && (
                                                    <button onClick={() => handleRemoveVenue(exam.id, alloc.id)} className="text-xs text-red-400 hover:text-red-600 mt-1 flex items-center">
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                        Remove
                                                    </button>
                                                )}
                                            </td>

                                            {/* Allocated Student Counts */}
                                            <td className="px-4 py-3 align-top">
                                                <input
                                                    type="number"
                                                    className="w-20 text-sm border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                    value={alloc.assignedNonRepeat}
                                                    onChange={(e) => updateAllocation(exam.id, alloc.id, 'assignedNonRepeat', parseInt(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                <input
                                                    type="number"
                                                    className="w-20 text-sm border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                    value={alloc.assignedRepeat}
                                                    onChange={(e) => updateAllocation(exam.id, alloc.id, 'assignedRepeat', parseInt(e.target.value) || 0)}
                                                />
                                            </td>

                                            {/* Staffing: Supervisor */}
                                            <td className="px-4 py-3 align-top relative">
                                                <div className={`relative ${supervisorConflict ? 'ring-2 ring-red-400 rounded-md' : ''}`}>
                                                    <select
                                                        value={alloc.supervisor}
                                                        onChange={(e) => updateAllocation(exam.id, alloc.id, 'supervisor', e.target.value)}
                                                        className="w-full text-xs border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                    >
                                                        <option value="">Select Supervisor...</option>
                                                        {staffList.map(s => (
                                                            <option key={s.id} value={s.id}>{s.name}</option>
                                                        ))}
                                                    </select>
                                                    {supervisorConflict && (
                                                        <div className="absolute top-0 right-0 -mt-2 -mr-2 text-red-500 bg-white rounded-full p-0.5 shadow-sm text-xs cursor-help" title={getConflictTitle(supervisorConflict)}>⚠️</div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Staffing: Invigilator (Single Selection) */}
                                            <td className="px-4 py-3 align-top relative">
                                                <div className={`relative ${invigilatorConflict ? 'ring-2 ring-red-400 rounded-md' : ''}`}>
                                                    <select
                                                        value={alloc.invigilator}
                                                        onChange={(e) => updateAllocation(exam.id, alloc.id, 'invigilator', e.target.value)}
                                                        className="w-full text-xs border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                    >
                                                        <option value="">None (or Select One)</option>
                                                        {staffList.map(s => (
                                                            <option key={s.id} value={s.id}>{s.name}</option>
                                                        ))}
                                                    </select>
                                                    {invigilatorConflict && (
                                                        <div className="absolute top-0 right-0 -mt-2 -mr-2 text-red-500 bg-white rounded-full p-0.5 shadow-sm text-xs cursor-help" title={getConflictTitle(invigilatorConflict)}>⚠️</div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 align-top">
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded block truncate" title={alloc.attendants}>
                                                    {alloc.attendants}
                                                </span>
                                            </td>

                                            <td className="px-1 py-3 align-middle text-center">
                                                {isFirst && (
                                                    <button
                                                        onClick={() => handleAddVenue(exam.id)}
                                                        className="p-1 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors shadow-sm"
                                                        title="Add Venue Split"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                <div className="flex space-x-3">
                    <button
                        id="save-draft-btn"
                        onClick={handleSaveDraft}
                        className="px-6 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors w-32"
                    >
                        Save Draft
                    </button>
                    <button className="px-6 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-sm font-semibold hover:bg-amber-100 transition-colors flex items-center">
                        <span className="mr-2">💬</span> Department Staff Concerns
                    </button>
                </div>
                <button className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transform transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm">
                    Submit to Faculty
                </button>
            </div>
        </div>
    );
};

export default AllocationsDashboard;
