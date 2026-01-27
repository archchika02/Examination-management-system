import { useState } from 'react';

const MedicalRepeatFormsSection = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedForm, setSelectedForm] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    // Mock Data
    const [forms, setForms] = useState([
        {
            id: 'M001',
            studentNo: 'IM/2022/025',
            studentName: 'Alice Smith',
            type: 'Medical',
            subDate: '2026-01-20',
            status: 'Pending',
            receiptUrl: '#',
            medicalUrl: '#'
        },
        {
            id: 'R001',
            studentNo: 'IM/2022/026',
            studentName: 'Bob Johnson',
            type: 'Repeat',
            subDate: '2026-01-18',
            status: 'Approved',
            receiptUrl: '#',
            medicalUrl: null
        },
        {
            id: 'M002',
            studentNo: 'IM/2022/027',
            studentName: 'Charlie Brown',
            type: 'Medical',
            subDate: '2026-01-22',
            status: 'Rejected',
            receiptUrl: '#',
            medicalUrl: '#',
            rejectionReason: 'Invalid medical certificate'
        },
        {
            id: 'R002',
            studentNo: 'IM/2022/028',
            studentName: 'Diana Prince',
            type: 'Repeat',
            subDate: '2026-01-24',
            status: 'Pending',
            receiptUrl: '#',
            medicalUrl: null
        },
        {
            id: 'M003',
            studentNo: 'IM/2022/029',
            studentName: 'Evan Wright',
            type: 'Medical',
            subDate: '2026-01-25',
            status: 'Pending',
            receiptUrl: '#',
            medicalUrl: '#'
        }
    ]);

    const handleApprove = (id) => {
        setForms(forms.map(form =>
            form.id === id ? { ...form, status: 'Approved' } : form
        ));
    };

    const handleRejectClick = (form) => {
        setSelectedForm(form);
        setRejectReason('');
        setShowRejectModal(true);
    };

    const confirmReject = () => {
        if (!rejectReason.trim()) return; // Prevent empty reasons
        setForms(forms.map(form =>
            form.id === selectedForm.id ? { ...form, status: 'Rejected', rejectionReason: rejectReason } : form
        ));
        setShowRejectModal(false);
        setSelectedForm(null);
    };

    const openDocument = (url, docName) => {
        // In a real app, this would open the PDF. Here we'll just mock it.
        alert(`Opening ${docName}... (Mock PDF Viewer)`);
    };

    // Filter Logic
    const filteredForms = forms.filter(form => {
        const matchesSearch = form.studentNo.includes(searchTerm) || form.studentName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || form.status === statusFilter;
        const matchesType = typeFilter === 'All' || form.type === statusFilter; // Wait, type logic needs correction
        // Fixed type filter:
        const matchesTypeFixed = typeFilter === 'All' || form.type === typeFilter;

        return matchesSearch && matchesStatus && matchesTypeFixed;
    });

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Medical / Repeat Forms</h2>
                    <p className="text-gray-500 text-sm mt-1">Review and validate student requests.</p>
                </div>
            </div>

            {/* Controls Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="md:col-span-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Search Student</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Student Number..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                        </div>
                    </div>

                    {/* Filter Type */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Form Type</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="All">All Types</option>
                            <option value="Medical">Medical Form</option>
                            <option value="Repeat">Repeat Form</option>
                        </select>
                    </div>

                    {/* Filter Status */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    {/* Reset Button (Optional but good for UX) */}
                    <div className="flex items-end">
                        <button
                            onClick={() => { setSearchTerm(''); setStatusFilter('All'); setTypeFilter('All'); }}
                            className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Form Type</th>
                                <th className="px-6 py-4">Documents</th>
                                <th className="px-6 py-4">Date Submitted</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredForms.length > 0 ? (
                                filteredForms.map((form) => (
                                    <tr key={form.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">{form.studentNo}</div>
                                            <div className="text-gray-500 text-xs">{form.studentName}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                ${form.type === 'Medical' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                                {form.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 space-y-2">
                                            <button
                                                onClick={() => openDocument(form.receiptUrl, 'Payment Receipt')}
                                                className="flex items-center text-xs text-gray-600 hover:text-blue-600 transition-colors bg-gray-100 hover:bg-blue-50 px-2 py-1 rounded border border-gray-200"
                                            >
                                                📄 View Receipt
                                            </button>
                                            {form.type === 'Medical' && (
                                                <button
                                                    onClick={() => openDocument(form.medicalUrl, 'Medical Letter')}
                                                    className="flex items-center text-xs text-gray-600 hover:text-red-600 transition-colors bg-gray-100 hover:bg-red-50 px-2 py-1 rounded border border-gray-200"
                                                >
                                                    🏥 View Medical Letter
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {form.subDate}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                ${form.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    form.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                                {form.status === 'Approved' && '✓ '}
                                                {form.status === 'Rejected' && '✕ '}
                                                {form.status === 'Pending' && '⏳ '}
                                                {form.status}
                                            </span>
                                            {form.status === 'Rejected' && (
                                                <div className="text-xs text-red-500 mt-1 max-w-[150px] truncate" title={form.rejectionReason}>
                                                    Reason: {form.rejectionReason}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => openDocument('#', 'Full Application Form')}
                                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="View Form"
                                                >
                                                    <span className="text-lg">👁️</span>
                                                </button>

                                                {form.status === 'Pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(form.id)}
                                                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                                            title="Approve"
                                                        >
                                                            <span className="text-lg">✅</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectClick(form)}
                                                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                            title="Reject"
                                                        >
                                                            <span className="text-lg">🚫</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center">
                                            <span className="text-4xl mb-3">🔍</span>
                                            <p className="text-lg font-medium">No forms found</p>
                                            <p className="text-sm">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Visual Only) */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <div>Showing {filteredForms.length} entries</div>
                    <div className="flex space-x-1">
                        <button className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 bg-blue-600 text-white border border-blue-600 rounded">1</button>
                        <button className="px-3 py-1 border rounded hover:bg-gray-50">2</button>
                        <button className="px-3 py-1 border rounded hover:bg-gray-50">Next</button>
                    </div>
                </div>
            </div>

            {/* Reject Reason Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-scale-up">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-red-50/50">
                            <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
                                🚫 Reject Request
                            </h3>
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                                <p className="text-gray-500">Rejecting request for:</p>
                                <div className="font-semibold text-gray-800 mt-1">
                                    {selectedForm?.studentName} ({selectedForm?.studentNo})
                                </div>
                                <div className="text-xs text-gray-400 mt-1">{selectedForm?.type} Form • {selectedForm?.subDate}</div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Rejection</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm min-h-[100px]"
                                    placeholder="Please provide details for the rejection..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    autoFocus
                                ></textarea>
                            </div>

                            <div className="text-xs text-gray-500 flex items-start gap-2 bg-blue-50 p-3 rounded text-blue-700">
                                <span>ℹ️</span>
                                <p>The student will be notified immediately. This action cannot be undone once confirmed.</p>
                            </div>
                        </div>

                        <div className="p-6 pt-2 flex gap-3">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReject}
                                disabled={!rejectReason.trim()}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-lg shadow-red-500/30 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicalRepeatFormsSection;
