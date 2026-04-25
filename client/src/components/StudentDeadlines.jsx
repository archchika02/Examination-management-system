import { useState, useEffect } from 'react';

const StudentDeadlines = () => {
    const [deadlines, setDeadlines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeadlines = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/deadlines');
                if (res.ok) {
                    const data = await res.json();
                    
                    // Sort by ID descending to ensure we get the latest row for each form First
                    data.sort((a, b) => b.id - a.id);
                    
                    const uniqueForms = [];
                    const seenForms = new Set();
                    const targetForms = new Set([
                        'Academic Course Unit',
                        'Add/Drop Form',
                        'Medical/Repeat Form'
                    ]);

                    for (const d of data) {
                        if (targetForms.has(d.form_name) && !seenForms.has(d.form_name)) {
                            seenForms.add(d.form_name);
                            uniqueForms.push(d);
                        }
                    }

                    const activeDeadlines = uniqueForms.map((d) => {
                        const rawDate = d.deadline || d.due_date;
                        const dateObj = new Date(rawDate);
                        
                        // Option to format like "May 15, 2026, 11:59 PM"
                        const formattedDate = dateObj.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });

                        const title = d.form_name + (d.academic_year ? ` (${d.academic_year})` : '');

                        return {
                            id: d.id,
                            formName: title,
                            deadline: formattedDate,
                            rawDate: dateObj,
                            description: d.description || 'No description provided.'
                        };
                    });

                    // Sort back by upcoming date
                    activeDeadlines.sort((a, b) => a.rawDate - b.rawDate);
                    
                    setDeadlines(activeDeadlines);
                } else {
                    console.error("Failed to fetch deadlines");
                }
            } catch (error) {
                console.error("Error fetching deadlines:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDeadlines();
    }, []);

    const getStatusColor = (rawDate) => {
        const today = new Date();
        const due = new Date(rawDate);
        const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'bg-gray-100 text-gray-500 border-gray-200'; // Past due
        if (diffDays <= 3) return 'bg-red-50 text-red-600 border-red-200 animate-pulse'; // Urgent
        if (diffDays <= 7) return 'bg-orange-50 text-orange-600 border-orange-200'; // Upcoming soon
        return 'bg-blue-50 text-blue-600 border-blue-200'; // Normal
    };

    const getStatusText = (rawDate) => {
        const today = new Date();
        const due = new Date(rawDate);
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
                            <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-xl border-l border-b ${getStatusColor(deadline.rawDate)}`}>
                                {getStatusText(deadline.rawDate)}
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
                                Due Date: <span className="ml-auto font-mono whitespace-nowrap">{deadline.deadline}</span>
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
