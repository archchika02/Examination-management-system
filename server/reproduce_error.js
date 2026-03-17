const pool = require('./config/db');

async function testQuery() {
    const level = '1';
    
    const queries = [
        {
            name: 'Academic',
            params: [level, level, level],
            sql: `
                WITH AllEnrollments AS (
                    SELECT h.user_id, sd.student_number, h.student_name, sd.level, rcu.course_code, h.academic_year
                    FROM course_unit_registration_headers h
                    JOIN registered_course_units rcu ON h.id = rcu.header_id
                    JOIN student_details sd ON h.user_id = sd.user_id
                    WHERE h.status = 'Approved' AND sd.level = ?
                    UNION DISTINCT
                    SELECT h.user_id, sd.student_number, h.student_name, sd.level, arc.course_code, h.academic_year
                    FROM add_drop_request_headers h
                    JOIN add_drop_requested_courses arc ON h.id = arc.header_id
                    JOIN student_details sd ON h.user_id = sd.user_id
                    WHERE h.status = 'Approved' AND arc.action = 'Add' AND sd.level = ?
                ),
                ExcludedEnrollments AS (
                    SELECT h.user_id, arc.course_code
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
                    fe.user_id, fe.student_number, fe.student_name, fe.level, fe.course_code,
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
                    fe.user_id, fe.student_number, fe.student_name, fe.level, fe.course_code, 
                    et.academic_year, et.date, s.start_time, s.end_time
                ORDER BY fe.student_number, et.date, s.start_time, s.end_time
            `
        },
        {
            name: 'Medical',
            params: [level],
            sql: `
                SELECT 
                    h.user_id, h.student_number, h.student_name, sd.level, mrc.course_code,
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
                    h.user_id, h.student_number, h.student_name, sd.level, mrc.course_code, 
                    et.academic_year, et.date, s.start_time, s.end_time
                ORDER BY h.student_number, et.date, s.start_time, s.end_time
            `
        }
    ];

    for (const q of queries) {
        try {
            console.log(`Running test query for ${q.name}...`);
            await pool.query(q.sql, q.params);
            console.log(`Query ${q.name} successful!`);
        } catch (error) {
            console.error(`Query ${q.name} failed:`);
            console.error(error.message);
        }
    }
    process.exit();
}

testQuery();
