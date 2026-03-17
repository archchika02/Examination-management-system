const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Save or Update Configuration (Supports Bulk)
router.post('/save', async (req, res) => {
    const payload = Array.isArray(req.body) ? req.body : [req.body]; // Handle both array and single object

    if (payload.length === 0) {
        return res.status(400).json({ message: 'No configurations provided' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        for (const config of payload) {
            const { batch_rep_id, course_code, preferred_dates, status, level, academic_year } = config;

            // Preferred dates should be JSON stringified if not already
            const datesStr = typeof preferred_dates === 'string' ? preferred_dates : JSON.stringify(preferred_dates);
            const finalLevel = level || 1;
            const finalAcademicYear = academic_year || '';

            const [existing] = await connection.execute(
                'SELECT id FROM batch_configurations WHERE batch_rep_id = ? AND course_code = ?',
                [batch_rep_id || 1, course_code]
            );

            if (existing.length > 0) {
                // Update
                await connection.execute(
                    'UPDATE batch_configurations SET preferred_dates = ?, status = ?, level = ?, academic_year = ? WHERE id = ?',
                    [datesStr, status || 'DRAFT', finalLevel, finalAcademicYear, existing[0].id]
                );
            } else {
                // Insert
                await connection.execute(
                    'INSERT INTO batch_configurations (batch_rep_id, course_code, preferred_dates, status, level, academic_year) VALUES (?, ?, ?, ?, ?, ?)',
                    [batch_rep_id || 1, course_code, datesStr, status || 'DRAFT', finalLevel, finalAcademicYear]
                );
            }
        }

        await connection.commit();
        res.json({ message: 'Configurations saved successfully', count: payload.length });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error(err);
        res.status(500).json({ error: 'Server error saving configurations' });
    } finally {
        if (connection) connection.release();
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
        const [rows] = await pool.execute('SELECT allowed_dates, deadline, academic_year FROM global_timetable_config LIMIT 1');
        if (rows.length === 0) {
            return res.json({ allowed_dates: [], deadline: '', academic_year: '' });
        }
        res.json({
            allowed_dates: typeof rows[0].allowed_dates === 'string' ? JSON.parse(rows[0].allowed_dates) : rows[0].allowed_dates,
            deadline: rows[0].deadline,
            academic_year: rows[0].academic_year || ''
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching global dates' });
    }
});

// Save Global Dates
router.post('/global-dates', async (req, res) => {
    try {
        const { allowed_dates, deadline, academic_year } = req.body;
        const datesStr = JSON.stringify(allowed_dates || []);

        await pool.execute(
            'UPDATE global_timetable_config SET allowed_dates = ?, deadline = ?, academic_year = ? WHERE id = 1',
            [datesStr, deadline || '', academic_year || '']
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
        // Need to delete dependencies in correct order because of foreign key constraints
        console.log('Attempting to clear all existing timetable related data...');
        
        // 1. Clear Staff Concerns and Draft Allocations dependencies
        await connection.execute('DELETE FROM staff_concerns');
        await connection.execute('DELETE FROM exam_draft_attendants');
        await connection.execute('DELETE FROM exam_draft_invigilators');
        
        // 2. Clear Draft Allocations (depends on exam_timetables)
        await connection.execute('DELETE FROM exam_draft_allocations');
        
        // 3. Clear Feedback and Venue dependencies (depend on exam_slots)
        await connection.execute('DELETE FROM department_concerns');
        await connection.execute('DELETE FROM allocations');
        await connection.execute('DELETE FROM venue_allocations');
        
        // 4. Finally clear main timetable tables
        await connection.execute('DELETE FROM exam_slots');
        await connection.execute('DELETE FROM exam_timetables');

        console.log(`Starting insertion of ${exams.length} exams into exam_timetables...`);
        for (const exam of exams) {
            // Note: User requested removing 'status' column from exam_timetables
            // Added course_code and date to exam_timetables to match requirement
            await connection.execute(
                'INSERT INTO exam_timetables (course_code, date, academic_year, semester, created_by) VALUES (?, ?, ?, ?, ?)',
                [exam.code, exam.date, academicYear, 1, 1] // Providing default semester=1, created_by=1 to satisfy existing schema constraints
            );

            // Parallel sync with batch_configurations to store chosen dates and academic year
            await connection.execute(
                'UPDATE batch_configurations SET preferred_dates = ?, academic_year = ?, status = ? WHERE course_code = ?',
                [JSON.stringify([exam.date]), academicYear, 'SUBMITTED', exam.code]
            );
        }

        await connection.commit();
        
        // Notify Faculty Staff
        try {
            const [facStaff] = await connection.execute('SELECT user_id FROM users WHERE role IN (?, ?)', ['FacultyStaff', 'Faculty']);
            for (const staff of facStaff) {
                await connection.execute(
                    'INSERT INTO activities (user_id, description, type, created_at) VALUES (?, ?, ?, NOW())',
                    [staff.user_id, 'Preferred timetable submitted to faculty for review.', 'notification']
                );
            }
        } catch (notifyErr) {
            console.error('Error notifying faculty staff:', notifyErr);
        }

        console.log('Final timetable submitted to Faculty successfully!');
        res.json({ message: 'Preferred timetable submitted to Faculty successfully!' });

    } catch (error) {
        await connection.rollback();
        console.error('Error during timetable submission transaction:', error);
        res.status(500).json({ 
            message: 'Failed to submit timetable to faculty', 
            error: error.message,
            sqlMessage: error.sqlMessage,
            code: error.code 
        });
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

// Fetch pending medical/repeat exams that have not been scheduled in the timetable
router.get('/pending-medical-repeat', async (req, res) => {
    try {
        const query = `
            SELECT 
                mrc.course_code, 
                mrc.course_title as title, 
                mrr.academic_year, 
                COUNT(DISTINCT mrr.user_id) as totalRepeatCount
            FROM medical_repeat_requested_courses mrc
            JOIN medical_repeat_request_headers mrr ON mrc.header_id = mrr.id
            WHERE mrr.status = 'Approved'
            AND NOT EXISTS (
                SELECT 1 FROM exam_timetables et 
                WHERE REPLACE(et.course_code, ' ', '') = REPLACE(mrc.course_code, ' ', '')
                AND et.academic_year = mrr.academic_year
            )
            GROUP BY mrc.course_code, mrc.course_title, mrr.academic_year
            ORDER BY mrr.academic_year DESC, mrc.course_code ASC
        `;
        const [rows] = await pool.execute(query);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching pending medical/repeat exams:', err);
        res.status(500).json({ error: 'Server error fetching pending medical/repeat exams' });
    }
});

// Schedule a specific exam (add it to exam_timetables)
router.post('/schedule-exam', async (req, res) => {
    const { courseCode, date, academicYear } = req.body;

    if (!courseCode || !date || !academicYear) {
        return res.status(400).json({ message: 'Course code, date, and academic year are required' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Check if already scheduled for this year
        const [existing] = await connection.execute(
            'SELECT timetable_id FROM exam_timetables WHERE REPLACE(course_code, " ", "") = REPLACE(?, " ", "") AND academic_year = ?',
            [courseCode, academicYear]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Exam is already scheduled for this academic year' });
        }

        // Insert new record
        const [result] = await connection.execute(
            'INSERT INTO exam_timetables (course_code, date, academic_year, semester, created_by) VALUES (?, ?, ?, ?, ?)',
            [courseCode, date, academicYear, 1, 1] // Semester=1, Created_by=1 defaults
        );

        await connection.commit();
        res.json({ message: 'Exam scheduled successfully', timetableId: result.insertId });

    } catch (error) {
        await connection.rollback();
        console.error('Error scheduling exam:', error);
        res.status(500).json({ message: 'Failed to schedule exam', error: error.message });
    } finally {
        connection.release();
    }
});

// --- FORM CONFIGURATION ENDPOINTS ---

/**
 * @route GET /api/configurations/forms
 * @desc Fetch all form configurations
 */
router.get('/forms', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM form_configurations ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching form configs:', err);
        res.status(500).json({ error: 'Server error fetching form configurations' });
    }
});

/**
 * @route GET /api/configurations/forms/:formName
 * @desc Fetch a specific form configuration structure
 */
router.get('/forms/:formName', async (req, res) => {
    const { formName } = req.params;
    try {
        const [rows] = await pool.execute('SELECT structure FROM form_configurations WHERE name = ?', [formName]);
        if (rows.length === 0) {
            return res.status(404).json({ error: `Form configuration for ${formName} not found` });
        }
        res.json(rows[0].structure);
    } catch (err) {
        console.error(`Error fetching form config for ${formName}:`, err);
        res.status(500).json({ error: 'Server error fetching form configuration' });
    }
});

/**
 * @route PUT /api/configurations/forms/:formName
 * @desc Update a specific form configuration structure
 */
router.put('/forms/:formName', async (req, res) => {
    const { formName } = req.params;
    const { structure } = req.body;

    if (!structure) {
        return res.status(400).json({ error: 'Structure is required' });
    }

    try {
        const structureStr = typeof structure === 'string' ? structure : JSON.stringify(structure);
        await pool.execute('UPDATE form_configurations SET structure = ? WHERE name = ?', [structureStr, formName]);
        res.json({ message: `Form configuration for ${formName} updated successfully` });
    } catch (err) {
        console.error(`Error updating form config for ${formName}:`, err);
        res.status(500).json({ error: 'Server error updating form configuration' });
    }
});

// --- END FORM CONFIGURATION ENDPOINTS ---

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
                CONCAT(t.course_code, COALESCE(CONCAT(' - ', m_map.title), CONCAT(' - ', m_latest.title), '')) AS course,
                s.std_non_repeat AS totalNonRepeat, 
                s.std_repeat AS totalRepeat,
                ea.user_id AS examiner1Id
            FROM exam_timetables t
            JOIN exam_slots s ON t.timetable_id = s.timetable_id
            LEFT JOIN (
                SELECT course_code, MAX(level) as level
                FROM modules
                GROUP BY course_code
            ) ml ON REPLACE(t.course_code, ' ', '') = REPLACE(ml.course_code, ' ', '')
            CROSS JOIN (
                SELECT academic_year as base_year FROM global_timetable_config LIMIT 1
            ) gtc
            LEFT JOIN modules m_map ON REPLACE(t.course_code, ' ', '') = REPLACE(m_map.course_code, ' ', '')
                AND m_map.academic_year = (
                    SELECT CONCAT(
                        CAST(SUBSTRING_INDEX(gtc.base_year, '/', 1) AS SIGNED) - (ml.level - 1),
                        '/',
                        CAST(SUBSTRING_INDEX(gtc.base_year, '/', -1) AS SIGNED) - (ml.level - 1)
                    )
                )
            LEFT JOIN (
                SELECT m1.course_code, m1.title, m1.academic_year
                FROM modules m1
                WHERE m1.academic_year = (SELECT MAX(m2.academic_year) FROM modules m2 WHERE REPLACE(m2.course_code, ' ', '') = REPLACE(m1.course_code, ' ', ''))
            ) m_latest ON REPLACE(t.course_code, ' ', '') = REPLACE(m_latest.course_code, ' ', '')
            LEFT JOIN examiner_appointments ea 
                ON REPLACE(t.course_code, ' ', '') = REPLACE(ea.course_code, ' ', '') 
                AND t.academic_year = ea.academic_year 
                AND ea.examiner_role = 'Examiner 1' 
                AND ea.status = 'Active'
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

// Fetch Staff list for allocations
router.get('/allocation-staff', async (req, res) => {
    try {
        const query = `
            SELECT user_id as id, name, role as dept 
            FROM users 
            WHERE role IN ('DeptStaff', 'AcademicSupervisor', 'HallAttendant') 
            AND approval_status = 'Approved' 
            AND is_verified = 1
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching staff list:', err);
        res.status(500).json({ message: 'Error fetching staff', error: err.message });
    }
});

// Fetch Allocation Drafts
router.get('/allocation-drafts', async (req, res) => {
    try {
        const query = `
            SELECT 
                a.alloc_id as id,
                a.exam_id,
                a.venue,
                a.assigned_non_repeat as assignedNonRepeat,
                a.assigned_repeat as assignedRepeat,
                CASE WHEN su.is_verified = 1 AND su.approval_status = 'Approved' THEN a.supervisor_id ELSE NULL END as supervisor,
                (
                    SELECT GROUP_CONCAT(i.invigilator_id) 
                    FROM exam_draft_invigilators i 
                    JOIN users u ON i.invigilator_id = u.user_id
                    WHERE i.alloc_id = a.alloc_id 
                    AND u.role IN ('DeptStaff', 'AcademicSupervisor') 
                    AND u.approval_status = 'Approved' 
                    AND u.is_verified = 1
                ) as invigilators,
                (
                    SELECT GROUP_CONCAT(at.attendant_id) 
                    FROM exam_draft_attendants at 
                    JOIN users u ON at.attendant_id = u.user_id
                    WHERE at.alloc_id = a.alloc_id 
                    AND u.role IN ('HallAttendant') 
                    AND u.approval_status = 'Approved' 
                    AND u.is_verified = 1
                ) as attendants
            FROM exam_draft_allocations a
            LEFT JOIN users su ON a.supervisor_id = su.user_id
        `;
        const [rows] = await pool.query(query);

        // process array links
        const drafts = rows.map(r => ({
            ...r,
            invigilators: r.invigilators ? r.invigilators.split(',').map(Number) : [],
            attendants: r.attendants ? r.attendants.split(',').map(Number) : []
        }));

        res.json(drafts);
    } catch (err) {
        console.error('Error fetching drafts:', err);
        res.status(500).json({ message: 'Error fetching drafts', error: err.message });
    }
});

// Save Allocation Drafts
router.post('/save-allocation-draft', async (req, res) => {
    const { exams } = req.body;

    if (!exams || !Array.isArray(exams)) {
        return res.status(400).json({ message: 'Invalid payload: exams array is required' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const examIds = exams.map(e => e.id).filter(id => id);
        if (examIds.length > 0) {
            console.log(`[SaveDraft] Wiping old data for exams: ${examIds.join(', ')}`);
            
            // Force wipe Old Invigilators associated with these exams first to avoid orphaned records
            await connection.query(`
                DELETE FROM exam_draft_invigilators 
                WHERE alloc_id IN (
                    SELECT alloc_id FROM exam_draft_allocations WHERE exam_id IN (?)
                )
            `, [examIds]);

            // Force wipe Old Attendants
            await connection.query(`
                DELETE FROM exam_draft_attendants 
                WHERE alloc_id IN (
                    SELECT alloc_id FROM exam_draft_allocations WHERE exam_id IN (?)
                )
            `, [examIds]);

            // Force wipe Old Concerns
            await connection.query(`
                DELETE FROM staff_concerns 
                WHERE alloc_id IN (
                    SELECT alloc_id FROM exam_draft_allocations WHERE exam_id IN (?)
                )
            `, [examIds]);

            // Then wipe the old allocations
            await connection.query('DELETE FROM exam_draft_allocations WHERE exam_id IN (?)', [examIds]);
        }

        // Fetch valid staff to filter out stale frontend payload drafts
        const [validStaff] = await connection.query(`
            SELECT user_id, role FROM users 
            WHERE role IN ('DeptStaff', 'AcademicSupervisor', 'HallAttendant') 
            AND approval_status = 'Approved' 
            AND is_verified = 1
        `);
        
        const validSupervisors = new Set(validStaff.filter(s => ['DeptStaff', 'AcademicSupervisor'].includes(s.role)).map(u => Number(u.user_id)));
        const validAttendants = new Set(validStaff.filter(s => s.role === 'HallAttendant').map(u => Number(u.user_id)));

        for (const exam of exams) {
            if (!exam.id) continue;

            for (const alloc of exam.allocations) {
                // Ensure supervisor is still valid
                const supervisorId = (alloc.supervisor && validSupervisors.has(Number(alloc.supervisor)))
                    ? alloc.supervisor
                    : null;

                const [result] = await connection.query(
                    `INSERT INTO exam_draft_allocations 
                    (exam_id, venue, assigned_non_repeat, assigned_repeat, supervisor_id) 
                    VALUES (?, ?, ?, ?, ?)`,
                    [
                        exam.id,
                        alloc.venue || '',
                        alloc.assignedNonRepeat || 0,
                        alloc.assignedRepeat || 0,
                        supervisorId
                    ]
                );

                const newAllocId = result.insertId;

                // Handle multiple invigilators explicitly validating each
                if (alloc.invigilators && Array.isArray(alloc.invigilators)) {
                    const validInvigIds = alloc.invigilators
                        .filter(invigId => invigId && validSupervisors.has(Number(invigId)));
                    
                    if (validInvigIds.length > 0) {
                        const invigValues = validInvigIds.map(id => [newAllocId, id]);
                        await connection.query(
                            `INSERT INTO exam_draft_invigilators (alloc_id, invigilator_id) VALUES ?`,
                            [invigValues]
                        );
                    }
                }

                // Handle multiple attendants explicitly validating each
                if (alloc.attendants && Array.isArray(alloc.attendants)) {
                    const validAttendantIds = alloc.attendants
                        .filter(attId => attId && validAttendants.has(Number(attId)));
                    
                    if (validAttendantIds.length > 0) {
                        const attendantValues = validAttendantIds.map(id => [newAllocId, id]);
                        await connection.query(
                            `INSERT INTO exam_draft_attendants (alloc_id, attendant_id) VALUES ?`,
                            [attendantValues]
                        );
                    }
                }
            }
        }

        await connection.commit();
        res.json({ message: 'Draft saved successfully' });
    } catch (err) {
        await connection.rollback();
        console.error('Error saving draft:', err);
        res.status(500).json({ message: 'Error saving draft', error: err.message });
    } finally {
        connection.release();
    }
});

// Publish All Specific Drafted Timetables
router.post('/publish-timetables', async (req, res) => {
    try {
        await pool.query('UPDATE exam_draft_allocations SET is_published = 1');

        // Notify Department Staff
        const [deptStaff] = await pool.query('SELECT user_id FROM users WHERE role = ? OR role = ?', ['DeptStaff', 'Department Staff']);
        if (deptStaff.length > 0) {
            const values = deptStaff.map(staff => [
                'Personalized Timetable Released',
                staff.user_id,
                'notification'
            ]);
            await pool.query('INSERT INTO activities (description, user_id, type) VALUES ?', [values]);
        }

        res.json({ message: 'Timetables published successfully!' });
    } catch (err) {
        console.error('Error publishing timetables:', err);
        res.status(500).json({ message: 'Error publishing timetables', error: err.message });
    }
});

// Get Personalized Timetable for a specific User
router.get('/personalized-timetable/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        // First get the user's role
        const [userRows] = await pool.query('SELECT role FROM users WHERE user_id = ?', [userId]);
        if (userRows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userRole = userRows[0].role;
        const isStudentOrRep = (userRole === 'Student' || userRole === 'BatchRep' || userRole === 'Batch Representative');

        let query = '';
        let params = [];

        if (isStudentOrRep) {
            // Logic for Students/BatchReps: Filter by their approved course registrations matching the exam's academic year
            query = `
                SELECT 
                    a.alloc_id,
                    a.exam_id,
                    et.date,
                    et.academic_year,
                    DATE_FORMAT(s.start_time, '%l:%i %p') AS time,
                    et.course_code as courseUnit,
                    COALESCE(m_map.title, m_latest.title) as courseTitle,
                    a.venue,
                    'Student' as role,
                    NULL as examinerRole
                FROM exam_draft_allocations a
                JOIN exam_timetables et ON a.exam_id = et.timetable_id
                JOIN exam_slots s ON et.timetable_id = s.timetable_id
                LEFT JOIN (
                    SELECT course_code, MAX(level) as level
                    FROM modules
                    GROUP BY course_code
                ) ml ON REPLACE(et.course_code, ' ', '') = REPLACE(ml.course_code, ' ', '')
                CROSS JOIN (
                    SELECT academic_year as base_year FROM global_timetable_config LIMIT 1
                ) gtc
                LEFT JOIN modules m_map ON REPLACE(et.course_code, ' ', '') = REPLACE(m_map.course_code, ' ', '')
                    AND m_map.academic_year = (
                        SELECT CONCAT(
                            CAST(SUBSTRING_INDEX(gtc.base_year, '/', 1) AS SIGNED) - (ml.level - 1),
                            '/',
                            CAST(SUBSTRING_INDEX(gtc.base_year, '/', -1) AS SIGNED) - (ml.level - 1)
                        )
                    )
                LEFT JOIN (
                    SELECT m1.course_code, m1.title, m1.academic_year
                    FROM modules m1
                    WHERE m1.academic_year = (SELECT MAX(m2.academic_year) FROM modules m2 WHERE REPLACE(m2.course_code, ' ', '') = REPLACE(m1.course_code, ' ', ''))
                ) m_latest ON REPLACE(et.course_code, ' ', '') = REPLACE(m_latest.course_code, ' ', '')
                WHERE a.is_published_to_students = 1
                AND (
                    /* Registered Course Units Match */
                    EXISTS (
                        SELECT 1 FROM registered_course_units rcu 
                        JOIN course_unit_registration_headers cur ON rcu.header_id = cur.id 
                        WHERE cur.user_id = ? AND cur.status = 'Approved'
                        AND REPLACE(rcu.course_code, ' ', '') = REPLACE(et.course_code, ' ', '')
                        AND cur.academic_year = et.academic_year
                    )
                    OR
                    /* Add / Drop Added Courses Match */
                    EXISTS (
                        SELECT 1 FROM add_drop_requested_courses adc 
                        JOIN add_drop_request_headers adr ON adc.header_id = adr.id 
                        WHERE adr.user_id = ? AND adc.action = 'Add' AND adr.status = 'Approved'
                        AND REPLACE(adc.course_code, ' ', '') = REPLACE(et.course_code, ' ', '')
                        AND adr.academic_year = et.academic_year
                    )
                    OR
                    /* Medical / Repeat Courses Match */
                    EXISTS (
                        SELECT 1 FROM medical_repeat_requested_courses mrc 
                        JOIN medical_repeat_request_headers mrr ON mrc.header_id = mrr.id 
                        WHERE mrr.user_id = ? AND mrr.status = 'Approved'
                        AND REPLACE(mrc.course_code, ' ', '') = REPLACE(et.course_code, ' ', '')
                        AND mrr.academic_year = et.academic_year
                    )
                )
                AND NOT EXISTS (
                    /* Subtract Dropped Courses Match */
                    SELECT 1 FROM add_drop_requested_courses adc 
                    JOIN add_drop_request_headers adr ON adc.header_id = adr.id 
                    WHERE adr.user_id = ? AND adc.action = 'Drop' AND adr.status = 'Approved'
                    AND REPLACE(adc.course_code, ' ', '') = REPLACE(et.course_code, ' ', '')
                    AND adr.academic_year = et.academic_year
                )
                ORDER BY et.date ASC, s.start_time ASC
            `;
            params = [userId, userId, userId, userId];
        } else {
            // Existing logic for Staff roles
            query = `
                SELECT 
                    a.alloc_id,
                    a.exam_id,
                    et.date,
                    et.academic_year,
                    DATE_FORMAT(s.start_time, '%l:%i %p') AS time,
                    et.course_code as courseUnit,
                    COALESCE(m_map.title, m_latest.title) as courseTitle,
                    a.venue,
                    CASE 
                        WHEN a.supervisor_id = ? THEN 'Supervisor'
                        WHEN (SELECT COUNT(*) FROM exam_draft_invigilators i WHERE i.alloc_id = a.alloc_id AND i.invigilator_id = ?) > 0 THEN 'Invigilator'
                        WHEN (SELECT COUNT(*) FROM exam_draft_attendants at WHERE at.alloc_id = a.alloc_id AND at.attendant_id = ?) > 0 THEN 'Hall Attendant'
                        ELSE 'Staff'
                    END as role,
                    (SELECT examiner_role FROM examiner_appointments ea WHERE REPLACE(ea.course_code, ' ', '') = REPLACE(et.course_code, ' ', '') AND ea.user_id = ? AND ea.status = 'Active' LIMIT 1) as examinerRole
                FROM exam_draft_allocations a
                JOIN exam_timetables et ON a.exam_id = et.timetable_id
                JOIN exam_slots s ON et.timetable_id = s.timetable_id
                LEFT JOIN (
                    SELECT course_code, MAX(level) as level
                    FROM modules
                    GROUP BY course_code
                ) ml ON REPLACE(et.course_code, ' ', '') = REPLACE(ml.course_code, ' ', '')
                CROSS JOIN (
                    SELECT academic_year as base_year FROM global_timetable_config LIMIT 1
                ) gtc
                LEFT JOIN modules m_map ON REPLACE(et.course_code, ' ', '') = REPLACE(m_map.course_code, ' ', '')
                    AND m_map.academic_year = (
                        SELECT CONCAT(
                            CAST(SUBSTRING_INDEX(gtc.base_year, '/', 1) AS SIGNED) - (ml.level - 1),
                            '/',
                            CAST(SUBSTRING_INDEX(gtc.base_year, '/', -1) AS SIGNED) - (ml.level - 1)
                        )
                    )
                LEFT JOIN (
                    SELECT m1.course_code, m1.title, m1.academic_year
                    FROM modules m1
                    WHERE m1.academic_year = (SELECT MAX(m2.academic_year) FROM modules m2 WHERE REPLACE(m2.course_code, ' ', '') = REPLACE(m1.course_code, ' ', ''))
                ) m_latest ON REPLACE(et.course_code, ' ', '') = REPLACE(m_latest.course_code, ' ', '')
                WHERE a.is_published = 1
                AND (
                    a.supervisor_id = ? 
                    OR EXISTS (SELECT 1 FROM exam_draft_invigilators i WHERE i.alloc_id = a.alloc_id AND i.invigilator_id = ?)
                    OR EXISTS (SELECT 1 FROM exam_draft_attendants at WHERE at.alloc_id = a.alloc_id AND at.attendant_id = ?)
                )
                ORDER BY et.date ASC, s.start_time ASC
            `;
            params = [userId, userId, userId, userId, userId, userId, userId];
        }

        const [rows] = await pool.query(query, params);

        // Format dates just like the frontend expects 'YYYY-MM-DD'
        const formattedRows = rows.map((r) => {
            const dateObj = new Date(r.date);
            const localDate = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000));
            return {
                id: r.alloc_id,
                allocId: r.alloc_id,
                examId: r.exam_id,
                date: localDate.toISOString().split('T')[0],
                time: r.time,
                academicYear: r.academic_year,
                courseUnit: r.courseUnit,
                courseTitle: r.courseTitle,
                venue: r.venue,
                role: r.role,
                examinerRole: r.examinerRole
            };
        });

        res.json(formattedRows);
    } catch (err) {
        console.error('Error fetching personalized timetable:', err);
        res.status(500).json({ message: 'Error fetching personalized timetable', error: err.message });
    }
});

// ==========================================
// STAFF CONCERNS
// ==========================================

// Report a new concern
router.post('/report-concern', async (req, res) => {
    let { concerns, userId, role, allocId, examId, reason } = req.body;

    // Normalize to an array of concerns
    let reportList = [];
    if (concerns && Array.isArray(concerns)) {
        reportList = concerns;
    } else if (userId && role && allocId && reason) {
        reportList = [{ staffId: userId, role, allocId, examId, reason }];
    }

    if (reportList.length === 0) {
        return res.status(400).json({ message: 'Invalid payload or missing fields' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Role mapping to match user requirements
        const roleMap = {
            'AcademicSupervisor': 'Academic Supervisor',
            'Supervisor': 'Supervisor',
            'HallAttendant': 'Hall Attendant',
            'Invigilator': 'Invigilator'
        };

        for (const c of reportList) {
            let sId = c.staffId || userId;
            let aId = c.allocId || allocId;
            let eId = c.examId || examId;
            let rsn = c.reason || reason;
            let rle = roleMap[c.role] || c.role;

            // Prevention: Check for existing pending concern for this staff and allocation
            const [existing] = await connection.execute(
                'SELECT concern_id FROM staff_concerns WHERE alloc_id = ? AND staff_id = ? AND status = ?',
                [aId, sId, 'Pending']
            );

            if (existing.length > 0) {
                // Skip if already reported
                continue;
            }

            // Fetch exam_id if missing or to ensure correctness (as requested)
            if (!eId) {
                const [allocRows] = await connection.execute('SELECT exam_id FROM exam_draft_allocations WHERE alloc_id = ?', [aId]);
                if (allocRows.length > 0) {
                    eId = allocRows[0].exam_id;
                } else {
                    throw new Error(`Allocation ${aId} not found`);
                }
            }

            await connection.execute(
                `INSERT INTO staff_concerns (alloc_id, exam_id, staff_id, role, reason, status) VALUES (?, ?, ?, ?, ?, ?)`,
                [aId, eId, sId, rle, rsn, 'Pending']
            );

            // Fetch reporter name for notification
            const [reporter] = await connection.execute('SELECT name FROM users WHERE user_id = ?', [sId]);
            const reporterName = reporter.length > 0 ? reporter[0].name : 'A staff member';

            // Notify all Academic Supervisors
            const [supervisors] = await connection.execute('SELECT user_id FROM users WHERE role = ?', ['AcademicSupervisor']);
            for (const supervisor of supervisors) {
                await connection.execute(
                    'INSERT INTO activities (user_id, description, type) VALUES (?, ?, ?)',
                    [supervisor.user_id, `${reporterName} reported a concern: ${rsn}`, 'notification']
                );
            }
        }
        await connection.commit();
        res.json({ message: 'Concerns reported successfully' });
    } catch (err) {
        await connection.rollback();
        console.error('Error reporting concerns:', err);
        res.status(500).json({ message: 'Error reporting concerns', error: err.message });
    } finally {
        connection.release();
    }
});

// Fetch all concerns (with details and optional target filtering)
router.get('/staff-concerns', async (req, res) => {
    const { target } = req.query; // Optional: 'Faculty' or 'AcademicSupervisor'
    try {
        let whereClause = '';
        const params = [];

        if (target === 'Faculty') {
            whereClause = "WHERE c.role IN ('Hall Attendant', 'attendant')";
        } else if (target === 'AcademicSupervisor') {
            whereClause = "WHERE c.role IN ('Supervisor', 'Invigilator', 'Academic Supervisor', 'supervisor', 'invigilator')";
        }

        const query = `
            SELECT 
                c.concern_id as id,
                c.exam_id as examId,
                c.alloc_id as allocId,
                c.role as displayRole,
                CASE 
                    WHEN c.role = 'Supervisor' THEN 'supervisor'
                    WHEN c.role = 'Invigilator' THEN 'invigilator'
                    WHEN c.role = 'Hall Attendant' THEN 'attendant'
                    ELSE c.role
                END as role,
                u.name as requestBy,
                u2.name as replacementName,
                'Schedule Reassignment' as type,
                c.reason as description,
                c.reason as reason,
                c.status,
                DATE_FORMAT(c.created_at, '%d/%m/%Y') as reportDate,
                DATE_FORMAT(c.created_at, '%d/%m/%Y') as date,
                et.course_code as course,
                et.course_code as courseUnit,
                c2.title as courseTitle,
                DATE_FORMAT(et.date, '%d/%m/%Y') as examDate,
                CONCAT(DATE_FORMAT(s.start_time, '%l:%i %p'), ' - ', DATE_FORMAT(s.end_time, '%l:%i %p')) AS time,
                a.venue
            FROM staff_concerns c
            JOIN users u ON c.staff_id = u.user_id
            LEFT JOIN users u2 ON c.replacement_staff_id = u2.user_id
            JOIN exam_draft_allocations a ON c.alloc_id = a.alloc_id
            JOIN exam_timetables et ON a.exam_id = et.timetable_id
            JOIN (
                SELECT timetable_id, MIN(start_time) as start_time, MIN(end_time) as end_time
                FROM exam_slots
                GROUP BY timetable_id
            ) s ON et.timetable_id = s.timetable_id
            LEFT JOIN (
                SELECT m1.course_code, m1.title, m1.academic_year
                FROM modules m1
                WHERE m1.academic_year = (
                    SELECT MAX(m2.academic_year) FROM modules m2 
                    WHERE REPLACE(m2.course_code, ' ', '') = REPLACE(m1.course_code, ' ', '') 
                )
            ) c2 ON REPLACE(et.course_code, ' ', '') = REPLACE(c2.course_code, ' ', '')
            ${whereClause}
            ORDER BY c.created_at DESC
        `;
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching concerns:', err);
        res.status(500).json({ message: 'Error fetching concerns', error: err.message });
    }
});

// Resolve a concern / Replace staff
router.post('/resolve-concern', async (req, res) => {
    const { concernId, status, replacementStaffId, allocId, role, newStaffId } = req.body;

    // Resolve inputs from both old and new frontend formats
    const actualStatus = status || 'Resolved';
    const actualConcernId = concernId;
    const actualReplacementId = replacementStaffId || newStaffId;

    if (!actualConcernId || !actualStatus) {
        return res.status(400).json({ message: 'Missing required fields (concernId or status)' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Find the basic data from the concern if not provided
        const [concerns] = await connection.execute('SELECT staff_id, alloc_id, role as dbRole FROM staff_concerns WHERE concern_id = ?', [actualConcernId]);
        if (concerns.length === 0) throw new Error('Concern not found');

        const oldStaffId = concerns[0].staff_id;
        const aId = allocId || concerns[0].alloc_id;
        const rawRole = role || concerns[0].dbRole;
        const normRole = (rawRole === 'Hall Attendant' || rawRole === 'attendant') ? 'attendant' :
            (rawRole === 'Invigilator' || rawRole === 'invigilator') ? 'invigilator' :
                (rawRole === 'Supervisor' || rawRole === 'supervisor') ? 'supervisor' : rawRole;

        // 2. Perform replacement in draft tables only if Approved/Resolved
        if (actualStatus === 'Approved' || actualStatus === 'Resolved') {
            if (actualReplacementId) {
                if (normRole === 'supervisor') {
                    await connection.execute(
                        'UPDATE exam_draft_allocations SET supervisor_id = ? WHERE alloc_id = ?',
                        [actualReplacementId, aId]
                    );
                } else if (normRole === 'invigilator') {
                    await connection.execute(
                        'DELETE FROM exam_draft_invigilators WHERE alloc_id = ? AND invigilator_id = ?',
                        [aId, oldStaffId]
                    );
                    await connection.execute(
                        'INSERT INTO exam_draft_invigilators (alloc_id, invigilator_id) VALUES (?, ?)',
                        [aId, actualReplacementId]
                    );
                } else if (normRole === 'attendant') {
                    await connection.execute(
                        'DELETE FROM exam_draft_attendants WHERE alloc_id = ? AND attendant_id = ?',
                        [aId, oldStaffId]
                    );
                    await connection.execute(
                        'INSERT INTO exam_draft_attendants (alloc_id, attendant_id, is_published) VALUES (?, ?, 1)',
                        [aId, actualReplacementId]
                    );
                }
            }
        }

        // 3. Mark concern as resolved and store replacement staff
        await connection.execute(
            'UPDATE staff_concerns SET status = ?, replacement_staff_id = ? WHERE concern_id = ?',
            [actualStatus, actualReplacementId || null, actualConcernId]
        );

        // Notify reporter (old staff) if Approved/Resolved
        if (actualStatus === 'Approved' || actualStatus === 'Resolved') {
            await connection.execute(
                'INSERT INTO activities (user_id, description, type) VALUES (?, ?, ?)',
                [oldStaffId, 'Concern report was approved', 'notification']
            );

            // Notify newly appointed staff if any
            if (actualReplacementId) {
                await connection.execute(
                    'INSERT INTO activities (user_id, description, type) VALUES (?, ?, ?)',
                    [actualReplacementId, 'New schedule was appointed', 'notification']
                );
            }
        }

        await connection.commit();
        res.json({ message: `Concern ${actualStatus} successfully` });
    } catch (err) {
        await connection.rollback();
        console.error('Error resolving concern:', err);
        res.status(500).json({ message: 'Error resolving concern', error: err.message });
    } finally {
        connection.release();
    }
});

// Fetch my concerns
router.get('/my-concerns/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const query = `
            SELECT 
                c.concern_id as id,
                c.exam_id as examId,
                c.alloc_id as allocId,
                CASE 
                    WHEN c.role = 'Supervisor' THEN 'supervisor'
                    WHEN c.role = 'Invigilator' THEN 'invigilator'
                    WHEN c.role = 'Hall Attendant' THEN 'attendant'
                    ELSE c.role
                END as role,
                c.reason as description,
                c.reason as reason,
                c.status,
                DATE_FORMAT(c.created_at, '%Y-%m-%d') as date,
                et.course_code as course,
                et.course_code as courseUnit,
                c2.title as courseTitle,
                DATE_FORMAT(et.date, '%Y-%m-%d') as examDate,
                DATE_FORMAT(s.start_time, '%l:%i %p') AS time,
                a.venue,
                u2.name as replacementName
            FROM staff_concerns c
            JOIN exam_draft_allocations a ON c.alloc_id = a.alloc_id
            JOIN exam_timetables et ON a.exam_id = et.timetable_id
            JOIN exam_slots s ON et.timetable_id = s.timetable_id
            LEFT JOIN (
                SELECT m1.course_code, m1.title, m1.academic_year
                FROM modules m1
                WHERE m1.academic_year = (
                    SELECT MAX(m2.academic_year) FROM modules m2 
                    WHERE REPLACE(m2.course_code, ' ', '') = REPLACE(m1.course_code, ' ', '') 
                )
            ) c2 ON REPLACE(et.course_code, ' ', '') = REPLACE(c2.course_code, ' ', '')
            LEFT JOIN users u2 ON c.replacement_staff_id = u2.user_id
            WHERE c.staff_id = ?
            ORDER BY c.created_at DESC
        `;
        const [rows] = await pool.query(query, [userId]);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching my concerns:', err);
        res.status(500).json({ message: 'Error fetching my concerns', error: err.message });
    }
});

// ==========================================
// EXAMINER ASSIGNMENTS
// ==========================================

// Get eligible staff for Examiner Assignments
router.get('/examiner-staff', async (req, res) => {
    try {
        const query = `
            SELECT user_id as id, name, email
            FROM users 
            WHERE role IN ('DeptStaff', 'AcademicSupervisor') 
            AND approval_status = 'Approved' 
            AND is_verified = 1
            ORDER BY name ASC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching examiner staff:', err);
        res.status(500).json({ message: 'Error fetching examiner staff', error: err.message });
    }
});

// Get available courses for Examiner Assignments
router.get('/examiner-courses', async (req, res) => {
    try {
        const query = `
            SELECT course_code, title 
            FROM modules
            ORDER BY course_code ASC
        `;
        const [rows] = await pool.query(query);
        // Format to "CODE - TITLE" for the dropdown
        const formatted = rows.map(r => `${r.course_code} - ${r.title}`);
        res.json(formatted);
    } catch (err) {
        console.error('Error fetching examiner courses:', err);
        res.status(500).json({ message: 'Error fetching examiner courses', error: err.message });
    }
});

// Get all current examiner appointments
router.get('/examiner-appointments', async (req, res) => {
    try {
        const query = `
            SELECT 
                a.appointment_id as id,
                a.user_id,
                a.course_code as courseCode,
                a.academic_year as academicYear,
                a.examiner_role as type,
                a.status,
                c.title as courseTitle
            FROM examiner_appointments a
            LEFT JOIN modules c ON a.course_code = c.course_code
        `;
        const [rows] = await pool.query(query);
        const formatted = rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            course: row.courseTitle ? `${row.courseCode} - ${row.courseTitle}` : row.courseCode,
            academicYear: row.academicYear,
            type: row.type,
            status: row.status === 'Active' ? 'Appointed' : row.status
        }));
        res.json(formatted);
    } catch (err) {
        console.error('Error fetching appointments:', err);
        res.status(500).json({ message: 'Error fetching appointments', error: err.message });
    }
});

// Save or Update an Examiner Appointment
router.post('/examiner-appointments', async (req, res) => {
    const { userId, appointmentId, course, academicYear, type } = req.body;

    if (!userId || !course || !academicYear || !type) {
        return res.status(400).json({ message: 'Missing required configuration data' });
    }

    // Extract the raw course_code from "CODE - TITLE"
    const courseCode = course.split(' - ')[0];

    try {
        // Check for existing appointment for the same course, academic year, and role
        const [existing] = await pool.query(
            'SELECT * FROM examiner_appointments WHERE course_code = ? AND academic_year = ? AND examiner_role = ?',
            [courseCode, academicYear, type]
        );

        if (existing.length > 0) {
            // Already an appointment for this slot
            // If it doesn't match the ID we're currently editing, it's a conflict
            if (existing[0].appointment_id !== appointmentId) {
                return res.status(409).json({ message: `Conflict: Another examiner is already appointed as ${type} for ${course}` });
            }
        }

        if (appointmentId) {
            // Explicitly updating an existing row you clicked 'Edit' on
            await pool.query(
                'UPDATE examiner_appointments SET course_code = ?, examiner_role = ?, status = "Active" WHERE appointment_id = ?',
                [courseCode, type, appointmentId]
            );
        } else {
            // Insert new appointment (First time appointing for this academic year)
            await pool.query(
                'INSERT INTO examiner_appointments (course_code, user_id, examiner_role, academic_year, status) VALUES (?, ?, ?, ?, "Active")',
                [courseCode, userId, type, academicYear]
            );
        }
        res.json({ message: 'Examiner successfully appointed' });
    } catch (err) {
        console.error('Error saving appointment:', err);
        res.status(500).json({ message: 'Error assigning examiner', error: err.message });
    }
});

// Submit all published draft allocations to Faculty Staff
router.post('/submit-to-faculty', async (req, res) => {
    try {
        await pool.query('UPDATE exam_draft_allocations SET is_submitted_to_faculty = 1 WHERE is_published = 1');
        
        // Notify Faculty Staff
        try {
            const [facStaff] = await pool.query('SELECT user_id FROM users WHERE role IN (?, ?)', ['FacultyStaff', 'Faculty']);
            for (const staff of facStaff) {
                await pool.query(
                    'INSERT INTO activities (user_id, description, type, created_at) VALUES (?, ?, ?, NOW())',
                    [staff.user_id, 'Final examination allocations submitted to faculty.', 'notification']
                );
            }
        } catch (notifyErr) {
            console.error('Error notifying faculty staff:', notifyErr);
        }

        res.json({ message: 'Allocations submitted to faculty successfully' });
    } catch (err) {
        console.error('Error submitting to faculty:', err);
        res.status(500).json({ message: 'Error submitting to faculty', error: err.message });
    }
});

// Submit/Return allocations from Faculty back to AS (mark as finalized by faculty)
router.post('/submit-to-as', async (req, res) => {
    try {
        // Marks them as submitted back to AS (is_submitted_to_faculty = 2)
        await pool.query('UPDATE exam_draft_allocations SET is_submitted_to_faculty = 2 WHERE is_submitted_to_faculty = 1');
        
        // Notify Academic Supervisors
        try {
            const [asStaff] = await pool.query('SELECT user_id FROM users WHERE role = ?', ['AcademicSupervisor']);
            for (const staff of asStaff) {
                await pool.query(
                    'INSERT INTO activities (user_id, description, type, created_at) VALUES (?, ?, ?, NOW())',
                    [staff.user_id, 'Hall attendant configurations submitted by faculty.', 'notification']
                );
            }
        } catch (notifyErr) {
            console.error('Error notifying academic supervisors:', notifyErr);
        }

        res.json({ message: 'Submitted to Academic Supervisor successfully' });
    } catch (err) {
        console.error('Error submitting to AS:', err);
        res.status(500).json({ message: 'Error submitting to AS', error: err.message });
    }
});

// GET Allocations for Faculty Staff (Hall Attendant Configuration)
router.get('/faculty-attendant-allocations', async (req, res) => {
    try {
        const query = `
            SELECT 
                a.alloc_id,
                a.exam_id,
                et.date,
                et.academic_year,
                s.start_time as raw_start_time,
                CONCAT(DATE_FORMAT(s.start_time, '%l:%i %p'), ' - ', DATE_FORMAT(s.end_time, '%l:%i %p')) AS time,
                et.course_code,
                COALESCE(m_map.title, m_latest.title) as course_title,
                s.std_non_repeat as total_non_repeat,
                s.std_repeat as total_repeat,
                a.venue,
                a.assigned_non_repeat,
                a.assigned_repeat,
                u_sup.name as supervisor_name
            FROM exam_draft_allocations a
            JOIN exam_timetables et ON a.exam_id = et.timetable_id
            JOIN exam_slots s ON et.timetable_id = s.timetable_id
            LEFT JOIN (
                SELECT course_code, MAX(level) as level
                FROM modules
                GROUP BY course_code
            ) ml ON REPLACE(et.course_code, ' ', '') = REPLACE(ml.course_code, ' ', '')
            CROSS JOIN (
                SELECT academic_year as base_year FROM global_timetable_config LIMIT 1
            ) gtc
            LEFT JOIN modules m_map ON REPLACE(et.course_code, ' ', '') = REPLACE(m_map.course_code, ' ', '')
                AND m_map.academic_year = (
                    SELECT CONCAT(
                        CAST(SUBSTRING_INDEX(gtc.base_year, '/', 1) AS SIGNED) - (ml.level - 1),
                        '/',
                        CAST(SUBSTRING_INDEX(gtc.base_year, '/', -1) AS SIGNED) - (ml.level - 1)
                    )
                )
            LEFT JOIN (
                SELECT m1.course_code, m1.title, m1.academic_year
                FROM modules m1
                WHERE m1.academic_year = (SELECT MAX(m2.academic_year) FROM modules m2 WHERE REPLACE(m2.course_code, ' ', '') = REPLACE(m1.course_code, ' ', ''))
            ) m_latest ON REPLACE(et.course_code, ' ', '') = REPLACE(m_latest.course_code, ' ', '')
            LEFT JOIN users u_sup ON a.supervisor_id = u_sup.user_id
            WHERE a.is_submitted_to_faculty IN (1, 2)
            ORDER BY et.date ASC, s.start_time ASC
        `;
        const [rows] = await pool.query(query);

        // Group by exam_id like the frontend expects
        const examsMap = {};
        for (const r of rows) {
            if (!examsMap[r.exam_id]) {
                examsMap[r.exam_id] = {
                    id: r.exam_id,
                    date: r.date,
                    time: r.time,
                    course: `${r.course_code} - ${r.course_title || 'No Title'}`,
                    totalNonRepeat: r.total_non_repeat,
                    totalRepeat: r.total_repeat,
                    allocations: []
                };
            }

            // Get invigilators for this allocation
            const [invigilators] = await pool.query(
                `SELECT u.name FROM exam_draft_invigilators ei JOIN users u ON ei.invigilator_id = u.user_id WHERE ei.alloc_id = ?`,
                [r.alloc_id]
            );

            // Get attendants for this allocation
            const [attendants] = await pool.query(
                `SELECT ea.attendant_id, u.name FROM exam_draft_attendants ea JOIN users u ON ea.attendant_id = u.user_id WHERE ea.alloc_id = ?`,
                [r.alloc_id]
            );

            examsMap[r.exam_id].allocations.push({
                id: r.alloc_id,
                venue: r.venue,
                assignedNonRepeat: r.assigned_non_repeat,
                assignedRepeat: r.assigned_repeat,
                supervisor: r.supervisor_name,
                invigilator: invigilators.length > 0 ? invigilators.map(i => i.name).join(', ') : 'None',
                attendants: attendants.length > 0 ? attendants.map(a => a.name).join(', ') : 'None',
                attendantIds: attendants.map(a => a.attendant_id)
            });

            // Keep track of raw start time for sorting the grouped object later
            if (!examsMap[r.exam_id].rawStartTime) {
                examsMap[r.exam_id].rawStartTime = r.raw_start_time;
            }
        }

        const sortedExams = Object.values(examsMap).sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA - dateB !== 0) return dateA - dateB;

            // If same date, sort by raw start time
            return a.rawStartTime.localeCompare(b.rawStartTime);
        });

        res.json(sortedExams);
    } catch (err) {
        console.error('Error fetching faculty allocations:', err);
        res.status(500).json({ message: 'Error fetching faculty allocations', error: err.message });
    }
});

// Save Hall Attendant Draft
router.post('/save-hall-attendant-draft', async (req, res) => {
    const { assignments } = req.body; // Expecting [{ alloc_id, attendantIds: [] }, ...]
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        for (const item of assignments) {
            const { alloc_id, attendantIds } = item;

            // 1. Delete existing attendants for this allocation
            await connection.query('DELETE FROM exam_draft_attendants WHERE alloc_id = ?', [alloc_id]);

            // 2. Insert new attendants
            if (attendantIds && attendantIds.length > 0) {
                // Ensure unique IDs to prevent DB duplication
                const uniqueIds = [...new Set(attendantIds)];
                const values = uniqueIds.map(id => [alloc_id, id]);
                await connection.query('INSERT INTO exam_draft_attendants (alloc_id, attendant_id) VALUES ?', [values]);
            }
        }

        await connection.commit();
        res.json({ message: 'Hall attendant draft saved successfully!' });
    } catch (err) {
        await connection.rollback();
        console.error('Error saving hall attendant draft:', err);
        res.status(500).json({ message: 'Error saving hall attendant draft', error: err.message });
    } finally {
        connection.release();
    }
});

// Publish Hall Attendant Timetable
router.post('/publish-attendant-timetable', async (req, res) => {
    try {
        await pool.query('UPDATE exam_draft_attendants SET is_published = 1');
        res.json({ message: 'Personalized timetables published successfully!' });
    } catch (err) {
        console.error('Error publishing hall attendant timetable:', err);
        res.status(500).json({ message: 'Error publishing hall attendant timetable', error: err.message });
    }
});

// Publish Student Timetable
router.post('/publish-student-timetable', async (req, res) => {
    try {
        await pool.query('UPDATE exam_draft_allocations SET is_published_to_students = 1');
        res.json({ message: 'Timetables published to students successfully!' });
    } catch (err) {
        console.error('Error publishing student timetable:', err);
        res.status(500).json({ message: 'Error publishing student timetable', error: err.message });
    }
});

// Get Published Exams for a specific Hall Attendant
router.get('/attendant-published-exams', async (req, res) => {
    const { attendantId } = req.query; // Expecting attendantId
    if (!attendantId) {
        return res.status(400).json({ message: 'Attendant ID is required' });
    }

    try {
        const query = `
            SELECT 
                a.alloc_id as id,
                a.exam_id,
                et.academic_year as academicYear,
                et.date,
                et.course_code,
                COALESCE(m_map.title, m_latest.title) as courseTitle,
                a.venue,
                s.start_time,
                s.end_time,
                u_sup.name as supervisorName,
                eda.is_published,
                (SELECT COUNT(*) FROM staff_concerns sc 
                 WHERE sc.alloc_id = a.alloc_id 
                 AND sc.staff_id = ? 
                 AND sc.status = 'Pending'
                 LIMIT 1) as has_pending_concern
            FROM exam_draft_attendants eda
            JOIN exam_draft_allocations a ON eda.alloc_id = a.alloc_id
            JOIN exam_timetables et ON a.exam_id = et.timetable_id
            LEFT JOIN exam_slots s ON et.timetable_id = s.timetable_id
            LEFT JOIN (
                SELECT course_code, MAX(level) as level
                FROM modules
                GROUP BY course_code
            ) ml ON REPLACE(et.course_code, ' ', '') = REPLACE(ml.course_code, ' ', '')
            CROSS JOIN (
                SELECT academic_year as base_year FROM global_timetable_config LIMIT 1
            ) gtc
            LEFT JOIN modules m_map ON REPLACE(et.course_code, ' ', '') = REPLACE(m_map.course_code, ' ', '')
                AND m_map.academic_year = (
                    SELECT CONCAT(
                        CAST(SUBSTRING_INDEX(gtc.base_year, '/', 1) AS SIGNED) - (ml.level - 1),
                        '/',
                        CAST(SUBSTRING_INDEX(gtc.base_year, '/', -1) AS SIGNED) - (ml.level - 1)
                    )
                )
            LEFT JOIN (
                SELECT m1.course_code, m1.title, m1.academic_year
                FROM modules m1
                WHERE m1.academic_year = (SELECT MAX(m2.academic_year) FROM modules m2 WHERE REPLACE(m2.course_code, ' ', '') = REPLACE(m1.course_code, ' ', ''))
            ) m_latest ON REPLACE(et.course_code, ' ', '') = REPLACE(m_latest.course_code, ' ', '')
            LEFT JOIN users u_sup ON a.supervisor_id = u_sup.user_id
            WHERE eda.attendant_id = ? AND eda.is_published = 1
            ORDER BY et.date ASC, s.start_time ASC
        `;
        const [rawRows] = await pool.query(query, [attendantId, attendantId]);

        // Helper to format time (e.g. 09:00:00 -> 09:00 AM)
        const formatTime = (timeData) => {
            if (!timeData) return 'N/A';
            const str = typeof timeData === 'string' ? timeData : timeData.toString();
            const match = str.match(/(\d{2}):(\d{2}):(\d{2})/);
            const cleanTime = match ? match[1] : str;
            const parts = cleanTime.split(':');
            if (parts.length < 2) return str;
            const hour = parseInt(parts[0]);
            const minute = parts[1];
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const h12 = hour % 12 || 12;
            return `${h12.toString().padStart(2, '0')}:${minute} ${ampm}`;
        };

        const getSec = (t) => {
            if (!t) return 0;
            const str = typeof t === 'string' ? t : t.toString();
            const m = str.match(/(\d{2}):(\d{2}):(\d{2})/);
            if (!m) return 0;
            return parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseInt(m[3]);
        };

        // Group rows by allocation ID
        const grouped = {};
        rawRows.forEach(row => {
            if (!grouped[row.id]) {
                grouped[row.id] = {
                    id: row.id,
                    exam_id: row.exam_id,
                    academicYear: row.academicYear,
                    date: row.date ? new Date(row.date).toLocaleDateString('en-GB') : 'N/A', // dd/mm/yyyy
                    courseUnit: `${row.course_code} - ${row.courseTitle || 'No Title'}`,
                    venue: row.venue,
                    supervisorName: row.supervisorName || 'N/A',
                    is_published: row.is_published,
                    has_pending_concern: row.has_pending_concern,
                    minStart: row.start_time,
                    maxEnd: row.end_time
                };
            } else {
                if (row.start_time && (!grouped[row.id].minStart || row.start_time < grouped[row.id].minStart)) {
                    grouped[row.id].minStart = row.start_time;
                }
                if (row.end_time && (!grouped[row.id].maxEnd || row.end_time > grouped[row.id].maxEnd)) {
                    grouped[row.id].maxEnd = row.end_time;
                }
            }
        });

        // Finalize timing and duration for each group
        const result = Object.values(grouped).map(item => {
            let startTime = 'N/A';
            let endTime = 'N/A';
            let time = 'N/A';
            let durationMinutes = 0;

            if (item.minStart && item.maxEnd) {
                startTime = formatTime(item.minStart);
                endTime = formatTime(item.maxEnd);
                time = `${startTime} - ${endTime}`;
                durationMinutes = Math.floor((getSec(item.maxEnd) - getSec(item.minStart)) / 60);
            }

            return {
                ...item,
                startTime,
                endTime,
                time,
                durationMinutes
            };
        });

        res.json(result);
    } catch (err) {
        console.error('Error fetching attendant published exams:', err);
        res.status(500).json({ message: 'Error fetching attendant published exams', error: err.message });
    }
});

module.exports = router;
