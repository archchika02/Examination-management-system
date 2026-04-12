const pool = require('../config/db');

exports.getAdmissionCards = async (req, res) => {
    const { level, type } = req.query; // type: 'Academic', 'Medical'

    if (!level || !type) {
        return res.status(400).json({ message: 'Level and Type are required' });
    }

    try {
        // Extract numeric string level (e.g., "Level 1" -> "1")
        const parsedLevel = typeof level === 'string' ? level.replace('Level ', '').trim() : level;

        let query = '';
        const params = [parsedLevel];

        if (type === 'Academic') {
            query = `
                WITH AllEnrollments AS (
                    SELECT 
                        h.user_id, 
                        sd.student_number, 
                        h.student_name, 
                        sd.level,
                        rcu.course_code,
                        h.academic_year
                    FROM course_unit_registration_headers h
                    JOIN registered_course_units rcu ON h.id = rcu.header_id
                    JOIN student_details sd ON h.user_id = sd.user_id
                    WHERE h.status = 'Approved' AND sd.level = ?

                    UNION DISTINCT

                    -- Add-Drop "Add" actions
                    SELECT 
                        h.user_id, 
                        sd.student_number, 
                        h.student_name, 
                        sd.level,
                        arc.course_code,
                        h.academic_year
                    FROM add_drop_request_headers h
                    JOIN add_drop_requested_courses arc ON h.id = arc.header_id
                    JOIN student_details sd ON h.user_id = sd.user_id
                    WHERE h.status = 'Approved' AND arc.action = 'Add' AND sd.level = ?
                ),
                ExcludedEnrollments AS (
                    -- Add-Drop "Drop" actions
                    SELECT 
                        h.user_id, 
                        arc.course_code
                    FROM add_drop_request_headers h
                    JOIN add_drop_requested_courses arc ON h.id = arc.header_id
                    WHERE h.status = 'Approved' AND arc.action = 'Drop'
                ),
                FinalEnrollments AS (
                    SELECT e.*
                    FROM AllEnrollments e
                    LEFT JOIN ExcludedEnrollments ex ON e.user_id = ex.user_id AND REPLACE(e.course_code, ' ', '') = REPLACE(ex.course_code, ' ', '')
                    WHERE ex.user_id IS NULL
                )
                SELECT 
                    fe.user_id,
                    fe.student_number,
                    fe.student_name,
                    fe.level,
                    fe.course_code,
                    DATE_FORMAT(et.date, '%W, %e %M, %Y') as exam_date,
                    CONCAT(DATE_FORMAT(s.start_time, '%l:%i %p'), ' - ', DATE_FORMAT(s.end_time, '%l:%i %p')) as start_time,
                    GROUP_CONCAT(DISTINCT da.venue ORDER BY da.venue SEPARATOR ', ') as venues,
                    et.academic_year
                FROM FinalEnrollments fe
                JOIN exam_timetables et ON REPLACE(fe.course_code, ' ', '') = REPLACE(et.course_code, ' ', '') 
                    AND fe.academic_year = et.academic_year
                LEFT JOIN exam_slots s ON et.timetable_id = s.timetable_id
                LEFT JOIN exam_draft_allocations da ON et.timetable_id = da.exam_id AND da.is_published = 1
                GROUP BY 
                    fe.user_id, 
                    fe.student_number, 
                    fe.student_name, 
                    fe.level, 
                    fe.course_code, 
                    et.academic_year,
                    et.date, 
                    s.start_time,
                    s.end_time
                ORDER BY fe.student_number, et.date, s.start_time, s.end_time
            `;
            params.push(parsedLevel); // for the UNION part
        } else {
            // Logic for Medical/Repeat:
            query = `
                SELECT 
                    h.user_id,
                    h.student_number,
                    h.student_name,
                    sd.level,
                    mrc.course_code,
                    DATE_FORMAT(et.date, '%W, %e %M, %Y') as exam_date,
                    CONCAT(DATE_FORMAT(s.start_time, '%l:%i %p'), ' - ', DATE_FORMAT(s.end_time, '%l:%i %p')) as start_time,
                    GROUP_CONCAT(DISTINCT da.venue ORDER BY da.venue SEPARATOR ', ') as venues,
                    et.academic_year
                FROM medical_repeat_request_headers h
                JOIN medical_repeat_requested_courses mrc ON h.id = mrc.header_id
                JOIN student_details sd ON h.user_id = sd.user_id
                JOIN exam_timetables et ON REPLACE(mrc.course_code, ' ', '') = REPLACE(et.course_code, ' ', '') 
                    AND h.academic_year = et.academic_year
                LEFT JOIN exam_slots s ON et.timetable_id = s.timetable_id
                LEFT JOIN exam_draft_allocations da ON et.timetable_id = da.exam_id AND da.is_published = 1
                WHERE h.status = 'Approved' AND sd.level = ?
                GROUP BY 
                    h.user_id, 
                    h.student_number, 
                    h.student_name, 
                    sd.level,
                    mrc.course_code, 
                    et.academic_year,
                    et.date, 
                    s.start_time,
                    s.end_time
                ORDER BY h.student_number, et.date, s.start_time, s.end_time
            `;
        }

        const [rows] = await pool.query(query, params);

        // Group by student for frontend convenience
        const students = {};
        rows.forEach(row => {
            if (!students[row.user_id]) {
                students[row.user_id] = {
                    student_number: row.student_number,
                    student_name: row.student_name,
                    level: row.level,
                    academic_year: row.academic_year,
                    courses: []
                };
            }
            if (row.course_code) {
                students[row.user_id].courses.push({
                    course_code: row.course_code,
                    date: row.exam_date,
                    time: row.start_time,
                    venue: row.venues
                });
            }
        });

        res.json(Object.values(students));
    } catch (error) {
        console.error('Error fetching admission cards:', error);
        res.status(500).json({ message: 'Error fetching admission cards', error: error.message });
    }
};

