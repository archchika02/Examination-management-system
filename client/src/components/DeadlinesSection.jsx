import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, title, subtitle, children }) => {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
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
                {/* Overlay - removed backdrop-blur to prevent visual issues */}
                <div className="fixed inset-0 bg-gray-900/75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                {/* Modal Content - added relative and z-index to ensure it sits ABOVE the overlay */}
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

const DeadlinesSection = () => {
    // Initial mock data used if localStorage is empty
    const initialMockDeadlines = [
        {
            id: 1,
            formName: 'Course Registration Form',
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
            formName: 'Medical Form',
            deadline: '2026-05-25',
            roles: ['Students', 'Department Staff'],
            description: 'Deadline for submitting medical exemption forms'
        },
        {
            id: 4,
            formName: 'Final Timetable Approval',
            deadline: '2026-05-10',
            roles: ['Faculty Staff', 'Academic Supervisor'],
            description: 'Deadline for approving final examination timetable'
        }
    ];

    const [deadlines, setDeadlines] = useState([]);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('ems_deadlines');
        if (stored) {
            setDeadlines(JSON.parse(stored));
        } else {
            setDeadlines(initialMockDeadlines);
        }
    }, []);

    // Save to localStorage whenever deadlines change
    useEffect(() => {
        if (deadlines.length > 0) {
            localStorage.setItem('ems_deadlines', JSON.stringify(deadlines));
        }
    }, [deadlines]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDeadline, setNewDeadline] = useState({
        formName: '',
        deadline: '',
        description: '',
        roles: [],
        notifySystem: true,
        notifyEmail: false
    });
    const [touched, setTouched] = useState({});

    const availableRoles = [
        'Students',
        'Faculty Staff',
        'Academic Supervisor',
        'Department Staff',
        'Dean'
    ];

    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
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
        if (!newDeadline.formName.trim()) errors.formName = 'Form Name is required';
        if (!newDeadline.deadline) errors.deadline = 'Deadline Date is required';
        else if (newDeadline.deadline < getMinDate()) errors.deadline = 'Deadline must be in the future';
        if (newDeadline.roles.length === 0) errors.roles = 'Select at least one role';
        return errors;
    };

    const errors = validate();
    const isValid = Object.keys(errors).length === 0;

    const handleSave = () => {
        setTouched({ formName: true, deadline: true, roles: true });

        if (!isValid) return;

        const deadlineToAdd = {
            id: Date.now(),
            ...newDeadline
        };

        setDeadlines([deadlineToAdd, ...deadlines]);
        setIsModalOpen(false);
        setNewDeadline({
            formName: '',
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
                    {/* <p className="text-sm text-gray-500 mt-1">Manage and track important submission dates</p> */}
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
                                <th className="p-4 pl-6">Form Name</th>
                                <th className="p-4">Deadline</th>
                                <th className="p-4">Roles</th>
                                <th className="p-4">Description</th>
                                <th className="p-4 pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {deadlines.map((deadline) => (
                                <tr key={deadline.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="p-4 pl-6 font-semibold text-gray-800">{deadline.formName}</td>
                                    <td className="p-4 text-gray-600 font-medium font-mono">{deadline.deadline}</td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1.5">
                                            {deadline.roles.map((role, index) => (
                                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-500 max-w-xs truncate" title={deadline.description}>{deadline.description}</td>
                                    <td className="p-4 pr-6 text-right">
                                        <button
                                            onClick={() => handleRemove(deadline.id)}
                                            className="inline-flex items-center justify-center px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-md text-xs font-bold transition-all border border-red-100 hover:border-red-600 group/btn"
                                        >
                                            <span className="mr-1.5 group-hover/btn:animate-pulse">🗑️</span> Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {deadlines.length === 0 && (
                                <tr>
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
                    {/* Form Name */}
                    <div>
                        <label htmlFor="formName" className="block text-sm font-semibold text-gray-700 mb-1">
                            Form Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="formName"
                            className={`block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5 border transition-colors ${touched.formName && errors.formName ? 'border-red-300 bg-red-50' : ''}`}
                            placeholder="e.g., Course Registration Form"
                            value={newDeadline.formName}
                            onChange={(e) => setNewDeadline({ ...newDeadline, formName: e.target.value })}
                            onBlur={() => setTouched({ ...touched, formName: true })}
                        />
                        {touched.formName && errors.formName && <p className="mt-1 text-xs text-red-600 font-medium">{errors.formName}</p>}
                    </div>

                    {/* Deadline Date */}
                    <div>
                        <label htmlFor="deadline" className="block text-sm font-semibold text-gray-700 mb-1">
                            Deadline Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            id="deadline"
                            min={getMinDate()}
                            className={`block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5 border transition-colors ${touched.deadline && errors.deadline ? 'border-red-300 bg-red-50' : ''}`}
                            value={newDeadline.deadline}
                            onChange={(e) => setNewDeadline({ ...newDeadline, deadline: e.target.value })}
                            onBlur={() => setTouched({ ...touched, deadline: true })}
                        />
                        {touched.deadline && errors.deadline && <p className="mt-1 text-xs text-red-600 font-medium">{errors.deadline}</p>}
                    </div>

                    {/* Roles */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Applicable Roles <span className="text-red-500">*</span>
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
