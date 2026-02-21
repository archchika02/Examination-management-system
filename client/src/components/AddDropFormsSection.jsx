import { useState, useMemo } from 'react';

const AddDropFormsSection = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [selectedForm, setSelectedForm] = useState(null);

    // Mock Data
    const forms = [
        { id: 1, studentNo: 'IM/2022/025', name: 'Alice Wyne', form: 'Add Course', fileName: 'add_form_s2023001.pdf', date: '2026-01-20' },
        { id: 2, studentNo: 'IM/2022/026', name: 'Bob Johnson', form: 'Drop Course', fileName: 'drop_form_s2023045.pdf', date: '2026-01-21' },
        { id: 3, studentNo: 'IM/2022/027', name: 'Charlie Davis', form: 'Add & Drop', fileName: 'add_drop_s2023012.pdf', date: '2026-01-22' },
        { id: 4, studentNo: 'IM/2022/028', name: 'Diana Prince', form: 'Add Course', fileName: 'add_form_s2023089.pdf', date: '2026-01-23' },
        { id: 5, studentNo: 'IM/2022/029', name: 'Evan Wright', form: 'Drop Course', fileName: 'drop_form_s2023056.pdf', date: '2026-01-23' },
        { id: 6, studentNo: 'IM/2022/030', name: 'Fiona Gallagher', form: 'Add Course', fileName: 'add_form_s2023033.pdf', date: '2026-01-24' },
        { id: 7, studentNo: 'IM/2022/031', name: 'George Miller', form: 'Add & Drop', fileName: 'add_drop_s2023091.pdf', date: '2026-01-24' },
    ];

    // Filter Logic
    const filteredForms = useMemo(() => {
        return forms.filter(item => {
            const matchesSearch = item.studentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'All' || item.form === filterType;
            return matchesSearch && matchesType;
        });
    }, [searchTerm, filterType]);

    // Icon helper
    const getFormTypeBadge = (type) => {
        switch (type) {
            case 'Add Course': return <span className="bg-green-100 text-green-700 py-1 px-3 rounded-full text-xs font-bold border border-green-200">Add</span>;
            case 'Drop Course': return <span className="bg-red-100 text-red-700 py-1 px-3 rounded-full text-xs font-bold border border-red-200">Drop</span>;
            case 'Add & Drop': return <span className="bg-purple-100 text-purple-700 py-1 px-3 rounded-full text-xs font-bold border border-purple-200">Add & Drop</span>;
            default: return <span className="bg-gray-100 text-gray-700 py-1 px-3 rounded-full text-xs font-bold">Unknown</span>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                <th className="px-6 py-4">Student Info</th>
                                <th className="px-6 py-4">Form Type & File</th>
                                <th className="px-6 py-4">Submitted Date</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredForms.length > 0 ? (
                                filteredForms.map((item) => (
                                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-200">
                                                    {item.name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{item.name}</div>
                                                    <div className="text-xs text-gray-500 font-mono tracking-wide">{item.studentNo}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-start gap-1">
                                                {getFormTypeBadge(item.form)}
                                                <span className="text-xs text-gray-400 mt-1 flex items-center gap-1">
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
                                                className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm hover:shadow-md active:scale-95"
                                                title="View Form"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
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
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center text-xs text-gray-500">
                    <span>Showing {filteredForms.length} entries</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 rounded bg-white border border-gray-200 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 rounded bg-white border border-gray-200 disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
            </div>

            {/* View Modal */}
            {selectedForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-scale-up">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Review Form</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">{selectedForm.studentNo}</span>
                                    <span>•</span>
                                    <span>{selectedForm.name}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedForm(null)}
                                className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 bg-gray-100 p-8 overflow-y-auto flex items-center justify-center">
                            {/* Mock PDF Viewer Placeholder */}
                            <div className="bg-white w-full h-full shadow-lg rounded-sm flex flex-col items-center justify-center border border-gray-300 relative">
                                <div className="absolute top-0 left-0 right-0 bg-gray-50 p-2 border-b flex justify-between items-center px-4">
                                    <span className="text-xs text-gray-500">{selectedForm.fileName} (Preview)</span>
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    </div>
                                </div>
                                <div className="text-center p-10">
                                    <div className="text-6xl mb-4 text-red-500 opacity-80">📄</div>
                                    <h4 className="text-2xl font-bold text-gray-900 mb-2">PDF Viewer Placeholder</h4>
                                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                                        This would display the actual content of <strong>{selectedForm.fileName}</strong>.
                                        In a real implementation, this would connect to a PDF rendering library or iframe.
                                    </p>
                                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all font-medium flex items-center gap-2 mx-auto">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download File
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white">
                            <button
                                onClick={() => setSelectedForm(null)}
                                className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddDropFormsSection;
