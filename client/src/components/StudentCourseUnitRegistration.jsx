import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import SignatureCanvas from 'react-signature-canvas';

const StudentCourseUnitRegistration = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const sigCanvas = useRef(null);

    // Form Structure (Copied from EditFormsSection.jsx ID: 1)
    const formStructure = [
        {
            id: 'header_cr',
            type: 'header',
            content: [
                { text: 'Application closing date: 17.02.2025', style: 'text_left_bold' },
                { text: 'UNIVERSITY OF KELANIYA - SRI LANKA', style: 'h2' },
                { text: 'FACULTY OF SCIENCE', style: 'h3' },
                { text: '2023/2024 ACADEMIC YEAR', style: 'h2' },
                { text: 'REGISTRATION FORM FOR COURSE UNITS', style: 'h2_underline' },
                { text: '(Use block capitals only)', style: 'text_left_italic_bold' },
            ]
        },
        {
            id: 'student_info_cr_1',
            type: 'section_inline',
            fields: [
                { id: 'st_no_cr', label: '*STUDENT NUMBER', type: 'box_input_prefilled', value: ['I', 'M', '/'], count: 8 },
                { id: 'level', label: '*LEVEL', type: 'box_single', align: 'right' },
            ]
        },
        {
            id: 'student_info_cr_2',
            type: 'section',
            fields: [
                { id: 'st_name_cr', label: '*STUDENT NAME: Mr', type: 'line_input_check', secondaryLabel: 'Ms' },
                { id: 'address', label: 'ADDRESS', type: 'line_input_dotted' },
            ]
        },
        {
            id: 'student_info_cr_3',
            type: 'section_inline',
            fields: [
                { id: 'mobile', label: '*MOBILE/ TELEPHONE NO', type: 'line_input_dotted', flex: 1 },
                { id: 'email_cr', label: 'E-MAIL', type: 'line_input_dotted', flex: 1 },
            ]
        },
        {
            id: 'course_combo_row',
            type: 'section_inline',
            fields: [
                { id: 'spacer', type: 'spacer', flex: 2 },
                { id: 'course_combo', label: '*COURSE UNIT COMBINATION', type: 'box_single', align: 'right' },
            ]
        },
        {
            id: 'course_grids_layout',
            type: 'two_column_layout',
            left: [
                {
                    type: 'grid_section',
                    title: 'COMPULSORY COURSE UNITS',
                    subtitle: 'SEMESTER 1',
                    rows: 10,
                    cols: 12,
                    id: 'Grid_Comp_S1'
                },
                {
                    type: 'section_inline',
                    justify: 'end',
                    fields: [{ id: 'cred_comp_1', label: 'CREDITS', type: 'box_small' }]
                },
                {
                    type: 'grid_section',
                    subtitle: 'SEMESTER 2',
                    rows: 10,
                    cols: 12,
                    id: 'Grid_Comp_S2'
                },
                {
                    type: 'section_inline',
                    justify: 'end',
                    fields: [{ id: 'cred_comp_2', label: 'CREDITS', type: 'box_small' }]
                },
                {
                    type: 'section_inline',
                    justify: 'end',
                    fields: [{ id: 'cred_comp_total', label: 'COMPULSORY CREDITS', type: 'box_small' }]
                },
            ],
            right: [
                {
                    type: 'grid_section',
                    title: 'OPTIONAL COURSE UNITS',
                    subtitle: 'SEMESTER 1',
                    rows: 6,
                    cols: 12,
                    id: 'Grid_Opt_S1'
                },
                {
                    type: 'section_inline',
                    justify: 'end',
                    fields: [{ id: 'cred_opt_1', label: 'CREDITS', type: 'box_small' }]
                },
                {
                    type: 'grid_section',
                    subtitle: 'SEMESTER 2',
                    rows: 6,
                    cols: 12,
                    id: 'Grid_Opt_S2'
                },
                {
                    type: 'section_inline',
                    justify: 'end',
                    fields: [{ id: 'cred_opt_2', label: 'CREDITS', type: 'box_small' }]
                },
                {
                    type: 'section_inline',
                    justify: 'end',
                    fields: [{ id: 'cred_opt_total', label: 'OPTIONAL CREDITS', type: 'box_small' }]
                },
                {
                    type: 'grid_section',
                    title: 'AUXILIARY COURSE UNITS',
                    subtitle: 'SEMESTER 1',
                    rows: 3,
                    cols: 12,
                    id: 'Grid_Aux_S1'
                },
                {
                    type: 'grid_section',
                    subtitle: 'SEMESTER 2',
                    rows: 3,
                    cols: 12,
                    id: 'Grid_Aux_S2'
                },
                {
                    type: 'section_inline',
                    justify: 'end',
                    fields: [{ id: 'cred_aux', label: 'CREDITS', type: 'box_small' }]
                },
                {
                    type: 'section_inline',
                    justify: 'end',
                    fields: [{ id: 'cred_aux_total', label: 'AUXILIARY CREDITS', type: 'box_small' }]
                },
            ]
        },
        {
            id: 'footer_summary',
            type: 'section_inline',
            fields: [
                { id: 'total_creds_box', label: 'TOTAL NUMBER OF CREDITS', type: 'box_medium_labeled' },
            ]
        },
        {
            id: 'signatures_cr',
            type: 'signature_row_wide',
            labels: ['DATE', 'SIGNATURE OF APPLICANT'],
            footer: 'ANY CHANGE TO THE REGISTERED COURSES WILL NOT BE DONE AFTER TWO WEEKS OF THE COMMENCEMENT OF THE SEMESTER.'
        },
        {
            id: 'footer_office',
            type: 'text_center_italic',
            content: 'Office of the Dean – Faculty of Science, University of Kelaniya'
        }
    ];

    // Pre-fill Logic
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                st_name_cr: user.name || '',
                // Parse student ID if format matches IM/2023/001 logic later if needed
                email_cr: user.email || '',
                // Additional mock pre-fills
                level: '1',
                mobile: '0712345678'
            }));
        }
    }, [user]);

    const handleInputChange = (id, value) => {
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
            alert("Please provide your digital signature before submitting.");
            return;
        }

        setSubmitted(true);

        try {
            // Using getCanvas() instead of getTrimmedCanvas() to avoid "trim_canvas is not a function" error in this Vite setup
            const signatureBase64 = sigCanvas.current.getCanvas().toDataURL('image/png');
            console.log("Form Data Submitted:", formData);

            const payload = {
                user_id: user?.user_id || null, // Assuming user object has user_id or id
                form_data: formData,
                signature: signatureBase64
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
            // Optionally reset form or navigate away
            sigCanvas.current.clear();
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
                                    {[...Array(element.cols)].map((_, c) => (
                                        <input
                                            key={c}
                                            type="text"
                                            maxLength={2}
                                            className="flex-1 border-r border-black last:border-r-0 w-full text-center text-[10px] focus:bg-blue-50 outline-none uppercase"
                                            onChange={(e) => handleInputChange(`${element.id}_${r}_${c}`, e.target.value)}
                                        />
                                    ))}
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
                                    <div className="border-b border-black border-dashed mb-1 w-full bg-white relative flex flex-col justify-end" style={{ height: '80px' }}>
                                        <div className="absolute inset-0">
                                            <SignatureCanvas
                                                ref={sigCanvas}
                                                canvasProps={{ className: 'signature-canvas w-full h-full' }}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => sigCanvas?.current?.clear()}
                                            className="absolute bottom-1 right-1 text-[8px] bg-gray-200 px-1 py-0.5 rounded hover:bg-gray-300 no-print z-10"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                ) : (
                                    <input
                                        type="date"
                                        className="h-8 border-b border-black border-dashed mb-1 w-full text-center focus:bg-blue-50 outline-none font-serif"
                                        onChange={(e) => handleInputChange(`sig_${idx}`, e.target.value)}
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
                        {field.value.map((val, i) => (
                            <div key={`p-${i}`} className="w-8 h-8 border border-gray-800 bg-gray-100 flex items-center justify-center font-bold text-xl">{val}</div>
                        ))}
                        {/* Dynamic Student ID Inputs */}
                        <div className="flex gap-1">
                            {[...Array(field.count)].map((_, i) => (
                                <input
                                    key={i}
                                    type="text"
                                    maxLength={1}
                                    className="w-8 h-8 border border-gray-800 text-center font-bold text-xl focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                                    onChange={(e) => {
                                        // Complex logic to stitch ID together could go here
                                        handleInputChange(`${field.id}_${i}`, e.target.value)
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {field.type === 'box_single' && (
                    <input
                        type="text"
                        className="w-24 h-10 border border-gray-800 text-center px-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                    />
                )}

                {field.type === 'box_small' && (
                    <input
                        type="text"
                        className="w-16 h-8 border border-gray-800 text-center px-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                    />
                )}

                {(field.type === 'line_input' || field.type === 'line_input_dotted' || field.type === 'dotted_line') && (
                    <input
                        type="text"
                        className={`flex-1 border-b-2 border-gray-300 ${field.type.includes('dotted') ? 'border-dotted' : ''} h-8 px-2 focus:border-blue-500 outline-none min-w-[150px]`}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                    />
                )}

                {field.type === 'line_input_check' && (
                    <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2">
                            <div
                                onClick={() => handleInputChange(`${field.id}_mr`, !formData[`${field.id}_mr`])}
                                className={`w-8 h-8 border border-gray-800 cursor-pointer flex items-center justify-center ${formData[`${field.id}_mr`] ? 'bg-black text-white' : 'bg-white'}`}
                            >
                                {formData[`${field.id}_mr`] && '✓'}
                            </div>
                            <input
                                type="text"
                                className="flex-1 border-b border-gray-400 border-dotted h-8 px-2 outline-none min-w-[200px]"
                                placeholder="Name..."
                                value={formData[field.id] || ''}
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm bg-gray-200 px-1">{field.secondaryLabel}</span>
                            <div
                                onClick={() => handleInputChange(`${field.id}_ms`, !formData[`${field.id}_ms`])}
                                className={`w-8 h-8 border border-gray-800 cursor-pointer flex items-center justify-center ${formData[`${field.id}_ms`] ? 'bg-black text-white' : 'bg-white'}`}
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
                            type="number"
                            className="w-20 h-10 border-l border-black pl-2 focus:bg-blue-50 outline-none"
                            value={formData[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                        />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6 no-print">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Academic Course Unit Registration</h2>
                    <p className="text-gray-500 text-sm mt-1">Please fill the form below in block capitals.</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={submitted}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg flex items-center gap-2"
                >
                    {submitted ? 'Submitting...' : 'Submit Registration'}
                </button>
            </div>

            <div className="bg-white p-16 shadow-2xl border border-gray-200 min-h-screen relative mx-auto w-full max-w-[210mm]">
                {/* Paper Form Container */}
                {formStructure.map(element => renderFormElement(element))}
            </div>
        </div>
    );
};

export default StudentCourseUnitRegistration;
