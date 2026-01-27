import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const UploadResults = () => {
    const { user } = useAuth();

    // -- State --
    const [academicYear, setAcademicYear] = useState('');
    const [selectedExam, setSelectedExam] = useState('');
    const [students, setStudents] = useState([]);
    const [isTableVisible, setIsTableVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [marks, setMarks] = useState({}); // { studentId: { examiner1: val, examiner2: val } }
    const [errors, setErrors] = useState({}); // { studentId: errorMsg }
    const [submissionStatus, setSubmissionStatus] = useState('idle'); // idle, draft, submitted

    // -- Mock Data --
    const academicYears = ['2023 / 2024', '2024 / 2025'];

    const assignedExams = [
        { id: 'INTE 21213', code: 'INTE 21213', name: 'Data Structures (Final Exam)', role: 'Examiner 1' },
        { id: 'INTE 31283', code: 'INTE 31283', name: 'Big Data and Warehousing', role: 'Examiner 1' },
        { id: 'INTE 21333', code: 'INTE 21333', name: 'Event Driven Programming', role: 'Examiner 1' },
    ];

    // Mock students data generator
    const generateMockStudents = (examId) => {
        return [
            { id: 'IM/2022/025', name: 'Alice Johnson', regNo: 'IM/2022/025' },
            { id: 'IM/2022/026', name: 'Bob Smith', regNo: 'IM/2022/026' },
            { id: 'IM/2022/027', name: 'Charlie Brown', regNo: 'IM/2022/027' },
            { id: 'IM/2022/028', name: 'Diana Ross', regNo: 'IM/2022/028' },
            { id: 'IM/2022/029', name: 'Evan Wright', regNo: 'IM/2022/029' },
        ];
    };

    // -- Handlers --

    const handleLoadStudents = () => {
        if (!academicYear || !selectedExam) return;

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            const mockStudents = generateMockStudents(selectedExam);
            setStudents(mockStudents);

            // Initialize marks state if empty
            const initialMarks = {};
            mockStudents.forEach(s => {
                initialMarks[s.id] = { examiner1: '', examiner2: '', final: '' };
            });
            setMarks(initialMarks);

            setIsTableVisible(true);
            setLoading(false);
        }, 800);
    };

    const handleMarkChange = (studentId, field, value) => {
        if (submissionStatus === 'submitted') return;

        let error = null;
        if (value !== '') {
            // Check if it's a valid number
            const numVal = parseFloat(value);
            const isNumber = !isNaN(numVal) && isFinite(value);

            if (isNumber) {
                if (numVal < 0 || numVal > 100) {
                    error = 'Must be 0-100';
                }
            } else {
                // Allow letters, +, - for grades (e.g. A+, B-, MC, AB)
                const validGradeRegex = /^[a-zA-Z\+\-]+$/;
                if (!validGradeRegex.test(value)) {
                    error = 'Invalid format';
                }
            }
        }

        setErrors(prev => ({
            ...prev,
            [studentId]: error
        }));

        setMarks(prev => {
            const studentMarks = { ...prev[studentId], [field]: value };

            let newFinal = studentMarks.final;

            if (field === 'examiner1' || field === 'examiner2') {
                const v1 = parseFloat(studentMarks.examiner1);
                const v2 = parseFloat(studentMarks.examiner2);
                if (!isNaN(v1) && !isNaN(v2)) {
                    newFinal = Math.round((v1 + v2) / 2);
                }
            }

            return {
                ...prev,
                [studentId]: {
                    ...studentMarks,
                    final: newFinal
                }
            };
        });
    };



    const handleUploadDraft = () => {
        // Simulate save draft
        alert('Results saved as draft!');
        setSubmissionStatus('draft');
    };

    const handleSubmit = () => {
        // Validation before submit
        const currentExamRole = assignedExams.find(e => e.id === selectedExam)?.role;
        const markField = currentExamRole === 'Examiner 1' ? 'examiner1' : 'examiner2';

        const missingMarks = students.some(s => marks[s.id]?.[markField] === '');
        if (missingMarks) {
            alert('Please fill in all marks for your assigned role before submitting.');
            return;
        }

        const hasErrors = Object.values(errors).some(e => e !== null);
        if (hasErrors) {
            alert('Please correct invalid marks before submitting.');
            return;
        }

        if (confirm('Are you sure you want to submit? This will lock the results.')) {
            setSubmissionStatus('submitted');
            alert('Results submitted successfully! Usage notification sent to Academic Supervisor.');
        }
    };

    // Helper to determine if current user can edit a field
    const canEdit = (field) => {
        if (submissionStatus === 'submitted') return false;

        const exam = assignedExams.find(e => e.id === selectedExam);
        if (!exam) return false;

        if (field === 'examiner1' && exam.role === 'Examiner 1') return true;
        if (field === 'examiner2' && exam.role === 'Examiner 2') return true;

        return false;
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header / Title Section */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Upload Results</h2>
                    <p className="text-gray-500 text-sm">Enter and submit examination results for your appointed subjects.</p>
                </div>
                {submissionStatus === 'submitted' && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
                        ✅ Submitted
                    </span>
                )}
            </div>

            {/* Configuration Panel */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    {/* Academic Year */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Academic Year <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                        >
                            <option value="">Select Year</option>
                            {academicYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    {/* Exam Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Exam Selection <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedExam}
                            onChange={(e) => setSelectedExam(e.target.value)}
                            className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                        >
                            <option value="">Select Exam</option>
                            {assignedExams.map(exam => (
                                <option key={exam.id} value={exam.id}>{exam.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Load Button */}
                    <div>
                        <button
                            onClick={handleLoadStudents}
                            disabled={!academicYear || !selectedExam || loading}
                            className={`w-full py-2.5 px-4 rounded-lg font-semibold text-white transition-all shadow-md
                                ${(!academicYear || !selectedExam || loading)
                                    ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 hover:shadow-lg active:scale-95'
                                }
                            `}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading...
                                </span>
                            ) : (
                                'Load Students'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Table Section */}
            {isTableVisible && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Student Results List</h3>
                        <div className="text-sm text-gray-500">
                            Role: <span className="font-semibold text-teal-700">{assignedExams.find(e => e.id === selectedExam)?.role}</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 border-b border-gray-100 font-semibold">Student ID</th>
                                    <th className="p-4 border-b border-gray-100 font-semibold">Name</th>
                                    <th className="p-4 border-b border-gray-100 font-semibold w-32">Examiner 1</th>
                                    <th className="p-4 border-b border-gray-100 font-semibold w-32">Examiner 2</th>
                                    <th className="p-4 border-b border-gray-100 font-semibold w-24">Final</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 font-mono text-gray-600">{student.id}</td>
                                        <td className="p-4 font-medium text-gray-800">
                                            {student.name}
                                            <div className="text-xs text-gray-400 font-normal">{student.regNo}</div>
                                        </td>

                                        {/* Examiner 1 Marks */}
                                        <td className="p-4">
                                            <input
                                                type="text"
                                                value={marks[student.id]?.examiner1 || ''}
                                                onChange={(e) => handleMarkChange(student.id, 'examiner1', e.target.value)}
                                                disabled={!canEdit('examiner1')}
                                                className={`w-full p-2 border rounded-md text-center outline-none transition-all
                                                    ${errors[student.id] ? 'border-red-300 bg-red-50 focus:border-red-500' : 'border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500'}
                                                    ${!canEdit('examiner1') ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white'}
                                                `}
                                                placeholder="-"
                                            />
                                        </td>

                                        {/* Examiner 2 Marks */}
                                        <td className="p-4">
                                            <input
                                                type="text"
                                                value={marks[student.id]?.examiner2 || ''}
                                                onChange={(e) => handleMarkChange(student.id, 'examiner2', e.target.value)}
                                                disabled={!canEdit('examiner2')}
                                                className={`w-full p-2 border rounded-md text-center outline-none transition-all
                                                    ${errors[student.id] ? 'border-red-300 bg-red-50 focus:border-red-500' : 'border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500'}
                                                    ${!canEdit('examiner2') ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white'}
                                                `}
                                                placeholder="-"
                                            />
                                        </td>

                                        {/* Final Marks (Auto-calc) */}
                                        <td className="p-4">
                                            <input
                                                type="text"
                                                value={marks[student.id]?.final || ''}
                                                onChange={(e) => handleMarkChange(student.id, 'final', e.target.value)}
                                                disabled={submissionStatus === 'submitted'}
                                                className={`w-full p-2 border rounded-md text-center outline-none transition-all font-bold text-gray-700
                                                    ${submissionStatus === 'submitted' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 border-gray-200'}
                                                `}
                                                placeholder="-"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Action Buttons Footer */}
                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            onClick={handleUploadDraft}
                            disabled={submissionStatus === 'submitted'}
                            className={`px-6 py-2.5 rounded-lg border font-medium transition-all
                                ${submissionStatus === 'submitted'
                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 shadow-sm'}
                            `}
                        >
                            Save Draft
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submissionStatus === 'submitted'}
                            className={`px-6 py-2.5 rounded-lg font-medium text-white shadow-md transition-all
                                ${submissionStatus === 'submitted'
                                    ? 'bg-gray-400 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg active:scale-95'}
                            `}
                        >
                            {submissionStatus === 'submitted' ? 'Submitted' : 'Submit Results'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadResults;
