import React, { useState, useEffect } from 'react';

const Icons = {
    Plus: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" /></svg>
    ),
    Save: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
    ),
    Trash: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
    ),
    BookOpen: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
    ),
    Layers: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
    ),
    Info: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="16" y2="12" /><line x1="12" x2="12" y1="8" y2="8" /></svg>
    )
};


const AddCourseUnit = ({ isReadOnly = false }) => {
    // State for existing courses
    const [courses, setCourses] = useState([]);

    const [formData, setFormData] = useState({
        code: '',
        title: '',
        academicYear: '',
        isNonWritten: 'No'
    });

    const [filters, setFilters] = useState({
        status: 'All',
        academicYear: 'All'
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/modules/list');
            const data = await res.json();
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const acadYears = ['All', ...new Set(courses.map(c => c.academic_year).filter(Boolean))].sort().reverse();

    const filteredCourses = courses.filter(course => {
        const statusMatch = filters.status === 'All' ||
            (filters.status === 'Written' && course.isNonWritten !== 'Yes') ||
            (filters.status === 'Non-Written' && course.isNonWritten === 'Yes');

        const yearMatch = filters.academicYear === 'All' ||
            (course.academic_year && course.academic_year.toLowerCase().includes(filters.academicYear.toLowerCase()));

        return statusMatch && yearMatch;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.code || !formData.title) {
            alert("Please fill in course code and title.");
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/modules/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: formData.code,
                    title: formData.title,
                    academicYear: formData.academicYear,
                    isNonWritten: formData.isNonWritten
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to add course unit');
            }

            // Refresh course list
            fetchCourses();

            // Reset form
            setFormData({
                code: '',
                title: '',
                academicYear: '',
                isNonWritten: 'No'
            });

            alert('Course Unit added successfully!');
        } catch (error) {
            console.error('Error adding course:', error);
            alert(error.message || 'Failed to add course unit');
        }
    };

    const handleRemove = (id) => {
        if (window.confirm("Are you sure you want to remove this course unit?")) {
            setCourses(courses.filter(course => course.id !== id));
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Side: Add New Course Form */}
                {!isReadOnly && (
                    <div className="lg:col-span-4 sticky top-6">
                        <div className="bg-white p-8 rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100">
                            <div className="mb-8 flex items-center gap-4">
                                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-200">
                                    <Icons.Plus />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest text-xs">Add Course Unit</h2>
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">System Registry</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Course Code</label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        placeholder="e.g. INTE21233"
                                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-900 placeholder:text-slate-300 text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Course Title</label>
                                    <textarea
                                        name="title"
                                        rows="1"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g. Computer Architecture"
                                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-900 placeholder:text-slate-300 text-sm resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Academic Year</label>
                                        <input
                                            type="text"
                                            name="academicYear"
                                            value={formData.academicYear}
                                            onChange={handleChange}
                                            placeholder="2024/2025"
                                            className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-900 placeholder:text-slate-300 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Type</label>
                                        <select
                                            name="isNonWritten"
                                            value={formData.isNonWritten}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-900 text-sm appearance-none cursor-pointer"
                                        >
                                            <option value="No">Written</option>
                                            <option value="Yes">Non-Written</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full group relative mt-4 overflow-hidden rounded-2xl bg-slate-900 p-4 text-white transition-all hover:bg-slate-800 active:scale-[0.98] shadow-xl shadow-slate-200"
                                >
                                    <div className="relative flex items-center justify-center gap-3">
                                        <Icons.Save />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Register Course Unit</span>
                                    </div>
                                </button>
                            </form>
                        </div>

                        <div className="mt-6 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-start gap-3">
                            <div className="text-blue-500 mt-0.5">
                                <Icons.Info />
                            </div>
                            <p className="text-[10px] font-bold text-blue-700 leading-relaxed uppercase tracking-widest">
                                New course unit will be immediately available for faculty.
                            </p>
                        </div>
                    </div>
                )}

                {/* Right Side: Course Units Table */}
                <div className={isReadOnly ? "lg:col-span-12" : "lg:col-span-8"}>
                    <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/30">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-900 rounded-2xl text-white">
                                    <Icons.BookOpen />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest text-xs">Existing Registry</h3>
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Academic Catalog</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Year:</span>
                                    <input
                                        type="text"
                                        name="academicYear"
                                        placeholder="All Years"
                                        value={filters.academicYear === 'All' ? '' : filters.academicYear}
                                        onChange={(e) => setFilters(prev => ({ ...prev, academicYear: e.target.value || 'All' }))}
                                        className="text-[10px] font-black text-slate-900 bg-transparent outline-none w-20 placeholder:text-slate-300"
                                    />
                                </div>

                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status:</span>
                                    <select
                                        name="status"
                                        value={filters.status}
                                        onChange={handleFilterChange}
                                        className="text-[10px] font-black text-slate-900 bg-transparent outline-none cursor-pointer"
                                    >
                                        <option value="All">All Types</option>
                                        <option value="Written">Written</option>
                                        <option value="Non-Written">Non-Written</option>
                                    </select>
                                </div>

                                <div className="bg-white px-4 py-1.5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2 ml-auto md:ml-0">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Count:</span>
                                    <span className="text-xs font-black text-blue-600">{filteredCourses.length}</span>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Course Detail</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Academic Year</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredCourses.length > 0 ? (
                                        filteredCourses.map((course) => (
                                            <tr key={course.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                            <Icons.Layers />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-black text-slate-900 mb-0.5">{course.code}</div>
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter max-w-[200px] truncate">{course.title}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest">
                                                        {course.academic_year || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm
                                                        ${course.isNonWritten === 'Yes'
                                                            ? 'bg-purple-50 text-purple-700 border-purple-100'
                                                            : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                        }`}>
                                                        {course.isNonWritten === 'Yes' ? 'Non-Written' : 'Written'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="p-4 bg-slate-50 rounded-full mb-4 text-slate-300">
                                                        <Icons.BookOpen />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No course units found for the selected filters</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddCourseUnit;
