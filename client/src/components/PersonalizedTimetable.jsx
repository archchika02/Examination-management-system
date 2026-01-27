import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PersonalizedTimetable = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [timetableData, setTimetableData] = useState([]);

    // Mock Course Titles Dictionary (since Supervisor only enters code)
    const courseTitles = {
        'INTE 21213': 'Information system Modelling',
        'INTE 21323': 'Web application Development',
        'INTE 21333': 'Software Engineering Concepts',
        'INTE 22253': 'Distributed Systems and Cloud Computing',
        'INTE 22263': 'Embedded Systems Development',
    };

    const getCourseTitle = (code) => {
        // Try to match exact or partial code
        const safeCode = code?.trim() || '';
        return courseTitles[safeCode] || 'Advanced Topics in Science'; // Default title if not found
    };

    // Load Data
    useEffect(() => {
        const stored = localStorage.getItem('ems_timetable_data');
        if (stored) {
            setTimetableData(JSON.parse(stored));
        } else {
            // Fallback default data for demo
            setTimetableData([
                { id: 1, date: '2026-10-18', time: '09:00 - 11:00', courseUnit: 'INTE 21213', venue: 'A8 203' },
                { id: 2, date: '2026-10-20', time: '13:00 - 15:00', courseUnit: 'INTE 21323', venue: 'A8 203' },
                { id: 3, date: '2026-10-23', time: '09:00 - 12:00', courseUnit: 'INTE 21333', venue: 'A8 203' },
                { id: 4, date: '2026-10-25', time: '10:00 - 12:00', courseUnit: 'INTE 22253', venue: 'A8 203' },
                { id: 5, date: '2026-10-28', time: '09:00 - 11:00', courseUnit: 'INTE 22263', venue: 'A8 203' },
            ]);
        }
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        try {
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (e) {
            return dateString;
        }
    };

    const filteredData = timetableData.filter(exam => {
        const term = searchTerm.toLowerCase();
        const code = (exam.courseUnit || '').toLowerCase();
        const title = getCourseTitle(exam.courseUnit).toLowerCase();
        const venue = (exam.venue || '').toLowerCase();
        return code.includes(term) || title.includes(term) || venue.includes(term);
    });

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.text('UNIVERSITY OF KELANIYA', 105, 20, null, null, 'center');
        doc.setFontSize(14);
        doc.text('Faculty of Science', 105, 30, null, null, 'center');
        doc.setFontSize(12);
        doc.text('Examination Timetable 2023/2024', 105, 40, null, null, 'center');

        // Table
        const tableColumn = ["Course Unit", "Course Title", "Date", "Time", "Venue"];
        const tableRows = filteredData.map(exam => [
            exam.courseUnit,
            getCourseTitle(exam.courseUnit),
            formatDate(exam.date),
            exam.time,
            exam.venue
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 50,
        });

        doc.save('Personalized_Timetable.pdf');
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up pb-10">
            {/* Header Section */}
            <div>
                <h2 className="text-3xl font-bold text-gray-800">Personalized Timetable</h2>
                <p className="text-gray-500 mt-1">View and download your examination timetable</p>
            </div>

            {/* Filter & Action Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                {/* Search Field */}
                <div className="relative w-full md:w-96">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        🔍
                    </span>
                    <input
                        type="text"
                        placeholder="Search course or venue..."
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Download Button */}
                <button
                    onClick={handleDownloadPDF}
                    className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                >
                    <span className="text-xl">⬇️</span>
                    Download Timetable
                </button>
            </div>

            {/* Timetable Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                                <th className="px-6 py-4 font-bold">Course Unit</th>
                                <th className="px-6 py-4 font-bold">Course Title</th>
                                <th className="px-6 py-4 font-bold">Date</th>
                                <th className="px-6 py-4 font-bold">Time</th>
                                <th className="px-6 py-4 font-bold">Venue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredData.length > 0 ? (
                                filteredData.map((exam) => (
                                    <tr key={exam.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-800">{exam.courseUnit}</td>
                                        <td className="px-6 py-4 text-gray-700">{getCourseTitle(exam.courseUnit)}</td>
                                        <td className="px-6 py-4 text-gray-600">{formatDate(exam.date)}</td>
                                        <td className="px-6 py-4 text-gray-600 font-mono bg-gray-50/50 rounded">{exam.time}</td>
                                        <td className="px-6 py-4 text-indigo-600 font-medium">{exam.venue}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                        <p className="text-lg mb-2">No exams found matching your search.</p>
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="text-blue-600 hover:underline font-medium"
                                        >
                                            Clear filters to view all
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">
                        Showing {filteredData.length} of {timetableData.length} exams
                    </span>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors block"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PersonalizedTimetable;
