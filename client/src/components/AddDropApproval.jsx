import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Local SVG Icon Library for professional look
const Icons = {
    Search: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
    ),
    View: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>
    ),
    Check: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
    ),
    X: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
    ),
    Vault: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="12" cy="12" r="3" /><path d="m14 10 2-2" /><path d="m14 14 2 2" /><path d="m10 14-2 2" /><path d="m10 10-2-2" /></svg>
    ),
    Printer: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" /></svg>
    ),
    Alert: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" /></svg>
    )
};

import { generateAddDropPDF } from '../utils/pdfGenerator';
import { fetchDeadlines, getDeadlineForForm } from '../utils/deadlineHelper';

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
                    console.log('[AddDropApproval] Raw API response length:', Array.isArray(data) ? data.length : typeof data, data);

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
                            } else if (role === 'FacultyStaff' || role === 'Faculty Staff') {
                                if (req.status.includes('Pending')) tabStatus = 'Pending';
                                else if (req.status === 'Approved') tabStatus = 'Approved';
                                else if (req.status.includes('Rejected')) tabStatus = 'Rejected';
                                else tabStatus = req.status; // Fallback
                            }

                            return {
                                ...req,
                                studentNumber: req.student_number || 'Missing Number',
                                name: req.student_name || 'Missing Name',
                                form: `Add/Drop Form (${(Number(req.sem1_credits) || 0) + (Number(req.sem2_credits) || 0)} Credits)`,
                                status: req.status || 'Pending',
                                tabStatus: tabStatus,
                                reason: req.reject_reason || '',
                            };
                        });

                        console.log('[AddDropApproval] Formatted data length:', formattedData.length);
                        setRequests(formattedData);
                    } catch (mapError) {
                        console.error('[AddDropApproval] Map error:', mapError);
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

    const openViewModal = async (request) => {
        try {
            const requestWithRaw = { ...request };

            // Fetch deadlines and inject the matching deadline Date
            const deadlines = await fetchDeadlines();
            const academicYear = requestWithRaw.academic_year || requestWithRaw.year || '';
            requestWithRaw.deadlineDate = getDeadlineForForm('Add/Drop Form', academicYear, deadlines);

            const doc = await generateAddDropPDF(requestWithRaw);
            window.open(doc.output('bloburl'), '_blank');
        } catch (error) {
            console.error("PDF Preview Error:", error);
            alert("Failed to generate PDF preview.");
        }
    };

    const closeViewModal = () => {
        // No longer needed
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
            {/* Header and Controls */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 no-print">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Course code Modifications</h2>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Review and validate student requests for course additions and drops.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Premium Segmented Tabs */}
                        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                            {['All', 'Pending', 'Approved', 'Rejected'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${activeTab === tab
                                        ? 'bg-white text-blue-700 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative w-full sm:w-64 group">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-700 transition-colors">
                                <Icons.Search />
                            </span>
                            <input
                                type="text"
                                placeholder="Search Student ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700/5 focus:border-blue-700 transition-all text-sm font-semibold placeholder:text-slate-400"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Data Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden no-print">
                <div className="overflow-x-auto overflow-y-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                                <th className="px-6 py-4">Submission Identity</th>
                                <th className="px-6 py-4">Form Details</th>
                                <th className="px-6 py-4 text-center">Status Badge</th>
                                <th className="px-6 py-4 text-right">Administrative Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredRequests.length > 0 ? (
                                filteredRequests.map((request) => (
                                    <tr key={request.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 tracking-tight">{request.studentNumber}</span>
                                                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">{request.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => openViewModal(request)}
                                                className="text-blue-700 hover:text-blue-900 font-bold text-xs flex items-center gap-1 group"
                                                title="View Form Details"
                                            >
                                                <span className="group-hover:translate-x-0.5 transition-transform">View Form →</span>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border shadow-sm ${request.tabStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        request.tabStatus === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                            'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}>
                                                    {request.status.replace('Pending ', '')}
                                                </span>
                                                {request.tabStatus === 'Rejected' && request.reason && (
                                                    <div className="mt-1 text-[10px] text-rose-500 font-medium italic max-w-[150px] truncate group-hover:whitespace-normal transition-all">
                                                        "{request.reason}"
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {request.tabStatus === 'Pending' && user?.role !== 'Faculty Staff' && user?.role !== 'FacultyStaff' ? (
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleApprove(request.id)}
                                                        className="px-4 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 flex items-center gap-2"
                                                    >
                                                        <Icons.Check /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => openRejectModal(request)}
                                                        className="px-4 py-1.5 bg-white text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2"
                                                    >
                                                        <Icons.X /> Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-[10px] font-bold italic uppercase tracking-wider pr-4">
                                                    {(user?.role === 'Faculty Staff' || user?.role === 'FacultyStaff') && request.tabStatus === 'Pending'
                                                        ? 'AWAITING APPROVAL'
                                                        : 'Record Archived'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <span className="text-slate-200">
                                                <Icons.Vault />
                                            </span>
                                            <div className="space-y-1">
                                                <p className="text-slate-900 font-bold tracking-tight">Registry Clear</p>
                                                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">No matching records discovered</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Professional Rejection Modal */}
            {rejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in no-print p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in border border-slate-100">
                        <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-white relative">
                            <div className="absolute top-0 left-10 h-1.5 w-20 bg-rose-500 rounded-b-full"></div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Decline Application</h3>
                                <p className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-wider">Administrative Action</p>
                            </div>
                            <button onClick={() => setRejectModalOpen(false)} className="h-10 w-10 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 transition-colors">
                                <Icons.X />
                            </button>
                        </div>
                        <div className="p-10 space-y-6">
                            <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100 flex items-start gap-4">
                                <span className="text-rose-600">
                                    <Icons.Alert />
                                </span>
                                <p className="text-xs text-rose-700 font-medium leading-relaxed">
                                    Declining request for <span className="text-slate-900 font-bold">{selectedRequest?.studentNumber}</span>.
                                    A precise rationale must be communicated to the applicant.
                                </p>
                            </div>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Specify reason for rejection..."
                                className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-400 transition-all text-sm font-semibold min-h-[140px] placeholder:text-slate-300"
                            />
                        </div>
                        <div className="px-10 py-8 bg-slate-50/50 flex justify-end gap-3">
                            <button
                                onClick={() => setRejectModalOpen(false)}
                                className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition-all shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectSubmit}
                                disabled={!rejectionReason.trim()}
                                className="px-8 py-3 bg-rose-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-rose-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-rose-600/10 active:scale-95"
                            >
                                Submit Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal Removed: Now opens in standalone webpage */}
        </div>
    );
};

export default AddDropApproval;