exports.getAttendanceSheets = async (req, res) => {
    const { courseCode } = req.query;

    if (!courseCode) {
        return res.status(400).json({ message: 'Course Code is required' });
    }

    try {
        // 1. Fetch Exam Data (Including Academic Year)
        const [exams] = await pool.query(`
            SELECT 
                et.timetable_id, 
                et.course_code, 
                et.academic_year,
                COALESCE(m_medical.course_title, m_target.title, 'Unknown Title') as course_title,
                DATE_FORMAT(et.date, '%W, %e %M, %Y') as exam_date,
                CONCAT(DATE_FORMAT(s.start_time, '%l:%i %p'), ' - ', DATE_FORMAT(s.end_time, '%l:%i %p')) as start_time
            FROM exam_timetables et
            CROSS JOIN (SELECT academic_year as base_year FROM global_timetable_config LIMIT 1) gtc
            LEFT JOIN (
                SELECT mrc.course_code, MAX(mrc.course_title) as course_title
                FROM medical_repeat_requested_courses mrc
                JOIN medical_repeat_request_headers h ON mrc.header_id = h.id
                WHERE h.status = 'Approved'
                  AND h.academic_year = (SELECT academic_year FROM global_timetable_config LIMIT 1)
                GROUP BY mrc.course_code
            ) m_medical ON REPLACE(et.course_code, ' ', '') = REPLACE(m_medical.course_code, ' ', '')
            LEFT JOIN modules m_target ON REPLACE(et.course_code, ' ', '') = REPLACE(m_target.course_code, ' ', '')
            AND m_target.academic_year = (
                SELECT CONCAT(
                    CAST(SUBSTRING_INDEX(gtc.base_year, '/', 1) AS SIGNED) - (CAST(SUBSTRING(REGEXP_REPLACE(et.course_code, '[^0-9]', ''), 1, 1) AS SIGNED) - 1),
                    '/',
                    CAST(SUBSTRING_INDEX(gtc.base_year, '/', -1) AS SIGNED) - (CAST(SUBSTRING(REGEXP_REPLACE(et.course_code, '[^0-9]', ''), 1, 1) AS SIGNED) - 1)
                )
            )
            LEFT JOIN exam_slots s ON et.timetable_id = s.timetable_id
            WHERE REPLACE(et.course_code, ' ', '') = REPLACE(?, ' ', '')
        `, [courseCode]);

        if (exams.length === 0) {
            return res.status(404).json({ message: 'No exam timetable found for this course.' });
        }
        const exam = exams[0];

        // 2. Fetch Venues & Allocations for this exam
        const [venues] = await pool.query(`
            SELECT 
                venue,
                assigned_non_repeat,
                assigned_repeat
            FROM exam_draft_allocations
            WHERE exam_id = ? AND is_published = 1
            ORDER BY venue ASC
        `, [exam.timetable_id]);

        if (venues.length === 0) {
            return res.status(404).json({ message: 'No published venue allocations found for this exam.' });
        }

        // 3. Fetch Non-Repeat Students directly registered for this course (Filtered by Academic Year)
        const [nonRepeatRows] = await pool.query(`
            WITH AllEnrollments AS (
                SELECT sd.student_number
                FROM course_unit_registration_headers h
                JOIN registered_course_units rcu ON h.id = rcu.header_id
                JOIN student_details sd ON h.user_id = sd.user_id
                WHERE h.status = 'Approved' 
                  AND h.academic_year = ?
                  AND REPLACE(rcu.course_code, ' ', '') = REPLACE(?, ' ', '')
                  
                UNION DISTINCT
                
                SELECT sd.student_number
                FROM add_drop_request_headers h
                JOIN add_drop_requested_courses arc ON h.id = arc.header_id
                JOIN student_details sd ON h.user_id = sd.user_id
                WHERE h.status = 'Approved' 
                  AND h.academic_year = ?
                  AND arc.action = 'Add'
                  AND REPLACE(arc.course_code, ' ', '') = REPLACE(?, ' ', '')
            ),
            ExcludedEnrollments AS (
                SELECT h.user_id
                FROM add_drop_request_headers h
                JOIN add_drop_requested_courses arc ON h.id = arc.header_id
                WHERE h.status = 'Approved' 
                  AND h.academic_year = ?
                  AND arc.action = 'Drop'
                  AND REPLACE(arc.course_code, ' ', '') = REPLACE(?, ' ', '')
            )
            SELECT e.student_number
            FROM AllEnrollments e
            LEFT JOIN student_details sd ON e.student_number = sd.student_number
            LEFT JOIN ExcludedEnrollments ex ON sd.user_id = ex.user_id
            WHERE ex.user_id IS NULL
            ORDER BY e.student_number ASC
        `, [exam.academic_year, courseCode, exam.academic_year, courseCode, exam.academic_year, courseCode]);

        const nonRepeatStudents = nonRepeatRows.map(r => r.student_number);

        // 4. Fetch Repeat/Medical Students (Filtered by Academic Year)
        const [repeatRows] = await pool.query(`
            SELECT h.student_number
            FROM medical_repeat_request_headers h
            JOIN medical_repeat_requested_courses mrc ON h.id = mrc.header_id
            WHERE h.status = 'Approved'
              AND h.academic_year = ?
              AND REPLACE(mrc.course_code, ' ', '') = REPLACE(?, ' ', '')
            ORDER BY h.student_number ASC
        `, [exam.academic_year, courseCode]);

        const repeatStudents = repeatRows.map(r => r.student_number);

        // 5. Build Attendance Sheet response per Venue
        const attendanceSheets = [];
        let nonRepeatIndex = 0;
        let repeatIndex = 0;

        for (const v of venues) {
            const allocatedNonRepeats = nonRepeatStudents.slice(nonRepeatIndex, nonRepeatIndex + v.assigned_non_repeat);
            nonRepeatIndex += v.assigned_non_repeat;

            const allocatedRepeats = repeatStudents.slice(repeatIndex, repeatIndex + v.assigned_repeat);
            repeatIndex += v.assigned_repeat;

            // Combine and sort them all together within the venue. Or just concatenate since non-repeated and repeated
            // usually do not overlap and we sort them separately. But let's sort the combined array anyway just to be safe.
            let venueStudents = [...allocatedNonRepeats, ...allocatedRepeats];
            venueStudents.sort((a, b) => a.localeCompare(b));

            if (venueStudents.length > 0) {
                attendanceSheets.push({
                    course_code: exam.course_code,
                    course_title: exam.course_title,
                    exam_date: exam.exam_date,
                    exam_time: exam.start_time,
                    venue: v.venue,
                    students: venueStudents
                });
            } else if (v.assigned_non_repeat > 0 || v.assigned_repeat > 0) {
                // If the draft allowed for students but there are none left, emit empty
                attendanceSheets.push({
                    course_code: exam.course_code,
                    course_title: exam.course_title,
                    exam_date: exam.exam_date,
                    exam_time: exam.start_time,
                    venue: v.venue,
                    students: []
                });
            }
        }

        res.json(attendanceSheets);

    } catch (error) {
        console.error('Error fetching attendance sheets:', error);
        res.status(500).json({ message: 'Error fetching attendance sheets', error: error.message });
    }
};

