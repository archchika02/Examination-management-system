
import React, { useState } from 'react';

const FacultyAttendantAllocation = () => {
    // Mock Staff Database (Read-only reference)
    const staffList = [
        { id: 's1', name: 'Dr. Alan Smith', dept: 'CS' },
        { id: 's2', name: 'Prof. Sarah Jones', dept: 'MATH' },
        { id: 's3', name: 'Mr. James Doe', dept: 'CS' },
        { id: 's4', name: 'Ms. Emily White', dept: 'ENG' },
        { id: 's5', name: 'Dr. Robert Brown', dept: 'MATH' },
    ];

    // Dedicated Hall Attendants List (Mock Database)
    const hallAttendantsList = [
        { id: 'ha1', name: 'Staff A' },
        { id: 'ha2', name: 'Staff B' },
        { id: 'ha3', name: 'Staff C' },
        { id: 'ha4', name: 'Staff D' },
        { id: 'ha5', name: 'Staff E' },
        { id: 'ha6', name: 'Staff F' },
    ];

    const venuesList = [
        { name: 'Main Hall', capacity: 120 },
        { name: 'Room 201', capacity: 50 },
        { name: 'Lab 1', capacity: 30 },
    ];

    // Initial Data with nested allocations
    const [exams, setExams] = useState([
        {
            id: 1,
            date: '2025-01-15',
            time: '09:00 AM',
            course: 'INTE 22253 - Distributed Systems and Cloud Computing',
            totalNonRepeat: 100,
            totalRepeat: 10,
            allocations: [
                { id: 'a1', venue: 'Main Hall', assignedNonRepeat: 100, assignedRepeat: 10, supervisor: 'Dr. Alan Smith', invigilator: 'Mr. James Doe', attendants: 'Staff A, Staff B' }
            ]
        },
        {
            id: 2,
            date: '2025-01-16',
            time: '01:00 PM',
            course: 'INTE 22263 - Embedded Systems Development',
            totalNonRepeat: 45,
            totalRepeat: 5,
            allocations: [
                { id: 'a2', venue: 'Room 201', assignedNonRepeat: 45, assignedRepeat: 5, supervisor: 'Prof. Sarah Jones', invigilator: 'None', attendants: 'Staff C' }
            ]
        }
    ]);

    // Mock Reschedule Requests Data
    const [requests, setRequests] = useState([
        { id: 101, attendant: 'Staff A', course: 'INTE 21323 - Web Application Development', currentSession: '2025-01-15 09:00 AM', reason: 'Medical Appointment', status: 'Pending', examId: 1, allocId: 'a1' },
        { id: 102, attendant: 'Staff C', course: 'INTE 21333 - Event Driven Programming', currentSession: '2025-01-16 01:00 PM', reason: 'Family Emergency', status: 'Pending', examId: 2, allocId: 'a2' }
    ]);

    // Approval Modal State
    const [approvalModal, setApprovalModal] = useState({ open: false, requestId: null, examId: null, allocId: null, currentAttendant: '' });
    const [selectedReplacement, setSelectedReplacement] = useState('');

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
        localStorage.setItem('facultyAttendantDraft', JSON.stringify(exams));
    };

    const updateAttendants = (examId, allocId, value) => {
        setExams(prev => prev.map(exam => {
            if (exam.id === examId) {
                return {
                    ...exam,
                    allocations: exam.allocations.map(alloc =>
                        alloc.id === allocId ? { ...alloc, attendants: value } : alloc
                    )
                };
            }
            return exam;
        }));
    };

    const handleSubmit = () => {
        // Mock submit action
        console.log("Submitting to Academic Supervisor:", exams);
        alert("Configuration submitted to Academic Supervisor successfully!");
    };

    const handleRequestAction = (req, action) => {
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
                setRequests(requests.filter(r => r.id !== req.id));
            }
        }
    };

    const confirmApproval = () => {
        if (!selectedReplacement) {
            alert("Please select a replacement Hall Attendant.");
            return;
        }

        // 1. Update the allocation in the main table
        setExams(prev => prev.map(exam => {
            if (exam.id === approvalModal.examId) {
                return {
                    ...exam,
                    allocations: exam.allocations.map(alloc => {
                        if (alloc.id === approvalModal.allocId) {
                            // Simple string replacement for demo purposes. In a real app, this would handle array logic.
                            const updatedAttendants = alloc.attendants.replace(approvalModal.currentAttendant, selectedReplacement);
                            return { ...alloc, attendants: updatedAttendants };
                        }
                        return alloc;
                    })
                };
            }
            return exam;
        }));

        // 2. Remove the request
        setRequests(requests.filter(r => r.id !== approvalModal.requestId));

        // 3. Close modal
        setApprovalModal({ open: false, requestId: null, examId: null, allocId: null, currentAttendant: '' });
        alert(`Request Approved! ${approvalModal.currentAttendant} has been replaced by ${selectedReplacement}.`);
    };

    // Filter attendants to exclude the one being replaced
    const availableSuccessors = hallAttendantsList.filter(ha => ha.name !== approvalModal.currentAttendant);

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
                <div className="overflow-x-auto">
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
                                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 bg-yellow-50/30 w-48">Hall Attendants (Edit)</th>
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

                                                {/* Editable Hall Attendants */}
                                                <td className="px-4 py-3 align-top">
                                                    <input
                                                        type="text"
                                                        value={alloc.attendants}
                                                        onChange={(e) => updateAttendants(exam.id, alloc.id, e.target.value)}
                                                        className="w-full text-sm border-gray-200 rounded-md focus:ring-yellow-500 focus:border-yellow-500 bg-white"
                                                        placeholder="Enter Staff Names..."
                                                    />
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
                    </div>
                    <button
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
                                                        <option key={staff.id} value={staff.name}>
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
