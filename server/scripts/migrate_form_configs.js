const pool = require('../config/db');

const formConfigurations = [
    {
        name: 'course_registration',
        structure: [
            {
                id: 'header_cr',
                type: 'header',
                content: [
                    { text: 'Application closing date: {{deadlineDate}}', style: 'text_left_bold' },
                    { text: 'UNIVERSITY OF KELANIYA - SRI LANKA', style: 'h2' },
                    { text: 'FACULTY OF SCIENCE', style: 'h3' },
                    { text: '{{academicYear}} ACADEMIC YEAR', style: 'h2' },
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
                        id: 'Grid_Comp_S1',
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
                        id: 'Grid_Comp_S2',
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
                        id: 'Grid_Opt_S1',
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
                        id: 'Grid_Opt_S2',
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
                        id: 'Grid_Aux_S1',
                        type: 'grid_section',
                        title: 'AUXILIARY COURSE UNITS',
                        subtitle: 'SEMESTER 1',
                        rows: 3,
                        cols: 12
                    },
                    {
                        id: 'Grid_Aux_S2',
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
        name: 'add_drop',
        structure: [
            {
                id: 'header_1',
                type: 'header',
                content: [
                    { text: 'UNIVERSITY OF KELANIYA - SRI LANKA', style: 'h2' },
                    { text: 'FACULTY OF SCIENCE', style: 'h3' },
                    { text: 'APPLICATION TO ADD/ DROP COURSE UNITS', style: 'h2_underline' },
                    { text: 'SEMESTER II - ACADEMIC YEAR {{academicYear}}', style: 'h3' }
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
        name: 'medical_repeat',
        structure: [
            {
                id: 'header_rm',
                type: 'header',
                content: [
                    { text: 'Closing date of Application: {{deadlineDate}}', style: 'text_left_bold' },
                    { text: 'UNIVERSITY OF KELANIYA', style: 'h2' },
                    { text: 'APPLICATION FOR REPEAT/MEDICAL EXAMINATIONS', style: 'h2' },
                    { text: 'FOR IT/MIT STUDENTS', style: 'h3' },
                    { text: 'INTAKE OF STUDENTS OF THE ACADEMIC YEAR 2022/2023 ONLY', style: 'h3' },
                    { text: 'ACADEMIC YEAR {{academicYear}} – SEMESTER I', style: 'h3' }
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
    }
];

async function migrate() {
    try {
        console.log('Starting migration for form_configurations...');

        // Step 1: Create table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS form_configurations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                structure JSON NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Table form_configurations ensures.');

        // Step 2: Seed data
        for (const config of formConfigurations) {
            const [existing] = await pool.query('SELECT id FROM form_configurations WHERE name = ?', [config.name]);
            if (existing.length > 0) {
                await pool.query('UPDATE form_configurations SET structure = ? WHERE name = ?', [JSON.stringify(config.structure), config.name]);
                console.log(`Updated configuration for: ${config.name}`);
            } else {
                await pool.query('INSERT INTO form_configurations (name, structure) VALUES (?, ?)', [config.name, JSON.stringify(config.structure)]);
                console.log(`Inserted configuration for: ${config.name}`);
            }
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
