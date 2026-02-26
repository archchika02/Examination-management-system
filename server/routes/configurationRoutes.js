const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Save or Update Configuration (Supports Bulk)
router.post('/save', async (req, res) => {
    const payload = Array.isArray(req.body) ? req.body : [req.body]; // Handle both array and single object

    if (payload.length === 0) {
        return res.status(400).json({ message: 'No configurations provided' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        for (const config of payload) {
            const { batch_rep_id, course_code, preferred_dates, status, level } = config;

            // Preferred dates should be JSON stringified if not already
            const datesStr = typeof preferred_dates === 'string' ? preferred_dates : JSON.stringify(preferred_dates);
            // Default level to 1 if not provided, favoring manual input then DB lookup if we wanted (but user asked for manual input preference)
            const finalLevel = level || 1;

            const [existing] = await connection.execute(
                'SELECT id FROM batch_configurations WHERE batch_rep_id = ? AND course_code = ?',
                [batch_rep_id || 1, course_code]
            );

            if (existing.length > 0) {
                // Update
                await connection.execute(
                    'UPDATE batch_configurations SET preferred_dates = ?, status = ?, level = ? WHERE id = ?',
                    [datesStr, status || 'DRAFT', finalLevel, existing[0].id]
                );
            } else {
                // Insert
                await connection.execute(
                    'INSERT INTO batch_configurations (batch_rep_id, course_code, preferred_dates, status, level) VALUES (?, ?, ?, ?, ?)',
                    [batch_rep_id || 1, course_code, datesStr, status || 'DRAFT', finalLevel]
                );
            }
        }

        await connection.commit();
        res.json({ message: 'Configurations saved successfully', count: payload.length });

    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ error: 'Server error saving configurations' });
    } finally {
        connection.release();
    }
});

// List Configurations
router.get('/list', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM batch_configurations ORDER BY created_at DESC');
        // Parse JSON dates
        const configs = rows.map(row => ({
            ...row,
            preferred_dates: typeof row.preferred_dates === 'string' ? JSON.parse(row.preferred_dates) : row.preferred_dates
        }));
        res.json(configs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching configurations' });
    }
});

// Get Global Dates
router.get('/global-dates', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT allowed_dates, deadline FROM global_timetable_config LIMIT 1');
        if (rows.length === 0) {
            return res.json({ allowed_dates: [], deadline: '' });
        }
        res.json({
            allowed_dates: typeof rows[0].allowed_dates === 'string' ? JSON.parse(rows[0].allowed_dates) : rows[0].allowed_dates,
            deadline: rows[0].deadline
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching global dates' });
    }
});

// Save Global Dates
router.post('/global-dates', async (req, res) => {
    try {
        const { allowed_dates, deadline } = req.body;
        const datesStr = JSON.stringify(allowed_dates || []);

        await pool.execute(
            'UPDATE global_timetable_config SET allowed_dates = ?, deadline = ? WHERE id = 1',
            [datesStr, deadline || '']
        );
        res.json({ message: 'Global dates saved successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error saving global dates' });
    }
});

// ... existing global dates ...

// Submit final preferred timetable to Faculty
router.post('/faculty-submit', async (req, res) => {
    const { exams, academicYear } = req.body;

    if (!exams || !Array.isArray(exams) || exams.length === 0) {
        return res.status(400).json({ message: 'No exams provided for submission' });
    }

    if (!academicYear) {
        return res.status(400).json({ message: 'Academic Year is required' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Clear existing timetables to completely overwrite the schedule with the new submission
        // Need to delete exam_slots first because of foreign key constraints
        await connection.execute('DELETE FROM exam_slots');
        await connection.execute('DELETE FROM exam_timetables');

        for (const exam of exams) {
            // Note: User requested removing 'status' column from exam_timetables
            // Added course_code and date to exam_timetables to match requirement
            await connection.execute(
                'INSERT INTO exam_timetables (course_code, date, academic_year, semester, created_by) VALUES (?, ?, ?, ?, ?)',
                [exam.code, exam.date, academicYear, 1, 1] // Providing default semester=1, created_by=1 to satisfy existing schema constraints
            );
        }

        await connection.commit();
        res.json({ message: 'Preferred timetable submitted to Faculty successfully!' });

    } catch (error) {
        await connection.rollback();
        console.error('Error submitting to faculty:', error);
        res.status(500).json({ message: 'Failed to submit timetable to faculty', error: error.message });
    } finally {
        connection.release();
    }
});

// Fetch all finalized exam timetables assigned to Faculty (Also fetch related saved slot data)
router.get('/final-timetables', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT t.timetable_id, t.course_code, t.academic_year, t.semester, t.created_by,
            DATE_FORMAT(t.date, '%Y-%m-%d') AS date,
            s.start_time, s.end_time, s.std_non_repeat, s.std_repeat 
            FROM exam_timetables t 
            LEFT JOIN exam_slots s ON t.timetable_id = s.timetable_id
            ORDER BY t.date ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching final timetables:', error);
        res.status(500).json({ message: 'Failed to fetch final timetables', error: error.message });
    }
});

// Save allocated exam slot details (Times and Student limits) from Faculty Staff
router.post('/save-exam-slots', async (req, res) => {
    const { slots } = req.body;

    if (!slots || !Array.isArray(slots)) {
        return res.status(400).json({ message: 'Invalid payload for slots' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        for (const slot of slots) {
            // First update the date in exam_timetables in case it was dragged to a new calendar date
            await connection.execute(
                'UPDATE exam_timetables SET date = ? WHERE timetable_id = ?',
                [slot.date, slot.id]
            );

            // Then insert or update the exact time and student metrics in the exam_slots table
            // In MySQL, to do ON DUPLICATE KEY properly we need a unique constraint, but we can also just DELETE then INSERT for cleanliness per timetable_id
            await connection.execute('DELETE FROM exam_slots WHERE timetable_id = ?', [slot.id]);

            await connection.execute(
                `INSERT INTO exam_slots 
                (timetable_id, course_code, date, start_time, end_time, std_non_repeat, std_repeat, created_by) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    slot.id,
                    slot.code,
                    slot.date,
                    slot.time || null,
                    slot.endTime || null,
                    slot.stdNonRepeat === '' ? null : slot.stdNonRepeat,
                    slot.stdRepeat === '' ? null : slot.stdRepeat,
                    1 // Default created_by
                ]
            );
        }

        await connection.commit();
        res.json({ message: 'Exam slots saved successfully!' });
    } catch (error) {
        await connection.rollback();
        console.error('Error saving exam slots:', error);
        res.status(500).json({ message: 'Failed to save exam slots', error: error.message });
    } finally {
        connection.release();
    }
});

module.exports = router;
