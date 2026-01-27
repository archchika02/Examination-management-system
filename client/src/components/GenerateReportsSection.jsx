import { useState } from 'react';

const GenerateReportsSection = () => {
    // State for Admission Sheet
    const [admissionLevel, setAdmissionLevel] = useState('');
    const [admissionRepeatYear, setAdmissionRepeatYear] = useState('');

    // State for Attendance Sheet
    const [attendanceLevel, setAttendanceLevel] = useState('Level 1');

    // State for Marking Sheet
    const [markingCourseUnit, setMarkingCourseUnit] = useState('');

    // Mock Data
    const levels = ['Level 1', 'Level 2', 'Level 3', 'Level 4'];
    const repeatYears = ['2023/2024', '2024/2025', '2025/2026'];
    const courseUnits = ['CS1101 - Programming I', 'CS1102 - Database Systems', 'CS2201 - Data Structures', 'CS3202 - Software Engineering'];

    const handleGeneratePreview = (reportType) => {
        alert(`Generating preview for ${reportType}...`);
    };

    const handleDownloadPDF = (reportType) => {
        alert(`Downloading PDF for ${reportType}...`);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Generate Reports</h2>
                    <p className="text-gray-500 text-sm">Create and download examination-related reports.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Select Repeat Year</label>
                                <select
                                    value={admissionRepeatYear}
                                    onChange={(e) => setAdmissionRepeatYear(e.target.value)}
                                    className="w-full bg-gray-50 text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 border border-gray-200"
                                >
                                    <option value="">Select Year</option>
                                    {repeatYears.map(year => <option key={year} value={year}>{year}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => handleGeneratePreview('Admission Sheet')}
                                disabled={!admissionLevel || !admissionRepeatYear}
                                className="flex-1 text-blue-600 bg-blue-50 hover:bg-blue-100 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2.5 text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Preview
                            </button>
                            <button
                                onClick={() => handleDownloadPDF('Admission Sheet')}
                                disabled={!admissionLevel || !admissionRepeatYear}
                                className="flex-1 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2.5 text-center transition-colors shadow-md shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                Download
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
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Level</label>
                                <select
                                    value={attendanceLevel}
                                    onChange={(e) => setAttendanceLevel(e.target.value)}
                                    className="w-full bg-gray-50 text-gray-800 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 border border-gray-200"
                                >
                                    {levels.map(level => <option key={level} value={level}>{level}</option>)}
                                </select>
                            </div>
                            <div className="invisible">
                                <label className="block text-xs font-semibold text-transparent uppercase mb-1">Spacer</label>
                                <div className="p-2.5 text-sm">&nbsp;</div>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => handleGeneratePreview('Attendance Sheet')}
                                disabled={!attendanceLevel}
                                className="flex-1 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-3 py-2.5 text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Preview
                            </button>
                            <button
                                onClick={() => handleDownloadPDF('Attendance Sheet')}
                                disabled={!attendanceLevel}
                                className="flex-1 text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-3 py-2.5 text-center transition-colors shadow-md shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                Download
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. Marking Sheet Card */}
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
                                    {courseUnits.map(course => <option key={course} value={course}>{course}</option>)}
                                </select>
                            </div>
                            <div className="invisible">
                                <label className="block text-xs font-semibold text-transparent uppercase mb-1">Spacer</label>
                                <div className="p-2.5 text-sm">&nbsp;</div>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => handleGeneratePreview('Marking Sheet')}
                                disabled={!markingCourseUnit}
                                className="flex-1 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 focus:ring-4 focus:ring-emerald-300 font-medium rounded-lg text-sm px-3 py-2.5 text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Preview
                            </button>
                            <button
                                onClick={() => handleDownloadPDF('Marking Sheet')}
                                disabled={!markingCourseUnit}
                                className="flex-1 text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300 font-medium rounded-lg text-sm px-3 py-2.5 text-center transition-colors shadow-md shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                Download
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default GenerateReportsSection;
