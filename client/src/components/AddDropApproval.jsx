import React, { useState } from 'react';

const AddDropApproval = () => {
    // Mock Data
    const [requests, setRequests] = useState([
        { id: 1, studentNumber: 'S12345', name: 'John Doe', form: 'add_drop_form_1.pdf', status: 'Pending', reason: '' },
        { id: 2, studentNumber: 'S67890', name: 'Jane Smith', form: 'add_drop_form_2.pdf', status: 'Approved', reason: '' },
        { id: 3, studentNumber: 'S11223', name: 'Alice Johnson', form: 'add_drop_form_3.pdf', status: 'Rejected', reason: 'Course full' },
        { id: 4, studentNumber: 'S44556', name: 'Bob Brown', form: 'add_drop_form_4.pdf', status: 'Pending', reason: '' },
        { id: 5, studentNumber: 'S77889', name: 'Charlie Davis', form: 'add_drop_form_5.pdf', status: 'Pending', reason: '' },
    ]);

    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Filtering Logic
    const filteredRequests = requests.filter(request => {
        const matchesTab = activeTab === 'All' || request.status === activeTab;
        const matchesSearch =
            request.studentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    // Actions
    const handleApprove = (id) => {
        setRequests(requests.map(req =>
            req.id === id ? { ...req, status: 'Approved' } : req
        ));
    };

    const openRejectModal = (request) => {
        setSelectedRequest(request);
        setRejectionReason('');
        setRejectModalOpen(true);
    };

    const handleRejectSubmit = () => {
        if (!selectedRequest) return;
        setRequests(requests.map(req =>
            req.id === selectedRequest.id ? { ...req, status: 'Rejected', reason: rejectionReason } : req
        ));
        setRejectModalOpen(false);
        setSelectedRequest(null);
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header and Controls */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                                            <a href="#" className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 font-medium">
                                                📄 {request.form}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${request.status === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                                    request.status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                                        'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                }`}>
                                                {request.status}
                                            </span>
                                            {request.status === 'Rejected' && request.reason && (
                                                <div className="mt-1 text-xs text-red-500 italic max-w-xs break-words">
                                                    "{request.reason}"
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {request.status === 'Pending' ? (
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
                                                <span className="text-gray-400 text-xs italic">No actions available</span>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
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
        </div>
    );
};

export default AddDropApproval;
