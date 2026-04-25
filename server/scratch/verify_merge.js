const pool = require('../config/db');

async function verify() {
    try {
        // We know exam_id 481 has 2 venues and corresponds to MGTE31293 (2024/2025)
        const courseCode = 'MGTE31293';
        const academicYear = '2024/2025';

        // Find a student registered for this course
        const [students] = await pool.query(`
            SELECT cur.user_id 
            FROM registered_course_units rcu 
            JOIN course_unit_registration_headers cur ON rcu.header_id = cur.id 
            WHERE REPLACE(rcu.course_code, ' ', '') = ? 
            AND cur.academic_year = ? 
            AND cur.status = 'Approved' 
            LIMIT 1
        `, [courseCode, academicYear]);

        if (students.length === 0) {
            console.log("No student found for this course registration.");
            process.exit(0);
        }

        const userId = students[0].user_id;
        console.log(`Testing with student user_id: ${userId}`);

        // Now run the NEW query logic from the controller
        const query = `
                SELECT 
                    MIN(a.alloc_id) as alloc_id,
                    a.exam_id,
                    et.date,
                    et.academic_year,
                    DATE_FORMAT(s.start_time, '%l:%i %p') AS time,
                    et.course_code as courseUnit,
                    COALESCE(m_map.title, m_latest.title) as courseTitle,
                    GROUP_CONCAT(DISTINCT a.venue ORDER BY a.venue SEPARATOR ', ') as venue,
                    'Student' as role,
                    NULL as examinerRole
                FROM exam_draft_allocations a
                JOIN exam_timetables et ON a.exam_id = et.timetable_id
                JOIN exam_slots s ON et.timetable_id = s.timetable_id
                LEFT JOIN (
                    SELECT REPLACE(course_code, ' ', '') as norm_code, MAX(level) as level
                    FROM modules
                    GROUP BY REPLACE(course_code, ' ', '')
                ) ml ON REPLACE(et.course_code, ' ', '') = ml.norm_code
                CROSS JOIN (
                    SELECT academic_year as base_year FROM global_timetable_config LIMIT 1
                ) gtc
                LEFT JOIN (
                    SELECT REPLACE(course_code, ' ', '') as norm_code, academic_year, MAX(title) as title
                    FROM modules
                    GROUP BY REPLACE(course_code, ' ', ''), academic_year
                ) m_map ON REPLACE(et.course_code, ' ', '') = m_map.norm_code
                    AND m_map.academic_year = (
                        SELECT CONCAT(
                            CAST(SUBSTRING_INDEX(gtc.base_year, '/', 1) AS SIGNED) - (ml.level - 1),
                            '/',
                            CAST(SUBSTRING_INDEX(gtc.base_year, '/', -1) AS SIGNED) - (ml.level - 1)
                        )
                    )
                LEFT JOIN (
                    SELECT REPLACE(course_code, ' ', '') as norm_code, MAX(title) as title
                    FROM modules
                    GROUP BY REPLACE(course_code, ' ', '')
                ) m_latest ON REPLACE(et.course_code, ' ', '') = m_latest.norm_code
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
                GROUP BY 
                    a.exam_id, 
                    et.date, 
                    et.academic_year, 
                    s.start_time, 
                    et.course_code, 
                    m_map.title, 
                    m_latest.title
                ORDER BY et.date ASC, s.start_time ASC
        `;

        const [rows] = await pool.query(query, [userId, userId, userId, userId]);
        
        console.log("Personalized Timetable Rows:");
        rows.forEach(r => {
            console.log(`Course: ${r.courseUnit}, Date: ${r.date}, Venues: ${r.venue}`);
        });

        const multiVenueRows = rows.filter(r => r.venue.includes(','));
        if (multiVenueRows.length > 0) {
            console.log("\nSUCCESS: Found consolidated venues!");
            console.log(multiVenueRows);
        } else {
            console.log("\nFAILURE: No consolidated venues found. (Check if 'is_published_to_students' is 1 for both venues of exam 481)");
        }

    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

verify();
