import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const Icons = {
    Calendar: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
    ),
    Send: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
    ),
    MessageSquare: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    )
};

const AllocationsDashboard = () => {
    const [staffList, setStaffList] = useState([]);
    const [attendantList, setAttendantList] = useState([]);

    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllocationsAndDrafts = async () => {
            try {
                // Fetch staff
                const staffRes = await fetch('http://localhost:5000/api/configurations/allocation-staff');
                if (staffRes.ok) {
                    const allStaff = await staffRes.json();

                    // Split supervisors/invigilators from attendants
                    const supervisors = allStaff.filter(s => s.dept === 'DeptStaff' || s.dept === 'AcademicSupervisor');
                    const attendants = allStaff.filter(s => s.dept === 'HallAttendant');

                    setStaffList(supervisors);
                    setAttendantList(attendants);
                }

                const response = await fetch('http://localhost:5000/api/configurations/allocations-dashboard');
                const draftsRes = await fetch('http://localhost:5000/api/configurations/allocation-drafts');

                let drafts = [];
                if (draftsRes.ok) {
                    drafts = await draftsRes.json();
                }

                if (response.ok) {
                    const data = await response.json();
                    const formattedExams = data.map(exam => {
                        const endParts = exam.endTime ? exam.endTime.split(':') : [];
                        let endString = exam.endTime;
                        if (endParts.length >= 2) {
                            let endHour = parseInt(endParts[0], 10);
                            const endMin = endParts[1];
                            const ampm = endHour >= 12 ? 'PM' : 'AM';
                            if (endHour > 12) endHour -= 12;
                            if (endHour === 0) endHour = 12;
                            endString = `${endHour}:${endMin} ${ampm}`;
                        }

                        const examDrafts = drafts.filter(d => d.exam_id === exam.examId);

                        let mappedAllocations = [];
                        if (examDrafts.length > 0) {
                            mappedAllocations = examDrafts.map(d => ({
                                id: `alloc-${d.id}`,
                                venue: d.venue,
                                assignedNonRepeat: d.assignedNonRepeat,
                                assignedRepeat: d.assignedRepeat,
                                supervisor: d.supervisor ? String(d.supervisor) : '',
                                invigilators: d.invigilators ? d.invigilators.map(String) : [],
                                attendants: d.attendants ? d.attendants.map(String) : []
                            }));
                        } else {
                            mappedAllocations = [{
                                id: `alloc-${exam.allocId}`,
                                venue: '',
                                assignedNonRepeat: 0,
                                assignedRepeat: 0,
                                supervisor: '',
                                invigilators: [],
                                attendants: []
                            }];
                        }

                        return {
                            id: exam.examId,
                            date: exam.date,
                            time: `${exam.time} - ${endString}`,
                            course: exam.course,
                            totalNonRepeat: exam.totalNonRepeat || 0,
                            totalRepeat: exam.totalRepeat || 0,
                            examiner1Id: exam.examiner1Id || null,
                            allocations: mappedAllocations
                        };
                    });
                    setExams(formattedExams);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllocationsAndDrafts();
        fetchConcerns();
    }, []);

    // Helper: Check for conflicts
    const checkConflict = (staffId, examDate, examTime, currentAllocationId, role, currentAlloc) => {
        if (!staffId) return false;

        // 1. Overlap Conflict: Staff is busy elsewhere at the same time
        for (const exam of exams) {
            if (exam.date === examDate && exam.time === examTime) {
                for (const alloc of exam.allocations) {
                    if (alloc.id !== currentAllocationId) {
                        if (alloc.supervisor === staffId) return 'Overlap';
                        if (alloc.invigilators && alloc.invigilators.includes(staffId)) return 'Overlap';
                    }
                }
            }
        }

        // 2. Intra-Allocation Conflicts (Same Venue/Row)
        if (currentAlloc) {
            const supervisorId = role === 'supervisor' ? staffId : currentAlloc.supervisor;
            const invigilatorIds = role === 'invigilators' ? [staffId] : (currentAlloc.invigilators || []);

            if (supervisorId && invigilatorIds.includes(supervisorId)) {
                return 'Self';
            }
        }

        return false;
    };

    const handleSaveDraft = async () => {
        const btn = document.getElementById('save-draft-btn');
        if (btn) {
            btn.innerText = "Saving...";
            btn.disabled = true;
        }

        try {
            const response = await fetch('http://localhost:5000/api/configurations/save-allocation-draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ exams })
            });

            if (response.ok) {
                if (btn) btn.innerText = "Saved! ✓";
            } else {
                if (btn) btn.innerText = "Error!";
            }
        } catch (err) {
            console.error(err);
            if (btn) btn.innerText = "Error!";
        } finally {
            if (btn) {
                setTimeout(() => {
                    btn.innerText = "Save Draft";
                    btn.disabled = false;
                }, 2000);
            }
        }
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
                            invigilators: [],
                            attendants: [],
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

    const [isConcernsModalOpen, setIsConcernsModalOpen] = useState(false);
    const [replacementSelections, setReplacementSelections] = useState({});

    const [departmentConcerns, setDepartmentConcerns] = useState([]);

    const fetchConcerns = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/configurations/staff-concerns?target=AcademicSupervisor');
            if (res.ok) {
                const data = await res.json();
                setDepartmentConcerns(data);
            }
        } catch (error) {
            console.error("Failed to fetch concerns:", error);
        }
    };

    const handleOpenConcerns = () => setIsConcernsModalOpen(true);
    const handleCloseConcerns = () => setIsConcernsModalOpen(false);

    const handleSelectReplacement = (concernId, staffId) => {
        setReplacementSelections(prev => ({ ...prev, [concernId]: staffId }));
    };

    const [isResolving, setIsResolving] = useState(false);

    const handleApplyResolution = async (concern) => {
        const newStaffId = replacementSelections[concern.id];
        if (!newStaffId) return;

        setIsResolving(true);
        try {
            const response = await fetch('http://localhost:5000/api/configurations/resolve-concern', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    concernId: concern.id,
                    allocId: concern.allocId,
                    role: concern.role,
                    newStaffId: newStaffId
                })
            });

            if (response.ok) {
                // 1. Update the exam allocation locally
                setExams(prev => prev.map(exam => {
                    if (exam.id === concern.examId) {
                        return {
                            ...exam,
                            allocations: exam.allocations.map(alloc => {
                                if (alloc.id === concern.allocId) {
                                    if (concern.role === 'supervisor') {
                                        return { ...alloc, supervisor: String(newStaffId) };
                                    } else if (concern.role === 'invigilator') {
                                        return { ...alloc, invigilators: [...(alloc.invigilators || []), String(newStaffId)] };
                                    } else if (concern.role === 'attendant') {
                                        return { ...alloc, attendants: [...(alloc.attendants || []), String(newStaffId)] };
                                    }
                                }
                                return alloc;
                            })
                        };
                    }
                    return exam;
                }));

                // 2. Refresh concerns from server to get updated status and accurate list
                await fetchConcerns();

                // Clear selection
                setReplacementSelections(prev => {
                    const newState = { ...prev };
                    delete newState[concern.id];
                    return newState;
                });

                alert('Staff replaced and concern resolved successfully.');
            } else {
                const data = await response.json();
                alert(`Failed to resolve concern: ${data.message}`);
            }
        } catch (error) {
            console.error("Error resolving concern:", error);
            alert("Error resolving concern.");
        } finally {
            setIsResolving(false);
        }
    };

    const handlePublishTimetables = async () => {
        if (!window.confirm("Are you sure you want to publish these allocations? This will make them visible to all assigned staff.")) {
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/configurations/publish-timetables', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                alert("Timetables published successfully!");
            } else {
                const errorData = await response.json();
                alert(`Failed to publish: ${errorData.message}`);
            }
        } catch (error) {
            console.error("Error publishing timetables:", error);
            alert("An error occurred while publishing timetables.");
        }
    };

    const handleSubmitToFaculty = async () => {
        if (!window.confirm("Are you sure you want to submit these published allocations to the faculty?")) {
            return;
        }

        const btn = document.getElementById('submit-to-faculty-btn');
        if (btn) {
            btn.innerText = "Submitting...";
            btn.disabled = true;
        }

        try {
            const response = await fetch('http://localhost:5000/api/configurations/submit-to-faculty', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                alert("Allocations submitted to faculty successfully!");
            } else {
                const errorData = await response.json();
                alert(`Failed to submit: ${errorData.message}`);
            }
        } catch (error) {
            console.error("Error submitting to faculty:", error);
            alert("An error occurred while submitting to faculty.");
        } finally {
            if (btn) {
                btn.innerText = "Submit to Faculty";
                btn.disabled = false;
            }
        }
    };

    return (
        <>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col h-full overflow-hidden animate-fade-in-up">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Exam Allocations & Staffing</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage exam venues and staff assignments.</p>
                    </div>
                    <div>
                        <button
                            onClick={handlePublishTimetables}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-200 transition-all text-[10px] uppercase tracking-widest flex items-center gap-2 group active:scale-95">
                            <Icons.Calendar />
                            Publish Personalized
                        </button>
                    </div>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-64 text-gray-500">
                            Loading allocations...
                        </div>
                    ) : (
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

                                            // Examiner 1 Missing Conflict
                                            const missingExaminer1 = isFirst && exam.examiner1Id && !exam.allocations.some(a =>
                                                a.supervisor == exam.examiner1Id || (a.invigilators && a.invigilators.includes(String(exam.examiner1Id)))
                                            );

                                            // Conflict Detection
                                            const supervisorConflict = checkConflict(alloc.supervisor, exam.date, exam.time, alloc.id, 'supervisor', alloc);
                                            // Array overlap detection for invigilators
                                            let invigilatorConflict = false;
                                            if (alloc.invigilators && alloc.invigilators.length > 0) {
                                                for (const invigId of alloc.invigilators) {
                                                    const conflict = checkConflict(invigId, exam.date, exam.time, alloc.id, 'invigilator', alloc);
                                                    if (conflict) {
                                                        invigilatorConflict = conflict;
                                                        break;
                                                    }
                                                }
                                            }

                                            const getConflictTitle = (code) => {
                                                if (code === 'Overlap') return 'Staff is busy in another venue at this time';
                                                if (code === 'Self') return 'Same person cannot be Supervisor and Invigilator';
                                                return 'Conflict detected';
                                            };

                                            return (
                                                <React.Fragment key={alloc.id}>
                                                    {missingExaminer1 && (
                                                        <tr>
                                                            <td colSpan="11" className="px-4 py-2 bg-red-50 text-red-700 text-xs font-semibold border-b border-red-200 uppercase tracking-wide">
                                                                ⚠️ Action Required: The assigned Examiner 1 for this course must be appointed as a Supervisor or Invigilator.
                                                            </td>
                                                        </tr>
                                                    )}
                                                    <tr className={`${rowClass} ${borderClass} hover:bg-gray-50 transition-colors group`}>
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
                                                            <input
                                                                type="text"
                                                                placeholder="Enter Venue"
                                                                value={alloc.venue}
                                                                onChange={(e) => updateAllocation(exam.id, alloc.id, 'venue', e.target.value)}
                                                                className="w-full text-sm border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                                            />
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
                                                                        <option key={s.id} value={s.id}>
                                                                            {s.name} {s.id === exam.examiner1Id ? '⭐ (Examiner 1)' : ''}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                {supervisorConflict && (
                                                                    <div className="absolute top-0 right-0 -mt-2 -mr-2 text-red-500 bg-white rounded-full p-0.5 shadow-sm text-xs cursor-help" title={getConflictTitle(supervisorConflict)}>⚠️</div>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Staffing: Invigilator (Multiple Selection) */}
                                                        <td className="px-4 py-3 align-top relative">
                                                            <div className={`relative ${invigilatorConflict ? 'ring-2 ring-red-400 rounded-md' : ''}`}>
                                                                <div className="w-full max-h-24 overflow-y-auto border border-gray-200 rounded-md bg-white p-1">
                                                                    {staffList.length === 0 && <div className="text-xs text-gray-400 p-1">No staff</div>}
                                                                    {[...staffList].sort((a, b) => {
                                                                        const aSelected = (alloc.invigilators || []).includes(String(a.id));
                                                                        const bSelected = (alloc.invigilators || []).includes(String(b.id));
                                                                        if (aSelected && !bSelected) return -1;
                                                                        if (!aSelected && bSelected) return 1;
                                                                        return a.name.localeCompare(b.name);
                                                                    }).map(s => (
                                                                        <label key={s.id} className={`flex items-center space-x-2 text-xs p-1 rounded cursor-pointer transition-colors ${s.id === exam.examiner1Id
                                                                            ? 'bg-yellow-50 hover:bg-yellow-100 font-semibold border border-yellow-200 text-yellow-800'
                                                                            : 'hover:bg-indigo-50 text-gray-700'
                                                                            }`}>
                                                                            <input
                                                                                type="checkbox"
                                                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3 h-3"
                                                                                checked={(alloc.invigilators || []).includes(String(s.id))}
                                                                                onChange={(e) => {
                                                                                    const current = alloc.invigilators || [];
                                                                                    const newValues = e.target.checked
                                                                                        ? [...current, String(s.id)]
                                                                                        : current.filter(id => id !== String(s.id));
                                                                                    updateAllocation(exam.id, alloc.id, 'invigilators', newValues);
                                                                                }}
                                                                            />
                                                                            <span>{s.name} {s.id === exam.examiner1Id ? '⭐' : ''} <span className="text-gray-400 font-normal">({s.dept})</span></span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                                {invigilatorConflict && (
                                                                    <div className="absolute top-0 right-0 -mt-2 -mr-2 text-red-500 bg-white rounded-full p-0.5 shadow-sm text-xs cursor-help" title={getConflictTitle(invigilatorConflict)}>⚠️</div>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Staffing: Attendants (Read-Only) */}
                                                        <td className="px-4 py-3 align-top relative">
                                                            <div className="w-full max-h-24 overflow-y-auto border border-gray-100 rounded-md bg-transparent p-1 space-y-1">
                                                                {(alloc.attendants || []).length > 0 ? (
                                                                    (alloc.attendants || []).map(id => {
                                                                        const ha = attendantList.find(h => Number(h.id) === Number(id));
                                                                        return (
                                                                            <div key={id} className="text-[10px] font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200 truncate">
                                                                                {ha ? ha.name : `Staff #${id}`}
                                                                            </div>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <div className="text-[10px] text-gray-400 italic p-1">No attendants</div>
                                                                )}
                                                            </div>
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
                                                </React.Fragment>
                                            );
                                        })}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button
                            id="save-draft-btn"
                            onClick={handleSaveDraft}
                            className="px-6 py-3 border-2 border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all w-36 uppercase tracking-widest active:scale-95"
                        >
                            Save Draft
                        </button>
                        <button
                            onClick={handleOpenConcerns}
                            className="group relative px-6 py-3 bg-white border-2 border-amber-100 rounded-xl text-xs font-black text-amber-700 hover:bg-amber-50 hover:border-amber-200 transition-all flex flex-col items-center justify-center active:scale-95"
                        >
                            <div className="flex items-center gap-2">
                                <Icons.MessageSquare />
                                <span>STAFF CONCERNS</span>
                            </div>
                            {departmentConcerns.filter(c => c.status === 'Pending').length > 0 && (
                                <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-lg border-2 border-white animate-bounce">
                                    {departmentConcerns.filter(c => c.status === 'Pending').length}
                                </div>
                            )}
                        </button>
                    </div>
                    <button
                        id="submit-to-faculty-btn"
                        onClick={handleSubmitToFaculty}
                        className="px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-xl shadow-emerald-200 transition-all transform hover:-translate-y-0.5 active:scale-95 text-[10px] uppercase tracking-widest flex items-center gap-2"
                    >
                        <Icons.Send />
                        Submit to Faculty
                    </button>
                </div>

            </div>

            {/* Concerns Modal - Rendered via Portal to escape parent stacking contexts/transforms */}
            {isConcernsModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">

                    {/* Background overlay */}
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                        onClick={handleCloseConcerns}
                    ></div>

                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full relative z-[10000]">
                            <div className="bg-white px-6 pt-6 pb-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl leading-6 font-bold text-gray-900 flex items-center">
                                        <span className="mr-2">⚠️</span> Staff Concerns & Change Requests
                                    </h3>
                                    <button onClick={handleCloseConcerns} className="text-gray-400 hover:text-gray-500 transition-colors">
                                        <span className="text-2xl">×</span>
                                    </button>
                                </div>

                                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                                    {departmentConcerns.length > 0 ? (
                                        departmentConcerns.map((concern) => {
                                            // Find related exam data
                                            const relatedExam = exams.find(e => e.id === concern.examId);
                                            const relatedAlloc = relatedExam?.allocations.find(a => a.id === concern.allocId || a.id === `alloc-${concern.allocId}`);

                                            return (
                                                <div key={concern.id} className={`p-5 rounded-xl border-l-4 shadow-sm ${concern.status === 'Resolved' ? 'bg-gray-50 border-green-500' : 'bg-white border-amber-500 ring-1 ring-gray-100'}`}>
                                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                                        {/* Col 1: Exam Details */}
                                                        <div className="col-span-1">
                                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Impacted Exam</p>
                                                            <div className="text-sm font-bold text-gray-800">{relatedExam?.course}</div>
                                                            <div className="flex items-center mt-2 text-sm text-gray-600">
                                                                <span className="mr-2">📅 {relatedExam?.date}</span>
                                                                <span>⏰ {relatedExam?.time}</span>
                                                            </div>
                                                            <div className="mt-1 text-sm text-indigo-600 font-medium">
                                                                📍 Venue: {relatedAlloc?.venue || 'Not Assigned'}
                                                            </div>
                                                        </div>

                                                        {/* Col 2: The Concern */}
                                                        <div className="col-span-1 border-l border-gray-100 pl-4">
                                                            <div className="flex justify-between items-start">
                                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Request By</p>
                                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${concern.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                                    {concern.status}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {concern.requestBy} <span className="text-gray-500 font-normal">({concern.role})</span>
                                                            </div>
                                                            <div className="mt-2 bg-amber-50 p-2 rounded text-sm text-amber-900/80 italic border border-amber-100">
                                                                "{concern.description}"
                                                            </div>
                                                        </div>

                                                        {/* Col 3: Action / Reassignment */}
                                                        <div className="col-span-1 border-l border-gray-100 pl-4 flex flex-col justify-center">
                                                            {concern.status === 'Pending' ? (
                                                                <div className="space-y-3">
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Reassign {concern.role === 'supervisor' ? 'Supervisor' : 'Invigilator'}:</label>
                                                                        <select
                                                                            className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                                            value={replacementSelections[concern.id] || ''}
                                                                            onChange={(e) => handleSelectReplacement(concern.id, e.target.value)}
                                                                        >
                                                                            <option value="">Select Replacement...</option>
                                                                            {(concern.role === 'attendant' ? attendantList : staffList)
                                                                                .filter(s => s.name !== concern.requestBy)
                                                                                .filter(s => {
                                                                                    if (!relatedExam || !relatedAlloc) return true;
                                                                                    const conflict = checkConflict(
                                                                                        String(s.id),
                                                                                        relatedExam.date,
                                                                                        relatedExam.time,
                                                                                        relatedAlloc.id,
                                                                                        concern.role === 'invigilator' ? 'invigilators' : concern.role,
                                                                                        relatedAlloc
                                                                                    );
                                                                                    return !conflict;
                                                                                })
                                                                                .map(s => (
                                                                                    <option key={s.id} value={s.id}>{s.name} ({s.dept || 'Attendant'})</option>
                                                                                ))}
                                                                        </select>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleApplyResolution(concern)}
                                                                        disabled={!replacementSelections[concern.id] || isResolving}
                                                                        className={`w-full py-2 px-4 rounded-lg text-sm font-bold text-white shadow-sm transition-all
                                                                            ${replacementSelections[concern.id] && !isResolving
                                                                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transform hover:-translate-y-0.5'
                                                                                : 'bg-gray-300 cursor-not-allowed'}`}
                                                                    >
                                                                        {isResolving ? 'Resolving...' : '✓ Assign & Resolve'}
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="text-center text-gray-500">
                                                                    <div className="inline-block p-2 bg-green-50 rounded-full mb-2">
                                                                        <span className="text-xl">✅</span>
                                                                    </div>
                                                                    <p className="text-sm">Resolved</p>
                                                                    {concern.replacementName && (
                                                                        <p className="text-xs text-green-700 mt-2 font-medium bg-green-50 p-2 rounded">Reassigned to: <br />{concern.replacementName}</p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            No concerns reported.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div >,
                document.body
            )}
        </>
    );
};

export default AllocationsDashboard;
