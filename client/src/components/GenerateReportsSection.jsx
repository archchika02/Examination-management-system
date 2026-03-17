import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import uniLogo from '../assets/university-of-kelaniya-logo-png.png';

const GenerateReportsSection = () => {
    // State for Admission Sheet
    const [admissionLevel, setAdmissionLevel] = useState('');
    const [admissionType, setAdmissionType] = useState('Academic'); // 'Academic' or 'Medical'

    // State for Attendance Sheet
    const [attendanceDate, setAttendanceDate] = useState('');
    const [examDates, setExamDates] = useState([]);
    const [attendanceCourseUnit, setAttendanceCourseUnit] = useState('');
    const [attendanceCourseUnits, setAttendanceCourseUnits] = useState([]);

    // Fetch exam dates on mount
    useEffect(() => {
        const fetchDates = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/reports/exam-dates');
                const data = await response.json();
                setExamDates(data);
                if (data.length > 0) {
                    setAttendanceDate(data[0]);
                }
            } catch (error) {
                console.error('Error fetching exam dates:', error);
            }
        };
        fetchDates();
    }, []);

    // Update attendance course units when attendanceDate changes
    useEffect(() => {
        const fetchAttendanceCourses = async () => {
            if (!attendanceDate) return;
            try {
                // The date might be ISO string, but the endpoint expects it as a param
                const response = await fetch(`http://localhost:5000/api/reports/exam-courses/${attendanceDate}`);
                const data = await response.json();

                setAttendanceCourseUnits(data);
                if (data.length > 0) {
                    setAttendanceCourseUnit(data[0].course_code);
                } else {
                    setAttendanceCourseUnit('');
                }
            } catch (error) {
                console.error('Error fetching attendance courses:', error);
            }
        };

        fetchAttendanceCourses();
    }, [attendanceDate]);

    const [isDownloading, setIsDownloading] = useState(false);

    // Mock Data
    const levels = ['Level 1', 'Level 2', 'Level 3', 'Level 4'];
    const types = [
        { id: 'Academic', label: 'Academic / Add-Drop' },
        { id: 'Medical', label: 'Medical / Repeat' }
    ];

    const generateAdmissionDoc = async (level, type) => {
        const response = await fetch(`http://localhost:5000/api/reports/admission-cards?level=${level}&type=${type}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Server Error: ${errorData.message || 'Failed to fetch data'}`);
        }

        const students = await response.json();

        if (students.length === 0) {
            throw new Error('No approved registrations found for the selected criteria.');
        }

        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        students.forEach((student, index) => {
            if (index > 0) doc.addPage();

            // Header
            // Commented out logo loading as it causes async issues with jsPDF
            // doc.addImage('http://localhost:5173/uni-logo.png', 'PNG', 15, 10, 25, 25);


            doc.setFontSize(10);
            doc.text('UNIVERSITY OF KELANIYA - SRI LANKA', 115, 12, { align: 'center' });
            doc.text('FACULTY OF SCIENCE', 115, 17, { align: 'center' });
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Bachelor of Science Degree Examination', 115, 22, { align: 'center' });
            doc.text('EXAMINATION ADMISSION CARD', 115, 27, { align: 'center' });

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`Student No: ${student.student_number}`, 15, 45);
            doc.text(`Name: ${student.student_name}`, 115, 45);
            doc.text(`Academic Year: ${student.academic_year || '2022/2023'}`, 15, 52);

            // Semester parsing: 2nd digit of 1st course unit
            let semester = 'N/A';
            if (student.courses && student.courses.length > 0) {
                const firstCourse = student.courses[0].course_code;
                const match = firstCourse.match(/\d/g);
                if (match && match.length >= 2) {
                    semester = match[1];
                }
            }
            doc.text(`Semester: ${semester}`, 115, 52);

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.text('IMPORTANT:', 15, 60);
            doc.setFont('helvetica', 'normal');
            doc.text('1. The candidate should bring the student record book or the student identity card to the Examination Hall.', 35, 60);
            doc.text('2. This admission card should be returned to the supervisor on the last day of your examination.', 35, 64);

            doc.text('Signature of the Candidate: ___________________________', 15, 75);
            doc.text('The signature of the above candidate was placed before me.', 15, 82);
            doc.text('Name of the Mentor: ___________________________', 15, 89);
            doc.text('Signature of the Mentor: ___________________________', 15, 96);


            doc.text('Registrar / Examination', 130, 103);
            doc.text(`Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}`, 170, 103);

            // Table
            const tableData = student.courses.map(c => [
                student.student_number,
                c.course_code,
                c.date || 'TBA',
                c.time || 'TBA',
                c.venue || 'TBA',
                '', // Student's Signature
                ''  // Supervisor's Signature
            ]);

            autoTable(doc, {
                startY: 110,
                head: [['Student No', 'Course Unit', 'Date', 'Time', 'Venue', "Student's Signature", "Supervisor's Signature"]],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 8 },
                bodyStyles: { fontSize: 8 },
                columnStyles: {
                    0: { cellWidth: 25 },
                    1: { cellWidth: 25 },
                    2: { cellWidth: 35 },
                    3: { cellWidth: 20 },
                    4: { cellWidth: 40 },
                    5: { cellWidth: 20 },
                    6: { cellWidth: 25 }
                }
            });
        });

        return doc;
    };

    const generateAttendanceDoc = async (courseCode) => {
        const response = await fetch(`http://localhost:5000/api/reports/attendance-sheets?courseCode=${courseCode}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Server Error: ${errorData.message || 'Failed to fetch data'}`);
        }

        const venuesData = await response.json();

        if (venuesData.length === 0) {
            throw new Error('No attendance data found for the selected course.');
        }

        const img = new Image();
        img.src = uniLogo;
        await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; // Proceed even if it fails
        });

        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        venuesData.forEach((venueData, venueIndex) => {
            const students = venueData.students || [];

            // Number of rows that fit on a single page column length
            const maxStudentsPerColumn = 27;
            const maxStudentsPerPage = maxStudentsPerColumn * 2;

            // Chunk the students into pages for this venue
            const pages = [];
            for (let i = 0; i < students.length; i += maxStudentsPerPage) {
                pages.push(students.slice(i, i + maxStudentsPerPage));
            }

            if (pages.length === 0) {
                pages.push([]); // Make sure we render an empty sheet if no students
            }

            pages.forEach((pageStudents, pageIndex) => {
                if (venueIndex > 0 || pageIndex > 0) doc.addPage();

                try {
                    doc.addImage(img, 'PNG', 15, 10, 20, 20); // Add University Logo
                } catch (e) {
                    // console.warn("Could not add logo", e);
                }

                doc.setFontSize(10);
                doc.text('UNIVERSITY OF KELANIYA - SRI LANKA', 105, 12, { align: 'center' });
                doc.text('FACULTY OF SCIENCE', 105, 17, { align: 'center' });
                doc.text('DEPARTMENT OF INDUSTRIAL MANAGEMENT', 105, 22, { align: 'center' });

                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text('ATTENDANCE SHEET', 105, 30, { align: 'center' });

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.text(`Course unit: ${venueData.course_code} - ${venueData.course_title}`, 15, 45);
                doc.text(`Date: ${venueData.exam_date || 'TBA'}`, 15, 52);
                doc.text(`Time: ${venueData.exam_time || 'TBA'}`, 15, 59);

                doc.setFont('helvetica', 'bold');
                doc.text(`Venue: ${venueData.venue}`, 150, 45);

                // Split page data sequentially: Left fills up first, Right takes the spillover
                const leftStudents = pageStudents.slice(0, maxStudentsPerColumn);
                const rightStudents = pageStudents.slice(maxStudentsPerColumn);

                const formatTableData = (studentArray) => studentArray.map(std => [std, '']); // [Student No, Signature Space]

                // Left Table
                if (leftStudents.length > 0 || pageStudents.length === 0) {
                    autoTable(doc, {
                        startY: 65,
                        margin: { left: 15, right: 110 }, // Restrict width to left half
                        head: [['Student No', 'Signature']],
                        body: formatTableData(leftStudents),
                        theme: 'grid',
                        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9 },
                        bodyStyles: { fontSize: 9, minCellHeight: 8 },
                        columnStyles: {
                            0: { cellWidth: 40 },
                            1: { cellWidth: 40 }
                        }
                    });
                }

                // Right Table (Only render if there are students in the second column)
                if (rightStudents.length > 0) {
                    autoTable(doc, {
                        startY: 65,
                        margin: { left: 110, right: 15 }, // Restrict width to right half
                        head: [['Student No', 'Signature']],
                        body: formatTableData(rightStudents),
                        theme: 'grid',
                        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9 },
                        bodyStyles: { fontSize: 9, minCellHeight: 8 },
                        columnStyles: {
                            0: { cellWidth: 40 },
                            1: { cellWidth: 40 }
                        }
                    });
                }
            });
        });

        return doc;
    };

    const handleGeneratePreview = async (reportType) => {
        if (reportType === 'Admission Sheet') {
            setIsDownloading(true);
            try {
                const doc = await generateAdmissionDoc(admissionLevel, admissionType);
                window.open(doc.output('bloburl'), '_blank');
            } catch (error) {
                console.error("PDF Preview Error:", error);
                alert(error.message || 'Failed to generate preview. Check console.');
            } finally {
                setIsDownloading(false);
            }
        } else if (reportType === 'Attendance Sheet') {
            setIsDownloading(true);
            try {
                const doc = await generateAttendanceDoc(attendanceCourseUnit);
                window.open(doc.output('bloburl'), '_blank');
            } catch (error) {
                console.error("PDF Preview Error:", error);
                alert(error.message || 'Failed to generate preview. Check console.');
            } finally {
                setIsDownloading(false);
            }
        }
    };

    const handleDownloadPDF = async (reportType) => {
        if (reportType === 'Admission Sheet') {
            setIsDownloading(true);
            try {
                const doc = await generateAdmissionDoc(admissionLevel, admissionType);
                doc.save(`Admission_Cards_${admissionLevel}_${admissionType}.pdf`);
            } catch (error) {
                console.error("PDF Generation Error:", error);
                alert(error.message || 'Failed to generate PDF. Check console.');
            } finally {
                setIsDownloading(false);
            }
        } else if (reportType === 'Attendance Sheet') {
            setIsDownloading(true);
            try {
                const doc = await generateAttendanceDoc(attendanceCourseUnit);
                doc.save(`Attendance_Sheet_${attendanceCourseUnit.replace(/\s+/g, '_')}.pdf`);
            } catch (error) {
                console.error("PDF Generation Error:", error);
                alert(error.message || 'Failed to generate PDF. Check console.');
            } finally {
                setIsDownloading(false);
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Generate Reports</h2>
                    <p className="text-gray-500 text-sm">Create and download examination-related reports.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-6">
                {/* 1. Admission Sheet Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                    <div className="h-2 bg-blue-500 w-full"></div>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Admission Sheet</h3>
                        <p className="text-gray-500 text-sm mb-6 min-h-[40px]">
                            Contains details of registered students. Used for exam hall verification.
                        </p>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Select Level</label>
                                <select
                                    value={admissionLevel}
                                    onChange={(e) => setAdmissionLevel(e.target.value)}
                                    className="w-full bg-gray-50 text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 border border-gray-200"
                                >
                                    <option value="">Select Level</option>
                                    {levels.map(level => <option key={level} value={level}>{level}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Select Type</label>
                                <select
                                    value={admissionType}
                                    onChange={(e) => setAdmissionType(e.target.value)}
                                    className="w-full bg-gray-50 text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 border border-gray-200"
                                >
                                    {types.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => handleGeneratePreview('Admission Sheet')}
                                disabled={!admissionLevel || isDownloading}
                                className="flex-1 text-blue-600 bg-blue-50 hover:bg-blue-100 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2.5 text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Preview
                            </button>
                            <button
                                onClick={() => handleDownloadPDF('Admission Sheet')}
                                disabled={!admissionLevel || isDownloading}
                                className="flex-1 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2.5 text-center transition-colors shadow-md shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                {isDownloading ? 'Downloading...' : 'Download'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Attendance Sheet Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                    <div className="h-2 bg-indigo-500 w-full"></div>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Attendance Sheet</h3>
                        <p className="text-gray-500 text-sm mb-6 min-h-[40px]">
                            Used by invigilators to mark student attendance during examinations.
                        </p>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Select Date</label>
                                <select
                                    value={attendanceDate}
                                    onChange={(e) => setAttendanceDate(e.target.value)}
                                    className="w-full bg-gray-50 text-gray-800 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 border border-gray-200"
                                >
                                    {examDates.length === 0 && <option value="">No dates available</option>}
                                    {examDates.map(date => (
                                        <option key={date} value={date}>
                                            {new Date(date).toLocaleDateString('en-GB', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Select Course Unit</label>
                                <select
                                    value={attendanceCourseUnit}
                                    onChange={(e) => setAttendanceCourseUnit(e.target.value)}
                                    className="w-full bg-gray-50 text-gray-800 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 border border-gray-200"
                                    disabled={attendanceCourseUnits.length === 0}
                                >
                                    {attendanceCourseUnits.length === 0 && <option value="">No scheduled exams on this date</option>}
                                    {attendanceCourseUnits.map(course => (
                                        <option key={course.course_code} value={course.course_code}>
                                            {course.course_code} - {course.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => handleGeneratePreview('Attendance Sheet')}
                                disabled={!attendanceCourseUnit || isDownloading}
                                className="flex-1 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-3 py-2.5 text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Preview
                            </button>
                            <button
                                onClick={() => handleDownloadPDF('Attendance Sheet')}
                                disabled={!attendanceCourseUnit || isDownloading}
                                className="flex-1 text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-3 py-2.5 text-center transition-colors shadow-md shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                {isDownloading ? 'Downloading...' : 'Download'}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default GenerateReportsSection;
