import { useState } from 'react';

const AcademicCourseUnits = () => {
    // Mock Data
    const [registrations, setRegistrations] = useState([
        {
            id: 1,
            studentNumber: 'IM/2022/025',
            studentName: 'Alice Smith',
            formName: 'CourseReg_2023001.pdf',
            courseUnits: ['CS101', 'CS102', 'MA101'],
            dateSubmitted: '2026-01-20',
            status: 'Pending'
        },
        {
            id: 2,
            studentNumber: 'IM/2022/026',
            studentName: 'Bob Johnson',
            formName: 'CourseReg_2023002.pdf',
            courseUnits: ['CS101', 'CS103', 'PH101'],
            dateSubmitted: '2026-01-21',
            status: 'Approved'
        },
        {
            id: 3,
            studentNumber: 'IM/2022/027',
            studentName: 'Charlie Brown',
            formName: 'CourseReg_2023003.pdf',
            courseUnits: ['CS101', 'MA102'],
            dateSubmitted: '2026-01-22',
            status: 'Rejected'
        },
        {
            id: 4,
            studentNumber: 'IM/2022/028',
            studentName: 'David Wilson',
            formName: 'CourseReg_2023015.pdf',
            courseUnits: ['CS102', 'CS103', 'MA101'],
            dateSubmitted: '2026-01-24',
            status: 'Pending'
        },
        {
            id: 5,
            studentNumber: 'IM/2022/029',
            studentName: 'Eva Green',
            formName: 'CourseReg_2023022.pdf',
            courseUnits: ['CS101', 'CS102', 'PH101'],
            dateSubmitted: '2026-01-25',
            status: 'Pending'
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    // Modal State
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    // Filter Logic
    const filteredRegistrations = registrations.filter(reg => {
        const matchesSearch = reg.studentNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || reg.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Actions
    const handleApprove = (id) => {
        setRegistrations(registrations.map(reg =>
            reg.id === id ? { ...reg, status: 'Approved' } : reg
        ));
    };

    const initiateReject = (reg) => {
        setSelectedRegistration(reg);
        setRejectReason('');
        setRejectModalOpen(true);
    };

    const confirmReject = () => {
        if (selectedRegistration) {
            console.log(`Rejecting ${selectedRegistration.studentNumber} with reason: ${rejectReason}`);
            setRegistrations(registrations.map(reg =>
                reg.id === selectedRegistration.id ? { ...reg, status: 'Rejected' } : reg
            ));
            setRejectModalOpen(false);
            setSelectedRegistration(null);
        }
    };

    const initiateView = (reg) => {
        setSelectedRegistration(reg);
        setViewModalOpen(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-700';
            case 'Rejected': return 'bg-red-100 text-red-700';
            case 'Pending': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="max-w-7xl mx-auto animate-fade-in-up relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Academic Course Units</h2>
                    <p className="text-gray-500 text-sm mt-1">Review and manage student course registration submissions.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search Field */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400">🔍</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Search Student ID..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filter Button */}
                    <select
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 cursor-pointer"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Course Registration Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Number</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Submitted</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRegistrations.length > 0 ? (
                                filteredRegistrations.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {reg.studentNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {reg.studentName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => initiateView(reg)}>
                                            <div className="flex items-center gap-1">
                                                <span>📄</span>
                                                {reg.formName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {reg.dateSubmitted}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(reg.status)}`}>
                                                {reg.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => initiateView(reg)}
                                                    className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100"
                                                    title="View"
                                                >
                                                    👁️
                                                </button>
                                                {reg.status === 'Pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(reg.id)}
                                                            className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50"
                                                            title="Approve"
                                                        >
                                                            ✅
                                                        </button>
                                                        <button
                                                            onClick={() => initiateReject(reg)}
                                                            className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                                                            title="Reject"
                                                        >
                                                            ❌
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500">
                                        No registrations found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                        Showing <span className="font-medium">{filteredRegistrations.length}</span> results
                    </div>
                    {/* Pagination placeholder */}
                    <div className="flex gap-1">
                        <button className="px-2 py-1 border border-gray-300 rounded bg-white text-gray-500 text-xs hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-2 py-1 border border-gray-300 rounded bg-white text-gray-500 text-xs hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
            </div>

            {/* View Modal */}
            {viewModalOpen && selectedRegistration && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden animate-scale-in">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Course Registration Form</h3>
                                <p className="text-sm text-gray-500">{selectedRegistration.studentName} ({selectedRegistration.studentNumber})</p>
                            </div>
                            <button
                                onClick={() => setViewModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
                            {/* Mock PDF Viewer */}
                            <div className="w-full h-full bg-white shadow-lg border border-gray-200 mx-auto max-w-3xl p-8 min-h-[800px] flex flex-col">
                                <div className="border-b-2 border-slate-800 pb-4 mb-8 flex justify-between items-end">
                                    <div>
                                        <h1 className="text-2xl font-bold uppercase tracking-widest text-slate-800">EMS University</h1>
                                        <p className="text-sm text-slate-600">Faculty of Computing</p>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-xl font-bold text-slate-700">Course Registration</h2>
                                        <p className="text-sm text-slate-500">Semester 1, 2026</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-500">Student Name</label>
                                            <div className="text-gray-900 font-medium border-b border-gray-300 pb-1">{selectedRegistration.studentName}</div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-500">Registration No</label>
                                            <div className="text-gray-900 font-medium border-b border-gray-300 pb-1">{selectedRegistration.studentNumber}</div>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <h4 className="font-bold text-sm uppercase text-slate-700 bg-slate-100 p-2 mb-4">Selected Course Units</h4>
                                        <table className="w-full text-sm">
                                            <thead className="border-b border-gray-300">
                                                <tr>
                                                    <th className="text-left py-2 font-semibold text-gray-600">Course Code</th>
                                                    <th className="text-left py-2 font-semibold text-gray-600">Course Name</th>
                                                    <th className="text-right py-2 font-semibold text-gray-600">Credits</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {selectedRegistration.courseUnits.map((unit, idx) => (
                                                    <tr key={idx} className="py-2">
                                                        <td className="py-2">{unit}</td>
                                                        <td className="py-2">Mock Course Name</td>
                                                        <td className="py-2 text-right">3</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-12 pt-8 border-t border-gray-200">
                                        <div className="flex justify-between items-end">
                                            <div className="w-48 text-center">
                                                <div className="h-12 border-b border-gray-400 mb-2"></div>
                                                <p className="text-xs uppercase text-gray-500">Student Signature</p>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Date: {selectedRegistration.dateSubmitted}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
                            <button
                                onClick={() => setViewModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Close
                            </button>
                            {selectedRegistration.status === 'Pending' && (
                                <>
                                    <button
                                        onClick={() => {
                                            initiateReject(selectedRegistration);
                                            setViewModalOpen(false);
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleApprove(selectedRegistration.id);
                                            setViewModalOpen(false);
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                                    >
                                        Approve
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModalOpen && selectedRegistration && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-scale-in">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Reject Registration</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Please provide a reason for rejecting <span className="font-semibold">{selectedRegistration.studentNumber}</span>'s registration. This will be sent to the student.
                            </p>

                            <textarea
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                rows="4"
                                placeholder="Enter rejection reason here..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            ></textarea>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setRejectModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmReject}
                                    disabled={!rejectReason.trim()}
                                    className={`px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors ${!rejectReason.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    Confirm Reject
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcademicCourseUnits;
