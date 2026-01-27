import { useState } from 'react';

const EditFormsSection = () => {
    // Mock Data for Editable Forms
    const [forms, setForms] = useState([
        {
            id: 1,
            name: 'Registration Form for Course Units',
            lastUpdated: '2026-01-20',
            description: 'Student course enrollment form.',
            structure: [
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
                            cols: 12
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
                            cols: 12
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
                            cols: 12
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
                            cols: 12
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
                            cols: 12
                        },
                        {
                            type: 'grid_section',
                            subtitle: 'SEMESTER 2',
                            rows: 3,
                            cols: 12
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
            ]
        },
        {
            id: 2,
            name: 'Add/Drop Form',
            lastUpdated: '2026-01-10',
            description: 'Request to add or drop registered courses.',
            structure: [
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
            ]
        },
        {
            id: 3,
            name: 'Repeat/Medical Exam Form',
            lastUpdated: '2026-01-26',
            description: 'Application for Repeat/Medical Examinations.',
            structure: [
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
                        { id: 'st_num_spec', label: '02. Student Number', type: 'prefilled_box', value: 'IM/2022/.........' },
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
                    id: 'signatures_rm',
                    type: 'signature_row_wide',
                    labels: ['Student Signature:....................................', 'Date ........................']
                },
            ]
        },
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list', 'view', 'edit'
    const [selectedForm, setSelectedForm] = useState(null);
    const [activeElement, setActiveElement] = useState(null); // { id, type, parentId, index, ...data }
    const [notification, setNotification] = useState(null);

    // Filter forms based on search
    const filteredForms = forms.filter(form =>
        form.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleView = (form) => {
        setSelectedForm(form);
        setViewMode('view');
        setActiveElement(null);
    };

    const handleEdit = (form) => {
        setSelectedForm(JSON.parse(JSON.stringify(form))); // Deep copy for editing
        setViewMode('edit');
        setActiveElement(null);
    };

    const handleSave = () => {
        // In a real app, we would send 'selectedForm' to the backend
        setNotification({ type: 'success', message: 'Changes saved successfully!' });
        setTimeout(() => setNotification(null), 3000);

        const updatedForms = forms.map(f =>
            f.id === selectedForm.id
                ? { ...selectedForm, lastUpdated: new Date().toISOString().split('T')[0] }
                : f
        );
        setForms(updatedForms);
    };

    const handleBack = () => {
        setViewMode('list');
        setSelectedForm(null);
        setActiveElement(null);
    };

    // --- Active Element Selection ---
    const selectElement = (element, parent = null) => {
        if (viewMode === 'edit') {
            setActiveElement({ ...element, parentId: parent?.id });
        }
    };

    // --- Recursively Update Element in Structure ---
    const updateElementInStructure = (structure, id, updates) => {
        return structure.map(el => {
            if (el.id === id) {
                return { ...el, ...updates };
            }
            if (el.fields) { // Sections
                return { ...el, fields: updateElementInStructure(el.fields, id, updates) };
            }
            if (el.content && Array.isArray(el.content)) { // Headers
                // Handle array content carefully if we are targetting items inside? 
                // Actually headers content is an array of objects but they don't have IDs themselves usually in my schema above
                // Let's assume we update the whole 'content' array if targetting the header block
                return el;
            }
            if (el.left && el.right) { // Two Column
                return {
                    ...el,
                    left: updateElementInStructure(el.left, id, updates),
                    right: updateElementInStructure(el.right, id, updates)
                }
            }
            // Add other nested types if needed
            return el;
        });
    };

    // Helper to update specific content item inside a header block which has sub-items
    // Since header content items don't have IDs, we might need to handle them differently or select the whole header block
    // For simplicity, let's select the whole header block and edit its content array via the sidebar

    const handlePropertyChange = (key, value) => {
        if (!activeElement || !selectedForm) return;

        // Create new structure with updates
        // Note: This is a simplified update logic. For deep nested structures or array sub-items, 
        // we might need more robust path-based updates.

        // Strategy: We update the LOCAL activeElement state for UI, AND the selectedForm structure.
        setActiveElement(prev => ({ ...prev, [key]: value }));

        const newStructure = updateElementInStructure(selectedForm.structure, activeElement.id, { [key]: value });
        setSelectedForm(prev => ({ ...prev, structure: newStructure }));
    };

    // Special handler for Header content array editing (by index)
    const handleHeaderContentChange = (index, subKey, value) => {
        if (!activeElement || activeElement.type !== 'header') return;

        const newContent = [...activeElement.content];
        newContent[index] = { ...newContent[index], [subKey]: value };

        handlePropertyChange('content', newContent);
    }

    // --- Dynamic Form Renderer ---
    const renderFormElement = (element, mode = 'view', parent = null) => {
        const isEdit = mode === 'edit';
        const isActive = activeElement && activeElement.id === element.id;

        const clickableProps = isEdit ? {
            onClick: (e) => { e.stopPropagation(); selectElement(element, parent); },
            className: `cursor-pointer transition-all ${isActive ? 'ring-2 ring-blue-500 bg-blue-50/50' : 'hover:ring-1 hover:ring-blue-300 hover:bg-gray-50'}`
        } : {};

        // Wrapper to apply clickable props
        const Wrapper = ({ children, className = "" }) => (
            <div
                {...clickableProps}
                className={`${clickableProps.className || ''} ${className} relative rounded`}
            >
                {isActive && <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm z-10 hidden group-hover:block">Edit</div>}
                {children}
            </div>
        );

        switch (element.type) {
            case 'header':
                return (
                    <Wrapper key={element.id} className="text-center mb-6 space-y-1 p-2 group">
                        {element.content.map((item, idx) => {
                            let className = "text-gray-900 font-serif ";
                            if (item.style === 'h2') className += "text-lg font-bold";
                            if (item.style === 'h3') className += "text-md font-semibold";
                            if (item.style === 'h2_underline') className += "text-lg font-bold underline decoration-2 underline-offset-4";
                            if (item.style === 'text_left_bold') return <div key={idx} className="text-left font-bold text-sm mb-4">{item.text}</div>;
                            if (item.style === 'text_left_italic_bold') return <div key={idx} className="text-left font-bold italic text-sm mt-3">{item.text}</div>;
                            return <div key={idx} className={className}>{item.text}</div>;
                        })}
                    </Wrapper>
                );

            case 'instruction_block':
                return (
                    <Wrapper key={element.id} className="mb-6 border border-gray-300 p-4 text-sm font-serif group">
                        <h4 className="font-bold underline mb-2">Instructions:</h4>
                        <ol className="list-decimal list-outside ml-4 space-y-3">
                            {element.items.map((item, idx) => (
                                <li key={idx} className="pl-1">
                                    {typeof item === 'string' ? item : (
                                        item.type === 'table_embedded' ? ( // Simplified render for embedded items
                                            <div className="mt-2 mb-2 border border-black w-full max-w-lg opacity-80">
                                                [Embedded Table]
                                            </div>
                                        ) : null
                                    )}
                                </li>
                            ))}
                        </ol>
                    </Wrapper>
                );

            case 'section':
                return (
                    <div key={element.id} className="space-y-4 mb-6">
                        {element.fields.map(field => {
                            const isFieldActive = activeElement && activeElement.id === field.id;
                            return (
                                <div
                                    key={field.id}
                                    onClick={(e) => { e.stopPropagation(); selectElement(field, element); }}
                                    className={`flex items-end gap-2 p-1 rounded group ${isEdit ? 'cursor-pointer hover:bg-blue-50' : ''} ${isFieldActive ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                                >
                                    <span className={`text-sm font-serif whitespace-nowrap ${field.type === 'prefilled_box' ? '' : 'min-w-[150px]'}`}>{field.label}{field.label && field.label.endsWith(':') ? '' : ':'}</span>

                                    {field.type === 'box_input' && (
                                        <div className="flex gap-1">
                                            {[...Array(field.count || 8)].map((_, i) => (
                                                <div key={i} className="w-8 h-8 border border-gray-400 bg-white"></div>
                                            ))}
                                        </div>
                                    )}
                                    {field.type === 'line_input' && (
                                        <div className="flex-1 border-b border-gray-400 border-dashed h-6"></div>
                                    )}
                                    {field.type === 'line_input_dotted' && (
                                        <div className="flex-1 border-b-2 border-gray-300 border-dotted h-5"></div>
                                    )}
                                    {field.type === 'dotted_line' && (
                                        <div className="flex-1 border-b-2 border-gray-300 border-dotted h-5"></div>
                                    )}
                                    {field.type === 'prefilled_box' && (
                                        <div className="border border-gray-800 px-3 py-2 font-mono text-lg ml-2">
                                            {field.value}
                                        </div>
                                    )}
                                    {field.type === 'line_input_check' && (
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-8 h-8 border border-gray-800"></div>
                                            <span className="font-bold text-sm bg-gray-200 px-1">{field.secondaryLabel}</span>
                                            <div className="w-8 h-8 border border-gray-800"></div>
                                            <div className="flex-1 border-b border-gray-300 border-dotted h-6"></div>
                                        </div>
                                    )}
                                    {field.type === 'text_right' && (
                                        <div className="flex-1 flex justify-end items-center gap-2">
                                            <span className="font-bold">=</span>
                                            <div className="border border-gray-400 w-20 h-6 bg-white"></div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                );

            case 'section_inline':
                return (
                    <div key={element.id} className={`flex flex-wrap items-end gap-6 mb-6 ${element.justify ? 'justify-' + element.justify : ''}`}>
                        {element.fields.map(field => {
                            if (field.type === 'spacer') return <div key={field.id} style={{ flex: field.flex }}></div>;
                            const isFieldActive = activeElement && activeElement.id === field.id;
                            return (
                                <div
                                    key={field.id}
                                    onClick={(e) => { e.stopPropagation(); selectElement(field, element); }}
                                    className={`flex items-end gap-2 p-1 rounded group ${field.flex ? 'flex-1' : ''} ${isEdit ? 'cursor-pointer hover:bg-blue-50' : ''} ${isFieldActive ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                                >
                                    <span className="text-sm font-semibold uppercase font-serif whitespace-nowrap">{field.label} {field.label && !field.label.endsWith(':') && ':'}</span>
                                    {field.type === 'box_input_prefilled' && (
                                        <div className="flex gap-1 items-center">
                                            {field.value.map((val, i) => (
                                                <div key={`p-${i}`} className="w-8 h-8 border border-gray-800 bg-gray-100 flex items-center justify-center font-bold text-xl">{val}</div>
                                            ))}
                                            {[...Array(field.count)].map((_, i) => (
                                                <div key={i} className="w-8 h-8 border border-gray-800 bg-white"></div>
                                            ))}
                                        </div>
                                    )}
                                    {field.type === 'box_single' && (
                                        <div className="w-24 h-10 border border-gray-800 bg-white"></div>
                                    )}
                                    {field.type === 'box_small' && (
                                        <div className="w-16 h-8 border border-gray-800 bg-white"></div>
                                    )}
                                    {field.type === 'line_input_dotted' && (
                                        <div className="flex-1 border-b-2 border-gray-300 border-dotted h-6 min-w-[200px]"></div>
                                    )}
                                    {field.type === 'box_medium_labeled' && (
                                        <div className="border border-black p-1 flex items-center gap-4">
                                            <span className="font-bold text-sm uppercase px-2">{field.label}</span>
                                            <div className="w-20 h-10 border-l border-black bg-white"></div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                );

            case 'table':
                return (
                    <Wrapper key={element.id} className={`mb-6 border border-black group`}>
                        {element.title && (
                            <div className="border-b border-black text-center font-bold p-1 bg-gray-50 uppercase text-sm font-serif">
                                {element.title}
                            </div>
                        )}
                        <div className="grid" style={{ gridTemplateColumns: element.numberedRows ? '30px 1fr 2fr 1fr 1fr' : `1fr 1.5fr` }}>
                            {/* Header */}
                            {element.numberedRows && <div className="border-r border-black border-b border-black bg-gray-100"></div>}
                            {element.columns.map((col, idx) => (
                                <div key={idx} className={`border-r border-black last:border-r-0 p-2 text-center text-xs font-bold border-b border-black font-serif`}>
                                    {col}
                                </div>
                            ))}
                            {/* Rows */}
                            {[...Array(element.rows)].map((_, rIdx) => (
                                <>
                                    {element.numberedRows && <div key={`idx-${rIdx}`} className="border-r border-black border-b border-black last:border-b-0 flex items-center justify-center font-bold text-xs">{rIdx + 1}</div>}
                                    {element.columns.map((_, cIdx) => (
                                        <div key={`${rIdx}-${cIdx}`} className="border-r border-black last:border-r-0 border-b border-black last:border-b-0 h-8 bg-white"></div>
                                    ))}
                                </>
                            ))}
                        </div>
                    </Wrapper>
                );
            case 'text_block':
                return (
                    <Wrapper key={element.id} className={`mb-8 text-sm font-serif leading-relaxed p-2 group`}>
                        <span className="font-bold">Declaration: </span>
                        {element.content.replace('Declaration: ', '')}
                    </Wrapper>
                );
            case 'text_block_simple':
                return (
                    <Wrapper key={element.id} className={`mb-1 text-sm font-serif p-1 group`}>
                        {element.content}
                    </Wrapper>
                );

            case 'text_center_italic':
                return (
                    <Wrapper key={element.id} className={`mb-1 text-sm font-serif italic text-center text-gray-700 mt-8 p-1 group`}>
                        {element.content}
                    </Wrapper>
                );

            case 'signature_row':
                return (
                    <Wrapper key={element.id} className="mb-8 p-2 group">
                        <div className="flex justify-between items-end gap-10">
                            {element.labels.map((label, idx) => (
                                <div key={idx} className="flex-1 text-center">
                                    <div className="border-b border-black border-dashed mb-1 w-full"></div>
                                    <div className="text-sm font-serif">{label}</div>
                                </div>
                            ))}
                        </div>
                        {element.footer && (
                            <div className="text-center text-xs italic mt-2 font-serif">{element.footer}</div>
                        )}
                        {element.id === 'approvals' && (
                            <div className="mt-6 text-sm font-serif">Approved/Not approved</div>
                        )}
                    </Wrapper>
                );

            case 'signature_row_wide':
                return (
                    <Wrapper key={element.id} className="mb-8 mt-12 flex justify-between items-end p-2 group">
                        {element.labels.map((label, idx) => (
                            <div key={idx} className="text-sm font-serif font-bold uppercase border-t border-dotted border-black pt-2 min-w-[200px] text-center">{label}</div>
                        ))}
                    </Wrapper>
                );

            case 'two_column_layout':
                return (
                    <div key={element.id} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 border border-black h-full">
                        {/* Left Column */}
                        <div className="border-r border-black p-2 flex flex-col h-full">
                            {element.left.map((item, i) => renderFormElement({ ...item, id: `${element.id}_l_${i}` }, mode, element))}
                        </div>
                        {/* Right Column */}
                        <div className="p-2 flex flex-col h-full">
                            {element.right.map((item, i) => renderFormElement({ ...item, id: `${element.id}_r_${i}` }, mode, element))}
                        </div>
                    </div>
                )

            case 'grid_section':
                return (
                    <Wrapper key={element.id} className="mb-4 group p-1">
                        {element.title && <div className="font-bold text-sm mb-1 uppercase font-serif">{element.title}</div>}
                        {element.subtitle && <div className="text-xs mb-1 uppercase font-serif">{element.subtitle}</div>}
                        <div className="border border-black bg-white">
                            {[...Array(element.rows)].map((_, r) => (
                                <div key={r} className="flex h-6 border-b border-black last:border-b-0">
                                    {[...Array(element.cols)].map((_, c) => (
                                        <div key={c} className="flex-1 border-r border-black last:border-r-0"></div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </Wrapper>
                )

            default:
                return null;
        }
    };


    // --- Render Methods ---

    const renderList = () => (
        <div className="space-y-6 animate-fade-in-up">
            {/* Top Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative w-full sm:w-96">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        🔍
                    </span>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                        placeholder="Search forms..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="text-sm text-gray-500">
                    Showing <span className="font-bold text-gray-800">{filteredForms.length}</span> forms
                </div>
            </div>

            {/* Forms Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead>
                            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Form Name</th>
                                <th className="px-6 py-4">Last Updated</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {filteredForms.map((form) => (
                                <tr key={form.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-800">{form.name}</div>
                                        <div className="text-xs text-gray-500 mt-1">{form.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                                        {form.lastUpdated}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleView(form)}
                                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleEdit(form)}
                                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderViewMode = () => (
        <div className="animate-fade-in-right">
            <div className="mb-6 flex items-center justify-between">
                <button
                    onClick={handleBack}
                    className="flex items-center text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <span className="mr-2">←</span> Back to List
                </button>
                <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">
                    Read Only Mode
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">{selectedForm.name}</h2>
                        <p className="text-gray-500 text-xs">Previewing form as Student</p>
                    </div>
                    <button
                        onClick={() => handleEdit(selectedForm)}
                        className="text-indigo-600 text-sm font-medium hover:underline"
                    >
                        Edit This Format
                    </button>
                </div>

                {/* Form Canvas */}
                <div className="p-10 max-w-[210mm] mx-auto bg-white shadow-sm my-8 border border-gray-200 min-h-[297mm]">
                    {selectedForm.structure ? (
                        selectedForm.structure.map(element => renderFormElement(element, 'view'))
                    ) : (
                        <div className="flex items-center justify-center h-96 text-gray-400">
                            <div className="text-center">
                                <p className="text-lg">No digital structure definition found.</p>
                                <p className="text-sm">Click Edit to initialize structure.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderEditMode = () => (
        <div className="animate-fade-in-right">
            <div className="mb-6 flex items-center justify-between">
                <button
                    onClick={handleBack}
                    className="flex items-center text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <span className="mr-2">←</span> Cancel & Back
                </button>
                <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wide flex items-center">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></span>
                    Editing Mode
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Editor Sidebar */}
                <div className="lg:col-span-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-24">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800">Properties</h3>
                        {activeElement && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{activeElement.type}</span>}
                    </div>

                    {activeElement ? (
                        <div className="space-y-4 animate-fade-in">
                            {/* Common: Label or Content */}
                            {activeElement.label !== undefined && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Field Label</label>
                                    <input
                                        type="text"
                                        className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={activeElement.label}
                                        onChange={(e) => handlePropertyChange('label', e.target.value)}
                                    />
                                </div>
                            )}

                            {/* Specific: Header Content */}
                            {activeElement.type === 'header' && (
                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold text-gray-600">Header Lines</label>
                                    {activeElement.content.map((item, idx) => (
                                        <div key={idx} className="border border-gray-200 p-2 rounded text-xs bg-gray-50">
                                            <input
                                                className="w-full bg-transparent border-none p-0 focus:ring-0 text-gray-700 font-medium mb-1"
                                                value={item.text}
                                                onChange={(e) => handleHeaderContentChange(idx, 'text', e.target.value)}
                                            />
                                            <select
                                                className="w-full text-[10px] border-none bg-white p-1 rounded"
                                                value={item.style}
                                                onChange={(e) => handleHeaderContentChange(idx, 'style', e.target.value)}
                                            >
                                                <option value="h2">H2 (Bold)</option>
                                                <option value="h3">H3 (Semibold)</option>
                                                <option value="h2_underline">H2 Underlined</option>
                                                <option value="text_left_bold">Left Bold</option>
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Specific: Text Blocks */}
                            {(activeElement.type === 'text_block' || activeElement.type === 'text_block_simple') && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Content</label>
                                    <textarea
                                        rows="4"
                                        className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={activeElement.content}
                                        onChange={(e) => handlePropertyChange('content', e.target.value)}
                                    />
                                </div>
                            )}

                            {/* Display ID for debug */}
                            <div className="pt-2 border-t border-gray-100">
                                <span className="text-[10px] text-gray-400 font-mono">ID: {activeElement.id}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed text-sm">
                            <span className="block text-2xl mb-2">👆</span>
                            Select an element on the form to edit its properties.
                        </div>
                    )}

                    <div className="border-t border-gray-100 my-4 pt-4">
                        <button onClick={handleSave} className="w-full py-2 bg-green-600 text-white rounded font-bold shadow-sm hover:bg-green-700 transition">
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Form Canvas (Editable) */}
                <div className="lg:col-span-3 bg-white rounded-xl shadow-lg border border-amber-200 overflow-hidden ring-4 ring-amber-50">
                    <div className="bg-amber-50/50 px-6 py-4 border-b border-amber-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800">{selectedForm.name} - Editor</h2>
                        <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded">Click elements to modify</span>
                    </div>

                    <div className="p-10 max-w-[210mm] mx-auto bg-white min-h-[297mm]" onClick={() => setActiveElement(null)}>
                        {selectedForm.structure ? (
                            selectedForm.structure.map(element => renderFormElement(element, 'edit'))
                        ) : (
                            <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                                <button className="px-4 py-2 bg-blue-600 text-white rounded">Load Default Structure</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto relative">
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-24 right-8 z-50 px-6 py-4 rounded-lg shadow-xl text-white font-medium animate-bounce-in
                    ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {notification.message}
                </div>
            )}

            {/* Header */}
            {viewMode === 'list' && (
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Edit Forms</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage and customize system forms structure.</p>
                    </div>
                </div>
            )}

            {viewMode === 'list' && renderList()}
            {viewMode === 'view' && renderViewMode()}
            {viewMode === 'edit' && renderEditMode()}
        </div>
    );
};

export default EditFormsSection;
