import React, { useState, useEffect } from 'react';

const AssignExaminer = () => {
    const [examiners, setExaminers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [academicYear, setAcademicYear] = useState("2024/2025");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [staffRes, coursesRes, apptRes] = await Promise.all([
                    fetch('http://localhost:5000/api/configurations/examiner-staff'),
                    fetch('http://localhost:5000/api/configurations/examiner-courses'),
                    fetch('http://localhost:5000/api/configurations/examiner-appointments')
                ]);

                if (staffRes.ok && coursesRes.ok && apptRes.ok) {
                    const staffData = await staffRes.json();
                    const coursesData = await coursesRes.json();
                    const apptData = await apptRes.json();

                    setCourses(coursesData);

                    // Merge staff with appointments if they exist
                    const mergedExaminers = staffData.map(staff => {
                        // Find if this staff member has an appointment for the currently viewed academicYear
                        const existingAppt = apptData.find(a => a.userId === staff.id && a.academicYear === academicYear);

                        if (existingAppt) {
                            return {
                                id: staff.id,
                                appointmentId: existingAppt.id,
                                name: staff.name,
                                email: staff.email,
                                type: existingAppt.type,
                                course: existingAppt.course,
                                academicYear: existingAppt.academicYear,
                                status: existingAppt.status
                            };
                        } else {
                            // If no current appointment, see if there is ANY appointment we can copy the type/course from
                            const previousAppt = apptData.find(a => a.userId === staff.id);

                            return {
                                id: staff.id,
                                appointmentId: null, // No active appointment for THIS academic year yet
                                name: staff.name,
                                email: staff.email,
                                type: previousAppt ? previousAppt.type : "",
                                course: previousAppt ? previousAppt.course : "",
                                academicYear: academicYear,
                                status: "Available"
                            };
                        }
                    });

                    setExaminers(mergedExaminers);
                }
            } catch (error) {
                console.error("Error fetching examiner data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [academicYear, refreshTrigger]); // Re-fetch if academic year changes or data refreshed

    const handleAppoint = async (id) => {
        const examinerToAppoint = examiners.find(ex => ex.id === id);
        if (!examinerToAppoint) return;

        // Visual Validation first
        if (!examinerToAppoint.type || !examinerToAppoint.course) {
            alert("Please select both an Examiner Type and a Course.");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/configurations/examiner-appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: examinerToAppoint.id,
                    appointmentId: examinerToAppoint.appointmentId,
                    course: examinerToAppoint.course,
                    academicYear: examinerToAppoint.academicYear,
                    type: examinerToAppoint.type
                })
            });

            const data = await response.json();

            if (response.ok) {
                setRefreshTrigger(r => r + 1);
                setEditingId(null); // Clear edit mode on success
            } else if (response.status === 409) {
                alert(data.message);
            } else {
                alert("Error assigning examiner: " + data.message);
            }
        } catch (error) {
            console.error("Failed to appoint", error);
            alert("Server connection failed.");
        }
    };

    const handleTypeChange = (id, newType) => {
        setExaminers(examiners.map(ex =>
            ex.id === id ? { ...ex, type: newType, status: "Available" } : ex
        ));
    };

    const handleCourseChange = (id, newCourse) => {
        setExaminers(examiners.map(ex =>
            ex.id === id ? { ...ex, course: newCourse, status: "Available" } : ex
        ));
    };

    const filteredExaminers = examiners.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ex.course.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "All" || ex.status === statusFilter;
        // In a real app, we might also filter by academicYear if the list contained mixed years, 
        // but here we assume the list is loaded based on the context or we just show all for now.
        // The requirements say "Displays the academic year entered in the typing field", implying the row data helps confirm it.
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: filteredExaminers.length,
        appointed: filteredExaminers.filter(e => e.status === "Appointed").length,
        available: filteredExaminers.filter(e => e.status === "Available").length
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header / Title Section could go here if not covered by Dashboard header */}

            {/* Top Control Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-end md:items-center justify-between gap-4">

                {/* Left Controls */}
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
                    {/* Search Bar */}
                    <div className="relative flex-1 min-w-[200px]">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by Name, Course..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Academic Year */}
                    <div className="flex flex-col">
                        <label className="text-xs text-gray-500 font-medium ml-1 mb-1">Academic Year</label>
                        <input
                            type="text"
                            placeholder="YYYY/YYYY"
                            className="w-40 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex flex-col">
                        <label className="text-xs text-gray-500 font-medium ml-1 mb-1">Status</label>
                        <select
                            className="w-40 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Available">Available</option>
                            <option value="Appointed">Appointed</option>
                        </select>
                    </div>
                </div>


            </div>

            {/* Examiner Assignment Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Name</th>
                                <th className="px-6 py-4 font-semibold">Examiner Type</th>
                                <th className="px-6 py-4 font-semibold">Course</th>
                                <th className="px-6 py-4 font-semibold">Academic Year</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredExaminers.map((examiner) => (
                                <tr key={examiner.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold mr-3 border border-gray-200">
                                                {examiner.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{examiner.name}</div>
                                                <div className="text-sm text-gray-500">{examiner.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            className="w-full bg-transparent border-none focus:ring-0 text-gray-700 text-sm p-0 cursor-pointer hover:text-indigo-600 transition-colors disabled:cursor-not-allowed disabled:hover:text-gray-700"
                                            value={examiner.type}
                                            onChange={(e) => handleTypeChange(examiner.id, e.target.value)}
                                            disabled={examiner.status === "Appointed" && editingId !== examiner.id}
                                        >
                                            <option value="" disabled>Select Type</option>
                                            <option value="Examiner 1">Examiner 1</option>
                                            <option value="Examiner 2">Examiner 2</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            className="w-full bg-transparent border-none focus:ring-0 text-gray-700 text-sm p-0 cursor-pointer hover:text-indigo-600 transition-colors disabled:cursor-not-allowed disabled:hover:text-gray-700"
                                            value={examiner.course}
                                            onChange={(e) => handleCourseChange(examiner.id, e.target.value)}
                                            disabled={examiner.status === "Appointed" && editingId !== examiner.id}
                                        >
                                            <option value="" disabled>Select Course</option>
                                            {courses.map(course => (
                                                <option key={course} value={course}>{course}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-gray-600 text-sm bg-gray-100 px-2 py-1 rounded">{academicYear}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${examiner.status === "Appointed"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-blue-100 text-blue-800"
                                            }`}>
                                            {examiner.status === "Appointed" && <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>}
                                            {examiner.status === "Available" && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5"></span>}
                                            {examiner.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {examiner.status === "Appointed" && editingId !== examiner.id ? (
                                            <button
                                                onClick={() => setEditingId(examiner.id)}
                                                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                            >
                                                Edit
                                            </button>
                                        ) : (
                                            <div className="flex justify-end gap-2">
                                                {editingId === examiner.id && (
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleAppoint(examiner.id)}
                                                    disabled={!examiner.type || !examiner.course}
                                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                                                        ${(!examiner.type || !examiner.course)
                                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                            : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md"
                                                        }`}
                                                >
                                                    {editingId === examiner.id ? "Save" : "Appoint"}
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredExaminers.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No examiners found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                    <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Examiners</p>
                        <h4 className="text-3xl font-extrabold text-gray-900 mt-2">{stats.total}</h4>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-xl text-gray-600 group-hover:bg-gray-200 transition-colors">
                        👥
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                    <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Appointed</p>
                        <h4 className="text-3xl font-extrabold text-gray-900 mt-2">{stats.appointed}</h4>
                    </div>
                    <div className="bg-green-100 p-3 rounded-xl text-green-600 group-hover:bg-green-200 transition-colors">
                        ✅
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                    <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Available</p>
                        <h4 className="text-3xl font-extrabold text-gray-900 mt-2">{stats.available}</h4>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-xl text-blue-600 group-hover:bg-blue-200 transition-colors">
                        ⏳
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignExaminer;
