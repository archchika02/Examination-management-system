const pool = require('../config/db');

// Helper to extract course codes from grid format
const extractCourseCodes = (formData, prefix, rows, cols) => {
    const courses = [];
    for (let r = 0; r < rows; r++) {
        let code = '';
        for (let c = 0; c < cols; c++) {
            code += formData[`${prefix}_${r}_${c}`] || '';
        }
        code = code.trim();
        if (code.length > 0) {
            courses.push(code);
        }
    }
    return courses;
};

// Helper to extract student number
const extractStudentNumber = (formData, prefix, count) => {
    let number = ''; // Remove hardcoded 'IM/' prefix
    for (let i = 0; i < count; i++) {
        number += formData[`${prefix}_${i}`] || '';
    }
    return number; // Returns only digits entered
};

// 1. Submit Course Registration
exports.submitRegistration = async (req, res) => {
    const { user_id, form_data, signature, academicYear } = req.body;

    console.log("INCOMING FORM DATA KEYS:", Object.keys(form_data));

    if (!form_data || !signature) {
        return res.status(400).json({ error: 'Form data and signature are required' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Extract header data
        const studentNumber = extractStudentNumber(form_data, 'st_no_cr', 8);
        const studentName = (form_data['st_name_cr_mr'] ? 'Mr. ' : (form_data['st_name_cr_ms'] ? 'Ms. ' : '')) + (form_data['st_name_cr'] || '');
        const level = form_data['level'] || '';
        const combination = form_data['course_combo'] || '';
        const totalCredits = parseInt(form_data['total_creds_box']) || 0;

        const address = form_data['address'] || '';
        const mobile = form_data['mobile'] || '';
        const email = form_data['email_cr'] || '';

        // Insert Header
        const [headerResult] = await connection.execute(
            `INSERT INTO course_unit_registration_headers 
            (user_id, student_number, student_name, level, course_unit_combination, total_credits, signature, address, mobile, email, status, academic_year) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`,
            [user_id || null, studentNumber, studentName.trim(), level, combination, totalCredits, signature, address, mobile, email, academicYear || null]
        );

        const headerId = headerResult.insertId;

        // Extract Course Units
        const courses = [];
        // Compulsory Semester 1 (10 rows, 12 cols)
        extractCourseCodes(form_data, 'Grid_Comp_S1', 10, 12).forEach(code => courses.push({ code, type: 'Compulsory', sem: 1 }));
        // Compulsory Semester 2
        extractCourseCodes(form_data, 'Grid_Comp_S2', 10, 12).forEach(code => courses.push({ code, type: 'Compulsory', sem: 2 }));
        // Optional Semester 1 (6 rows, 12 cols)
        extractCourseCodes(form_data, 'Grid_Opt_S1', 6, 12).forEach(code => courses.push({ code, type: 'Optional', sem: 1 }));
        // Optional Semester 2
        extractCourseCodes(form_data, 'Grid_Opt_S2', 6, 12).forEach(code => courses.push({ code, type: 'Optional', sem: 2 }));
        // Auxiliary Semester 1 (3 rows, 12 cols)
        extractCourseCodes(form_data, 'Grid_Aux_S1', 3, 12).forEach(code => courses.push({ code, type: 'Auxiliary', sem: 1 }));
        // Auxiliary Semester 2
        extractCourseCodes(form_data, 'Grid_Aux_S2', 3, 12).forEach(code => courses.push({ code, type: 'Auxiliary', sem: 2 }));

        // Insert Course Units
        if (courses.length > 0) {
            const courseValues = courses.map(c => [headerId, c.code, c.type, c.sem]);

            // Using a simple loop or bulk insert if desired. Here we use query for bulk insert:
            await connection.query(
                'INSERT INTO registered_course_units (header_id, course_code, course_type, semester) VALUES ?',
                [courseValues]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Course registration submitted successfully' });
    } catch (err) {
        await connection.rollback();
        console.error('Error submitting course registration:', err);
        res.status(500).json({ error: 'Internal server error while processing the request' });
    } finally {
        connection.release();
    }
};

// 2. Get list of all registrations (Admin Dashboard)
exports.listRegistrations = async (req, res) => {
    try {
        const [headers] = await pool.execute('SELECT * FROM course_unit_registration_headers ORDER BY created_at DESC');

        // Let's get the course units
        if (headers.length > 0) {
            const headerIds = headers.map(h => h.id);
            const placeholders = headerIds.map(() => '?').join(',');
            const [courses] = await pool.query(`SELECT * FROM registered_course_units WHERE header_id IN (${placeholders})`, headerIds);

            // Map courses back to headers
            headers.forEach(header => {
                header.courses = courses.filter(c => c.header_id === header.id);
            });
        }

        res.status(200).json(headers);
    } catch (err) {
        console.error('Error fetching course registrations:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// 3. Get list of registrations for a specific student
exports.getStudentRegistrations = async (req, res) => {
    const { user_id } = req.params;
    try {
        const [headers] = await pool.execute(
            'SELECT * FROM course_unit_registration_headers WHERE user_id = ? ORDER BY created_at DESC',
            [user_id]
        );
        res.status(200).json(headers);
    } catch (err) {
        console.error('Error fetching student registrations:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// 4. Update status (Approve / Reject)
exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status, reject_reason } = req.body;

    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const [result] = await pool.execute(
            'UPDATE course_unit_registration_headers SET status = ?, reject_reason = ? WHERE id = ?',
            [status, reject_reason || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Registration not found' });
        }

        res.status(200).json({ message: 'Status updated successfully' });
    } catch (err) {
        console.error('Error updating status:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