exports.getExaminerCourses = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        // Query courses where the user is assigned as an examiner (Examiner 1 or 2)
        // We filter based on the first digit of the course code to determine the Level
        // and match it with the correct Academic Year cycle:
        // Level 1 (Digit 1) -> Base Year (e.g. 2024/2025)
        // Level 2 (Digit 2) -> Base Year - 1 (e.g. 2023/2024)
        const query = `
            SELECT DISTINCT ea.course_code, m_cycle.title as course_title 
            FROM examiner_appointments ea
            CROSS JOIN (SELECT academic_year as base_year FROM global_timetable_config LIMIT 1) gtc
            -- Mandatory join for the Shifted Batch Cycle module entry
            JOIN modules m_cycle ON REPLACE(ea.course_code, ' ', '') = REPLACE(m_cycle.course_code, ' ', '')
            AND m_cycle.academic_year = (
                SELECT CONCAT(
                    CAST(SUBSTRING_INDEX(gtc.base_year, '/', 1) AS SIGNED) - (CAST(SUBSTRING(REGEXP_REPLACE(ea.course_code, '[^0-9]', ''), 1, 1) AS SIGNED) - 1),
                    '/',
                    CAST(SUBSTRING_INDEX(gtc.base_year, '/', -1) AS SIGNED) - (CAST(SUBSTRING(REGEXP_REPLACE(ea.course_code, '[^0-9]', ''), 1, 1) AS SIGNED) - 1)
                )
            )
            WHERE ea.user_id = ? 
            AND ea.status = 'Active'
            AND ea.academic_year = gtc.base_year -- STRICTLY ONLY CURRENT CALENDAR YEAR
            ORDER BY ea.course_code ASC
        `;

        const [courses] = await pool.query(query, [userId]);
        res.json(courses);
    } catch (error) {
        console.error('Error fetching examiner courses:', error);
        res.status(500).json({ message: 'Error fetching examiner courses', error: error.message });
    }
};

