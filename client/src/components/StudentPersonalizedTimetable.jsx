import { useState, useEffect } from 'react';
import jsPDF from 'jsPDF';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../context/AuthContext';

// Professional SVG Icon Library
const Icons = {
    Calendar: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
    ),
    Search: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
    ),
    Download: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
    ),
    Clock: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    ),
    MapPin: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
    ),
    AlertCircle: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
    )
};

const StudentPersonalizedTimetable = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [timetableData, setTimetableData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load Data
    useEffect(() => {
        const fetchPersonalizedTimetable = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const response = await fetch(`http://localhost:5000/api/configurations/personalized-timetable/${user.user_id}`);
                if (response.ok) {
                    const data = await response.json();
                    setTimetableData(data);
                }
            } catch (error) {
                console.error("Error fetching personalized timetable:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPersonalizedTimetable();
    }, [user]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
            const day = date.getDate();
            const month = date.toLocaleDateString('en-US', { month: 'long' });
            const year = date.getFullYear();
            return `${weekday}, ${day} ${month}, ${year}`;
        } catch (e) {
            return dateString;
        }
    };

    const filteredData = timetableData.filter(exam => {
        const term = searchTerm.toLowerCase();
        const code = (exam.courseUnit || '').toLowerCase();
        const title = (exam.courseTitle || '').toLowerCase();
        const venue = (exam.venue || '').toLowerCase();
        return code.includes(term) || title.includes(term) || venue.includes(term);
    });

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        // PDF generation logic (keeping as is in core but ensuring it matches visual expectations if needed)
        // ... (unchanged core logic for now to ensure stability)
        doc.setFontSize(18);
        doc.text('UNIVERSITY OF KELANIYA', 105, 20, null, null, 'center');
        doc.setFontSize(14);
        doc.text('Faculty of Science', 105, 30, null, null, 'center');
        doc.setFontSize(12);
        doc.text('Department of Industrial Management', 105, 40, null, null, 'center');
        doc.text(`Examination Timetable`, 105, 50, null, null, 'center');
        doc.setFontSize(10);
        doc.text(`Student Schedule: ${user?.name || 'Student'}`, 105, 60, null, null, 'center');

        const tableColumn = ["Course Unit", "Course Title", "Date", "Time", "Venue"];
        const tableRows = filteredData.map(exam => [
            exam.courseUnit,
            exam.courseTitle || 'Unknown Title',
            formatDate(exam.date),
            exam.time,
            exam.venue
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 70,
            headStyles: { fillColor: [15, 23, 42] }, // slate-900
        });

        doc.save('Student_Personalized_Timetable.pdf');
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Personalized Timetable</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Official examination schedule for your registered components</p>
                </div>

                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    {/* Search Field */}
                    <div className="relative group flex-grow md:min-w-[300px]">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                            <Icons.Search />
                        </div>
                        <input
                            type="text"
                            placeholder="Filter by course, venue..."
                            className="block w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all shadow-sm shadow-slate-200/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleDownloadPDF}
                        disabled={filteredData.length === 0}
                        className="px-6 py-3.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 hover:shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Icons.Download />
                        <span>Export PDF</span>
                    </button>
                </div>
            </div>

            {/* Timetable Table */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                                <th className="px-8 py-6">Course Framework</th>
                                <th className="px-8 py-6">Session Details</th>
                                <th className="px-8 py-6">Date & Time</th>
                                <th className="px-8 py-6 text-right">Venue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Querying Timetable Registry...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.length > 0 ? (
                                filteredData.map((exam) => (
                                    <tr key={exam.id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100 w-fit">
                                                    {exam.courseUnit}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <h4 className="text-sm font-black text-slate-900 leading-tight uppercase tracking-tight">{exam.courseTitle || 'Examination Session'}</h4>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <div className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                                    {new Date(exam.date).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <Icons.Clock />
                                                    {exam.time}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                <Icons.MapPin />
                                                {exam.venue}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-40">
                                            <div className="p-4 bg-slate-50 rounded-[2rem]">
                                                <Icons.AlertCircle />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">No matching records found</p>
                                                <button
                                                    onClick={() => setSearchTerm('')}
                                                    className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest"
                                                >
                                                    Clear active filters
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Status */}
                {!loading && filteredData.length > 0 && (
                    <div className="px-8 py-6 bg-slate-50/30 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Showing {filteredData.length} Component{filteredData.length !== 1 ? 's' : ''} in registry
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Registry Sync Active</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentPersonalizedTimetable;
