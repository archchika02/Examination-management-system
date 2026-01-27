import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const StudentMedicalRepeatForm = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [file, setFile] = useState(null);

    // Form Structure (Copied from EditFormsSection.jsx ID: 4)
    const formStructure = [
        {
            id: 'header_rm',
            type: 'header',
            content: [
                { text: 'Closing date of Application: 09.04.2025', style: 'text_left_bold' },
                { text: 'UNIVERSITY OF KELANIYA', style: 'h2' },
                { text: 'APPLICATION FOR REPEAT/MEDICAL EXAMINATIONS', style: 'h2' },
                { text: 'FOR IT/MIT STUDENTS', style: 'h3' },
                { text: 'INTAKE OF STUDENTS OF THE ACADEMIC YEAR 2022/2023 ONLY', style: 'h3' },
                { text: 'ACADEMIC YEAR 2023/2024 – SEMESTER I', style: 'h3' }
            ]
        },
        {
            id: 'instructions',
            type: 'instruction_block',
            items: [
                "Mention the results obtained (E, D+, D, or C-) for each course unit separately with the relevant academic year. If you have been absent for the module mention it as 'AB', if you have obtained the approval for the medical application, mention it as 'MED', if the results are withheld, mention it as 'WH'.",
                "Follow mentioned amount should be deposited to the Peoples Bank, Dalugama Branch, Account Name: University of Kelaniya, Account No: 055-100130667553.",
                {
                    type: 'table_embedded',
                    columns: ['Kind of Payment', 'Amount to be paid for a course unit'],
                    rows: [
                        ['1st Medical', 'LKR 100.00 per course unit'],
                        ['2nd, 3rd Medical of the same course unit', 'LKR 500.00 per course unit'],
                        ['Repeat or any other situation', 'LKR 500.00 per course unit']
                    ]
                },
                "The duly filled application, copy of the medical application approved letter and the copy of the payment receipt should be attached and should be handed over to the help desk of the Faculty of Science.",
                "The student requests to sit exams beyond 5 years should obtain the approval of the Appeals committee and attach the letter of approval."
            ]
        },
        {
            id: 'student_info_rm',
            type: 'section',
            fields: [
                { id: 'full_name', label: '01. Full Name', type: 'dotted_line' },
                { id: 'st_num_spec', label: '02. Student Number', type: 'prefilled_box', value: 'IM/2022/' },
                { id: 'tel_no', label: '03. Telephone No', type: 'dotted_line' },
                { id: 'email_rm', label: '04. Email', type: 'dotted_line' },
            ]
        },
        {
            id: 'course_apply_head',
            type: 'text_block_simple',
            content: '05. Course unit applying for:'
        },
        {
            id: 'course_apply_table',
            type: 'table',
            columns: ['Course Code', 'Course Title', 'Results obtained', 'Academic Year'],
            rows: 5,
            numberedRows: true
        },
        {
            id: 'evidence_upload',
            type: 'file_upload',
            label: '06. Upload Evidence (Medical Certificate / Payment Receipt)',
        },
        {
            id: 'signatures_rm',
            type: 'signature_row_wide',
            labels: ['Student Signature:....................................', 'Date ........................']
        },
    ];

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

    const handleSubmit = () => {
        setSubmitted(true);
        console.log("Medical/Repeat Form Data:", { ...formData, file: file?.name });

        // Mock successful submission
        setTimeout(() => {
            alert("Application Submitted Successfully!");
            setSubmitted(false);
        }, 1500);
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
                                <片 key={rIdx}>
                                    {element.numberedRows && <div className="border-r border-black border-b border-black last:border-b-0 flex items-center justify-center font-bold text-xs">{rIdx + 1}</div>}
                                    {element.columns.map((col, cIdx) => (
                                        <div key={cIdx} className="border-r border-black last:border-r-0 border-b border-black last:border-b-0 h-10 p-0">
                                            <input
                                                type="text"
                                                className="w-full h-full border-none focus:bg-blue-50 outline-none px-2 text-center text-sm"
                                                onChange={(e) => handleInputChange(`${element.id}_row${rIdx}_col${cIdx}`, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </片>
                            ))}
                        </div>
                    </div>
                );

            case 'file_upload':
                return (
                    <div key={element.id} className="mb-8">
                        <div className="font-bold text-sm font-serif mb-2">{element.label}</div>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative group bg-white">
                            <input
                                type="file"
                                accept=".pdf,.jpg,.png"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                            <div className="space-y-3 pointer-events-none">
                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                    <span className="text-xl text-blue-500">📎</span>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {file ? (
                                        <span className="text-blue-600 font-semibold">{file.name}</span>
                                    ) : (
                                        <>
                                            <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
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

    // Virtual React Fragment helper
    const 片 = ({ children }) => <>{children}</>;

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
