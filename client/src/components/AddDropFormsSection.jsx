import React, { useState, useMemo, useEffect } from 'react';
import { generateAddDropPDF } from '../utils/pdfGenerator';

const Icons = {
    Search: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
    ),
    Filter: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
    ),
    FileText: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>
    ),
    Eye: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
    ),
    Empty: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
    )
};

const AddDropFormsSection = () => {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');

    const fetchForms = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/add-drop/list', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                if (!Array.isArray(data)) return;

                const mappedData = data.map(dbRow => {
                    const hasAdd = dbRow.added_courses && dbRow.added_courses.length > 0;
                    const hasDrop = dbRow.dropped_courses && dbRow.dropped_courses.length > 0;
                    let formType = 'Unknown';
                    if (hasAdd && hasDrop) formType = 'Add & Drop';
                    else if (hasAdd) formType = 'Add Course';
                    else if (hasDrop) formType = 'Drop Course';

                    const stNo = dbRow.student_number?.startsWith('IM/') ? dbRow.student_number : `IM/${dbRow.student_number || ''}`;

                    return {
                        id: dbRow.id,
                        studentNo: stNo,
                        name: dbRow.student_name || 'Missing Name',
                        form: formType,
                        fileName: `AddDrop_${stNo.replace(/[^a-zA-Z0-9]/g, '')}`,
                        date: new Date(dbRow.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                        rawData: dbRow
                    };
                });
                setForms(mappedData);
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

    const filteredForms = useMemo(() => {
        return forms.filter(item => {
            const matchesSearch = item.studentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'All' || item.form === filterType;
            return matchesSearch && matchesType;
        });
    }, [searchTerm, filterType, forms]);

    const getFormTypeBadge = (type) => {
        switch (type) {
            case 'Add Course': return <span className="bg-emerald-50 text-emerald-700 py-1 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-emerald-100">Add Only</span>;
            case 'Drop Course': return <span className="bg-rose-50 text-rose-700 py-1 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-rose-100">Drop Only</span>;
            case 'Add & Drop': return <span className="bg-blue-50 text-blue-700 py-1 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-blue-100">Dual Action</span>;
            default: return <span className="bg-slate-50 text-slate-500 py-1 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-100 italic">Unknown</span>;
        }
    };

    const handleViewPDF = async (formData) => {
        try {
            const doc = await generateAddDropPDF(formData);
            window.open(doc.output('bloburl'), '_blank');
        } catch (error) {
            console.error("PDF Preview Error:", error);
            alert("Failed to generate PDF document.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up flex flex-col h-full pb-10">

            {/* Header Section */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Course Modification Registry</h2>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Registry of student requests for course unit additions and withdrawals.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Status Filter */}
                        <div className="relative group w-full sm:w-auto">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <Icons.Filter />
                            </span>
                            <select
                                className="pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider focus:ring-4 focus:ring-blue-700/5 focus:border-blue-700 transition-all appearance-none cursor-pointer outline-none w-full sm:w-48"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="All">All Types</option>
                                <option value="Add Course">Add Units</option>
                                <option value="Drop Course">Drop Units</option>
                                <option value="Add & Drop">Add & Drop</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
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
                                <th className="px-8 py-5">Modification Context</th>
                                <th className="px-8 py-5">Registry Date</th>
                                <th className="px-8 py-5 text-right">Verification</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-6 h-6 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Retrieving Registry...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredForms.length > 0 ? (
                                filteredForms.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <div className="text-sm font-bold text-slate-900 tracking-tight">{item.name}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{item.studentNo}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col items-start gap-2">
                                                {getFormTypeBadge(item.form)}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-xs text-slate-600 font-bold uppercase tracking-tight">{item.date}</div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={() => handleViewPDF(item.rawData)}
                                                className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all flex items-center gap-2 ml-auto"
                                            >
                                                <Icons.Eye />
                                                <span>Review</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-32 text-center">
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
        </div>
    );
};

export default AddDropFormsSection;
