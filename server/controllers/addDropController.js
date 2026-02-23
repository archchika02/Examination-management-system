const pool = require('../config/db');

exports.submitAddDropRequest = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const {
            student_number,
            student_name,
            contact_number,
            email,
            combination,
            year,
            sem1_credits,
            sem2_credits,
            total_credits,
            signature,
            signature_date,
            added_courses, // Array of strings e.g. ["MATH101", "PHYS201"]
            dropped_courses // Array of strings
        } = req.body;

        // Form Validation Check
        if (!student_number || !student_name || !signature || !signature_date) {
            return res.status(400).json({ message: 'Missing required common fields' });
        }

        // Must have at least one course to add or drop
        if ((!added_courses || added_courses.length === 0) && (!dropped_courses || dropped_courses.length === 0)) {
            return res.status(400).json({ message: 'You must specify at least one course to add or drop' });
        }

        // Fetch user_id from the users table based on the provided email
        let userId = null;
        if (email) {
            const [users] = await connection.execute('SELECT user_id FROM users WHERE email = ?', [email]);
            if (users.length > 0) {
                userId = users[0].user_id;
            }
        }

        await connection.beginTransaction();

        // Insert Header
        const [headerResult] = await connection.execute(
            `INSERT INTO add_drop_request_headers 
            (user_id, student_number, student_name, contact_number, email, combination, year, sem1_credits, sem2_credits, total_credits, signature, signature_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                student_number,
                student_name,
                contact_number || null,
                email || null,
                combination || null,
                year || null,
                sem1_credits || null,
                sem2_credits || null,
                total_credits || null,
                signature,
                signature_date
            ]
        );

        const headerId = headerResult.insertId;

        // Insert Added Courses
        if (added_courses && added_courses.length > 0) {
            const addQuery = `INSERT INTO add_drop_requested_courses (header_id, course_code, action) VALUES (?, ?, 'Add')`;
            for (const courseCode of added_courses) {
                if (courseCode && courseCode.trim() !== '') {
                    await connection.execute(addQuery, [headerId, courseCode]);
                }
            }
        }

        // Insert Dropped Courses
        if (dropped_courses && dropped_courses.length > 0) {
            const dropQuery = `INSERT INTO add_drop_requested_courses (header_id, course_code, action) VALUES (?, ?, 'Drop')`;
            for (const courseCode of dropped_courses) {
                if (courseCode && courseCode.trim() !== '') {
                    await connection.execute(dropQuery, [headerId, courseCode]);
                }
            }
        }

        await connection.commit();
        res.status(201).json({ message: 'Add/Drop request submitted successfully', request_id: headerId });
    } catch (error) {
        await connection.rollback();
        console.error("Error submitting add/drop request:", error);
        res.status(500).json({ message: 'Server error while submitting request', error: error.message });
    } finally {
        connection.release();
    }
};

exports.getAddDropRequests = async (req, res) => {
    try {
        let userId = null;
        let role = null;

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
                userId = decoded.user_id || decoded.id;
                role = decoded.role;
            } catch (err) {
                return res.status(401).json({ message: 'Unauthorized access' });
            }
        } else {
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        let query = 'SELECT * FROM add_drop_request_headers';
        let params = [];

        // If user is a Student or BatchRep, only get their requests
        if (role === 'Student' || role === 'BatchRepresentative') {
            query += ' WHERE user_id = ?';
            params.push(userId);
        } else if (role === 'Dean') {
            // Dean can see Pending Dean, Approved (by Dean), and Rejected by Dean
            query += ' WHERE status IN (?, ?, ?)';
            params.push('Pending Dean', 'Approved', 'Rejected by Dean');
        } else if (role === 'FacultyStaff' || role === 'Admin') {
            // Faculty staff only sees fully approved forms ready for processing
            query += ' WHERE status = ?';
            params.push('Approved');
        }
        // AcademicSupervisor sees all forms (or perhaps could be restricted to just 'Pending Supervisor', 'Pending Dean', 'Approved', 'Rejected by Supervisor')
        // For now, Supervisor sees everything as they are the first line of review.

        query += ' ORDER BY created_at DESC';

        const [headers] = await pool.execute(query, params);

        // Fetch courses for each header
        const fullRequests = [];
        for (let header of headers) {
            const [courses] = await pool.execute('SELECT course_code, action FROM add_drop_requested_courses WHERE header_id = ?', [header.id]);

            const added_courses = courses.filter(c => c.action === 'Add').map(c => c.course_code);
            const dropped_courses = courses.filter(c => c.action === 'Drop').map(c => c.course_code);

            // Format for frontend
            fullRequests.push({
                ...header,
                added_courses,
                dropped_courses
            });
        }

        console.log(`[GET /api/add-drop/list] ROLE: ${role} | USER ID: ${userId}`);
        console.log(`[GET /api/add-drop/list] QUERY EXECUTED: ${query} with PARAMS:`, params);
        console.log(`[GET /api/add-drop/list] RESULT LENGTH: ${headers.length} headers, formatting into ${fullRequests.length} requests.`);
        if (fullRequests.length === 0) {
            console.log(`[GET /api/add-drop/list] WARN: Returning empty array [] to client!`);
        }

        res.status(200).json(fullRequests);
    } catch (error) {
        console.error("Error fetching add/drop requests:", error);
        res.status(500).json({ message: 'Server error while fetching requests' });
    }
};

exports.updateAddDropStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid action' });
        }

        let role = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
                role = decoded.role;
            } catch (err) {
                return res.status(401).json({ message: 'Unauthorized access' });
            }
        } else {
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        let newStatus = status;
        let rejectReason = reason || null;

        if (role === 'AcademicSupervisor') {
            if (status === 'Approved') newStatus = 'Pending Dean';
            if (status === 'Rejected') newStatus = 'Rejected by Supervisor';
        } else if (role === 'Dean') {
            if (status === 'Approved') newStatus = 'Approved';
            if (status === 'Rejected') newStatus = 'Rejected by Dean';
        } else if (role === 'Admin') {
            // Admin can force states
            newStatus = status;
        } else {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to approve/reject requests' });
        }

        await pool.execute(
            'UPDATE add_drop_request_headers SET status = ?, reject_reason = ? WHERE id = ?',
            [newStatus, rejectReason, id]
        );

        res.status(200).json({ message: `Request ${id} updated to ${newStatus}` });
    } catch (error) {
        console.error("Error updating add/drop status:", error);
        res.status(500).json({ message: 'Server error while updating request' });
    }
};
