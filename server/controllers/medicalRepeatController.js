const pool = require('../config/db');

// Submit a new medical/repeat application
const submitForm = async (req, res) => {
    try {
        const {
            student_number,
            student_name,
            contact_number,
            email,
            form_type,
            signature,
            signature_date,
            academicYear
        } = req.body;

        // When sending FormData, arrays/objects are often stringified
        let courses = req.body.courses;
        if (typeof courses === 'string') {
            try {
                courses = JSON.parse(courses);
            } catch (e) {
                console.error("Failed to parse courses:", e);
                return res.status(400).json({ message: 'Invalid courses format' });
            }
        }

        const user_id = req.user.user_id;

        // Validation
        if (!student_number || !student_name || !form_type || !signature || !courses || courses.length === 0) {
            return res.status(400).json({ message: 'Missing required fields or no courses provided.' });
        }

        if (!req.files || !req.files.payment_receipt) {
            return res.status(400).json({ message: 'Payment receipt is mandatory.' });
        }

        // Ideally, handle file upload for URLs here if implemented (e.g., using multer).
        // Extract paths if files were uploaded, fallback to req.body.url if sending strings manually
        let medical_certificate_url = req.body.medical_certificate_url || null;
        let payment_receipt_url = req.body.payment_receipt_url || null;

        if (req.files) {
            if (req.files.medical_certificate && req.files.medical_certificate[0]) {
                // Ensure front-slashes are used for web URLs
                medical_certificate_url = `/uploads/${req.files.medical_certificate[0].filename}`;
            }
            if (req.files.payment_receipt && req.files.payment_receipt[0]) {
                payment_receipt_url = `/uploads/${req.files.payment_receipt[0].filename}`;
            }
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Insert into headers table
            const [headerResult] = await connection.execute(
                `INSERT INTO medical_repeat_request_headers 
                (user_id, student_number, student_name, contact_number, email, form_type, signature, signature_date, medical_certificate_url, payment_receipt_url, status, academic_year) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`,
                [user_id, student_number, student_name, contact_number, email, form_type, signature, signature_date || null, medical_certificate_url, payment_receipt_url, academicYear || null]
            );

            const headerId = headerResult.insertId;

            // 2. Insert into requested courses table
            for (const course of courses) {
                await connection.execute(
                    `INSERT INTO medical_repeat_requested_courses 
                    (header_id, course_code, course_title, results_obtained, academic_year) 
                    VALUES (?, ?, ?, ?, ?)`,
                    [headerId, course.course_code, course.course_title || null, course.results_obtained || null, course.academic_year || null]
                );
            }

            await connection.commit();
            res.status(201).json({ message: 'Application submitted successfully', applicationId: headerId });

        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error submitting medical/repeat form:', error);
        res.status(500).json({ message: 'Server error during submission' });
    }
};

// Get all applications (for Faculty Staff)
const getAllForms = async (req, res) => {
    try {
        // Optional filters
        const { status, form_type, search } = req.query;

        let query = `
            SELECT h.*, 
                   COUNT(c.id) as course_count
            FROM medical_repeat_request_headers h
            LEFT JOIN medical_repeat_requested_courses c ON h.id = c.header_id
            WHERE 1=1
        `;
        const params = [];

        if (status && status !== 'All') {
            query += ` AND h.status = ?`;
            params.push(status);
        }

        if (form_type && form_type !== 'All') {
            query += ` AND h.form_type = ?`;
            params.push(form_type);
        }

        if (search) {
            query += ` AND (h.student_number LIKE ? OR h.student_name LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ` GROUP BY h.id ORDER BY h.created_at DESC`;

        const [headers] = await pool.execute(query, params);

        res.status(200).json(headers);
    } catch (error) {
        console.error('Error fetching medical/repeat forms:', error);
        res.status(500).json({ message: 'Server error fetching forms' });
    }
};

// Get a specific application by ID with its courses
const getFormById = async (req, res) => {
    try {
        const { id } = req.params;

        const [headers] = await pool.execute(
            `SELECT * FROM medical_repeat_request_headers WHERE id = ? `,
            [id]
        );

        if (headers.length === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const [courses] = await pool.execute(
            `SELECT * FROM medical_repeat_requested_courses WHERE header_id = ? `,
            [id]
        );

        const application = headers[0];
        application.courses = courses;

        res.status(200).json(application);
    } catch (error) {
        console.error('Error fetching typical form details:', error);
        res.status(500).json({ message: 'Server error fetching details' });
    }
};

// Get applications for a specific student
const getStudentForms = async (req, res) => {
    try {
        const { user_id } = req.params;

        const [headers] = await pool.execute(
            `SELECT * FROM medical_repeat_request_headers WHERE user_id = ? ORDER BY created_at DESC`,
            [user_id]
        );

        res.status(200).json(headers);
    } catch (error) {
        console.error('Error fetching student forms:', error);
        res.status(500).json({ message: 'Server error fetching student forms' });
    }
};

// Update the status of an application (Approve/Reject)
const updateFormStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reject_reason } = req.body;

        if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        if (status === 'Rejected' && !reject_reason) {
            return res.status(400).json({ message: 'Reject reason is required when rejecting an application' });
        }

        const query = `
            UPDATE medical_repeat_request_headers 
            SET status = ?, reject_reason = ?
                WHERE id = ?
                    `;
        const params = [status, status === 'Rejected' ? reject_reason : null, id];

        const [result] = await pool.execute(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.status(200).json({ message: `Application ${status.toLowerCase()} successfully` });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ message: 'Server error updating status' });
    }
};

module.exports = {
    submitForm,
    getAllForms,
    getFormById,
    getStudentForms,
    updateFormStatus
};
