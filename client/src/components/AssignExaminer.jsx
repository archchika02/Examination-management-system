import React, { useState, useEffect } from 'react';

const Icons = {
    Search: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    ),
    Calendar: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
    ),
    Filter: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
    ),
    Users: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ),
    CheckCircle: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    ),
    Clock: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    ),
    Edit: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
    ),
    X: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
    )
};

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
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: filteredExaminers.length,
        appointed: filteredExaminers.filter(e => e.status === "Appointed").length,
        available: filteredExaminers.filter(e => e.status === "Available").length
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md group">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">Total Registry</h4>
                        <span className="p-2 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-slate-100 group-hover:text-slate-600 transition-colors">
                            <Icons.Users />
                        </span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 leading-none">{stats.total}</div>
                    <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tighter">Academic Staff Listed</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md group">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">Appointed</h4>
                        <span className="p-2 bg-emerald-50 text-emerald-500 rounded-xl group-hover:bg-emerald-100 transition-colors">
                            <Icons.CheckCircle />
                        </span>
                    </div>
                    <div className="text-3xl font-black text-emerald-600 leading-none">{stats.appointed}</div>
                    <p className="text-[10px] text-emerald-500/70 font-bold mt-2 uppercase tracking-tighter">Configurations Finalized</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md group">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">Pending Availability</h4>
                        <span className="p-2 bg-blue-50 text-blue-500 rounded-xl group-hover:bg-blue-100 transition-colors">
                            <Icons.Clock />
                        </span>
                    </div>
                    <div className="text-3xl font-black text-blue-600 leading-none">{stats.available}</div>
                    <p className="text-[10px] text-blue-500/70 font-bold mt-2 uppercase tracking-tighter">Awaiting Assignment</p>
                </div>
            </div>

            {/* Comprehensive Controls Bar */}
            <div className="bg-slate-900 p-2 rounded-2xl shadow-xl flex flex-col md:flex-row items-stretch md:items-center gap-2">
                <div className="relative flex-1 group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                        <Icons.Search />
                    </span>
                    <input
                        type="text"
                        placeholder="Search by personnel or course..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-800 border-none rounded-xl text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 p-1">
                    <div className="flex items-center bg-slate-800 rounded-xl px-4 py-2 group focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                        <span className="text-blue-400 mr-3">
                            <Icons.Calendar />
                        </span>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Session</span>
                            <input
                                type="text"
                                className="bg-transparent border-none p-0 text-white text-xs font-bold focus:ring-0 w-24 h-4"
                                value={academicYear}
                                onChange={(e) => setAcademicYear(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center bg-slate-800 rounded-xl px-4 py-2 group focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                        <span className="text-blue-400 mr-3">
                            <Icons.Filter />
                        </span>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Status</span>
                            <select
                                className="bg-transparent border-none p-0 text-white text-xs font-bold focus:ring-0 w-24 h-4 cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All" className="bg-slate-800">All</option>
                                <option value="Available" className="bg-slate-800">Available</option>
                                <option value="Appointed" className="bg-slate-800">Appointed</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Examiner Assignment Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase text-slate-500 font-black tracking-widest">
                                <th className="px-8 py-5">Personnel</th>
                                <th className="px-8 py-5">Role Assignment</th>
                                <th className="px-8 py-5">Unit Allocation</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredExaminers.map((examiner) => (
                                <tr key={examiner.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-black border border-slate-200 group-hover:scale-105 transition-transform uppercase shadow-sm shadow-slate-100">
                                                {examiner.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-900 leading-none mb-1 group-hover:text-blue-600 transition-colors">{examiner.name}</div>
                                                <div className="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 transition-colors">{examiner.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="relative group/select">
                                            <select
                                                className="block w-full bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-700 py-2.5 pl-3 pr-8 appearance-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group-hover/select:bg-white group-hover/select:shadow-sm"
                                                value={examiner.type}
                                                onChange={(e) => handleTypeChange(examiner.id, e.target.value)}
                                                disabled={examiner.status === "Appointed" && editingId !== examiner.id}
                                            >
                                                <option value="" disabled>Select Type</option>
                                                <option value="Examiner 1">Examiner 1</option>
                                                <option value="Examiner 2">Examiner 2</option>
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover/select:text-blue-500 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="relative group/select">
                                            <select
                                                className="block w-full bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-700 py-2.5 pl-3 pr-8 appearance-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group-hover/select:bg-white group-hover/select:shadow-sm"
                                                value={examiner.course}
                                                onChange={(e) => handleCourseChange(examiner.id, e.target.value)}
                                                disabled={examiner.status === "Appointed" && editingId !== examiner.id}
                                            >
                                                <option value="" disabled>Select Course</option>
                                                {courses.map(course => (
                                                    <option key={course} value={course}>{course}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover/select:text-blue-500 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm
                                            ${examiner.status === "Appointed"
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-50"
                                                : "bg-blue-50 text-blue-700 border-blue-100 shadow-blue-50"
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${examiner.status === "Appointed" ? "bg-emerald-500 animate-pulse" : "bg-blue-500"}`}></span>
                                            {examiner.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        {examiner.status === "Appointed" && editingId !== examiner.id ? (
                                            <button
                                                onClick={() => setEditingId(examiner.id)}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-100 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95"
                                            >
                                                <Icons.Edit />
                                                Edit
                                            </button>
                                        ) : (
                                            <div className="flex justify-end gap-2">
                                                {editingId === examiner.id && (
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95"
                                                    >
                                                        <Icons.X />
                                                        Cancel
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleAppoint(examiner.id)}
                                                    disabled={!examiner.type || !examiner.course}
                                                    className={`inline-flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 text-white
                                                        ${(!examiner.type || !examiner.course)
                                                            ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                                                            : "bg-blue-600 hover:bg-blue-700 shadow-blue-200 hover:-translate-y-0.5"
                                                        }`}
                                                >
                                                    {editingId === examiner.id ? "Save Changes" : "Confirm Appointment"}
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredExaminers.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                                <Icons.Search />
                                            </div>
                                            <p className="text-sm font-bold text-slate-900">No personnel matches found</p>
                                            <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters.</p>
                                        </div>
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
