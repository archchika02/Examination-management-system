import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AddDropApproval = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (!token) {
                    console.error("No token found");
                    setLoading(false);
                    return;
                }

                const response = await fetch('http://localhost:5000/api/add-drop/list', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();

                    if (!Array.isArray(data)) {
                        setRequests([{ id: 999, studentNumber: 'ERR', name: 'Expected array, got: ' + typeof data, status: 'Rejected' }]);
                        return;
                    }

                    try {
                        const role = user?.role;
                        const formattedData = data.map(req => {
                            let tabStatus = req.status || 'Pending';
                            if (role === 'AcademicSupervisor' || role === 'Academic Supervisor') {
                                if (req.status === 'Pending Supervisor') tabStatus = 'Pending';
                                else if (['Pending Dean', 'Approved'].includes(req.status)) tabStatus = 'Approved';
                                else if (['Rejected by Supervisor', 'Rejected by Dean', 'Rejected'].includes(req.status)) tabStatus = 'Rejected';
                            } else if (role === 'Dean') {
                                if (req.status === 'Pending Dean') tabStatus = 'Pending';
                                else if (req.status === 'Approved') tabStatus = 'Approved';
                                else if (['Rejected by Dean', 'Rejected'].includes(req.status)) tabStatus = 'Rejected';
                            } else if (role === 'FacultyStaff') {
                                if (req.status === 'Approved') tabStatus = 'Approved';
                            }

                            return {
                                id: req.id,
                                studentNumber: req.student_number || 'Missing Number',
                                name: req.student_name || 'Missing Name',
                                form: `Add/Drop Form (${(Number(req.sem1_credits) || 0) + (Number(req.sem2_credits) || 0)} Credits)`,
                                status: req.status || 'Pending',
                                tabStatus: tabStatus,
                                reason: req.reject_reason || '',
                                ...req
                            };
                        });

                        setRequests(formattedData);
                    } catch (mapError) {
                        setRequests([{ id: 998, studentNumber: 'MAP-ERR', name: mapError.message, status: 'Rejected' }]);
                    }
                } else {
                    const errorText = await response.text();
                    console.error("Failed to fetch add/drop requests:", errorText);
                    setRequests([{ id: 997, studentNumber: 'API-ERR', name: `${response.status} ${response.statusText}`, reason: errorText, status: 'Rejected' }]);
                }
            } catch (error) {
                console.error("Error fetching add/drop requests:", error);
                setRequests([{ id: 996, studentNumber: 'FETCH-ERR', name: error.message, status: 'Rejected' }]);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [user]);

    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // View Modal State
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewData, setViewData] = useState(null);

    // Filtering Logic
    const filteredRequests = requests.filter(request => {
        const matchesTab = activeTab === 'All' || request.tabStatus === activeTab;
        const matchesSearch =
            (request.studentNumber && request.studentNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (request.name && request.name.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesTab && matchesSearch;
    });

    // Actions
    const handleApprove = async (id) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/add-drop/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Approved' })
            });

            if (response.ok) {
                setRequests(requests.map(req =>
                    req.id === id ? { ...req, status: 'Approved' } : req
                ));
            } else {
                console.error("Failed to approve request");
            }
        } catch (error) {
            console.error("Error approving request:", error);
        }
    };

    const openRejectModal = (request) => {
        setSelectedRequest(request);
        setRejectionReason('');
        setRejectModalOpen(true);
    };

    const handleRejectSubmit = async () => {
        if (!selectedRequest) return;

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/add-drop/${selectedRequest.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Rejected', reason: rejectionReason })
            });

            if (response.ok) {
                setRequests(requests.map(req =>
                    req.id === selectedRequest.id ? { ...req, status: 'Rejected', reason: rejectionReason } : req
                ));
                setRejectModalOpen(false);
                setSelectedRequest(null);
            } else {
                console.error("Failed to reject request");
            }
        } catch (error) {
            console.error("Error rejecting request:", error);
        }
    };

    const openViewModal = (request) => {
        setViewData(request);
        setIsViewModalOpen(true);
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setViewData(null);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header and Controls */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 no-print">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                    {/* Tabs */}
                    <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg self-start">
                        {['All', 'Pending', 'Approved', 'Rejected'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-64">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Search Student..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden no-print">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                <th className="px-6 py-4">Student Number</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Form</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm md:text-base">
                            {filteredRequests.length > 0 ? (
                                filteredRequests.map((request) => (
                                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{request.studentNumber}</td>
                                        <td className="px-6 py-4 text-gray-700">{request.name}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => openViewModal(request)}
                                                className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded flex items-center gap-2 font-medium transition-colors"
                                            >
                                                📄 View Form
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${request.tabStatus === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                                request.tabStatus === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                                    'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                }`}>
                                                {request.status}
                                            </span>
                                            {request.tabStatus === 'Rejected' && request.reason && (
                                                <div className="mt-1 text-xs text-red-500 italic max-w-xs break-words">
                                                    "{request.reason}"
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {request.tabStatus === 'Pending' ? (
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => handleApprove(request.id)}
                                                        className="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                                                    >
                                                        ✅ Approve
                                                    </button>
                                                    <button
                                                        onClick={() => openRejectModal(request)}
                                                        className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                                                    >
                                                        ❌ Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">Review Complete</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <span className="text-3xl">📭</span>
                                            <p className="text-sm font-medium">No requests found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Rejection Modal */}
            {rejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in no-print">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-scale-in">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800">Reject Request</h3>
                            <button onClick={() => setRejectModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-600">
                                You are about to reject the request for <span className="font-bold text-gray-900">{selectedRequest?.name}</span>.
                                Please provide a reason.
                            </p>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="E.g., Course capacity reached, Academic standing issue..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm min-h-[100px]"
                            />
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                            <button
                                onClick={() => setRejectModalOpen(false)}
                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectSubmit}
                                disabled={!rejectionReason.trim()}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-red-500/30"
                            >
                                Send Reason & Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View PDF Modal */}
            {isViewModalOpen && viewData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4 print:p-0 print:bg-white overflow-y-auto">
                    <div className="bg-white shadow-2xl w-full max-w-4xl max-h-[90vh] print:max-h-full print:shadow-none relative flex flex-col my-auto rounded-xl print:rounded-none">

                        {/* Modal Header Toolbar (Not printed) */}
                        <div className="sticky top-0 bg-gray-900 text-white p-4 flex justify-between items-center rounded-t-xl print:hidden z-10">
                            <div className="font-medium flex items-center gap-2">
                                📄 Add/Drop Request - <span className="text-indigo-300">{viewData.studentNumber}</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handlePrint}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-sm font-semibold transition-colors flex items-center gap-2"
                                >
                                    🖨️ Print / Save PDF
                                </button>
                                <button
                                    onClick={closeViewModal}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-sm font-semibold transition-colors"
                                >
                                    ✕ Close
                                </button>
                            </div>
                        </div>

                        {/* PDF View Content Container */}
                        <div className="p-8 print:p-0 overflow-y-auto bg-gray-200/50 print:bg-white flex flex-col items-center flex-1" id="printable-pdf-area">

                            {/* PDF Paper Sheet */}
                            <div className="bg-white p-12 shadow-md border border-gray-200 w-full max-w-[210mm] min-h-[297mm] print:shadow-none print:border-none print:w-full">

                                {/* 1. HEADER */}
                                <div className="text-center mb-8 space-y-1">
                                    <h2 className="text-gray-900 font-serif text-xl font-bold">UNIVERSITY OF KELANIYA - SRI LANKA</h2>
                                    <h3 className="text-gray-900 font-serif text-lg font-semibold">FACULTY OF SCIENCE</h3>
                                    <h2 className="text-gray-900 font-serif text-xl font-bold underline decoration-2 underline-offset-4 mb-4 block mt-4">APPLICATION TO ADD/ DROP COURSE UNITS</h2>
                                    <h3 className="text-gray-900 font-serif text-lg font-semibold mt-4">SEMESTER II - ACADEMIC YEAR 2023/2024</h3>
                                </div>

                                {/* 2. STUDENT INFO */}
                                <div className="space-y-6 mb-8">
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-semibold uppercase font-serif whitespace-nowrap">STUDENT NUMBER:</span>
                                        <div className="flex gap-1 ml-2">
                                            {[...Array(12)].map((_, i) => (
                                                <div key={i} className="w-8 h-8 border border-gray-800 text-center font-bold text-xl uppercase flex items-center justify-center">
                                                    {viewData.studentNumber[i] || ''}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-semibold uppercase font-serif whitespace-nowrap">STUDENT NAME (Mr/Ms):</span>
                                        <div className="flex-1 border-b border-gray-400 border-dashed h-8 px-2 font-medium flex items-end pb-1">{viewData.name}</div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-semibold uppercase font-serif whitespace-nowrap">CONTACT NUMBER:</span>
                                        <div className="flex-1 border-b border-gray-400 border-dashed h-8 px-2 font-medium flex items-end pb-1">{viewData.contact_number || '-'}</div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-semibold uppercase font-serif whitespace-nowrap">EMAIL ADDRESS:</span>
                                        <div className="flex-1 border-b border-gray-400 border-dashed h-8 px-2 font-medium flex items-end pb-1 text-blue-800">{viewData.email || '-'}</div>
                                    </div>
                                </div>

                                {/* 3. COMBINATION */}
                                <div className="flex flex-wrap gap-12 mb-8 p-6 bg-gray-50/50 rounded-lg border border-gray-200 items-center justify-center print:bg-transparent print:border-none print:p-0 print:mb-8 print:justify-start">
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-semibold uppercase font-serif whitespace-nowrap">COURSE COMBINATION:</span>
                                        <div className="w-24 h-8 border border-gray-800 flex items-center justify-center font-bold">{viewData.combination || '-'}</div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-semibold uppercase font-serif whitespace-nowrap">YEAR:</span>
                                        <div className="w-24 h-8 border border-gray-800 flex items-center justify-center font-bold">{viewData.year || '-'}</div>
                                    </div>
                                </div>

                                {/* 4. ADD TABLE */}
                                <div className="mb-8 border border-black">
                                    <div className="border-b border-black text-center font-bold p-2 bg-gray-100 uppercase text-sm font-serif print:bg-gray-100/50">
                                        TO ADD A COURSE UNIT
                                    </div>
                                    <div className="grid bg-white" style={{ gridTemplateColumns: '1fr 1.5fr' }}>
                                        <div className="border-r border-black p-2 text-center text-xs font-bold border-b border-black font-serif">Course Unit</div>
                                        <div className="p-2 text-center text-xs font-bold border-b border-black font-serif">Recommendation of the relevant Senior Academic Advisor (Signature)</div>

                                        {[...Array(4)].map((_, idx) => (
                                            <React.Fragment key={idx}>
                                                <div className="border-r border-black border-b border-black last:border-b-0 h-10 flex items-center justify-center font-bold text-gray-800 uppercase tracking-widest">
                                                    {(viewData.added_courses && viewData.added_courses[idx]) || ''}
                                                </div>
                                                <div className="border-b border-black last:border-b-0 h-10 bg-gray-50/50 flex items-center justify-center"></div>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>

                                {/* 5. DROP TABLE */}
                                <div className="mb-10 border border-black">
                                    <div className="border-b border-black text-center font-bold p-2 bg-gray-100 uppercase text-sm font-serif print:bg-gray-100/50">
                                        TO DROP A COURSE UNIT
                                    </div>
                                    <div className="grid bg-white" style={{ gridTemplateColumns: '1fr 1.5fr' }}>
                                        <div className="border-r border-black p-2 text-center text-xs font-bold border-b border-black font-serif">Course Unit</div>
                                        <div className="p-2 text-center text-xs font-bold border-b border-black font-serif">Recommendation of the relevant Senior Academic Advisor (Signature)</div>

                                        {[...Array(4)].map((_, idx) => (
                                            <React.Fragment key={idx}>
                                                <div className="border-r border-black border-b border-black last:border-b-0 h-10 flex items-center justify-center font-bold text-gray-800 uppercase tracking-widest">
                                                    {(viewData.dropped_courses && viewData.dropped_courses[idx]) || ''}
                                                </div>
                                                <div className="border-b border-black last:border-b-0 h-10 bg-gray-50/50 flex items-center justify-center"></div>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>

                                {/* 6. CREDITS SUMMARY */}
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center justify-end w-full gap-4">
                                        <span className="text-sm font-semibold uppercase font-serif">Number of credits registered for Semester I:</span>
                                        <span className="font-bold">=</span>
                                        <div className="w-24 h-8 flex items-center justify-end px-2 font-bold">{viewData.sem1_credits || '0'}</div>
                                    </div>
                                    <div className="flex items-center justify-end w-full gap-4">
                                        <span className="text-sm font-semibold uppercase font-serif">Number of credits registered for Semester II:</span>
                                        <span className="font-bold">=</span>
                                        <div className="w-24 h-8 flex items-center justify-end px-2 font-bold">{viewData.sem2_credits || '0'}</div>
                                    </div>
                                    <div className="flex items-center justify-end w-full gap-4 pt-2 border-t border-dashed border-gray-400">
                                        <span className="text-sm font-semibold uppercase font-serif">Total number of credits registered for Academic Year 2023/2024:</span>
                                        <span className="font-bold">=</span>
                                        <div className="w-24 h-8 flex items-center justify-end px-2 font-bold text-lg">{viewData.total_credits || '0'}</div>
                                    </div>
                                </div>

                                {/* 7. DECLARATION */}
                                <div className="mb-8 text-sm font-serif leading-relaxed">
                                    <span className="font-bold">Declaration: </span>
                                    This is my final selection of course units for Semester II of 2023/2024, and I shall not change them for any reason after this date.
                                </div>

                                {/* 8. APPLICANT SIGNATURES */}
                                <div className="mb-16 mt-8 flex justify-between items-end gap-16">
                                    <div className="flex-1 text-center">
                                        <div className="h-8 border-b border-dashed border-black w-full text-center flex items-end justify-center pb-1 font-serif font-medium">
                                            {viewData.signature_date ? new Date(viewData.signature_date).toLocaleDateString() : '-'}
                                        </div>
                                        <div className="text-sm font-serif font-bold uppercase pt-2">Date</div>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <div className="h-8 border-b border-dashed border-black w-full text-center flex items-end justify-center pb-1 font-serif italic text-blue-900 shadow-sm signature-font">
                                            {viewData.signature || ''}
                                        </div>
                                        <div className="text-sm font-serif font-bold uppercase pt-2">Signature</div>
                                    </div>
                                </div>

                                {/* 9. DEAN SIGNATURES */}
                                <div className="mb-8 mt-12 flex justify-between items-end gap-16 relative pb-10 border-t border-gray-200 pt-10">
                                    <div className="flex-1 text-center">
                                        <div className="h-8 border-b border-dashed border-black w-full bg-gray-50/30"></div>
                                        <div className="text-sm font-serif font-bold uppercase pt-2">Date</div>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <div className="h-8 border-b border-dashed border-black w-full bg-gray-50/30"></div>
                                        <div className="text-sm font-serif font-bold uppercase pt-2">Signature of the Dean</div>
                                    </div>
                                    <div className="w-full text-left absolute bottom-0 left-0 text-[10px] italic font-serif text-gray-500">
                                        Office of the Dean – Faculty of Science, University of Kelaniya
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default AddDropApproval;
