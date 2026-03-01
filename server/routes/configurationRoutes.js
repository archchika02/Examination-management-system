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
            s.start_time, s.end_time,
            GREATEST(0, 
                (
                    SELECT COUNT(DISTINCT cur.user_id) 
                    FROM registered_course_units rcu 
                    JOIN course_unit_registration_headers cur ON rcu.header_id = cur.id 
                    WHERE REPLACE(rcu.course_code, ' ', '') = REPLACE(t.course_code, ' ', '') AND cur.status = 'Approved'
                ) + (
                    SELECT COUNT(DISTINCT adr.user_id) 
                    FROM add_drop_requested_courses adc 
                    JOIN add_drop_request_headers adr ON adc.header_id = adr.id 
                    WHERE REPLACE(adc.course_code, ' ', '') = REPLACE(t.course_code, ' ', '') AND adc.action = 'Add' AND adr.status = 'Approved'
                ) - (
                    SELECT COUNT(DISTINCT adr.user_id) 
                    FROM add_drop_requested_courses adc 
                    JOIN add_drop_request_headers adr ON adc.header_id = adr.id 
                    WHERE REPLACE(adc.course_code, ' ', '') = REPLACE(t.course_code, ' ', '') AND adc.action = 'Drop' AND adr.status = 'Approved'
                )
            ) AS stdNonRepeat,
            (
                SELECT COUNT(DISTINCT mrr.user_id) 
                FROM medical_repeat_requested_courses mrc 
                JOIN medical_repeat_request_headers mrr ON mrc.header_id = mrr.id 
                WHERE REPLACE(mrc.course_code, ' ', '') = REPLACE(t.course_code, ' ', '') AND mrr.status = 'Approved'
            ) AS stdRepeat
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

// Fetch raw active student enrollments per course (used for frontend real-time conflict checking)
router.get('/course-enrollments', async (req, res) => {
    try {
        const query = `
            SELECT 
                REPLACE(course_code, ' ', '') AS course_code,
                user_id 
            FROM (
                SELECT cur.user_id, rcu.course_code
                FROM registered_course_units rcu 
                JOIN course_unit_registration_headers cur ON rcu.header_id = cur.id 
                WHERE cur.status = 'Approved'
                UNION
                SELECT adr.user_id, adc.course_code
                FROM add_drop_requested_courses adc 
                JOIN add_drop_request_headers adr ON adc.header_id = adr.id 
                WHERE adc.action = 'Add' AND adr.status = 'Approved'
                UNION
                SELECT mrr.user_id, mrc.course_code
                FROM medical_repeat_requested_courses mrc 
                JOIN medical_repeat_request_headers mrr ON mrc.header_id = mrr.id 
                WHERE mrr.status = 'Approved'
            ) AS AllEnrollments
            WHERE user_id NOT IN (
                SELECT adr.user_id 
                FROM add_drop_requested_courses adc 
                JOIN add_drop_request_headers adr ON adc.header_id = adr.id 
                WHERE REPLACE(adc.course_code, ' ', '') = REPLACE(AllEnrollments.course_code, ' ', '') 
                  AND adc.action = 'Drop' 
                  AND adr.status = 'Approved'
            )
        `;

        const [rows] = await pool.query(query);

        // Transform into a map: { "MATH101": [1, 2, 3], "CS101": [2, 4] }
        const enrollments = {};
        for (const row of rows) {
            const parsedCode = row.course_code || '';
            if (!enrollments[parsedCode]) enrollments[parsedCode] = [];
            enrollments[parsedCode].push(row.user_id);
        }

        res.json(enrollments);
    } catch (error) {
        console.error('Error fetching course enrollments:', error);
        res.status(500).json({ message: 'Failed to fetch course enrollments', error: error.message });
    }
});

