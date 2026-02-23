import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const StudentAddDropForm = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({});
    const [submitted, setSubmitted] = useState(false);

    // Form Structure (Copied from EditFormsSection.jsx ID: 2)
    const formStructure = [
        {
            id: 'header_1',
            type: 'header',
            content: [
                { text: 'UNIVERSITY OF KELANIYA - SRI LANKA', style: 'h2' },
                { text: 'FACULTY OF SCIENCE', style: 'h3' },
                { text: 'APPLICATION TO ADD/ DROP COURSE UNITS', style: 'h2_underline' },
                { text: 'SEMESTER II - ACADEMIC YEAR 2023/2024', style: 'h3' }
            ]
        },
        {
            id: 'student_info',
            type: 'section',
            fields: [
                { id: 'st_no', label: 'STUDENT NUMBER', type: 'box_input', count: 12 },
                { id: 'st_name', label: 'STUDENT NAME (Mr/Ms)', type: 'line_input' },
                { id: 'contact', label: 'CONTACT NUMBER', type: 'line_input' },
                { id: 'email', label: 'EMAIL ADDRESS', type: 'line_input' },
            ]
        },
        {
            id: 'course_info',
            type: 'row_group',
            fields: [
                { id: 'combo', label: 'COURSE COMBINATION', type: 'box_small' },
                { id: 'year', label: 'YEAR', type: 'box_small' }
            ]
        },
        {
            id: 'add_table',
            type: 'table',
            title: 'TO ADD A COURSE UNIT',
            columns: ['Course Unit', 'Recommendation of the relevant Senior Academic Advisor (Signature)'],
            rows: 4
        },
        {
            id: 'drop_table',
            type: 'table',
            title: 'TO DROP A COURSE UNIT',
            columns: ['Course Unit', 'Recommendation of the relevant Senior Academic Advisor (Signature)'],
            rows: 4
        },
        {
            id: 'credits_summary',
            type: 'section',
            fields: [
                { id: 'sem1_cred', label: 'Number of credits registered for Semester I', type: 'text_right' },
                { id: 'sem2_cred', label: 'Number of credits registered for Semester II', type: 'text_right' },
                { id: 'total_cred', label: 'Total number of credits registered for Academic Year 2023/2024', type: 'text_right' },
            ]
        },
        {
            id: 'declaration',
            type: 'text_block',
            content: 'Declaration: This is my final selection of course units for Semester II of 2023/2024, and I shall not change them for any reason after this date.'
        },
        {
            id: 'signatures',
            type: 'signature_row',
            labels: ['Date', 'Signature']
        },
        {
            id: 'approvals',
            type: 'signature_row',
            labels: ['Date', 'Signature of the Dean'],
            footer: 'Office of the Dean – Faculty of Science, University of Kelaniya'
        }
    ];

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                st_name: user.name || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    const handleInputChange = (id, value) => {
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = async () => {
        setSubmitted(true);

        try {
            // Reconstruct student number from individual boxes
            let student_number = '';
            for (let i = 0; i < 12; i++) {
                if (formData[`st_no_${i}`]) {
                    student_number += formData[`st_no_${i}`];
                }
            }

            // Extract added courses
            const added_courses = [];
            for (let i = 0; i < 4; i++) {
                const course = formData[`add_table_row${i}_col0`];
                if (course && course.trim() !== '') {
                    added_courses.push(course.trim());
                }
            }

            // Extract dropped courses
            const dropped_courses = [];
            for (let i = 0; i < 4; i++) {
                const course = formData[`drop_table_row${i}_col0`];
                if (course && course.trim() !== '') {
                    dropped_courses.push(course.trim());
                }
            }

            const payload = {
                student_number,
                student_name: formData.st_name,
                contact_number: formData.contact,
                email: formData.email,
                combination: formData.combo,
                year: formData.year,
                sem1_credits: formData.sem1_cred,
                sem2_credits: formData.sem2_cred,
                total_credits: formData.total_cred,
                signature: formData.signatures_Signature,
                signature_date: formData.signatures_Date,
                added_courses,
                dropped_courses
            };

            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/add-drop/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                alert("Add/Drop Request Submitted Successfully!");
                // Optionally clear form or redirect
            } else {
                alert(`Error: ${data.message}`);
                console.error("Submission error:", data);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("An error occurred while submitting the request.");
        } finally {
            setSubmitted(false);
        }
    };

    const renderFormElement = (element) => {
        switch (element.type) {
            case 'header':
                return (
                    <div key={element.id} className="text-center mb-6 space-y-1">
                        {element.content.map((item, idx) => {
                            let className = "text-gray-900 font-serif ";
                            if (item.style === 'h2') className += "text-xl font-bold";
                            if (item.style === 'h3') className += "text-lg font-semibold";
                            if (item.style === 'h2_underline') className += "text-xl font-bold underline decoration-2 underline-offset-4 mb-4 block";
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

            case 'row_group':
                return (
                    <div key={element.id} className="flex flex-wrap gap-8 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100 items-center justify-center">
                        {element.fields.map(field => renderField(field))}
                    </div>
                );

            case 'table':
                return (
                    <div key={element.id} className="mb-8 border border-black">
                        {element.title && (
                            <div className="border-b border-black text-center font-bold p-2 bg-gray-100 uppercase text-sm font-serif">
                                {element.title}
                            </div>
                        )}
                        <div className="grid bg-white" style={{ gridTemplateColumns: `1fr 1.5fr` }}> {/* Hardcoded 2-col for now based on structure */}
                            {element.columns.map((col, idx) => (
                                <div key={idx} className="border-r border-black last:border-r-0 p-2 text-center text-xs font-bold border-b border-black font-serif">
                                    {col}
                                </div>
                            ))}
                            {[...Array(element.rows)].map((_, rIdx) => (
                                <React.Fragment key={rIdx}>
                                    {/* Column 1: Course Unit (Student Input) */}
                                    <div className="border-r border-black border-b border-black last:border-b-0 h-10 p-1">
                                        <input
                                            type="text"
                                            className="w-full h-full border-none focus:bg-blue-50 outline-none px-2 text-center uppercase"
                                            placeholder={`Course Unit ${rIdx + 1}`}
                                            value={formData[`${element.id}_row${rIdx}_col0`] || ''}
                                            onChange={(e) => handleInputChange(`${element.id}_row${rIdx}_col0`, e.target.value.toUpperCase())}
                                        />
                                    </div>
                                    {/* Column 2: Recommendation (Staff only - Disabled or Placeholder) */}
                                    <div className="border-b border-black last:border-b-0 h-10 bg-gray-50 flex items-center justify-center text-gray-400 text-xs italic">
                                        (For Official Use Only)
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                );

            case 'text_block':
                return (
                    <div key={element.id} className="mb-6 text-sm font-serif leading-relaxed">
                        <span className="font-bold">Declaration: </span>
                        {element.content.replace('Declaration: ', '')}
                    </div>
                );

            case 'signature_row':
                return (
                    <div key={element.id} className="mb-8 mt-8 flex justify-between items-end gap-10">
                        {element.labels.map((label, idx) => (
                            <div key={idx} className="flex-1 text-center">
                                {/* Only enable Applicant Signature */}
                                {['Signature', 'Date'].some(txt => label === txt) && element.id === 'signatures' ? (
                                    <input
                                        type={label === 'Date' ? 'date' : 'text'}
                                        placeholder={label === 'Signature' ? 'Type Name as Digital Signature' : ''}
                                        className="h-8 border-b border-dashed border-black w-full text-center focus:bg-blue-50 outline-none font-serif"
                                        value={formData[`${element.id}_${label}`] || ''}
                                        onChange={(e) => handleInputChange(`${element.id}_${label}`, e.target.value)}
                                    />
                                ) : (
                                    <div className="h-8 border-b border-dashed border-black w-full bg-gray-50"></div>
                                )}
                                <div className="text-sm font-serif font-bold uppercase pt-2">{label}</div>
                            </div>
                        ))}
                        {element.footer && (
                            <div className="w-full text-left absolute -bottom-6 left-0 text-[10px] italic mt-2 font-serif">{element.footer}</div>
                        )}
                    </div>
                );

            default: return null;
        }
    };

    const renderField = (field) => {
        return (
            <div key={field.id} className={`flex items-center gap-2 ${field.type.includes('right') ? 'justify-end w-full' : ''}`}>
                <span className="text-sm font-semibold uppercase font-serif whitespace-nowrap">
                    {field.label}{field.label && !field.label.endsWith(':') && ':'}
                </span>

                {field.type === 'box_input' && (
                    <div className="flex gap-1 ml-2">
                        {[...Array(field.count)].map((_, i) => (
                            <input
                                key={i}
                                id={`${field.id}_${i}`}
                                type="text"
                                value={formData[`${field.id}_${i}`] || ''}
                                maxLength={1}
                                className="w-8 h-8 border border-gray-800 text-center font-bold text-xl focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                                onChange={(e) => {
                                    handleInputChange(`${field.id}_${i}`, e.target.value.toUpperCase());
                                    if (e.target.value && i < field.count - 1) {
                                        const nextBox = document.getElementById(`${field.id}_${i + 1}`);
                                        if (nextBox) nextBox.focus();
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Backspace' && !formData[`${field.id}_${i}`] && i > 0) {
                                        const prevBox = document.getElementById(`${field.id}_${i - 1}`);
                                        if (prevBox) prevBox.focus();
                                    }
                                }}
                            />
                        ))}
                    </div>
                )}

                {field.type === 'line_input' && (
                    <input
                        type="text"
                        className="flex-1 border-b border-gray-400 border-dashed h-8 px-2 focus:border-blue-500 outline-none min-w-[200px]"
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                    />
                )}

                {field.type === 'box_small' && (
                    <input
                        type="text"
                        className="w-24 h-8 border border-gray-800 text-center px-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none ml-2"
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                    />
                )}

                {field.type === 'text_right' && (
                    <div className="flex items-center gap-2 ml-4">
                        <span className="font-bold">=</span>
                        <input
                            type="number"
                            className="border border-gray-400 w-24 h-8 px-2 text-right focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                        />
                    </div>
                )}
            </div>
        )
    };

    // Removed Virtual React Fragment helper as it causes unmounting on re-renders

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6 no-print">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Add / Drop Course Request</h2>
                    <p className="text-gray-500 text-sm mt-1">Submit a request to add or drop course units.</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={submitted}
                    className={`px-6 py-2 ${submitted ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold rounded-lg shadow-lg flex items-center gap-2 transition-colors`}
                >
                    {submitted ? 'Sending...' : 'Submit Request'}
                </button>
            </div>

            <div className="bg-white p-12 shadow-xl border border-gray-200 min-h-screen relative mx-auto w-full max-w-[210mm]">
                {formStructure.map(element => {
                    // Wrap signature rows in relative container for footer positioning
                    if (element.type === 'signature_row' && element.footer) {
                        return <div key={element.id} className="relative pb-8">{renderFormElement(element)}</div>
                    }
                    return renderFormElement(element);
                })}
            </div>
        </div>
    );
};

export default StudentAddDropForm;
