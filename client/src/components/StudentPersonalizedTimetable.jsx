import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../context/AuthContext';

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
        const title = (exam.courseTitle || '').toLowerCase();
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
        doc.text('Department of Industrial Management', 105, 40, null, null, 'center');
        doc.setFontSize(12);

        const academicYear = filteredData.length > 0 && filteredData[0].academicYear
            ? filteredData[0].academicYear
            : '202X/202X';

        doc.text(`Examination Timetable ${academicYear}`, 105, 50, null, null, 'center');

        // Downloader Info
        doc.setFontSize(10);
        doc.text(`Student Schedule: ${user?.name || 'Student'}`, 105, 60, null, null, 'center');

        // Table
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
        });

        doc.save('Student_Personalized_Timetable.pdf');
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up pb-10">
            {/* Header Section */}
            <div>
                <h2 className="text-3xl font-bold text-gray-800">My Personalized Timetable</h2>
                <p className="text-gray-500 mt-1">View and download your examination timetable based on your registered courses</p>
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

                <div className="flex gap-3 w-full md:w-auto">
                    {/* Download Button */}
                    <button
                        onClick={handleDownloadPDF}
                        className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                    >
                        <span className="text-xl">⬇️</span>
                        Download Timetable
                    </button>
                </div>
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
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        Loading your timetable...
                                    </td>
                                </tr>
                            ) : filteredData.length > 0 ? (
                                filteredData.map((exam) => {
                                    return (
                                        <tr key={exam.id} className="transition-colors hover:bg-blue-50/30">
                                            <td className="px-6 py-4 font-bold text-gray-800">{exam.courseUnit}</td>
                                            <td className="px-6 py-4 text-gray-700">{exam.courseTitle || 'Unknown Title'}</td>
                                            <td className="px-6 py-4 text-gray-600">{formatDate(exam.date)}</td>
                                            <td className="px-6 py-4 text-gray-600 font-mono bg-gray-50/50 rounded">{exam.time}</td>
                                            <td className="px-6 py-4 text-indigo-600 font-medium">{exam.venue}</td>
                                        </tr>
                                    );
                                })
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

export default StudentPersonalizedTimetable;
