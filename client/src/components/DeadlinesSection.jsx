import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, title, subtitle, children }) => {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto font-sans" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-900/75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-gray-100 relative z-10">
                    <div className="bg-white px-6 pt-6 pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                <h3 className="text-xl leading-6 font-bold text-gray-900" id="modal-title">
                                    {title}
                                </h3>
                                {subtitle && (
                                    <p className="mt-1 text-sm text-gray-500">
                                        {subtitle}
                                    </p>
                                )}
                                <div className="mt-6">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

const FORM_NAME_OPTIONS = [
    'Academic Course Unit',
    'Add/Drop Form',
    'Medical/Repeat Form',
    'Timetable Finalization',
];

const DeadlinesSection = () => {
    const initialMockDeadlines = [
        {
            id: 1,
            formName: 'Academic Course Unit',
            deadline: '2026-05-15',
            roles: ['Students', 'Academic Supervisor'],
            description: 'Deadline for students to register for courses'
        },
        {
            id: 2,
            formName: 'Add/Drop Form',
            deadline: '2026-05-20',
            roles: ['Students'],
            description: 'Deadline for adding or dropping courses'
        },
        {
            id: 3,
            formName: 'Medical/Repeat Form',
            deadline: '2026-05-25',
            roles: ['Students', 'Department Staff'],
            description: 'Deadline for submitting medical exemption forms'
        },
        {
            id: 4,
            formName: 'Timetable Finalization',
            deadline: '2026-05-10',
            roles: ['Faculty Staff', 'Academic Supervisor'],
            description: 'Deadline for approving final examination timetable'
        }
    ];

    const [deadlines, setDeadlines] = useState([]);
    const [loadingDeadlines, setLoadingDeadlines] = useState(true);

    // Load deadlines from DB
    useEffect(() => {
        const fetchDeadlines = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/deadlines');
                if (res.ok) {
                    const data = await res.json();
                    const mappedData = data.map(d => ({
                        ...d,
                        formName: d.form_name,
                        academicYear: d.academic_year,
                        deadline: d.deadline ? d.deadline.substring(0, 10) : ''
                    }));
                    setDeadlines(mappedData.length > 0 ? mappedData : initialMockDeadlines);
                } else {
                    setDeadlines(initialMockDeadlines);
                }
            } catch {
                setDeadlines(initialMockDeadlines);
            } finally {
                setLoadingDeadlines(false);
            }
        };
        fetchDeadlines();
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDeadline, setNewDeadline] = useState({
        formName: '',
        academicYear: '',
        deadline: '',
        description: '',
        roles: [],
        notifySystem: true,
        notifyEmail: false
    });
    const [touched, setTouched] = useState({});

    const availableRoles = [
        'Students',
        'Batch Representative',
        'Faculty Staff',
        'Academic Supervisor',
        'Department Staff',
        'Hall Attendant',
        'Dean',
    ];

    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const formatDate = (dateString, separator = '-') => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}${separator}${month}${separator}${year}`;
    };

    const handleRemove = (id) => {
        setDeadlines(deadlines.filter(item => item.id !== id));
    };

    const handleRoleToggle = (role) => {
        setNewDeadline(prev => {
            const roles = prev.roles.includes(role)
                ? prev.roles.filter(r => r !== role)
                : [...prev.roles, role];
            return { ...prev, roles };
        });
    };

    const validate = () => {
        const errors = {};
        if (!newDeadline.formName) errors.formName = 'Please select a Form Name';
        if (!newDeadline.academicYear) errors.academicYear = 'Please select an Academic Year';
        if (!newDeadline.deadline) errors.deadline = 'Deadline Date is required';
        else if (newDeadline.deadline < getMinDate()) errors.deadline = 'Deadline must be in the future';
        if (newDeadline.roles.length === 0) errors.roles = 'Select at least one role';
        return errors;
    };

    const errors = validate();
    const isValid = Object.keys(errors).length === 0;

    // Save deadline to DB (replaces localStorage + writeNotifications)
    const handleSave = async () => {
        setTouched({ formName: true, deadline: true, roles: true });
        if (!isValid) return;

        try {
            const res = await fetch('http://localhost:5000/api/deadlines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formName: newDeadline.formName,
                    academicYear: newDeadline.academicYear,
                    deadline: newDeadline.deadline,
                    roles: newDeadline.roles,
                    description: newDeadline.description,
                    notifyEmail: newDeadline.notifyEmail,
                    notifySystem: newDeadline.notifySystem,
                    createdBy: null   // set to user.user_id if auth context is available here
                })
            });

            if (res.ok) {
                const saved = await res.json();
                // Add to local list for immediate display
                const deadlineToAdd = {
                    ...newDeadline,
                    id: saved.deadlineId,
                    due_date: newDeadline.deadline,
                    form_name: newDeadline.formName
                };
                setDeadlines([deadlineToAdd, ...deadlines]);
            } else {
                alert('Failed to save deadline. Please try again.');
                return;
            }
        } catch (err) {
            console.error('Error saving deadline:', err);
            alert('Error saving deadline.');
            return;
        }

        setIsModalOpen(false);
        setNewDeadline({
            formName: '',
            academicYear: '',
            deadline: '',
            description: '',
            roles: [],
            notifySystem: true,
            notifyEmail: false
        });
        setTouched({});
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setNewDeadline({
            formName: '',
            academicYear: '',
            deadline: '',
            description: '',
            roles: [],
            notifySystem: true,
            notifyEmail: false
        });
        setTouched({});
    };

    return (
        <div className="max-w-7xl mx-auto animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Deadlines</h2>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                    <h3 className="text-lg font-bold text-gray-800">Active Deadlines</h3>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40 hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <span className="text-lg leading-none">+</span> Add Deadline
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold tracking-wider">
                                <th className="p-4 pl-6 text-left">Form Name</th>
                                <th className="p-4 text-left">Year</th>
                                <th className="p-4 text-left">Deadline</th>
                                <th className="p-4 text-left">Roles</th>
                                <th className="p-4 pr-6 text-left">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {deadlines.map((deadline) => (
                                <tr key={deadline.id} className="hover:bg-blue-50/30 transition-colors group text-sm">
                                    <td className="p-4 pl-6 font-semibold text-gray-800">{deadline.formName}</td>
                                    <td className="p-4 text-gray-600 font-medium whitespace-nowrap">{deadline.academicYear}</td>
                                    <td className="p-4 text-gray-600 font-medium font-mono">{formatDate(deadline.deadline, '/')}</td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1.5">
                                            {deadline.roles.map((role, index) => (
                                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 pr-6 text-gray-500 max-w-xs truncate" title={deadline.description}>{deadline.description}</td>
                                </tr>
                            ))}
                            {deadlines.length === 0 && (
                                <tr key="empty">
                                    <td colSpan="5" className="p-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <span className="text-4xl mb-3">📅</span>
                                            <p className="text-base font-medium">No deadlines active</p>
                                            <p className="text-sm mt-1">Click "Add Deadline" to create one.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCancel}
                title="Add New Deadline"
                subtitle="Define a deadline for a form or academic process"
            >
                <div className="space-y-5">
                    {/* Form Name Dropdown */}
                    <div>
                        <label htmlFor="formName" className="block text-sm font-semibold text-gray-700 mb-1">
                            Form Name <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="formName"
                            className={`block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5 border transition-colors bg-white cursor-pointer ${touched.formName && errors.formName ? 'border-red-300 bg-red-50' : ''}`}
                            value={newDeadline.formName}
                            onChange={(e) => setNewDeadline({ ...newDeadline, formName: e.target.value })}
                            onBlur={() => setTouched({ ...touched, formName: true })}
                        >
                            <option value="">— Select a form —</option>
                            {FORM_NAME_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                        {touched.formName && errors.formName && <p className="mt-1 text-xs text-red-600 font-medium">{errors.formName}</p>}
                    </div>

                    {/* Academic Year Input */}
                    <div>
                        <label htmlFor="academicYear" className="block text-sm font-semibold text-gray-700 mb-1">
                            Academic Year <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="academicYear"
                            type="text"
                            placeholder="e.g. 2023/2024"
                            className={`block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5 border transition-colors bg-white ${touched.academicYear && errors.academicYear ? 'border-red-300 bg-red-50' : ''}`}
                            value={newDeadline.academicYear}
                            onChange={(e) => setNewDeadline({ ...newDeadline, academicYear: e.target.value })}
                            onBlur={() => setTouched({ ...touched, academicYear: true })}
                        />
                        {touched.academicYear && errors.academicYear && <p className="mt-1 text-xs text-red-600 font-medium">{errors.academicYear}</p>}
                    </div>

                    {/* Deadline Date */}
                    <div>
                        <label htmlFor="deadline" className="block text-sm font-semibold text-gray-700 mb-1">
                            Deadline Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                readOnly
                                placeholder="DD/MM/YYYY"
                                className={`block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5 border transition-colors bg-white cursor-pointer ${touched.deadline && errors.deadline ? 'border-red-300 bg-red-50' : ''}`}
                                value={newDeadline.deadline ? formatDate(newDeadline.deadline, '/') : ''}
                                onClick={() => document.getElementById('native-datepicker').showPicker()}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <input
                                type="date"
                                id="native-datepicker"
                                min={getMinDate()}
                                className="absolute opacity-0 pointer-events-none"
                                value={newDeadline.deadline}
                                onChange={(e) => setNewDeadline({ ...newDeadline, deadline: e.target.value })}
                                onBlur={() => setTouched({ ...touched, deadline: true })}
                            />
                        </div>
                        {touched.deadline && errors.deadline && <p className="mt-1 text-xs text-red-600 font-medium">{errors.deadline}</p>}
                    </div>

                    {/* Roles */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Notify Roles <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {availableRoles.map((role) => {
                                const isSelected = newDeadline.roles.includes(role);
                                return (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => handleRoleToggle(role)}
                                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${isSelected
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105'
                                            : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                            }`}
                                    >
                                        {role}
                                        {isSelected && <span className="ml-1.5 text-slate-300">✕</span>}
                                    </button>
                                );
                            })}
                        </div>
                        {touched.roles && errors.roles && <p className="mt-1 text-xs text-red-600 font-medium">{errors.roles}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
                            Description <span className="font-normal text-gray-400">(Optional)</span>
                        </label>
                        <textarea
                            id="description"
                            rows="3"
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5 border"
                            placeholder="Brief explanation of what this deadline is for..."
                            value={newDeadline.description}
                            onChange={(e) => setNewDeadline({ ...newDeadline, description: e.target.value })}
                        ></textarea>
                    </div>

                    {/* Notifications */}
                    <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Notification Options</p>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                                    checked={newDeadline.notifySystem}
                                    onChange={(e) => setNewDeadline({ ...newDeadline, notifySystem: e.target.checked })}
                                />
                                <span className="text-sm text-gray-700 group-hover:text-gray-900">Notify users via system notification</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                                    checked={newDeadline.notifyEmail}
                                    onChange={(e) => setNewDeadline({ ...newDeadline, notifyEmail: e.target.checked })}
                                />
                                <span className="text-sm text-gray-700 group-hover:text-gray-900">Send email reminder</span>
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2.5 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all"
                            onClick={handleCancel}
                        >
                            ❌ Cancel
                        </button>
                        <button
                            type="button"
                            className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent shadow-lg shadow-blue-500/20 px-6 py-2.5 bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                            onClick={handleSave}
                        >
                            ✅ Save Deadline
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DeadlinesSection;
