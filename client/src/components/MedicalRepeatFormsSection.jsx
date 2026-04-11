import { useState, useEffect, useMemo, useRef } from 'react';
import { generateMedicalRepeatPDF } from '../utils/pdfGenerator';
import { fetchDeadlines, getDeadlineForForm } from '../utils/deadlineHelper';

const Icons = {
    Search: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    ),
    Filter: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
    ),
    Eye: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
    ),
    Check: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    ),
    X: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    ),
    FileText: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
    ),
    Hospital: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6v4"/><path d="M14 14h-4"/><path d="M14 18h-4"/><path d="M14 8h-4"/><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/></svg>
    ),
    Empty: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
    )
};

const MedicalRepeatFormsSection = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedForm, setSelectedForm] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const [showViewModal, setShowViewModal] = useState(false);
    const [viewFormDetails, setViewFormDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchForms = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/medical-repeat', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const mappedForms = data.map(item => ({
                    id: item.id,
                    studentNo: item.student_number || '',
                    studentName: item.student_name || '',
                    type: item.form_type || 'Unknown',
                    subDate: new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    status: item.status || 'Pending',
                    receiptUrl: item.payment_receipt_url || '#',
                    medicalUrl: item.medical_certificate_url || '#',
                    rejectionReason: item.reject_reason || ''
                }));
                setForms(mappedForms);
            }
        } catch (error) {
            console.error("Error fetching forms:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchForms();
    }, []);

    const handleApprove = async (id) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/medical-repeat/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Approved' })
            });

            if (response.ok) {
                setForms(forms.map(form =>
                    form.id === id ? { ...form, status: 'Approved' } : form
                ));
            }
        } catch (error) {
            console.error("Error approving form:", error);
        }
    };

    const handleRejectClick = (form) => {
        setSelectedForm(form);
        setRejectReason('');
        setShowRejectModal(true);
    };

    const confirmReject = async () => {
        if (!rejectReason.trim()) return;
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/medical-repeat/${selectedForm.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Rejected', reject_reason: rejectReason })
            });

            if (response.ok) {
                setForms(forms.map(form =>
                    form.id === selectedForm.id ? { ...form, status: 'Rejected', rejectionReason: rejectReason } : form
                ));
                setShowRejectModal(false);
                setSelectedForm(null);
            }
        } catch (error) {
            console.error("Error rejecting form:", error);
        }
    };

    const openDocument = (url, docName) => {
        if (url && url !== '#') {
            const fullUrl = url.startsWith('/uploads') ? `http://localhost:5000${url}` : url;
            window.open(fullUrl, '_blank');
        } else {
            alert(`No ${docName} attached.`);
        }
    };

    const handleViewForm = async (id) => {
        setLoadingDetails(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/medical-repeat/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                
                // Fetch deadlines and inject the matching deadline Date
                const deadlines = await fetchDeadlines();
                const academicYear = data.academic_year || '';
                data.deadlineDate = getDeadlineForForm('Medical/Repeat Form', academicYear, deadlines);

                const doc = await generateMedicalRepeatPDF(data);
                window.open(doc.output('bloburl'), '_blank');
            }
        } catch (error) {
            console.error("Error fetching form details:", error);
            alert("Failed to generate document preview.");
        } finally {
            setLoadingDetails(false);
            setShowViewModal(false);
        }
    };

    const filteredForms = useMemo(() => {
        return forms.filter(form => {
            const matchesSearch = form.studentNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                               (form.studentName && form.studentName.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesStatus = statusFilter === 'All' || form.status === statusFilter;
            const matchesType = typeFilter === 'All' || form.type === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [searchTerm, statusFilter, typeFilter, forms]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved': return <span className="bg-emerald-50 text-emerald-700 py-1 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-emerald-100 italic">Validated</span>;
            case 'Rejected': return <span className="bg-rose-50 text-rose-700 py-1 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-rose-100 italic">Disputed</span>;
            case 'Pending': return <span className="bg-amber-50 text-amber-700 py-1 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-amber-100 animate-pulse italic">Inspection Required</span>;
            default: return <span className="bg-slate-50 text-slate-500 py-1 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-100 italic">{status}</span>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up flex flex-col h-full pb-10">
            {/* Header Section */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Medical & Repeat Registry</h2>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Log of student medical certificates and course repeat applications.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Type Filter */}
                        <div className="relative group w-full sm:w-auto">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <Icons.Filter />
                            </span>
                            <select
                                className="pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider focus:ring-4 focus:ring-blue-700/5 focus:border-blue-700 transition-all appearance-none cursor-pointer outline-none w-full sm:w-40"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option value="All">All Types</option>
                                <option value="Medical">Medical</option>
                                <option value="Repeat">Repeat</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="relative group w-full sm:w-auto">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <Icons.Filter />
                            </span>
                            <select
                                className="pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider focus:ring-4 focus:ring-blue-700/5 focus:border-blue-700 transition-all appearance-none cursor-pointer outline-none w-full sm:w-40"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Records</option>
                                <option value="Pending">Pending Audit</option>
                                <option value="Approved">Validated</option>
                                <option value="Rejected">Disputed</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative group w-full sm:w-64">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-700 transition-colors">
                                <Icons.Search />
                            </span>
                            <input
                                type="text"
                                placeholder="SEARCH REGISTRY..."
                                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-700/5 focus:border-blue-700 transition-all w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-0">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-md z-10">
                            <tr className="border-b border-slate-100 text-[10px] uppercase text-slate-400 font-bold tracking-widest">
                                <th className="px-8 py-5">Applicant</th>
                                <th className="px-8 py-5">Context</th>
                                <th className="px-8 py-5">Documentation</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Administrative Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-6 h-6 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Querying System...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredForms.length > 0 ? (
                                filteredForms.map((form) => (
                                    <tr key={form.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <div className="text-sm font-bold text-slate-900 tracking-tight">{form.studentName}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{form.studentNo}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-left">
                                            <div className="flex flex-col gap-1">
                                                <span className={`inline-block w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${form.type === 'Medical' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                                                    {form.type}
                                                </span>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{form.subDate}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => openDocument(form.receiptUrl, 'Payment Receipt')}
                                                    className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tight bg-slate-50 px-2 py-1.5 rounded border border-slate-100 hover:bg-slate-100 transition-all w-fit"
                                                >
                                                    <Icons.FileText />
                                                    <span>Receipt</span>
                                                </button>
                                                {form.type === 'Medical' && (
                                                    <button
                                                        onClick={() => openDocument(form.medicalUrl, 'Medical Letter')}
                                                        className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tight bg-slate-50 px-2 py-1.5 rounded border border-slate-100 hover:bg-slate-100 transition-all w-fit"
                                                    >
                                                        <Icons.Hospital />
                                                        <span>Certificate</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {getStatusBadge(form.status)}
                                            {form.status === 'Rejected' && (
                                                <div className="text-[10px] text-rose-500 font-bold uppercase mt-1 italic max-w-[150px] truncate" title={form.rejectionReason}>
                                                    Reason: {form.rejectionReason}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewForm(form.id)}
                                                    className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all flex items-center gap-2"
                                                >
                                                    <Icons.Eye />
                                                    <span>Review</span>
                                                </button>
                                                {form.status === 'Pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(form.id)}
                                                            className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all flex items-center gap-2 border border-emerald-100"
                                                        >
                                                            <Icons.Check />
                                                            <span>Approve</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectClick(form)}
                                                            className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all flex items-center gap-2 border border-rose-100"
                                                        >
                                                            <Icons.X />
                                                            <span>Reject</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-40">
                                            <Icons.Empty />
                                            <div className="mt-4">
                                                <p className="text-sm font-bold text-slate-900 tracking-tight">Registry Exhausted</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">No modification records identified</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Registry Summary: {filteredForms.length} Records</span>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md animate-scale-up border border-slate-200">
                        <div className="p-8">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Issue Registry Dispute</h3>
                            <p className="text-xs text-slate-500 font-medium mb-6">
                                Provide substantial reasoning for the rejection of <span className="font-bold text-slate-900">{selectedForm?.studentNo}</span>'s submission.
                            </p>

                            <textarea
                                className="w-full border border-slate-200 rounded-2xl p-4 text-xs font-medium focus:ring-4 focus:ring-rose-700/5 focus:border-rose-700 outline-none transition-all bg-slate-50/50 min-h-[120px]"
                                placeholder="DOCUMENT REASONING HERE..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            ></textarea>

                            <div className="flex justify-end gap-4 mt-8">
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                    className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmReject}
                                    disabled={!rejectReason.trim()}
                                    className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-lg shadow-rose-100 ${!rejectReason.trim() ? 'opacity-50 cursor-not-allowed shadow-none' : ''}`}
                                >
                                    Confirm Dispute
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Form Modal */}
            {showViewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-scale-up border border-slate-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                                <Icons.FileText />
                                <span>Administrative Audit</span>
                            </h3>
                            <button
                                onClick={() => { setShowViewModal(false); setViewFormDetails(null); }}
                                className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-all text-xl"
                            >
                                <Icons.X />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto scrollbar-hide">
                            {loadingDetails ? (
                                <div className="flex flex-col items-center justify-center h-40 gap-3">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compiling Record...</span>
                                </div>
                            ) : viewFormDetails ? (
                                <div className="space-y-10 animate-fade-in">
                                    {/* Student Info Section */}
                                    <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 pb-2 border-b border-slate-200">Applicant Identification</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                            <div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-1">Full Name</div>
                                                <div className="text-sm font-bold text-slate-900">{viewFormDetails.student_name}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-1">Student Index</div>
                                                <div className="text-sm font-bold text-slate-900">{viewFormDetails.student_number}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-1">Official Email</div>
                                                <div className="text-sm font-bold text-slate-900">{viewFormDetails.email}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-1">Contact Terminal</div>
                                                <div className="text-sm font-bold text-slate-900">{viewFormDetails.contact_number}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-1">Audit Categorization</div>
                                                <div className="mt-1">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${viewFormDetails.form_type === 'Medical' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                                                        {viewFormDetails.form_type}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-1">Current Validation</div>
                                                <div className="mt-1">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border
                                                    ${viewFormDetails.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                            viewFormDetails.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                                'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                        {viewFormDetails.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Courses Section */}
                                    <div>
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 pb-2 border-b border-slate-200">Academic Context</h4>
                                        <div className="overflow-hidden border border-slate-100 rounded-3xl bg-white shadow-sm">
                                            <table className="min-w-full divide-y divide-slate-100">
                                                <thead className="bg-slate-50/50">
                                                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        <th className="px-8 py-4 text-left">Course Identifier</th>
                                                        <th className="px-8 py-4 text-left">Academic Year</th>
                                                        <th className="px-8 py-4 text-left">Result Record</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {viewFormDetails.courses && viewFormDetails.courses.length > 0 ? (
                                                        viewFormDetails.courses.map(course => (
                                                            <tr key={course.id} className="text-xs font-medium text-slate-600">
                                                                <td className="px-8 py-4 font-bold text-slate-900">{course.course_code}</td>
                                                                <td className="px-8 py-4">{course.academic_year || 'N/A'}</td>
                                                                <td className="px-8 py-4 italic">{course.results_obtained || 'Pending'}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="3" className="px-8 py-8 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">No associated course units identified.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Documents Preview Section */}
                                    <div className="bg-blue-50/20 p-8 rounded-[2rem] border border-blue-50">
                                        <h4 className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-6 pb-2 border-b border-blue-100">Registry Documentation</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <button
                                                onClick={() => openDocument(viewFormDetails.payment_receipt_url, 'Payment Receipt')}
                                                className="flex flex-col items-center justify-center p-8 bg-white border border-slate-100 rounded-[2rem] hover:border-blue-700 hover:shadow-xl hover:shadow-blue-700/5 transition-all group"
                                            >
                                                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors mb-4">
                                                    <Icons.FileText />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest group-hover:text-blue-700">Official Receipt</span>
                                                <span className="text-[8px] text-slate-400 font-bold uppercase mt-1">Transaction Proof</span>
                                            </button>

                                            {viewFormDetails.form_type === 'Medical' && (
                                                <button
                                                    onClick={() => openDocument(viewFormDetails.medical_certificate_url, 'Medical Certificate')}
                                                    className="flex flex-col items-center justify-center p-8 bg-white border border-slate-100 rounded-[2rem] hover:border-rose-700 hover:shadow-xl hover:shadow-rose-700/5 transition-all group"
                                                >
                                                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-700 transition-colors mb-4">
                                                        <Icons.Hospital />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest group-hover:text-rose-700">Medical Authentication</span>
                                                    <span className="text-[8px] text-slate-400 font-bold uppercase mt-1">Certificate Record</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                <div className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-12 italic">
                                    System record synchronization failure.
                                </div>
                            )}
                        </div>

                        <div className="px-8 py-4 border-t border-slate-100 bg-white flex justify-between items-center">
                            <div>
                                {viewFormDetails?.status === 'Pending' && (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => {
                                                setShowViewModal(false);
                                                handleRejectClick({
                                                    id: viewFormDetails.id,
                                                    studentName: viewFormDetails.student_name,
                                                    studentNo: viewFormDetails.student_number,
                                                    type: viewFormDetails.form_type,
                                                    subDate: new Date(viewFormDetails.created_at).toLocaleDateString('en-GB')
                                                });
                                            }}
                                            className="px-6 py-2 bg-white border border-rose-200 text-rose-700 rounded-xl hover:bg-rose-50 transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                                        >
                                            <Icons.X />
                                            <span>Issue Dispute</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowViewModal(false);
                                                handleApprove(viewFormDetails.id);
                                            }}
                                            className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-100"
                                        >
                                            <Icons.Check />
                                            <span>Authorize Record</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => { setShowViewModal(false); setViewFormDetails(null); }}
                                className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all text-[10px] font-bold uppercase tracking-widest"
                            >
                                Close Audit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicalRepeatFormsSection;
