import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const StudentCourseUnitRegistration = ({ readOnlyData = null }) => {
    const { user } = useAuth();
    // If readOnlyData is provided, use it directly, otherwise use local state
    const [formData, setFormData] = useState(readOnlyData || {});
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [academicYear, setAcademicYear] = useState('2023/2024');
    const [deadlineDate, setDeadlineDate] = useState('Not Set');
    const [dynamicStructure, setDynamicStructure] = useState([]);
    const [loading, setLoading] = useState(true);
    const isReadOnly = !!readOnlyData;

    const formatDate = (dateString, separator = '-') => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}${separator}${month}${separator}${year}`;
    };

    const DatePickerField = ({ id, value, onChange, isReadOnly, placeholder = "DD/MM/YYYY" }) => {
        const uniqueId = `date-picker-${id}`;
        const today = new Date().toISOString().split('T')[0];
        
        return (
            <div className="relative w-full">
                <input
                    type="text"
                    readOnly
                    placeholder={placeholder}
                    className="h-8 border-b border-black border-dashed mb-1 w-full text-center focus:bg-blue-50 outline-none font-serif cursor-pointer"
                    value={value ? formatDate(value, '/') : ''}
                    onClick={() => !isReadOnly && document.getElementById(uniqueId).showPicker()}
                />
                {!isReadOnly && (
                    <input
                        type="date"
                        id={uniqueId}
                        min={today}
                        className="absolute opacity-0 pointer-events-none"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                    />
                )}
            </div>
        );
    };

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                // 1. Fetch Deadlines
                const deadlineRes = await fetch('http://localhost:5000/api/deadlines');
                let currentAcademicYear = '2023/2024';
                let currentDeadlineDate = 'Not Set';

                if (deadlineRes.ok) {
                    const data = await deadlineRes.json();
                    const targetDeadline = data.find(d => d.form_name === 'Academic Course Unit');
                    if (targetDeadline) {
                        if (targetDeadline.academic_year) {
                            currentAcademicYear = targetDeadline.academic_year;
                            setAcademicYear(currentAcademicYear);
                        }
                        if (targetDeadline.deadline) {
                            const d = new Date(targetDeadline.deadline);
                            currentDeadlineDate = `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
                            setDeadlineDate(currentDeadlineDate);
                        }
                    }
                }

                // 2. Fetch Form Structure
                const formRes = await fetch('http://localhost:5000/api/configurations/forms/course_registration');
                if (formRes.ok) {
                    let structure = await formRes.json();
                    // Interpolate placeholders
                    const interpolate = (obj) => {
                        const str = JSON.stringify(obj);
                        const replaced = str
                            .replace(/{{deadlineDate}}/g, currentDeadlineDate)
                            .replace(/{{academicYear}}/g, currentAcademicYear);
                        return JSON.parse(replaced);
                    };
                    setDynamicStructure(interpolate(structure));
                }
            } catch (err) {
                console.error('Error loading initial data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (!isReadOnly) {
            loadInitialData();
        } else {
            // If read only, just set loading false as it likely has specific data/structure passed or we use hardcoded as fallback
            setLoading(false);
        }
    }, [isReadOnly]);
    
    // Hardcoded structure as fallback if needed, but we'll use dynamicStructure
    const fallbackStructure = [
        // ... (preserving original for safety if needed, but we'll swap it)
    ];

    // ... [formStructure remains exactly the same] ...
    const formStructure = dynamicStructure.length > 0 ? dynamicStructure : [];

    // Pre-fill Logic
    useEffect(() => {
        if (user && !isReadOnly) {
            setFormData(prev => ({
                ...prev,
                st_name_cr: user.name || '',
                email_cr: user.email || '',
                level: user.level || '1',
                mobile: user.mobile || '0712345678'
            }));
        }
    }, [user, isReadOnly]);

    const handleInputChange = (id, value) => {
        if (isReadOnly) return;
        
        setFormData(prev => {
            const newState = { ...prev, [id]: value };
            
            // Mutual exclusivity for Mr/Ms
            if (id.endsWith('_mr') && value === true) {
                const msId = id.replace('_mr', '_ms');
                newState[msId] = false;
            } else if (id.endsWith('_ms') && value === true) {
                const mrId = id.replace('_ms', '_mr');
                newState[mrId] = false;
            }
            
            return newState;
        });

        // Clear error when user types
        if (errors[id]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[id];
                return newErrors;
            });
        }
        
        // Also clear base ID error if a sub-id is changed (e.g. st_no_cr_0 clears st_no_cr)
        const baseId = id.split('_').slice(0, -1).join('_');
        if (baseId && errors[baseId]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[baseId];
                return newErrors;
            });
        }
        
        // Special case for Mr/Ms clearing the name group error
        if (id.includes('_mr') || id.includes('_ms')) {
            const groupBase = id.split('_').slice(0, -1).join('_'); // e.g. st_name_cr
            if (errors[`${groupBase}_salutation`]) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[`${groupBase}_salutation`];
                    return newErrors;
                });
            }
        }
    };

    // Credit Calculation Logic
    useEffect(() => {
        if (isReadOnly || loading) return;

        // Helper to get credits from a row, checking multiple possible ID patterns
        const getCreditsFromRow = (prefix, r, cols) => {
            let digits = "";
            // Common potential prefixes for grids
            const potentialPrefixes = [
                prefix,                          // Standard (e.g. Grid_Comp_S1)
                `course_grids_layout_l_${prefix === 'Grid_Comp_S1' ? 0 : 2}`, // Layout-based Comp
                `course_grids_layout_r_${prefix === 'Grid_Opt_S1' ? 0 : prefix === 'Grid_Opt_S2' ? 2 : prefix === 'Grid_Aux_S1' ? 5 : 6}` // Layout-based Opt/Aux
            ];

            // Map standard prefixes to their specific layout indices found in migrate_form_configs.js
            const layoutMap = {
                'Grid_Comp_S1': 'course_grids_layout_l_0',
                'Grid_Comp_S2': 'course_grids_layout_l_2',
                'Grid_Opt_S1': 'course_grids_layout_r_0',
                'Grid_Opt_S2': 'course_grids_layout_r_2',
                'Grid_Aux_S1': 'course_grids_layout_r_5',
                'Grid_Aux_S2': 'course_grids_layout_r_6'
            };

            const actualPrefix = layoutMap[prefix] || prefix;

            for (let c = 0; c < cols; c++) {
                // Try layout-based first, then standard prefix
                const val = formData[`${actualPrefix}_${r}_${c}`] || formData[`${prefix}_${r}_${c}`] || "";
                if (/[0-9]/.test(val)) {
                    digits += val;
                }
            }
            // 5th digit is index 4
            return digits.length >= 5 ? parseInt(digits[4]) || 0 : 0;
        };

        const calculateSectionTotal = (prefix, rows, cols) => {
            let total = 0;
            for (let r = 0; r < rows; r++) {
                total += getCreditsFromRow(prefix, r, cols);
            }
            return total;
        };

        const comp1 = calculateSectionTotal('Grid_Comp_S1', 10, 12);
        const comp2 = calculateSectionTotal('Grid_Comp_S2', 10, 12);
        const opt1 = calculateSectionTotal('Grid_Opt_S1', 6, 12);
        const opt2 = calculateSectionTotal('Grid_Opt_S2', 6, 12);
        const aux1 = calculateSectionTotal('Grid_Aux_S1', 3, 12);
        const aux2 = calculateSectionTotal('Grid_Aux_S2', 3, 12);

        const compTotal = comp1 + comp2;
        const optTotal = opt1 + opt2;
        const auxTotal = aux1 + aux2;

        const totalCredits = compTotal + optTotal + auxTotal;

        const updates = {};
        // Individual Semester Totals
        if (formData.cred_comp_1 !== String(comp1)) updates.cred_comp_1 = String(comp1);
        if (formData.cred_comp_2 !== String(comp2)) updates.cred_comp_2 = String(comp2);
        if (formData.cred_opt_1 !== String(opt1)) updates.cred_opt_1 = String(opt1);
        if (formData.cred_opt_2 !== String(opt2)) updates.cred_opt_2 = String(opt2);
        if (formData.cred_aux_1 !== String(aux1)) updates.cred_aux_1 = String(aux1);
        if (formData.cred_aux_2 !== String(aux2)) updates.cred_aux_2 = String(aux2);
        
        // Combined Section Totals (What the USER specifically asked for)
        if (formData.cred_comp_total !== String(compTotal)) updates.cred_comp_total = String(compTotal);
        if (formData.cred_opt_total !== String(optTotal)) updates.cred_opt_total = String(optTotal);
        if (formData.cred_aux_total !== String(auxTotal)) updates.cred_aux_total = String(auxTotal);
        
        // Grand Total
        if (formData.total_creds_box !== String(totalCredits)) updates.total_creds_box = String(totalCredits);

        if (Object.keys(updates).length > 0) {
            setFormData(prev => ({ ...prev, ...updates }));
        }
    }, [formData, isReadOnly, loading]);

    const validateForm = () => {
        const newErrors = {};
        
        // 1. Student Number (st_no_cr_0 to st_no_cr_7)
        let stNoFilled = true;
        for (let i = 0; i < 8; i++) {
            if (!formData[`st_no_cr_${i}`] || !formData[`st_no_cr_${i}`].trim()) {
                stNoFilled = false;
                break;
            }
        }
        if (!stNoFilled) newErrors.st_no_cr = "Student number is incomplete";

        // 2. Level
        if (!formData.level || !formData.level.trim()) {
            newErrors.level = "Level is required";
        }

        // 3. Student Name
        if (!formData.st_name_cr || !formData.st_name_cr.trim()) {
            newErrors.st_name_cr = "Student name is required";
        }

        // 4. Mr or Ms
        if (!formData.st_name_cr_mr && !formData.st_name_cr_ms) {
            newErrors.st_name_cr_salutation = "Please select Mr or Ms";
        }

        // 5. Address
        if (!formData.address || !formData.address.trim()) {
            newErrors.address = "Address is required";
        }

        // 6. Email
        if (!formData.email_cr || !formData.email_cr.trim()) {
            newErrors.email_cr = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email_cr)) {
            newErrors.email_cr = "Please enter a valid email address";
        }

        // 7. Mobile
        if (!formData.mobile || !formData.mobile.trim()) {
            newErrors.mobile = "Mobile number is required";
        }

        // 8. Course Combination
        if (!formData.course_combo || !formData.course_combo.trim()) {
            newErrors.course_combo = "Course combination is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (isReadOnly) return;

        // Perform Validation
        if (!validateForm()) {
            const firstError = Object.values(errors)[0] || "Please fill all required fields marked with *";
            alert(firstError);
            return;
        }

        if (!formData.sig_1 || !formData.sig_1.trim()) {
            alert("Please provide your signature by typing your name.");
            return;
        }

        setSubmitted(true);

        try {
            const payload = {
                user_id: user?.user_id || null,
                form_data: formData,
                signature: formData.sig_1,
                date_submitted: formData.sig_0, // Use the date from the form
                academicYear: academicYear
            };

            const response = await fetch('http://localhost:5000/api/course-registration/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Network response was not ok');
            }

            alert("Registration Form Submitted Successfully!");
        } catch (error) {
            console.error('Error submitting form:', error);
            alert("Error submitting form. Please try again.");
        } finally {
            setSubmitted(false);
        }
    };

    const renderFormElement = (element, parent = null) => {
        switch (element.type) {
            case 'header':
                return (
                    <div key={element.id} className="text-center mb-8 space-y-1">
                        {element.content.map((item, idx) => {
                            let className = "text-gray-900 font-serif ";
                            if (item.style === 'h2') className += "text-xl font-bold";
                            if (item.style === 'h3') className += "text-lg font-semibold";
                            if (item.style === 'h2_underline') className += "text-xl font-bold underline decoration-2 underline-offset-4 mb-4 block";
                            if (item.style === 'text_left_bold') return <div key={idx} className="text-left font-bold text-sm mb-4">{item.text}</div>;
                            if (item.style === 'text_left_italic_bold') return <div key={idx} className="text-left font-bold italic text-sm mt-3">{item.text}</div>;
                            return <div key={idx} className={className}>{item.text}</div>;
                        })}
                    </div>
                );

            case 'section':
                return (
                    <div key={element.id} className="space-y-4 mb-6">
                        {element.fields.map(field => renderField(field))}
                    </div>
                );

            case 'section_inline':
                return (
                    <div key={element.id} className={`flex flex-wrap items-end gap-6 mb-6 ${element.justify ? 'justify-' + element.justify : ''}`}>
                        {element.fields.map(field => renderField(field))}
                    </div>
                );

            case 'two_column_layout':
                return (
                    <div key={element.id} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 border border-black min-h-[500px]">
                        <div className="border-r border-black p-4 flex flex-col h-full">
                            {element.left.map((item, i) => renderFormElement({ ...item, id: item.id || `${element.id}_l_${i}` }, element))}
                        </div>
                        <div className="p-4 flex flex-col h-full">
                            {element.right.map((item, i) => renderFormElement({ ...item, id: item.id || `${element.id}_r_${i}` }, element))}
                        </div>
                    </div>
                );

            case 'grid_section':
                return (
                    <div key={element.id} className="mb-6">
                        {element.title && <div className="font-bold text-sm mb-1 uppercase font-serif">{element.title}</div>}
                        {element.subtitle && <div className="text-xs mb-1 uppercase font-serif">{element.subtitle}</div>}
                        <div className="border border-black bg-white">
                            {[...Array(element.rows)].map((_, r) => (
                                <div key={r} className="flex h-6 border-b border-black last:border-b-0">
                                    {[...Array(element.cols)].map((_, c) => {
                                        const inputId = `${element.id}_${r}_${c}`;
                                        return (
                                            <input
                                                key={c}
                                                id={inputId}
                                                type="text"
                                                maxLength={1}
                                                readOnly={isReadOnly}
                                                value={formData[inputId] || ''}
                                                className="flex-1 border-r border-black last:border-r-0 w-full text-center text-[10px] focus:bg-blue-50 outline-none uppercase"
                                                onChange={(e) => handleInputChange(inputId, e.target.value)}
                                                onKeyUp={(e) => {
                                                    if (isReadOnly) return;
                                                    // Auto-advance horizontally on 1 char typed
                                                    if (e.target.value.length === 1 && e.key !== 'Enter') {
                                                        const nextColId = `${element.id}_${r}_${c + 1}`;
                                                        const nextRowId = `${element.id}_${r + 1}_0`;

                                                        let nextEl = document.getElementById(nextColId);
                                                        // If end of row, optionally jump to next row (decided to stick to horizontal as user mentioned next box, but if they hit enter it goes down)
                                                        if (!nextEl && c + 1 === element.cols) {
                                                            nextEl = document.getElementById(nextRowId);
                                                        }
                                                        if (nextEl) nextEl.focus();
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (isReadOnly) return;
                                                    // Jump to next row vertically on Enter
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const nextRowId = `${element.id}_${r + 1}_0`;
                                                        const nextEl = document.getElementById(nextRowId);
                                                        if (nextEl) nextEl.focus();
                                                    } else if (e.key === 'ArrowRight') {
                                                        const nextEl = document.getElementById(`${element.id}_${r}_${c + 1}`);
                                                        if (nextEl) nextEl.focus();
                                                    } else if (e.key === 'ArrowLeft') {
                                                        const prevEl = document.getElementById(`${element.id}_${r}_${c - 1}`);
                                                        if (prevEl) prevEl.focus();
                                                    } else if (e.key === 'ArrowDown') {
                                                        const nextEl = document.getElementById(`${element.id}_${r + 1}_${c}`);
                                                        if (nextEl) nextEl.focus();
                                                    } else if (e.key === 'ArrowUp') {
                                                        const prevEl = document.getElementById(`${element.id}_${r - 1}_${c}`);
                                                        if (prevEl) prevEl.focus();
                                                    } else if (e.key === 'Backspace' && !e.target.value) {
                                                        // Optional: jumping back on backspace if empty
                                                        const prevEl = document.getElementById(`${element.id}_${r}_${c - 1}`);
                                                        if (prevEl) prevEl.focus();
                                                    }
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'signature_row_wide':
                return (
                    <div key={element.id} className="mb-8 mt-12 flex justify-between items-end gap-10">
                        {element.labels.map((label, idx) => (
                            <div key={idx} className="flex-1 text-center">
                                {label.includes('SIGNATURE') ? (
                                    <input
                                        type="text"
                                        readOnly={isReadOnly}
                                        placeholder="Type Name as Digital Signature"
                                        value={formData[`sig_${idx}`] || ''}
                                        className="h-8 border-b border-black border-dashed mb-1 w-full text-center focus:bg-blue-50 outline-none font-serif"
                                        onChange={(e) => handleInputChange(`sig_${idx}`, e.target.value)}
                                    />
                                ) : (
                                    <DatePickerField
                                        id={`sig_${idx}`}
                                        isReadOnly={isReadOnly}
                                        value={formData[`sig_${idx}`] || (isReadOnly ? formData.dateSubmitted : '') || ''}
                                        onChange={(val) => handleInputChange(`sig_${idx}`, val)}
                                    />
                                )}
                                <div className="text-sm font-serif font-bold uppercase pt-2">{label}</div>
                            </div>
                        ))}
                        {element.footer && (
                            <div className="w-full text-left absolute bottom-0 left-0 text-[10px] italic mt-2 font-serif">{element.footer}</div>
                        )}
                    </div>
                );

            case 'text_center_italic':
                return (
                    <div key={element.id} className="text-center italic font-serif text-sm mt-8 border-t pt-4">
                        {element.content}
                    </div>
                );

            default:
                return null;
        }
    };

    const renderField = (field) => {
        if (field.type === 'spacer') return <div key={field.id} style={{ flex: field.flex }}></div>;

        const commonLabel = (
            <span className="text-sm font-semibold uppercase font-serif whitespace-nowrap mr-2">
                {field.label}{field.label && !field.label.endsWith(':') && ':'}
            </span>
        );

        return (
            <div key={field.id} className={`flex items-end ${field.flex ? 'flex-1' : ''}`}>
                {commonLabel}

                {field.type === 'box_input_prefilled' && (
                    <div className="flex gap-1 items-center">
                        {field.value?.map((val, i) => (
                            <div key={`p-${i}`} className={`w-8 h-8 border bg-gray-100 flex items-center justify-center font-bold text-xl ${errors[field.id] ? 'border-red-500' : 'border-gray-800'}`}>{val}</div>
                        ))}
                        {/* Dynamic Student ID Inputs */}
                        <div className="flex gap-1">
                            {[...Array(field.count)].map((_, i) => {
                                const boxId = `${field.id}_${i}`;
                                return (
                                    <input
                                        key={i}
                                        id={boxId}
                                        type="text"
                                        maxLength={1}
                                        readOnly={isReadOnly}
                                        value={formData[boxId] || ''}
                                        className={`w-8 h-8 border text-center font-bold text-xl focus:ring-2 focus:ring-blue-500 outline-none uppercase bg-white ${errors[boxId] || errors[field.id] ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-800'}`}
                                        onChange={(e) => handleInputChange(boxId, e.target.value)}
                                        onKeyUp={(e) => {
                                            if (isReadOnly) return;
                                            if (e.target.value.length === 1 && e.key !== 'Enter') {
                                                const nextEl = document.getElementById(`${field.id}_${i + 1}`);
                                                if (nextEl) nextEl.focus();
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (isReadOnly) return;
                                            if (e.key === 'ArrowRight') {
                                                const nextEl = document.getElementById(`${field.id}_${i + 1}`);
                                                if (nextEl) nextEl.focus();
                                            } else if (e.key === 'ArrowLeft') {
                                                const prevEl = document.getElementById(`${field.id}_${i - 1}`);
                                                if (prevEl) prevEl.focus();
                                            } else if (e.key === 'Backspace' && !e.target.value) {
                                                const prevEl = document.getElementById(`${field.id}_${i - 1}`);
                                                if (prevEl) prevEl.focus();
                                            }
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}

                {field.type === 'box_single' && (
                    <input
                        type="text"
                        readOnly={isReadOnly}
                        className={`w-24 h-10 border text-center px-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold ${errors[field.id] ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-800'}`}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                    />
                )}

                {field.type === 'box_small' && (
                    <input
                        type="text"
                        readOnly={isReadOnly}
                        className="w-16 h-8 border border-gray-800 text-center px-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold"
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                    />
                )}

                {(field.type === 'line_input' || field.type === 'line_input_dotted' || field.type === 'dotted_line') && (
                    <input
                        type="text"
                        readOnly={isReadOnly}
                        className={`flex-1 border-b-2 ${field.type.includes('dotted') ? 'border-dotted' : ''} h-8 px-2 focus:border-blue-500 outline-none min-w-[150px] bg-transparent font-medium ${errors[field.id] ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                    />
                )}

                {field.type === 'line_input_check' && (
                    <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2">
                            <div
                                onClick={() => !isReadOnly && handleInputChange(`${field.id}_mr`, !formData[`${field.id}_mr`])}
                                className={`w-8 h-8 border flex items-center justify-center ${!isReadOnly ? 'cursor-pointer' : ''} ${formData[`${field.id}_mr`] ? 'bg-black text-white' : 'bg-white'} ${errors[`${field.id}_salutation`] ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-800'}`}
                            >
                                {formData[`${field.id}_mr`] && '✓'}
                            </div>
                            <input
                                type="text"
                                readOnly={isReadOnly}
                                className={`flex-1 border-b border-dotted h-8 px-2 outline-none min-w-[200px] bg-transparent font-medium ${errors[field.id] ? 'border-red-500 bg-red-50' : 'border-gray-400'}`}
                                placeholder="Name..."
                                value={formData[field.id] || ''}
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm bg-gray-200 px-1">{field.secondaryLabel}</span>
                            <div
                                onClick={() => !isReadOnly && handleInputChange(`${field.id}_ms`, !formData[`${field.id}_ms`])}
                                className={`w-8 h-8 border flex items-center justify-center ${!isReadOnly ? 'cursor-pointer' : ''} ${formData[`${field.id}_ms`] ? 'bg-black text-white' : 'bg-white'} ${errors[`${field.id}_salutation`] ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-800'}`}
                            >
                                {formData[`${field.id}_ms`] && '✓'}
                            </div>
                        </div>
                    </div>
                )}

                {field.type === 'box_medium_labeled' && (
                    <div className="border border-black p-1 flex items-center gap-4 bg-white/50">
                        <span className="font-bold text-sm uppercase px-2">{field.label}</span>
                        <input
                            type="text"
                            readOnly={isReadOnly}
                            className="w-20 h-10 border-l border-black pl-2 focus:bg-blue-50 outline-none bg-transparent font-bold text-lg text-center"
                            value={formData[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                        />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`mx-auto ${!isReadOnly ? 'max-w-5xl pb-20 animate-fade-in-up' : 'w-[210mm] relative'}`}>
            {!isReadOnly && (
                <div className="flex justify-between items-center mb-6 no-print">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Academic Course Unit Registration</h2>
                        <p className="text-gray-500 text-sm mt-1">Please fill the form below in block capitals.</p>
                    </div>
                </div>
            )}

            <div className={`bg-white p-12 ${!isReadOnly ? 'shadow-2xl border border-gray-200 min-h-screen relative mx-auto' : ''} w-full max-w-[210mm]`}>
                {/* Paper Form Container */}
                {formStructure.map(element => renderFormElement(element))}
            </div>

            {!isReadOnly && (
                <div className="mt-12 flex justify-end no-print">
                    <button
                        onClick={handleSubmit}
                        disabled={submitted}
                        className="px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 active:scale-95"
                    >
                        {submitted ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <span>📄</span>
                                Submit Registration
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default StudentCourseUnitRegistration;
