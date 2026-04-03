const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Add a new course unit
router.post('/add', async (req, res) => {
    let { code, title, isNonWritten, academicYear } = req.body;

    if (!code || !title) {
        return res.status(400).json({ message: 'Course code and title are required.' });
    }

    // Clean up code formatting
    code = code.trim().toUpperCase();

    // Parse the course code.
    // E.g., INTE 21223 -> the numeric part is 21223
    // year = 2 (first digit of numeric part)
    // semester = 1 (second digit)
    // credits = 3 (last digit)

    // Extract numeric part
    const numericPartMatch = code.match(/\d+/);
    if (!numericPartMatch) {
        return res.status(400).json({ message: 'Invalid course code format. Missing numeric part.' });
    }

    const numericPart = numericPartMatch[0];

    if (numericPart.length < 3) {
        return res.status(400).json({ message: 'Invalid course code format. Numeric part must have at least 3 digits.' });
    }

    const year = parseInt(numericPart[0]);
    const semesterDigit = parseInt(numericPart[1]);
    const semester = (semesterDigit === 1 || semesterDigit === 2) ? semesterDigit : null;
    const credits = parseInt(numericPart[numericPart.length - 1]);

    // non_written_type maps to isNonWritten
    const nonWrittenType = isNonWritten === 'Yes' ? 'Non-written' : 'Written';

    const type = null; // Compulsory, Optional, Auxiliary
    const selection = null; // IT, MIT

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Check if course already exists
        const [existing] = await connection.execute(
            'SELECT course_code FROM modules WHERE course_code = ?',
            [code]
        );

        if (existing.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: 'Course unit already exists' });
        }

        // Extract level: The first digit in the course code (e.g., INTE 21234 -> 2)
        const match = code.match(/\d/);
        const extractedLevel = match ? parseInt(match[0]) : null;

        await connection.execute(
            `INSERT INTO modules (
                course_code, title, credits, type, semester, selection, year, non_written_type, academic_year, level
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [code, title, credits, type, semester, selection, year, nonWrittenType, academicYear, extractedLevel]
        );

        await connection.commit();
        res.status(201).json({ message: 'Module unit added successfully', course: { code, title, credits, isNonWritten, academicYear } });
    } catch (error) {
        await connection.rollback();
        console.error('Error adding module unit:', error);
        res.status(500).json({ message: 'Failed to add module unit', error: error.message });
    } finally {
        connection.release();
    }
});

// List course units
router.get('/list', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM modules ORDER BY year, semester, course_code');
        // Map database records to expected frontend format
        const modules = rows.map(row => ({
            id: row.course_code, // Use course_code as a pseudo-id for keying
            code: row.course_code,
            title: row.title,
            credits: row.credits,
            isNonWritten: row.non_written_type === 'Non-written' ? 'Yes' : 'No',
            year: row.year,
            semester: row.semester,
            academic_year: row.academic_year
        }));
        res.json(modules);
    } catch (error) {
        console.error('Error fetching module units:', error);
        res.status(500).json({ message: 'Failed to fetch module units', error: error.message });
    }
});

module.exports = router;