// Save allocated exam slot details (Times and Student limits) from Faculty Staff
router.post('/save-exam-slots', async (req, res) => {
    const { slots, userId } = req.body;

    if (!slots || !Array.isArray(slots)) {
        return res.status(400).json({ message: 'Invalid payload for slots' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // --- CONFLICT VALIDATION ---
        // Group slots by date to check overlaps on the same day
        const slotsByDate = {};
        for (const slot of slots) {
            if (!slot.date || !slot.time || !slot.endTime) continue;
            if (!slotsByDate[slot.date]) slotsByDate[slot.date] = [];
            slotsByDate[slot.date].push(slot);
        }

        for (const date in slotsByDate) {
            const dateSlots = slotsByDate[date];
            // Check every pair of slots on this date
            for (let i = 0; i < dateSlots.length; i++) {
                for (let j = i + 1; j < dateSlots.length; j++) {
                    const slotA = dateSlots[i];
                    const slotB = dateSlots[j];

                    // Check if time overlaps
                    // overlap condition: (StartA < EndB) and (EndA > StartB)
                    if (slotA.time < slotB.endTime && slotA.endTime > slotB.time) {
                        // They overlap in time. Now check if any specific student is taking both.
                        const query = `
                            WITH CourseUsers AS (
                                SELECT DISTINCT cur.user_id, ? AS course_code
                                FROM registered_course_units rcu 
                                JOIN course_unit_registration_headers cur ON rcu.header_id = cur.id 
                                WHERE REPLACE(rcu.course_code, ' ', '') = REPLACE(?, ' ', '') AND cur.status = 'Approved'
                                UNION
                                SELECT DISTINCT adr.user_id, ? AS course_code
                                FROM add_drop_requested_courses adc 
                                JOIN add_drop_request_headers adr ON adc.header_id = adr.id 
                                WHERE REPLACE(adc.course_code, ' ', '') = REPLACE(?, ' ', '') AND adc.action = 'Add' AND adr.status = 'Approved'
                                UNION
                                SELECT DISTINCT mrr.user_id, ? AS course_code
                                FROM medical_repeat_requested_courses mrc 
                                JOIN medical_repeat_request_headers mrr ON mrc.header_id = mrr.id 
                                WHERE REPLACE(mrc.course_code, ' ', '') = REPLACE(?, ' ', '') AND mrr.status = 'Approved'
                            )
                            SELECT COUNT(*) as overlap_count
                            FROM CourseUsers a
                            JOIN CourseUsers b ON a.user_id = b.user_id
                            WHERE a.course_code = ? AND b.course_code = ?
                        `;

                        // For the DROP action, we should technically subtract those users, but for a strict conflict check, 
                        // if a user is initially registered and didn't drop, or added, or has a repeat form, they are in the pool.
                        // To keep the query performant and reliable, we'll check the combined pool of active enrollments.
                        // For a perfectly accurate "active" list, we subtract dropped users:
                        const accurateOverlapQuery = `
                            WITH ActiveUsersA AS (
                                SELECT user_id FROM (
                                    SELECT cur.user_id FROM registered_course_units rcu JOIN course_unit_registration_headers cur ON rcu.header_id = cur.id WHERE REPLACE(rcu.course_code, ' ', '') = REPLACE(?, ' ', '') AND cur.status = 'Approved'
                                    UNION
                                    SELECT adr.user_id FROM add_drop_requested_courses adc JOIN add_drop_request_headers adr ON adc.header_id = adr.id WHERE REPLACE(adc.course_code, ' ', '') = REPLACE(?, ' ', '') AND adc.action = 'Add' AND adr.status = 'Approved'
                                    UNION
                                    SELECT mrr.user_id FROM medical_repeat_requested_courses mrc JOIN medical_repeat_request_headers mrr ON mrc.header_id = mrr.id WHERE REPLACE(mrc.course_code, ' ', '') = REPLACE(?, ' ', '') AND mrr.status = 'Approved'
                                ) AS PoolA
                                WHERE user_id NOT IN (
                                    SELECT adr.user_id FROM add_drop_requested_courses adc JOIN add_drop_request_headers adr ON adc.header_id = adr.id WHERE REPLACE(adc.course_code, ' ', '') = REPLACE(?, ' ', '') AND adc.action = 'Drop' AND adr.status = 'Approved'
                                )
                            ),
                            ActiveUsersB AS (
                                SELECT user_id FROM (
                                    SELECT cur.user_id FROM registered_course_units rcu JOIN course_unit_registration_headers cur ON rcu.header_id = cur.id WHERE REPLACE(rcu.course_code, ' ', '') = REPLACE(?, ' ', '') AND cur.status = 'Approved'
                                    UNION
                                    SELECT adr.user_id FROM add_drop_requested_courses adc JOIN add_drop_request_headers adr ON adc.header_id = adr.id WHERE REPLACE(adc.course_code, ' ', '') = REPLACE(?, ' ', '') AND adc.action = 'Add' AND adr.status = 'Approved'
                                    UNION
                                    SELECT adr.user_id FROM add_drop_requested_courses adc JOIN add_drop_request_headers adr ON adc.header_id = adr.id WHERE REPLACE(adc.course_code, ' ', '') = REPLACE(?, ' ', '') AND adc.action = 'Add' AND adr.status = 'Approved'
                                    UNION
                                    SELECT mrr.user_id FROM medical_repeat_requested_courses mrc JOIN medical_repeat_request_headers mrr ON mrc.header_id = mrr.id WHERE REPLACE(mrc.course_code, ' ', '') = REPLACE(?, ' ', '') AND mrr.status = 'Approved'
                                ) AS PoolB
                                WHERE user_id NOT IN (
                                    SELECT adr.user_id FROM add_drop_requested_courses adc JOIN add_drop_request_headers adr ON adc.header_id = adr.id WHERE REPLACE(adc.course_code, ' ', '') = REPLACE(?, ' ', '') AND adc.action = 'Drop' AND adr.status = 'Approved'
                                )
                            )
                            SELECT COUNT(*) as overlap_count FROM ActiveUsersA JOIN ActiveUsersB ON ActiveUsersA.user_id = ActiveUsersB.user_id
                        `;

                        const [overlapResult] = await connection.execute(accurateOverlapQuery, [
                            slotA.code, slotA.code, slotA.code, slotA.code, // Params for A
                            slotB.code, slotB.code, slotB.code, slotB.code  // Params for B
                        ]);

                        const overlapCount = overlapResult[0].overlap_count;

                        if (overlapCount > 0) {
                            await connection.rollback();
                            return res.status(400).json({
                                message: `Cannot save timetable: ${overlapCount} student(s) have a conflict between ${slotA.code} and ${slotB.code} on ${date}.`
                            });
                        }
                    }
                }
            }
        }
        // --- END CONFLICT VALIDATION ---

        for (const slot of slots) {
            // First update the date in exam_timetables in case it was dragged to a new calendar date
            await connection.execute(
                'UPDATE exam_timetables SET date = ? WHERE timetable_id = ?',
                [slot.date, slot.id]
            );

            // Then insert or update the exact time and student metrics in the exam_slots table
            // In MySQL, to do ON DUPLICATE KEY properly we need a unique constraint, but we can also just DELETE then INSERT for cleanliness per timetable_id
            await connection.execute('DELETE FROM exam_slots WHERE timetable_id = ?', [slot.id]);

            // If time is fully specified, assign created_by to the faculty member. Otherwise leave it null.
            const createdBy = (slot.time && slot.endTime && userId) ? userId : null;

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
                    createdBy
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

// Submit timetable to department (making it visible to Academic Supervisor)
router.post('/submit-timetable', async (req, res) => {
    try {
        await pool.query('UPDATE exam_timetables SET is_submitted = TRUE WHERE is_submitted = FALSE');
        res.json({ message: 'Timetable submitted to department successfully' });
    } catch (err) {
        console.error('Error submitting timetable:', err);
        res.status(500).json({ message: 'Error submitting timetable', error: err.message });
    }
});

// Fetch submitted timetables for the Allocations Dashboard
router.get('/allocations-dashboard', async (req, res) => {
    try {
        const query = `
            SELECT 
                s.slot_id AS allocId,
                t.timetable_id AS examId,
                DATE_FORMAT(t.date, '%Y-%m-%d') AS date, 
                DATE_FORMAT(s.start_time, '%l:%i %p') AS time, 
                s.end_time AS endTime, 
                CONCAT(t.course_code, COALESCE(CONCAT(' - ', c.title), '')) AS course,
                s.std_non_repeat AS totalNonRepeat, 
                s.std_repeat AS totalRepeat
            FROM exam_timetables t
            JOIN exam_slots s ON t.timetable_id = s.timetable_id
            LEFT JOIN courses c ON REPLACE(t.course_code, ' ', '') = REPLACE(c.course_code, ' ', '')
            WHERE t.is_submitted = TRUE AND s.start_time IS NOT NULL AND s.end_time IS NOT NULL
            ORDER BY t.date ASC, s.start_time ASC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching allocations dashboard data:', err);
        res.status(500).json({ message: 'Error fetching allocations data', error: err.message });
    }
});

module.exports = router;
