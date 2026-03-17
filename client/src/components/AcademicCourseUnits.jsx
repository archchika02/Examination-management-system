import { useState, useEffect, useRef, useMemo } from 'react';
import { generateCourseUnitPDF } from '../utils/pdfGenerator';

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
    Download: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
    ),
    Empty: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
    )
};

const AcademicCourseUnits = () => {
    const [registrations, setRegistrations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [loading, setLoading] = useState(true);

    // Modal State
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    // Fetch data from backend
    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:5000/api/course-registration/list');
            const data = await res.json();
            const mappedData = data.map(dbRow => {
                const stNo = dbRow.student_number?.startsWith('IM/') ? dbRow.student_number : `IM/${dbRow.student_number || ''}`;
                return {
                    id: dbRow.id,
                    studentNumber: stNo,
                    studentName: dbRow.student_name,
                    formName: `CourseReg_${stNo.replace(/[^a-zA-Z0-9]/g, '')}`,
                    courseUnits: dbRow.courses || [],
                    totalCredits: dbRow.total_credits,
                    dateSubmitted: new Date(dbRow.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    status: dbRow.status,
                    signature: dbRow.signature,
                    address: dbRow.address || '',
                    mobile: dbRow.mobile || '',
                    email: dbRow.email || '',
                    rejectReason: dbRow.reject_reason || '',
                    form_data: typeof dbRow.form_data === 'string' ? JSON.parse(dbRow.form_data) : dbRow.form_data
                };
            });
            setRegistrations(mappedData);
        } catch (error) {
            console.error("Error fetching registrations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistrations();
    }, []);

    // Filter Logic
    const filteredRegistrations = useMemo(() => {
        return registrations.filter(reg => {
            const matchesSearch = reg.studentNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                reg.studentName?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'All' || reg.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, filterStatus, registrations]);

    // Actions
    const handleApprove = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/course-registration/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Approved' })
            });
            if (res.ok) fetchRegistrations();
        } catch (err) {
            console.error("Error approving:", err);
        }
    };

    const initiateReject = (reg) => {
        setSelectedRegistration(reg);
        setRejectReason('');
        setRejectModalOpen(true);
    };

    const confirmReject = async () => {
        if (selectedRegistration) {
            try {
                const res = await fetch(`http://localhost:5000/api/course-registration/${selectedRegistration.id}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'Rejected', reject_reason: rejectReason })
                });
                if (res.ok) {
                    fetchRegistrations();
                    setRejectModalOpen(false);
                    setSelectedRegistration(null);
                }
            } catch (err) {
                console.error("Error rejecting:", err);
            }
        }
    };

    const initiateView = async (reg) => {
        try {
            const doc = await generateCourseUnitPDF(reg);
            window.open(doc.output('bloburl'), '_blank');
        } catch (error) {
            console.error("PDF Preview Error:", error);
            alert("Failed to generate document preview.");
        }
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved': return <span className="bg-emerald-50 text-emerald-700 py-1 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-emerald-100 italic">Validated</span>;
            case 'Rejected': return <span className="bg-rose-50 text-rose-700 py-1 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-rose-100 italic">Disputed</span>;
            case 'Pending': return <span className="bg-amber-50 text-amber-700 py-1 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-amber-100 animate-pulse italic">Inspection Required</span>;
            default: return <span className="bg-slate-50 text-slate-500 py-1 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-100 italic">{status}</span>;
        }
    };

    const formatForReadOnlyForm = (reg) => {
        const formatted = {
            st_name_cr: reg.studentName || '',
            level: '1',
            mobile: reg.mobile,
            email_cr: reg.email,
            address: reg.address,
            signature: reg.signature,
            dateSubmitted: reg.dateSubmitted
        };

        const dbStNo = reg.studentNumber || '';
        const rawDigits = dbStNo.replace(/^IM\//, '');

        for (let i = 0; i < rawDigits.length && i < 8; i++) {
            formatted[`st_no_cr_${i}`] = rawDigits[i];
        }

        const gridRowCounters = {};
        reg.courseUnits.forEach((course) => {
            let courseTypeStr = (course.course_type || course.type || '').toLowerCase();
            let gridPrefix = courseTypeStr.includes('compulsory') ? 'Grid_Comp' : courseTypeStr.includes('optional') ? 'Grid_Opt' : 'Grid_Aux';
            let semSuffix = course.semester === 1 ? '_S1' : '_S2';
            let gridId = `${gridPrefix}${semSuffix}`;
            if (gridRowCounters[gridId] === undefined) gridRowCounters[gridId] = 0;
            let rowIndex = gridRowCounters[gridId]++;
            const code = course.course_code;
            if (code) {
                for (let c = 0; c < code.length && c < 12; c++) {
                    formatted[`${gridId}_${rowIndex}_${c}`] = code[c];
                }
            }
        });

        formatted.cred_comp_total = reg.totalCredits;
        formatted.total_creds_box = reg.totalCredits;
        return formatted;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up flex flex-col h-full pb-10">
            {/* Header Section */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Course Registration Registry</h2>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Official logs of student course unit registrations for the semester.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Status Filter */}
                        <div className="relative group w-full sm:w-auto">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <Icons.Filter />
                            </span>
                            <select
                                className="pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider focus:ring-4 focus:ring-blue-700/5 focus:border-blue-700 transition-all appearance-none cursor-pointer outline-none w-full sm:w-48"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
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
                                <th className="px-8 py-5">Academic Record</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Administrative Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-6 h-6 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Querying System...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRegistrations.length > 0 ? (
                                filteredRegistrations.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5 text-left">
                                            <div className="flex flex-col">
                                                <div className="text-sm font-bold text-slate-900 tracking-tight">{reg.studentName}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{reg.studentNumber}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="text-xs text-slate-600 font-bold uppercase tracking-tight">{reg.dateSubmitted}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {getStatusBadge(reg.status)}
                                            {reg.status === 'Rejected' && reg.rejectReason && (
                                                <div className="text-[10px] text-rose-500 font-bold uppercase mt-1 italic max-w-[150px] truncate" title={reg.rejectReason}>
                                                    Reason: {reg.rejectReason}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => initiateView(reg)}
                                                    className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all flex items-center gap-2"
                                                >
                                                    <Icons.Eye />
                                                    <span>Review</span>
                                                </button>
                                                {reg.status === 'Pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(reg.id)}
                                                            className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all flex items-center gap-2 border border-emerald-100"
                                                        >
                                                            <Icons.Check />
                                                            <span>Approve</span>
                                                        </button>
                                                        <button
                                                            onClick={() => initiateReject(reg)}
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
                                    <td colSpan="4" className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-40">
                                            <Icons.Empty />
                                            <div className="mt-4">
                                                <p className="text-sm font-bold text-slate-900 tracking-tight">No Submissions Detected</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Registry is currently void</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Registry Summary: {filteredRegistrations.length} Records</span>
                </div>
            </div>

            {/* View Modal */}
            {viewModalOpen && selectedRegistration && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-scale-up border border-slate-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Course Registration Document</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{selectedRegistration.studentName} | {selectedRegistration.studentNumber}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => downloadPDF(selectedRegistration)}
                                    className="px-4 py-2 bg-blue-700 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-800 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
                                >
                                    <Icons.Download />
                                    <span>Download Source</span>
                                </button>
                                <button
                                    onClick={() => setViewModalOpen(false)}
                                    className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-all"
                                >
                                    <Icons.X />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-slate-100/30 p-8 overflow-y-auto scrollbar-hide">
                            <div className="bg-white shadow-2xl mx-auto w-full max-w-[210mm] border border-slate-200 pointer-events-none transform scale-95 origin-top rounded-lg">
                                <StudentCourseUnitRegistration readOnlyData={formatForReadOnlyForm(selectedRegistration)} />
                            </div>
                        </div>
                        <div className="px-8 py-4 border-t border-slate-100 bg-white flex justify-end gap-3">
                            <button
                                onClick={() => setViewModalOpen(false)}
                                className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                            >
                                Close Audit
                            </button>
                            {selectedRegistration.status === 'Pending' && (
                                <>
                                    <button
                                        onClick={() => { initiateReject(selectedRegistration); setViewModalOpen(false); }}
                                        className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all border border-rose-100"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => { handleApprove(selectedRegistration.id); setViewModalOpen(false); }}
                                        className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-lg shadow-emerald-100"
                                    >
                                        Approve
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModalOpen && selectedRegistration && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md animate-scale-up border border-slate-200">
                        <div className="p-8">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Issue Registration Dispute</h3>
                            <p className="text-xs text-slate-500 font-medium mb-6">
                                Provide substantial reasoning for the rejection of <span className="font-bold text-slate-900">{selectedRegistration.studentNumber}</span>'s submission.
                            </p>

                            <textarea
                                className="w-full border border-slate-200 rounded-2xl p-4 text-xs font-medium focus:ring-4 focus:ring-rose-700/5 focus:border-rose-700 outline-none transition-all bg-slate-50/50 min-h-[120px]"
                                placeholder="DOCUMENT REASONING HERE..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            ></textarea>

                            <div className="flex justify-end gap-4 mt-8">
                                <button
                                    onClick={() => setRejectModalOpen(false)}
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

        </div>
    );
};

export default AcademicCourseUnits;
