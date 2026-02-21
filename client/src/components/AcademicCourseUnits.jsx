import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import StudentCourseUnitRegistration from './StudentCourseUnitRegistration';

const AcademicCourseUnits = () => {
    const [registrations, setRegistrations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    // Modal State
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    // Reference to the rendered PDF layout (invisible)
    const pdfRef = useRef();

    // Fetch data from backend
    const fetchRegistrations = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/course-registration/list');
            const data = await res.json();
            // Map the DB schema to the table format
            const mappedData = data.map(dbRow => {
                const stNo = dbRow.student_number?.startsWith('IM/') ? dbRow.student_number : `IM/${dbRow.student_number || ''}`;
                return {
                    id: dbRow.id,
                    studentNumber: stNo,
                    studentName: dbRow.student_name,
                    formName: `CourseReg_${stNo.replace(/[^a-zA-Z0-9]/g, '')}.pdf`,
                    courseUnits: dbRow.courses || [],
                    totalCredits: dbRow.total_credits,
                    dateSubmitted: new Date(dbRow.created_at).toLocaleDateString(),
                    status: dbRow.status,
                    signature: dbRow.signature,
                    address: dbRow.address || '',
                    mobile: dbRow.mobile || '',
                    email: dbRow.email || ''
                };
            });
            setRegistrations(mappedData);
        } catch (error) {
            console.error("Error fetching registrations:", error);
        }
    };

    useEffect(() => {
        fetchRegistrations();
    }, []);

    // Filter Logic
    const filteredRegistrations = registrations.filter(reg => {
        const matchesSearch = reg.studentNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || reg.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Actions
    const handleApprove = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/course-registration/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Approved' })
            });
            if (res.ok) fetchRegistrations();
        } catch (err) {
            console.error("Error approving:", err);
        }
    };

    const initiateReject = (reg) => {
        setSelectedRegistration(reg);
        setRejectReason('');
        setRejectModalOpen(true);
    };

    const confirmReject = async () => {
        if (selectedRegistration) {
            try {
                const res = await fetch(`http://localhost:5000/api/course-registration/${selectedRegistration.id}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'Rejected', reject_reason: rejectReason })
                });
                if (res.ok) {
                    fetchRegistrations();
                    setRejectModalOpen(false);
                    setSelectedRegistration(null);
                }
            } catch (err) {
                console.error("Error rejecting:", err);
            }
        }
    };

    const initiateView = (reg) => {
        setSelectedRegistration(reg);
        setViewModalOpen(true);
    };

    const downloadPDF = async (reg) => {
        // Find the invisible element we rendered for PDF layout
        const element = document.getElementById(`pdf-form-${reg.id}`);
        if (!element) return;

        try {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');

            // A4 Aspect Ratio 210x297mm
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(reg.formName);
        } catch (err) {
            console.error("Error generating PDF:", err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-700';
            case 'Rejected': return 'bg-red-100 text-red-700';
            case 'Pending': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // Helper to format DB row data into the structure expected by StudentCourseUnitRegistration
    const formatForReadOnlyForm = (reg) => {
        const formatted = {
            st_name_cr: reg.studentName || '',
            level: '1',
            mobile: reg.mobile,
            email_cr: reg.email,
            address: reg.address,
            signature: reg.signature,
            dateSubmitted: reg.dateSubmitted
        };

        // The studentNumber string from DB is e.g. "IM/12345". 
        // The first 3 chars "IM/" map to the static prefilled boxes.
        // The remaining 5-8 chars map to st_no_cr_0 through 7
        const dbStNo = reg.studentNumber || '';
        const rawDigits = dbStNo.replace(/^IM\//, '');

        for (let i = 0; i < rawDigits.length && i < 8; i++) {
            formatted[`st_no_cr_${i}`] = rawDigits[i];
        }

        reg.courseUnits.forEach((course, index) => {
            let courseTypeStr = (course.course_type || course.type || '').toLowerCase();
            let gridPrefix = courseTypeStr.includes('compulsory') ? 'Grid_Comp'
                : courseTypeStr.includes('optional') ? 'Grid_Opt'
                    : 'Grid_Aux';

            let semSuffix = course.semester === 1 ? '_S1' : '_S2';
            let gridId = `${gridPrefix}${semSuffix}`;

            const code = course.course_code;
            if (code) {
                for (let c = 0; c < code.length && c < 12; c++) {
                    formatted[`${gridId}_${index}_${c}`] = code[c];
                }
            }
        });

        formatted.cred_comp_total = reg.totalCredits;
        formatted.total_creds_box = reg.totalCredits;

        return formatted;
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => downloadPDF(reg)}>
                                            <div className="flex items-center gap-1 group">
                                                <span>📄</span>
                                                <span className="underline decoration-transparent group-hover:decoration-blue-800 transition-colors">{reg.formName}</span>
                                                <span className="text-xs ml-1 text-gray-400 group-hover:text-blue-800">📥</span>
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
                                        No registrations found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Modal */}
            {viewModalOpen && selectedRegistration && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden animate-scale-in">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Course Registration Submission</h3>
                                <p className="text-sm text-gray-500">{selectedRegistration.studentName} ({selectedRegistration.studentNumber})</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => downloadPDF(selectedRegistration)}
                                    className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold text-sm rounded hover:bg-blue-100 transition-colors flex items-center gap-2"
                                >
                                    <span>📥</span> Download PDF
                                </button>
                                <button
                                    onClick={() => setViewModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-gray-100 p-6 overflow-y-auto w-full">
                            {/* Render exact layout */}
                            <div className="bg-white shadow-lg mx-auto w-full max-w-[210mm] border border-gray-200 pointer-events-none transform scale-90 origin-top">
                                <StudentCourseUnitRegistration readOnlyData={formatForReadOnlyForm(selectedRegistration)} />
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
                                Please provide a reason for rejecting <span className="font-semibold">{selectedRegistration.studentNumber}</span>'s registration.
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

            {/* Hidden Off-Screen Renderers for PDF Downloading */}
            <div className="fixed top-[-9999px] left-[-9999px]">
                {registrations.map(reg => (
                    <div key={reg.id} id={`pdf-form-${reg.id}`} className="w-[210mm] bg-white p-12">
                        <StudentCourseUnitRegistration readOnlyData={formatForReadOnlyForm(reg)} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AcademicCourseUnits;
