import React, { useState, useMemo, useEffect } from 'react';

const AddDropFormsSection = () => {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [selectedForm, setSelectedForm] = useState(null);

    // Fetch data from backend
    const fetchForms = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/add-drop/list', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();

                if (!Array.isArray(data)) {
                    console.error("Expected array but got:", typeof data);
                    return;
                }

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
                        fileName: `AddDrop_${stNo.replace(/[^a-zA-Z0-9]/g, '')}.pdf`,
                        date: new Date(dbRow.created_at).toLocaleDateString(),
                        rawData: dbRow // Keep the raw data for the PDF viewer
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

    // Filter Logic
    const filteredForms = useMemo(() => {
        return forms.filter(item => {
            const matchesSearch = item.studentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'All' || item.form === filterType;
            return matchesSearch && matchesType;
        });
    }, [searchTerm, filterType, forms]);

    // Icon helper
    const getFormTypeBadge = (type) => {
        switch (type) {
            case 'Add Course': return <span className="bg-green-100 text-green-700 py-1 px-3 rounded-full text-xs font-bold border border-green-200">Add</span>;
            case 'Drop Course': return <span className="bg-red-100 text-red-700 py-1 px-3 rounded-full text-xs font-bold border border-red-200">Drop</span>;
            case 'Add & Drop': return <span className="bg-purple-100 text-purple-700 py-1 px-3 rounded-full text-xs font-bold border border-purple-200">Add & Drop</span>;
            default: return <span className="bg-gray-100 text-gray-700 py-1 px-3 rounded-full text-xs font-bold">Unknown</span>;
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up flex flex-col h-full">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 shrink-0">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">Add / Drop Forms</h2>
                    <p className="text-gray-500 text-sm mt-1">Review student subject change requests.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search Component */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400 group-focus-within:text-blue-500 transition-colors">🔍</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Search Student No..."
                            className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all w-full sm:w-64 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filter Component */}
                    <div className="relative">
                        <select
                            className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer outline-none bg-no-repeat bg-[right_1rem_center]"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                        >
                            <option value="All">All Types</option>
                            <option value="Add Course">Add Course</option>
                            <option value="Drop Course">Drop Course</option>
                            <option value="Add & Drop">Add & Drop</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col min-h-0">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10 shadow-sm">
                            <tr className="border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                <th className="px-6 py-4">Student Info</th>
                                <th className="px-6 py-4">Form Type & File</th>
                                <th className="px-6 py-4">Submitted Date</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                        Loading forms...
                                    </td>
                                </tr>
                            ) : filteredForms.length > 0 ? (
                                filteredForms.map((item) => (
                                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-200 shrink-0">
                                                    {item.name ? item.name.charAt(0) : 'S'}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{item.name}</div>
                                                    <div className="text-xs text-gray-500 font-mono tracking-wide mt-0.5">{item.studentNo}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-start gap-2">
                                                {getFormTypeBadge(item.form)}
                                                <span className="text-xs text-gray-500 flex items-center gap-1.5 bg-gray-50 rounded-md px-2 py-1 border border-gray-100">
                                                    📄 {item.fileName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600 font-medium">{item.date}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => setSelectedForm(item)}
                                                className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm hover:shadow active:scale-95 font-medium flex items-center gap-2 mx-auto"
                                                title="View Form"
                                            >
                                                <span>👁️</span> View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <span className="text-4xl mb-3">📂</span>
                                            <p className="text-sm">No forms found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center text-xs text-gray-500 shrink-0">
                    <span>Showing {filteredForms.length} entries</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 rounded bg-white border border-gray-200 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 rounded bg-white border border-gray-200 disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
            </div>

            {/* View PDF Modal */}
            {selectedForm && selectedForm.rawData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4 print:p-0 print:bg-white overflow-y-auto">
                    <div className="bg-white shadow-2xl w-full max-w-4xl max-h-[90vh] print:max-h-full print:shadow-none relative flex flex-col my-auto rounded-xl print:rounded-none">

                        {/* Modal Header Toolbar (Not printed) */}
                        <div className="sticky top-0 bg-gray-900 text-white p-4 flex justify-between items-center rounded-t-xl print:hidden z-10">
                            <div className="font-medium flex items-center gap-2">
                                📄 Add/Drop Request - <span className="text-indigo-300">{selectedForm.studentNo}</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handlePrint}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-sm font-semibold transition-colors flex items-center gap-2"
                                >
                                    🖨️ Print / Save PDF
                                </button>
                                <button
                                    onClick={() => setSelectedForm(null)}
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
                                                    {selectedForm.studentNo[i] || ''}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-semibold uppercase font-serif whitespace-nowrap">STUDENT NAME (Mr/Ms):</span>
                                        <div className="flex-1 border-b border-gray-400 border-dashed h-8 px-2 font-medium flex items-end pb-1">{selectedForm.name}</div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-semibold uppercase font-serif whitespace-nowrap">CONTACT NUMBER:</span>
                                        <div className="flex-1 border-b border-gray-400 border-dashed h-8 px-2 font-medium flex items-end pb-1">{selectedForm.rawData.contact_number || '-'}</div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-semibold uppercase font-serif whitespace-nowrap">EMAIL ADDRESS:</span>
                                        <div className="flex-1 border-b border-gray-400 border-dashed h-8 px-2 font-medium flex items-end pb-1 text-blue-800">{selectedForm.rawData.email || '-'}</div>
                                    </div>
                                </div>

                                {/* 3. COMBINATION */}
                                <div className="flex flex-wrap gap-12 mb-8 p-6 bg-gray-50/50 rounded-lg border border-gray-200 items-center justify-center print:bg-transparent print:border-none print:p-0 print:mb-8 print:justify-start">
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-semibold uppercase font-serif whitespace-nowrap">COURSE COMBINATION:</span>
                                        <div className="w-24 h-8 border border-gray-800 flex items-center justify-center font-bold">{selectedForm.rawData.combination || '-'}</div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-semibold uppercase font-serif whitespace-nowrap">YEAR:</span>
                                        <div className="w-24 h-8 border border-gray-800 flex items-center justify-center font-bold">{selectedForm.rawData.year || '-'}</div>
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
                                                    {(selectedForm.rawData.added_courses && selectedForm.rawData.added_courses[idx]) || ''}
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
                                                    {(selectedForm.rawData.dropped_courses && selectedForm.rawData.dropped_courses[idx]) || ''}
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
                                        <div className="w-24 h-8 flex items-center justify-end px-2 font-bold">{selectedForm.rawData.sem1_credits || '0'}</div>
                                    </div>
                                    <div className="flex items-center justify-end w-full gap-4">
                                        <span className="text-sm font-semibold uppercase font-serif">Number of credits registered for Semester II:</span>
                                        <span className="font-bold">=</span>
                                        <div className="w-24 h-8 flex items-center justify-end px-2 font-bold">{selectedForm.rawData.sem2_credits || '0'}</div>
                                    </div>
                                    <div className="flex items-center justify-end w-full gap-4 pt-2 border-t border-dashed border-gray-400">
                                        <span className="text-sm font-semibold uppercase font-serif">Total number of credits registered for Academic Year 2023/2024:</span>
                                        <span className="font-bold">=</span>
                                        <div className="w-24 h-8 flex items-center justify-end px-2 font-bold text-lg">{selectedForm.rawData.total_credits || '0'}</div>
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
                                            {selectedForm.rawData.signature_date ? new Date(selectedForm.rawData.signature_date).toLocaleDateString() : '-'}
                                        </div>
                                        <div className="text-sm font-serif font-bold uppercase pt-2">Date</div>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <div className="h-8 border-b border-dashed border-black w-full text-center flex items-end justify-center pb-1 font-serif italic text-blue-900 shadow-sm signature-font">
                                            {selectedForm.rawData.signature || ''}
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

export default AddDropFormsSection;
