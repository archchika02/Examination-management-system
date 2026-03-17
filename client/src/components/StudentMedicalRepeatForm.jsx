import React, { useState, useEffect, Fragment } from 'react';
import { useAuth } from '../context/AuthContext';

const StudentMedicalRepeatForm = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [medicalFiles, setMedicalFiles] = useState([]);
    const [receiptFiles, setReceiptFiles] = useState([]);
    const [academicYear, setAcademicYear] = useState('2023/2024');
    const [deadlineDate, setDeadlineDate] = useState('Not Set');
    const [dynamicStructure, setDynamicStructure] = useState([]);
    const [loading, setLoading] = useState(true);

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
                    const targetDeadline = data.find(d => d.form_name === 'Medical/Repeat Form');
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
                const formRes = await fetch('http://localhost:5000/api/configurations/forms/medical_repeat');
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

        loadInitialData();
    }, []);

    // Form Structure (Copied from EditFormsSection.jsx ID: 4)
    const formStructure = dynamicStructure.length > 0 ? dynamicStructure : [];

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                full_name: user.name || '',
                email_rm: user.email || '',
                // If the user's ID matches the pattern, valid, otherwise leave for manual entry
                st_num_spec: user.studentId ? user.studentId : 'IM/2022/'
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
            // Extract courses from formData
            const courses = [];
            for (let i = 0; i < 5; i++) {
                const code = formData[`course_apply_table_row${i}_col0`];
                if (code && code.trim() !== '') {
                    courses.push({
                        course_code: code,
                        course_title: formData[`course_apply_table_row${i}_col1`] || '',
                        results_obtained: formData[`course_apply_table_row${i}_col2`] || '',
                        academic_year: formData[`course_apply_table_row${i}_col3`] || ''
                    });
                }
            }

            if (courses.length === 0) {
                alert("Please add at least one course to apply for.");
                setSubmitted(false);
                return;
            }

            if (receiptFiles.length === 0) {
                alert("Please upload the Payment Receipt. It is mandatory.");
                setSubmitted(false);
                return;
            }

            const formType = medicalFiles.length > 0 ? 'Medical' : 'Repeat';

            const formDataPayload = new FormData();
            formDataPayload.append('student_number', formData.st_num_spec);
            formDataPayload.append('student_name', formData.full_name);
            formDataPayload.append('contact_number', formData.tel_no || '');
            formDataPayload.append('email', formData.email_rm || '');
            // Form type determined by attachments: Medical if cert attached, Repeat otherwise
            formDataPayload.append('form_type', formType);
            formDataPayload.append('signature', formData.sig_0 || '');
            formDataPayload.append('signature_date', formData.sig_1 || '');
            formDataPayload.append('academicYear', academicYear);
            formDataPayload.append('courses', JSON.stringify(courses));

            if (medicalFiles[0]) {
                formDataPayload.append('medical_certificate', medicalFiles[0]);
            }
            if (receiptFiles[0]) {
                formDataPayload.append('payment_receipt', receiptFiles[0]);
            }

            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/medical-repeat/submit', {
                method: 'POST',
                headers: {
                    // Do not set Content-Type here, browser will set it to multipart/form-data with boundary automatically
                    'Authorization': `Bearer ${token}`
                },
                body: formDataPayload
            });

            if (response.ok) {
                alert("Application Submitted Successfully!");
                // Optionally clear form here
            } else {
                const errorData = await response.json();
                alert(`Error submitting application: ${errorData.message}`);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert(`An unexpected error occurred during submission: ${error.message}`);
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
                            if (item.style === 'text_left_bold') return <div key={idx} className="text-left font-bold text-sm mb-4">{item.text}</div>;
                            return <div key={idx} className={className}>{item.text}</div>;
                        })}
                    </div>
                );

            case 'instruction_block':
                return (
                    <div key={element.id} className="mb-8 border border-gray-300 p-6 text-sm font-serif bg-gray-50/30">
                        <h4 className="font-bold underline mb-4">Instructions:</h4>
                        <ol className="list-decimal list-outside ml-4 space-y-3">
                            {element.items.map((item, idx) => (
                                <li key={idx} className="pl-1">
                                    {typeof item === 'string' ? item : (
                                        item.type === 'table_embedded' ? (
                                            <div className="mt-3 mb-3 border border-gray-400 w-full max-w-2xl bg-white">
                                                <div className="flex bg-gray-100 border-b border-gray-400 font-bold">
                                                    {item.columns.map((col, cIdx) => (
                                                        <div key={cIdx} className="flex-1 p-2 border-r border-gray-400 last:border-r-0 text-center">{col}</div>
                                                    ))}
                                                </div>
                                                {item.rows.map((row, rIdx) => (
                                                    <div key={rIdx} className="flex border-b border-gray-400 last:border-b-0">
                                                        {row.map((cell, cellIdx) => (
                                                            <div key={cellIdx} className="flex-1 p-2 border-r border-gray-400 last:border-r-0">{cell}</div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : null
                                    )}
                                </li>
                            ))}
                        </ol>
                    </div>
                );

            case 'section':
                return (
                    <div key={element.id} className="space-y-4 mb-6">
                        {element.fields.map(field => renderField(field))}
                    </div>
                );

            case 'text_block_simple':
                return (
                    <div key={element.id} className="mb-2 text-sm font-serif font-bold">
                        {element.content}
                    </div>
                );

            case 'table':
                return (
                    <div key={element.id} className="mb-8 border border-black">
                        <div className="grid bg-white" style={{ gridTemplateColumns: element.numberedRows ? '40px 1.5fr 3fr 1.5fr 1fr' : 'repeat(4, 1fr)' }}>
                            {/* Header */}
                            {element.numberedRows && <div className="border-r border-black border-b border-black bg-gray-100"></div>}
                            {element.columns.map((col, idx) => (
                                <div key={idx} className="border-r border-black last:border-r-0 p-2 text-center text-xs font-bold border-b border-black font-serif bg-gray-50 flex items-center justify-center">
                                    {col}
                                </div>
                            ))}
                            {/* Rows */}
                            {[...Array(element.rows)].map((_, rIdx) => (
                                <Fragment key={rIdx}>
                                    {element.numberedRows && <div className="border-r border-black border-b border-black last:border-b-0 flex items-center justify-center font-bold text-xs">{rIdx + 1}</div>}
                                    {element.columns.map((col, cIdx) => (
                                        <div key={cIdx} className="border-r border-black last:border-r-0 border-b border-black last:border-b-0 h-10 p-0">
                                            <input
                                                id={`input_${element.id}_row${rIdx}_col${cIdx}`}
                                                type="text"
                                                className="w-full h-full border-none focus:bg-blue-50 outline-none px-2 text-center text-sm"
                                                value={formData[`${element.id}_row${rIdx}_col${cIdx}`] || ''}
                                                onChange={(e) => handleInputChange(`${element.id}_row${rIdx}_col${cIdx}`, e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        let nextCIdx = cIdx + 1;
                                                        let nextRIdx = rIdx;
                                                        // Move to next row if at end of column
                                                        if (nextCIdx >= element.columns.length) {
                                                            nextCIdx = 0;
                                                            nextRIdx = rIdx + 1;
                                                        }
                                                        if (nextRIdx < element.rows) {
                                                            const nextInput = document.getElementById(`input_${element.id}_row${nextRIdx}_col${nextCIdx}`);
                                                            if (nextInput) {
                                                                nextInput.focus();
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    ))}
                                </Fragment>
                            ))}
                        </div>
                    </div>
                );

            case 'file_upload_medical':
                return (
                    <div key={element.id} className="mb-8">
                        <div className="font-bold text-sm font-serif mb-2">{element.label}</div>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative group bg-white">
                            <input
                                type="file"
                                accept=".pdf,.jpg,.png"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    const selected = Array.from(e.target.files);
                                    if (selected.length > 1) {
                                        alert("You can only upload 1 Medical Certificate file.");
                                        e.target.value = null; // reset
                                    } else {
                                        setMedicalFiles(selected);
                                    }
                                }}
                            />
                            <div className="space-y-3 pointer-events-none">
                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                    <span className="text-xl text-blue-500">📎</span>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {medicalFiles.length > 0 ? (
                                        <span className="text-blue-600 font-semibold">{medicalFiles[0].name}</span>
                                    ) : (
                                        <>
                                            <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop (Max 1 file)
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'file_upload_receipt':
                return (
                    <div key={element.id} className="mb-8">
                        <div className="font-bold text-sm font-serif mb-2">{element.label}</div>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative group bg-white">
                            <input
                                type="file"
                                accept=".pdf,.jpg,.png"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    const selected = Array.from(e.target.files);
                                    if (selected.length > 1) {
                                        alert("You can only upload 1 Payment Receipt file.");
                                        e.target.value = null; // reset
                                    } else {
                                        setReceiptFiles(selected);
                                    }
                                }}
                            />
                            <div className="space-y-3 pointer-events-none">
                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                    <span className="text-xl text-blue-500">📎</span>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {receiptFiles.length > 0 ? (
                                        <span className="text-blue-600 font-semibold">{receiptFiles[0].name}</span>
                                    ) : (
                                        <>
                                            <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop (Max 1 file)
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'signature_row_wide':
                return (
                    <div key={element.id} className="mb-8 mt-12 flex flex-col md:flex-row justify-between items-end gap-10">
                        {element.labels.map((label, idx) => {
                            const pureLabel = label.split(':')[0].trim(); // Extract 'Student Signature' from 'Student Signature:.......'
                            const isDate = pureLabel.toLowerCase().includes('date');

                            return (
                                <div key={idx} className="flex-1 text-center w-full">
                                    <input
                                        type={isDate ? 'date' : 'text'}
                                        placeholder={!isDate ? 'Digital Signature (Type Name)' : ''}
                                        className="h-8 border-b border-dotted border-black w-full text-center focus:bg-blue-50 outline-none font-serif"
                                        onChange={(e) => handleInputChange(`sig_${idx}`, e.target.value)}
                                    />
                                    <div className="text-sm font-serif font-bold pt-2 text-left">{label}</div>
                                </div>
                            )
                        })}
                    </div>
                );

            default: return null;
        }
    };

    const renderField = (field) => {
        return (
            <div key={field.id} className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold font-serif whitespace-nowrap min-w-[150px]">
                    {field.label}
                </span>

                {field.type === 'dotted_line' && (
                    <input
                        type="text"
                        className="flex-1 border-b border-gray-400 border-dotted h-8 px-2 focus:border-blue-500 outline-none"
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                    />
                )}
                {field.type === 'prefilled_box' && (
                    <input
                        type="text"
                        className="flex-1 border border-gray-800 h-10 px-3 font-mono text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData[field.id] || field.value}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                    />
                )}
            </div>
        )
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium font-serif italic">Loading formal structure...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6 no-print">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Repeat / Medical Application</h2>
                    <p className="text-gray-500 text-sm mt-1">Submit application for repeat or medical examinations.</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={submitted}
                    className={`px-6 py-2 ${submitted ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'} text-white font-bold rounded-lg shadow-lg flex items-center gap-2 transition-colors`}
                >
                    {submitted ? 'Submitting...' : 'Submit Application'}
                </button>
            </div>

            <div className="bg-white p-12 shadow-xl border border-gray-200 min-h-screen relative mx-auto w-full max-w-[210mm]">
                {formStructure.map(element => renderFormElement(element))}
            </div>
        </div>
    );
};

export default StudentMedicalRepeatForm;
