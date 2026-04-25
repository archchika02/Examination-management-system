import { useState, useEffect } from 'react';

const SupervisorTimetableManager = () => {
    const [entries, setEntries] = useState([]);
    const [newEntry, setNewEntry] = useState({
        courseUnit: '',
        date: '',
        time: '',
        venue: '',
        role: 'Supervisor' // Default role
    });

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('ems_timetable_data');
        if (stored) {
            setEntries(JSON.parse(stored));
        }
    }, []);

    // Save to localStorage whenever entries change
    useEffect(() => {
        localStorage.setItem('ems_timetable_data', JSON.stringify(entries));
    }, [entries]);

    const handleAdd = () => {
        if (!newEntry.courseUnit || !newEntry.date || !newEntry.time || !newEntry.venue) {
            alert("Please fill in all fields");
            return;
        }

        const entry = {
            id: Date.now(),
            ...newEntry
        };

        setEntries([...entries, entry]);
        setNewEntry({
            courseUnit: '',
            date: '',
            time: '',
            venue: '',
            role: 'Supervisor'
        });
    };

    const handleRemove = (id) => {
        setEntries(entries.filter(e => e.id !== id));
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Exam Timetable</h2>

                {/* Input Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course Unit</label>
                        <input
                            type="text"
                            placeholder="e.g. INTE 21233"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={newEntry.courseUnit}
                            onChange={(e) => setNewEntry({ ...newEntry, courseUnit: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={newEntry.date}
                            onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                        <input
                            type="time"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={newEntry.time}
                            onChange={(e) => setNewEntry({ ...newEntry, time: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                        <input
                            type="text"
                            placeholder="e.g. Hall A"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={newEntry.venue}
                            onChange={(e) => setNewEntry({ ...newEntry, venue: e.target.value })}
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleAdd}
                            className="w-full bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 font-bold transition-colors"
                        >
                            + Add Schedule
                        </button>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800">Scheduled Exams / Classes</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 font-medium">Course Unit</th>
                                <th className="px-6 py-3 font-medium">Date</th>
                                <th className="px-6 py-3 font-medium">Time</th>
                                <th className="px-6 py-3 font-medium">Venue</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {entries.length > 0 ? (
                                entries.map(entry => (
                                    <tr key={entry.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-bold text-gray-800">{entry.courseUnit}</td>
                                        <td className="px-6 py-4 text-gray-600">{entry.date}</td>
                                        <td className="px-6 py-4 text-gray-600">{entry.time}</td>
                                        <td className="px-6 py-4 text-indigo-600 font-medium">{entry.venue}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleRemove(entry.id)}
                                                className="text-red-500 hover:text-red-700 text-sm font-semibold px-3 py-1 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400 text-sm">
                                        No exams scheduled yet. Add one above.
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

export default SupervisorTimetableManager;
