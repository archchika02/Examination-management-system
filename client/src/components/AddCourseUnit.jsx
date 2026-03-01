import React, { useState, useEffect } from 'react';


const AddCourseUnit = () => {
    // State for existing courses
    const [courses, setCourses] = useState([]);

    const [formData, setFormData] = useState({
        code: '',
        title: '',
        academicYear: '',
        isNonWritten: 'No'
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/courses/list');
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.code || !formData.title) {
            alert("Please fill in course code and title.");
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/courses/add', {
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
        <div className="space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Side: Add New Course Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
                        <div className="mb-6 border-b border-gray-100 pb-4">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg text-lg">➕</span>
                                Add Course Unit
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Create a new course in the system.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 flex-1">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Course Code</label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    placeholder="e.g. CSC101"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Course Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Intro to CS"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Academic Year</label>
                                    <input
                                        type="text"
                                        name="academicYear"
                                        value={formData.academicYear}
                                        onChange={handleChange}
                                        placeholder="e.g. 2024/2025"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Non-Written?</label>
                                    <select
                                        name="isNonWritten"
                                        value={formData.isNonWritten}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm bg-white"
                                    >
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 mt-auto">
                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                                >
                                    <span>Save Course Unit</span>
                                    <span className="text-lg">💾</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Side: Course Units Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Existing Course Units</h3>
                                <p className="text-xs text-gray-500 mt-1">Manage and view all courses.</p>
                            </div>
                            <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                                Total: {courses.length}
                            </div>
                        </div>

                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Academic Year</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Non-Written</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {courses.length > 0 ? (
                                        courses.map((course) => (
                                            <tr key={course.id} className="hover:bg-indigo-50/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-indigo-900 bg-indigo-100/50 px-2 py-1 rounded text-sm">{course.code}</span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700 font-medium text-sm">
                                                    {course.title}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-bold text-xs ring-1 ring-gray-200">
                                                        {course.academic_year || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${course.isNonWritten === 'Yes'
                                                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                        }`}>
                                                        {course.isNonWritten === 'Yes' ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleRemove(course.id)}
                                                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                        title="Remove Course"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-400 bg-gray-50/30">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-4xl mb-2">📚</span>
                                                    <span className="text-sm">No courses added yet.</span>
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
