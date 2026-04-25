import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import uniLogo from '../assets/university-of-kelaniya-logo-png.png';
import { useAuth } from '../context/AuthContext';

const GenerateMarkingSheet = () => {
    const { user } = useAuth();
    const [markingCourseUnit, setMarkingCourseUnit] = useState('');
    const [courseUnits, setCourseUnits] = useState([]);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (user && user.user_id) {
            // Fetch course units where the user is an examiner
            fetch(`http://localhost:5000/api/reports/examiner-courses/${user.user_id}`)
                .then(res => res.json())
                .then(data => setCourseUnits(data))
                .catch(err => console.error("Error fetching examiner courses:", err));
        }
    }, [user]);

    const generateMarkingSheetDoc = async (courseCode) => {
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        // Add University Logo
        const img = new Image();
        img.src = uniLogo;
        await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
        });

        try {
            doc.addImage(img, 'PNG', 15, 10, 20, 20);
        } catch (e) {
            // Logo not loaded cleanly
        }

        // Header Structure
        doc.setFontSize(10);
        doc.text('UNIVERSITY OF KELANIYA - SRI LANKA', 105, 12, { align: 'center' });
        doc.text('FACULTY OF SCIENCE', 105, 17, { align: 'center' });
        doc.text('DEPARTMENT OF INDUSTRIAL MANAGEMENT', 105, 22, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('MARKING SHEET', 105, 30, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        // Fetch examiners
        let examinerText = '';
        let academicYear = '';
        try {
            const exResp = await fetch(`http://localhost:5000/api/reports/course-examiners?courseCode=${courseCode}`);
            if (exResp.ok) {
                const examiners = await exResp.json();

                if (examiners.length > 0) {
                    academicYear = examiners[0].academic_year;
                }

                const ex1 = examiners.find(ex => ex.examiner_role === 'Examiner 1');
                const ex2 = examiners.find(ex => ex.examiner_role === 'Examiner 2');

                let parts = [];
                if (ex1) parts.push(`Examiner 1: ${ex1.name}`);
                if (ex2) parts.push(`Examiner 2: ${ex2.name}`);

                if (parts.length > 0) {
                    examinerText = parts.join('   '); // Triple space for separation
                }
            }
        } catch (err) {
            console.error("Error fetching examiners:", err);
        }

        doc.text(`Course unit: ${courseCode}`, 15, 45);
        if (academicYear) {
            doc.text(`Academic Year: ${academicYear}`, 105, 45, { align: 'center' });
        }
        if (examinerText) {
            doc.text(examinerText, 195, 45, { align: 'right' });
        }

        // Define Marking sheet specific columns (e.g. Student No, and blank marks columns)
        // Note: For a true marking sheet, we should fetch the exact students from the backend endpoints
        // As a placeholder, assuming generating blank marking sheet rows or fetching student list
        // based on existing application capabilities. Assuming we fetch student_details.

        const response = await fetch(`http://localhost:5000/api/reports/attendance-sheets?courseCode=${courseCode}`);

        let students = [];
        if (response.ok) {
            const venuesData = await response.json();
            // Aggregate all students for this course unit across venues.
            venuesData.forEach(venue => {
                students = students.concat(venue.students || []);
            });
            // Ensure unique students and sorted again just in case
            students = [...new Set(students)].sort();
        }

        if (students.length === 0) {
            // For marking sheet lacking specific enrollees, render empty lines
            students = Array(30).fill('');
        }

        const tableData = students.map((std, i) => [
            i + 1,        // Serial 
            std,          // Student No
            ' ',           // E 1
            ' ',           // E 2
            ' '            // Grade
        ]);

        autoTable(doc, {
            startY: 55,
            head: [['No.', 'Student Number', 'Examiner 1 marks', 'Examiner 2 marks', 'Final Grade']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9 },
            bodyStyles: { fontSize: 9, minCellHeight: 8 },
            columnStyles: {
                0: { cellWidth: 15 },
                1: { cellWidth: 35 },
                2: { cellWidth: 35 },
                3: { cellWidth: 35 },
                4: { cellWidth: 35 },
            }
        });

        // Signatures area
        const finalY = doc.lastAutoTable.finalY || 55;
        if (finalY > 250) {
            doc.addPage();
            doc.text("Examiner's Signature: _______________________", 15, 30);
            doc.text("Date: _______________________", 130, 30);
        } else {
            doc.text("Examiner's Signature: _______________________", 15, finalY + 30);
            doc.text("Date: _______________________", 130, finalY + 30);
        }

        return doc;
    };

    const handleGeneratePreview = async () => {
        setIsDownloading(true);
        try {
            const doc = await generateMarkingSheetDoc(markingCourseUnit);
            window.open(doc.output('bloburl'), '_blank');
        } catch (error) {
            console.error("PDF Preview Error:", error);
            alert(error.message || 'Failed to generate preview. Check console.');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        try {
            const doc = await generateMarkingSheetDoc(markingCourseUnit);
            doc.save(`Marking_Sheet_${markingCourseUnit.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error("PDF Generation Error:", error);
            alert(error.message || 'Failed to generate PDF. Check console.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Generate Marking Sheet</h2>
                    <p className="text-gray-500 text-sm">Create and download marking sheets for grading evaluation.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 max-w-lg mx-auto gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                    <div className="h-2 bg-emerald-500 w-full"></div>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Marking Sheet</h3>
                        <p className="text-gray-500 text-sm mb-6 min-h-[40px]">
                            Student list with columns for marks entry. Used during evaluation.
                        </p>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Select Course Unit</label>
                                <select
                                    value={markingCourseUnit}
                                    onChange={(e) => setMarkingCourseUnit(e.target.value)}
                                    className="w-full bg-gray-50 text-gray-800 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 border border-gray-200"
                                >
                                    <option value="">Select Course</option>
                                    {courseUnits.map(course => <option key={course.course_code} value={course.course_code}>{course.course_code} - {course.course_title}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={handleGeneratePreview}
                                disabled={!markingCourseUnit || isDownloading}
                                className="flex-1 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 focus:ring-4 focus:ring-emerald-300 font-medium rounded-lg text-sm px-3 py-2.5 text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Preview
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                disabled={!markingCourseUnit || isDownloading}
                                className="flex-1 text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300 font-medium rounded-lg text-sm px-3 py-2.5 text-center transition-colors shadow-md shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
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

export default GenerateMarkingSheet;