exports.getCourseExaminers = async (req, res) => {
    const { courseCode } = req.query;

    if (!courseCode) {
        return res.status(400).json({ message: 'Course Code is required' });
    }

    try {
        const [examiners] = await pool.query(`
            SELECT DISTINCT ea.examiner_role, u.name, ea.academic_year
            FROM examiner_appointments ea
            JOIN users u ON ea.user_id = u.user_id
            WHERE REPLACE(ea.course_code, ' ', '') = REPLACE(?, ' ', '')
            AND ea.status = 'Active'
            AND ea.academic_year = (
                SELECT MAX(academic_year) 
                FROM examiner_appointments 
                WHERE REPLACE(course_code, ' ', '') = REPLACE(?, ' ', '') 
                AND status = 'Active'
            )
            ORDER BY ea.examiner_role ASC
        `, [courseCode, courseCode]);

        res.json(examiners);
    } catch (error) {
        console.error('Error fetching course examiners:', error);
        res.status(500).json({ message: 'Error fetching course examiners', error: error.message });
    }
};

exports.getExamDates = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT DISTINCT DATE_FORMAT(date, '%Y-%m-%d') as date
            FROM exam_slots 
            ORDER BY date ASC
        `);
        res.json(rows.map(r => r.date));
    } catch (error) {
        console.error('Error fetching exam dates:', error);
        res.status(500).json({ message: 'Error fetching exam dates', error: error.message });
    }
};

exports.getExamCoursesByDate = async (req, res) => {
    const { date } = req.params;
    try {
        const [rows] = await pool.query(`
            SELECT DISTINCT es.course_code, 
                   COALESCE(m_medical.course_title, m_target.title, 'Unknown Title') as title
            FROM exam_slots es
            JOIN exam_timetables et ON es.timetable_id = et.timetable_id
            CROSS JOIN (SELECT academic_year as base_year FROM global_timetable_config LIMIT 1) gtc
            LEFT JOIN (
                SELECT mrc.course_code, MAX(mrc.course_title) as course_title
                FROM medical_repeat_requested_courses mrc
                JOIN medical_repeat_request_headers h ON mrc.header_id = h.id
                WHERE h.status = 'Approved'
                  AND h.academic_year = (SELECT academic_year FROM global_timetable_config LIMIT 1)
                GROUP BY mrc.course_code
            ) m_medical ON REPLACE(es.course_code, ' ', '') = REPLACE(m_medical.course_code, ' ', '')
            LEFT JOIN modules m_target ON REPLACE(es.course_code, ' ', '') = REPLACE(m_target.course_code, ' ', '')
            AND m_target.academic_year = (
                SELECT CONCAT(
                    CAST(SUBSTRING_INDEX(gtc.base_year, '/', 1) AS SIGNED) - (CAST(SUBSTRING(REGEXP_REPLACE(es.course_code, '[^0-9]', ''), 1, 1) AS SIGNED) - 1),
                    '/',
                    CAST(SUBSTRING_INDEX(gtc.base_year, '/', -1) AS SIGNED) - (CAST(SUBSTRING(REGEXP_REPLACE(es.course_code, '[^0-9]', ''), 1, 1) AS SIGNED) - 1)
                )
            )
            WHERE DATE_FORMAT(es.date, '%Y-%m-%d') = ?
            ORDER BY es.course_code ASC
        `, [date]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching exam courses by date:', error);
        res.status(500).json({ message: 'Error fetching exam courses by date', error: error.message });
    }
};
