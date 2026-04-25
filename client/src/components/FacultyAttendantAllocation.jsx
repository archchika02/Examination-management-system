import React, { useState, useEffect } from 'react';

const FacultyAttendantAllocation = () => {
    const [loading, setLoading] = useState(true);
    const [exams, setExams] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [hallAttendantsList, setHallAttendantsList] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch submitted allocations
                const allocationsRes = await fetch('http://localhost:5000/api/configurations/faculty-attendant-allocations');
                if (allocationsRes.ok) {
                    const data = await allocationsRes.json();
                    setExams(data);
                }

                // Fetch staff and attendants for replacement lookups (if needed by requests logic)
                const staffRes = await fetch('http://localhost:5000/api/users/role/Invigilator');
                if (staffRes.ok) {
                    const data = await staffRes.json();
                    setStaffList(data.map(u => ({ id: u.user_id, name: u.name, dept: u.department || 'N/A' })));
                }

                const attendantRes = await fetch('http://localhost:5000/api/users/role/HallAttendant');
                if (attendantRes.ok) {
                    const data = await attendantRes.json();
                    setHallAttendantsList(data.map(u => ({ id: u.user_id, name: u.name })));
                }

                // Fetch real pending concerns for Hall Attendants (target=Faculty)
                const concernsRes = await fetch('http://localhost:5000/api/configurations/staff-concerns?target=Faculty');
                if (concernsRes.ok) {
                    const data = await concernsRes.json();
                    setRequests(data.filter(r => r.status === 'Pending').map(r => ({
                        id: r.id,
                        attendant: r.requestBy,
                        course: r.course || r.description, // Fallback if course field differs
                        currentSession: (r.examDate || r.date) + ' ' + (r.time || ''),
                        reason: r.description,
                        allocId: r.allocId,
                        examId: r.examId
                    })));
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Real Concerns State
    const [requests, setRequests] = useState([]);

    // Approval Modal State
    const [approvalModal, setApprovalModal] = useState({ open: false, requestId: null, examId: null, allocId: null, currentAttendant: '' });
    const [selectedReplacement, setSelectedReplacement] = useState('');

    const [openDropdown, setOpenDropdown] = useState(null); // Track which allocation's dropdown is open

    const toggleAttendant = (examId, allocId, attendantId) => {
        setExams(prev => prev.map(exam => {
            if (exam.id === examId) {
                return {
                    ...exam,
                    allocations: exam.allocations.map(alloc => {
                        if (alloc.id === allocId) {
                            const currentIds = alloc.attendantIds || [];
                            const newIds = currentIds.includes(attendantId)
                                ? currentIds.filter(id => id !== attendantId)
                                : [...currentIds, attendantId];
                            return { ...alloc, attendantIds: newIds };
                        }
                        return alloc;
                    })
                };
            }
            return exam;
        }));
    };

    const handleSaveDraft = async () => {
        const assignments = [];
        exams.forEach(exam => {
            exam.allocations.forEach(alloc => {
                assignments.push({
                    alloc_id: alloc.id,
                    attendantIds: alloc.attendantIds || []
                });
            });
        });

        const btn = document.getElementById('save-draft-btn');
        if (btn) btn.innerText = "Saving...";

        try {
            const response = await fetch('http://localhost:5000/api/configurations/save-hall-attendant-draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignments })
            });

            if (response.ok) {
                if (btn) btn.innerText = "Saved! ✓";
                setTimeout(() => { if (btn) btn.innerText = "Save Draft"; }, 2000);
            } else {
                alert("Failed to save draft.");
                if (btn) btn.innerText = "Save Draft";
            }
        } catch (err) {
            console.error("Error saving draft:", err);
            alert("Error saving draft.");
            if (btn) btn.innerText = "Save Draft";
        }
    };

    const handlePublish = async () => {
        const btn = document.getElementById('publish-btn');
        if (btn) btn.innerText = "Publishing...";

        try {
            const response = await fetch('http://localhost:5000/api/configurations/publish-attendant-timetable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                if (btn) btn.innerText = "Published! ✓";
                setTimeout(() => { if (btn) btn.innerText = "Publish Personalized Timetable"; }, 2000);
                alert("Personalized timetables published to Hall Attendants successfully!");
            } else {
                alert("Failed to publish timetables.");
                if (btn) btn.innerText = "Publish Personalized Timetable";
            }
        } catch (err) {
            console.error("Error publishing:", err);
            alert("An error occurred while publishing.");
            if (btn) btn.innerText = "Publish Personalized Timetable";
        }
    };

    const handlePublishToStudents = async () => {
        const btn = document.getElementById('publish-students-btn');
        if (btn) btn.innerText = "Publishing...";

        try {
            const response = await fetch('http://localhost:5000/api/configurations/publish-student-timetable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                if (btn) btn.innerText = "Published! ✓";
                setTimeout(() => { if (btn) btn.innerText = "Publish timetables to Students"; }, 2000);
                alert("Timetables published to Students successfully!");
            } else {
                alert("Failed to publish timetables.");
                if (btn) btn.innerText = "Publish timetables to Students";
            }
        } catch (err) {
            console.error("Error publishing:", err);
            alert("An error occurred while publishing.");
            if (btn) btn.innerText = "Publish timetables to Students";
        }
    };

    const handleSubmit = async () => {
        if (!window.confirm("Are you sure you want to submit these hall attendant allocations to the Academic Supervisor?")) return;

        const btn = document.getElementById('submit-to-as-btn');
        const originalText = btn ? btn.innerText : "Submit to Academic Supervisor";
        if (btn) btn.innerText = "Submitting...";

        try {
            const response = await fetch('http://localhost:5000/api/configurations/submit-to-as', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                if (btn) btn.innerText = "Submitted! ✓";
                alert("Configuration submitted to Academic Supervisor successfully!");
                // Optionally refresh or redirect
                setTimeout(() => { if (btn) btn.innerText = originalText; }, 3000);
            } else {
                alert("Failed to submit to Academic Supervisor.");
                if (btn) btn.innerText = originalText;
            }
        } catch (err) {
            console.error("Error submitting to AS:", err);
            alert("An error occurred during submission.");
            if (btn) btn.innerText = originalText;
        }
    };

    const handleRequestAction = async (req, action) => {
        if (action === 'Approve') {
            setApprovalModal({
                open: true,
                requestId: req.id,
                examId: req.examId,
                allocId: req.allocId,
                currentAttendant: req.attendant
            });
            setSelectedReplacement('');
        } else {
            if (window.confirm(`Are you sure you want to reject this request from ${req.attendant}?`)) {
                try {
                    const response = await fetch('http://localhost:5000/api/configurations/resolve-concern', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ concernId: req.id, status: 'Rejected' })
                    });
                    if (response.ok) {
                        setRequests(requests.filter(r => r.id !== req.id));
                        alert("Request rejected successfully.");
                    }
                } catch (err) {
                    console.error("Error rejecting concern:", err);
                    alert("Failed to reject request.");
                }
            }
        }
    };

    const confirmApproval = async () => {
        if (!selectedReplacement) {
            alert("Please select a replacement Hall Attendant.");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/configurations/resolve-concern', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    concernId: approvalModal.requestId,
                    status: 'Approved',
                    replacementStaffId: selectedReplacement
                })
            });

            if (response.ok) {
                // Update the local exams state to show the replacement
                setExams(prev => prev.map(exam => {
                    if (exam.id === approvalModal.examId) {
                        return {
                            ...exam,
                            allocations: exam.allocations.map(alloc => {
                                // Match both allocId and alloc-allocId formats
                                if (alloc.id === approvalModal.allocId || alloc.id === `alloc-${approvalModal.allocId}`) {
                                    const oldAttendantId = hallAttendantsList.find(ha => ha.name === approvalModal.currentAttendant)?.id;
                                    const newAttendantId = parseInt(selectedReplacement);

                                    // Filter out the old attendant and add the new one
                                    const currentIds = alloc.attendantIds || [];
                                    const filteredIds = currentIds.filter(id => id !== oldAttendantId);
                                    const updatedIds = [...filteredIds, newAttendantId];

                                    return { ...alloc, attendantIds: updatedIds };
                                }
                                return alloc;
                            })
                        };
                    }
                    return exam;
                }));

                // Remove the request from the list
                setRequests(requests.filter(r => r.id !== approvalModal.requestId));
                // Close modal
                setApprovalModal({ open: false, requestId: null, examId: null, allocId: null, currentAttendant: '' });
                alert(`Request Approved and Attendant Reassigned!`);
            }
        } catch (err) {
            console.error("Error approving concern:", err);
            alert("Failed to approve request.");
        }
    };

    // Filter attendants to exclude the one being replaced
    const availableSuccessors = hallAttendantsList.filter(ha => ha.name !== approvalModal.currentAttendant);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = () => setOpenDropdown(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col space-y-6 animate-fade-in-up relative">

            {/* Pending Requests Section */}
            {requests.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
                    <div className="p-4 border-b border-orange-100 bg-orange-50 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-orange-800 flex items-center gap-2">
                                <span className="text-xl">🔔</span> Pending Reschedule Requests
                            </h3>
                            <p className="text-sm text-orange-600 mt-1">Hall attendants requesting schedule changes.</p>
                        </div>
                        <span className="px-3 py-1 bg-white text-orange-600 rounded-full text-xs font-bold border border-orange-200">
                            {requests.length} Processing
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-orange-50/50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Attendant</th>
                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Course / Session</th>
                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Reason</th>
                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-50">
                                {requests.map(req => (
                                    <tr key={req.id} className="hover:bg-orange-50/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-800 text-sm">{req.attendant}</p>
                                            <p className="text-xs text-gray-500">ID: HA-00{req.id}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <p className="font-medium text-gray-800">{req.course}</p>
                                            <p className="text-gray-500 text-xs mt-0.5">{req.currentSession}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 italic">
                                            "{req.reason}"
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleRequestAction(req, 'Approve')}
                                                className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-lg hover:bg-green-200 transition-colors"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleRequestAction(req, 'Reject')}
                                                className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200 transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Main Allocation Table */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Hall Attendant Configuration</h2>
                        <p className="text-sm text-gray-500 mt-1">Configure hall attendants for exam venues.</p>
                    </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 text-gray-500">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                            <p className="font-medium">Loading submitted allocations...</p>
                        </div>
                    ) : exams.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 text-gray-500 text-center">
                            <span className="text-5xl mb-4">📥</span>
                            <h3 className="text-xl font-bold text-gray-800">No Allocations Submitted Yet</h3>
                            <p className="max-w-md mt-2">When the Academic Supervisor submits the final allocations for the faculty, they will appear here for hall attendant configuration.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 sticky top-0 z-20">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">Date</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">Time</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 w-40">Course</th>

                                    {/* Read-only Allocation Info */}
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 bg-indigo-50/30 w-48">Venue</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 bg-indigo-50/30 w-24">Alloc NR</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 bg-indigo-50/30 w-24">Alloc Rep</th>

                                    {/* Read-only Staff Columns */}
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 bg-green-50/30 w-48">Supervisor</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 bg-green-50/30 w-48">Invigilator</th>

                                    {/* Editable Column */}
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 bg-yellow-50/30 w-48">Hall Attendants</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {exams.map((exam) => (
                                    <React.Fragment key={exam.id}>
                                        {exam.allocations.map((alloc, index) => {
                                            const isFirst = index === 0;
                                            const rowClass = isFirst ? "bg-white" : "bg-gray-50/30";
                                            const borderClass = index === exam.allocations.length - 1 ? "border-b-2 border-gray-200" : "border-b border-gray-100 dashed";

                                            return (
                                                <tr key={alloc.id} className={`${rowClass} ${borderClass} hover:bg-gray-50 transition-colors group`}>
                                                    {/* Common Exam Info */}
                                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium align-top">
                                                        {isFirst && new Date(exam.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
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

                                                    {/* Read-only Venue Info */}
                                                    <td className="px-4 py-3 text-sm text-gray-700 align-top">
                                                        {alloc.venue}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-500 align-top">
                                                        {alloc.assignedNonRepeat}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-500 align-top">
                                                        {alloc.assignedRepeat}
                                                    </td>

                                                    {/* Read-only Staff Info */}
                                                    <td className="px-4 py-3 text-sm text-gray-700 align-top">
                                                        {alloc.supervisor}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-700 align-top">
                                                        {alloc.invigilator || 'None'}
                                                    </td>

                                                    {/* Editable Hall Attendants Selection */}
                                                    <td className="px-4 py-3 align-top relative min-w-[200px]">
                                                        <div className="text-sm text-gray-700 mb-2 font-medium">
                                                            {(alloc.attendantIds || []).length > 0 ? (
                                                                (alloc.attendantIds || []).map(id => {
                                                                    const ha = hallAttendantsList.find(h => Number(h.id) === Number(id));
                                                                    return ha ? ha.name : `Staff #${id}`;
                                                                }).join(', ')
                                                            ) : (
                                                                <span className="text-gray-400 italic">None assigned</span>
                                                            )}
                                                        </div>

                                                        <div className="relative">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setOpenDropdown(openDropdown === alloc.id ? null : alloc.id);
                                                                }}
                                                                className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm hover:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                                                            >
                                                                <span className="truncate text-gray-700 font-medium text-xs">
                                                                    {(alloc.attendantIds || []).length > 0
                                                                        ? `${(alloc.attendantIds || []).length} Selected`
                                                                        : "Manage Selection..."}
                                                                </span>
                                                                <span className={`text-[10px] transition-transform duration-200 ${openDropdown === alloc.id ? 'rotate-180' : ''}`}>
                                                                    ▼
                                                                </span>
                                                            </button>

                                                            {openDropdown === alloc.id && (
                                                                <div
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-fade-in origin-top"
                                                                >
                                                                    <div className="max-h-48 overflow-y-auto p-1 bg-gray-50/50">
                                                                        {hallAttendantsList.length > 0 ? (
                                                                            hallAttendantsList.map(ha => (
                                                                                <label
                                                                                    key={ha.id}
                                                                                    className="flex items-center space-x-3 px-3 py-2 hover:bg-white cursor-pointer rounded-md transition-colors group"
                                                                                >
                                                                                    <div className="relative flex items-center">
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            className="peer h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                                                                                            checked={(alloc.attendantIds || []).some(id => Number(id) === Number(ha.id))}
                                                                                            onChange={() => toggleAttendant(exam.id, alloc.id, ha.id)}
                                                                                        />
                                                                                    </div>
                                                                                    <span className={`text-sm transition-colors ${(alloc.attendantIds || []).some(id => Number(id) === Number(ha.id)) ? 'text-indigo-600 font-bold' : 'text-gray-600 font-medium group-hover:text-gray-900'}`}>
                                                                                        {ha.name}
                                                                                    </span>
                                                                                </label>
                                                                            ))
                                                                        ) : (
                                                                            <div className="p-3 text-xs text-gray-500 text-center italic">
                                                                                No approved Hall Attendants.
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-end">
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1.5 ml-1">
                            <p className="text-red-600 text-[10px] font-black uppercase tracking-widest animate-pulse flex items-center gap-1.5">
                                <span className="text-sm">⚠️</span>
                                Click the save draft button before publish the personalized timetable
                            </p>
                            <p className="text-red-600 text-[10px] font-black uppercase tracking-widest animate-pulse flex items-center gap-1.5">
                                <span className="text-sm">⚠️</span>
                                Click the submit to academic supervisor button after finalized the timetable
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                id="save-draft-btn"
                                onClick={handleSaveDraft}
                                className="px-6 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors w-32"
                            >
                                Save Draft
                            </button>
                            <button
                                id="publish-btn"
                                onClick={handlePublish}
                                className="px-6 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all shadow-sm"
                            >
                                Publish Personalized Timetable
                            </button>
                            <button
                                id="publish-students-btn"
                                onClick={handlePublishToStudents}
                                className="px-6 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all shadow-sm"
                            >
                                Publish timetables to Students
                            </button>
                        </div>
                    </div>
                    <button
                        id="submit-to-as-btn"
                        onClick={handleSubmit}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transform transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm"
                    >
                        Submit to Academic Supervisor
                    </button>
                </div>
            </div>

            {/* Approval Replacement Modal */}
            {approvalModal.open && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">

                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={() => setApprovalModal({ ...approvalModal, open: false })}></div>

                        <div className="relative inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <span className="text-blue-600 font-bold text-xl">👥</span>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
                                            Select Replacement Attendant
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Please select a new Hall Attendant to replace <span className="font-bold text-gray-800">{approvalModal.currentAttendant}</span>.
                                            </p>

                                            <div className="mt-4">
                                                <label htmlFor="replacement" className="block text-sm font-medium text-gray-700 mb-1">Available Staff (Role: Hall Attendant)</label>
                                                <select
                                                    id="replacement"
                                                    value={selectedReplacement}
                                                    onChange={(e) => setSelectedReplacement(e.target.value)}
                                                    className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border shadow-sm"
                                                >
                                                    <option value="" disabled>-- Select a replacement --</option>
                                                    {availableSuccessors.map(staff => (
                                                        <option key={staff.id} value={staff.id}>
                                                            {staff.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={confirmApproval}
                                    disabled={!selectedReplacement}
                                    className={`w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors
                                        ${selectedReplacement ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
                                >
                                    Confirm & Approve
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setApprovalModal({ ...approvalModal, open: false })}
                                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyAttendantAllocation;
