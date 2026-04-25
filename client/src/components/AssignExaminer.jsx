import React, { useState, useEffect } from 'react';

const Icons = {
    Search: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
    ),
    Calendar: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
    ),
    Filter: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
    ),
    Users: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    ),
    CheckCircle: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
    ),
    Clock: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    ),
    Edit: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
    ),
    X: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" /></svg>
    ),
    Trash2: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
    ),
    Plus: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
    )
};

const AssignExaminer = () => {
    const [examiners, setExaminers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [academicYear, setAcademicYear] = useState("2024/2025");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [loading, setLoading] = useState(true);
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

                    // Map staff and group appointments by userId
                    const mergedExaminers = staffData.map(staff => {
                        const staffAppts = apptData.filter(a => a.userId === staff.id && a.academicYear === academicYear);

                        return {
                            id: staff.id,
                            name: staff.name,
                            email: staff.email,
                            appointments: staffAppts.length > 0 ? staffAppts : [
                                { id: `temp-${Date.now()}-${Math.random()}`, type: '', course: '', academicYear, status: 'Available' }
                            ]
                        };
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
    }, [academicYear, refreshTrigger]);

    const handleAppoint = async (staffId, apptId) => {
        const examiner = examiners.find(ex => ex.id === staffId);
        if (!examiner) return;

        const appt = examiner.appointments.find(a => a.id === apptId);
        if (!appt) return;

        if (!appt.type || !appt.course) {
            alert("Please select both an Examiner Type and a Course.");
            return;
        }

        try {
            const isTemp = String(appt.id).startsWith('temp-');
            const response = await fetch('http://localhost:5000/api/configurations/examiner-appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: staffId,
                    appointmentId: isTemp ? null : appt.id,
                    course: appt.course,
                    academicYear: academicYear,
                    type: appt.type
                })
            });

            const data = await response.json();

            if (response.ok) {
                setRefreshTrigger(r => r + 1);
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

    const handleRemove = async (staffId, apptId) => {
        const isTemp = String(apptId).startsWith('temp-');

        if (isTemp) {
            // Just remove from local state if it's a temp row
            setExaminers(prev => prev.map(ex => {
                if (ex.id === staffId) {
                    const newAppts = ex.appointments.filter(a => a.id !== apptId);
                    return { ...ex, appointments: newAppts.length > 0 ? newAppts : [{ id: `temp-${Date.now()}-${Math.random()}`, type: '', course: '', academicYear, status: 'Available' }] };
                }
                return ex;
            }));
            return;
        }

        if (!window.confirm("Are you sure you want to remove this assignment?")) return;

        try {
            const response = await fetch(`http://localhost:5000/api/configurations/examiner-appointments/${apptId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setRefreshTrigger(r => r + 1);
            } else {
                alert("Failed to remove assignment.");
            }
        } catch (error) {
            console.error("Failed to remove", error);
        }
    };

    const handleAddAllocation = (staffId) => {
        setExaminers(prev => prev.map(ex => {
            if (ex.id === staffId) {
                return {
                    ...ex,
                    appointments: [
                        ...ex.appointments,
                        { id: `temp-${Date.now()}-${Math.random()}`, type: '', course: '', academicYear, status: 'Available' }
                    ]
                };
            }
            return ex;
        }));
    };

    const updateAppointment = (staffId, apptId, updates) => {
        setExaminers(prev => prev.map(ex => {
            if (ex.id === staffId) {
                return {
                    ...ex,
                    appointments: ex.appointments.map(a =>
                        a.id === apptId ? { ...a, ...updates, status: 'Available' } : a
                    )
                };
            }
            return ex;
        }));
    };

    const filteredExaminers = examiners.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ex.appointments.some(a => a.course.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === "All" ||
            (statusFilter === "Appointed" && ex.appointments.some(a => a.status === "Appointed")) ||
            (statusFilter === "Available" && ex.appointments.every(a => a.status === "Available"));

        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: filteredExaminers.length,
        appointed: filteredExaminers.filter(e => e.appointments.some(a => a.status === "Appointed")).length,
        available: filteredExaminers.filter(e => e.appointments.every(a => a.status === "Available")).length
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
                    <p className="text-[10px] text-emerald-500/70 font-bold mt-2 uppercase tracking-tighter">Staff with Assignments</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md group">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">Fully Available</h4>
                        <span className="p-2 bg-blue-50 text-blue-500 rounded-xl group-hover:bg-blue-100 transition-colors">
                            <Icons.Clock />
                        </span>
                    </div>
                    <div className="text-3xl font-black text-blue-600 leading-none">{stats.available}</div>
                    <p className="text-[10px] text-blue-500/70 font-bold mt-2 uppercase tracking-tighter">No current assignments</p>
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
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Academic Year</span>
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
                                <th className="px-8 py-5">Allocations & Roles</th>
                                <th className="px-8 py-5 text-right w-64">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredExaminers.map((examiner) => (
                                <tr key={examiner.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-5 align-top">
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
                                        <div className="space-y-4">
                                            {examiner.appointments.map((appt, idx) => (
                                                <div key={appt.id} className="flex flex-col md:flex-row gap-3 items-stretch md:items-center bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50 hover:bg-white hover:shadow-sm transition-all group/appt">
                                                    <div className="flex-1">
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Unit Allocation</span>
                                                        <div className="relative group/select">
                                                            <select
                                                                className="block w-full bg-slate-100/50 border-none rounded-xl text-xs font-bold text-slate-700 py-2.5 pl-3 pr-8 appearance-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer group-hover/appt:bg-white"
                                                                value={appt.course}
                                                                onChange={(e) => updateAppointment(examiner.id, appt.id, { course: e.target.value })}
                                                                disabled={appt.status === "Appointed"}
                                                            >
                                                                <option value="" disabled>Select Course</option>
                                                                {courses.map(course => (
                                                                    <option key={course} value={course}>{course}</option>
                                                                ))}
                                                            </select>
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover/select:text-blue-500 transition-colors">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="w-full md:w-48">
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Role</span>
                                                        <div className="relative group/select">
                                                            <select
                                                                className="block w-full bg-slate-100/50 border-none rounded-xl text-xs font-bold text-slate-700 py-2.5 pl-3 pr-8 appearance-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer group-hover/appt:bg-white"
                                                                value={appt.type}
                                                                onChange={(e) => updateAppointment(examiner.id, appt.id, { type: e.target.value })}
                                                                disabled={appt.status === "Appointed"}
                                                            >
                                                                <option value="" disabled>Role</option>
                                                                <option value="Examiner 1">Examiner 1</option>
                                                                <option value="Examiner 2">Examiner 2</option>
                                                            </select>
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover/select:text-blue-500 transition-colors">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-end gap-2 pt-4 md:pt-0">
                                                        {appt.status !== "Appointed" ? (
                                                            <button
                                                                onClick={() => handleAppoint(examiner.id, appt.id)}
                                                                disabled={!appt.type || !appt.course}
                                                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95
                                                                    ${(!appt.type || !appt.course)
                                                                        ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                                                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                                                    }`}
                                                            >
                                                                Confirm
                                                            </button>
                                                        ) : (
                                                            <span className="px-4 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                                                                Appointed
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={() => handleRemove(examiner.id, appt.id)}
                                                            className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                                                            title="Remove Allocation"
                                                        >
                                                            <Icons.Trash2 />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right align-top">
                                        <button
                                            onClick={() => handleAddAllocation(examiner.id)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl text-xs font-black transition-all shadow-xl active:scale-95 group/btn"
                                        >
                                            <span className="p-1 bg-slate-800 rounded-md group-hover/btn:bg-blue-600 transition-colors">
                                                <Icons.Plus />
                                            </span>
                                            Add Allocation
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredExaminers.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="px-8 py-20 text-center">
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
        </div>
    );
};

export default AssignExaminer;
