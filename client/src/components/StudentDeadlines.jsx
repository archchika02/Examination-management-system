import { useState, useEffect } from 'react';

const StudentDeadlines = () => {
    const [deadlines, setDeadlines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load deadlines from localStorage (shared with Faculty view)
        const stored = localStorage.getItem('ems_deadlines');
        if (stored) {
            const allDeadlines = JSON.parse(stored);
            // Filter deadlines intended for 'Students'
            const studentDeadlines = allDeadlines.filter(d =>
                d.roles && d.roles.includes('Students')
            );
            // Sort by date ascending (soonest first)
            studentDeadlines.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
            setDeadlines(studentDeadlines);
        } else {
            // If no custom deadlines found, use fallback mock data for testing clarity
            const mockDefaults = [
                {
                    id: 1,
                    formName: 'Course Registration Form',
                    deadline: '2026-05-15',
                    description: 'Deadline for students to register for courses'
                },
                {
                    id: 2,
                    formName: 'Add/Drop Form',
                    deadline: '2026-05-20',
                    description: 'Period for adding or dropping courses ends'
                }
            ];
            setDeadlines(mockDefaults);
        }
        setLoading(false);
    }, []);

    const getStatusColor = (deadlineDate) => {
        const today = new Date();
        const due = new Date(deadlineDate);
        const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'bg-gray-100 text-gray-500 border-gray-200'; // Past due
        if (diffDays <= 3) return 'bg-red-50 text-red-600 border-red-200 animate-pulse'; // Urgent
        if (diffDays <= 7) return 'bg-orange-50 text-orange-600 border-orange-200'; // Upcoming soon
        return 'bg-blue-50 text-blue-600 border-blue-200'; // Normal
    };

    const getStatusText = (deadlineDate) => {
        const today = new Date();
        const due = new Date(deadlineDate);
        const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Expired';
        if (diffDays === 0) return 'Due Today';
        if (diffDays === 1) return 'Tomorrow';
        return `${diffDays} Days Left`;
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading deadlines...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-10">
            <div>
                <h2 className="text-3xl font-bold text-gray-800">Deadlines</h2>
                <p className="text-gray-500 mt-1">Track important submission dates and academic schedules.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {deadlines.length > 0 ? (
                    deadlines.map((deadline) => (
                        <div
                            key={deadline.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all group relative overflow-hidden"
                        >
                            <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-xl border-l border-b ${getStatusColor(deadline.deadline)}`}>
                                {getStatusText(deadline.deadline)}
                            </div>

                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <span className="text-2xl">⏰</span>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                {deadline.formName}
                            </h3>

                            <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">
                                {deadline.description || 'No additional details provided.'}
                            </p>

                            <div className="flex items-center text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-lg">
                                <span className="mr-2">📅</span>
                                Due Date: <span className="ml-auto font-mono">{deadline.deadline}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
                        <span className="text-4xl block mb-2">🎉</span>
                        <h3 className="text-lg font-bold text-gray-800">No Pending Deadlines</h3>
                        <p className="text-gray-500">You are all caught up! Check back later for new schedules.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDeadlines;
