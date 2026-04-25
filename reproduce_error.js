const mysql = require('mysql2/promise');

async function testQuery() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'A09rChChIkA27',
        database: 'ems_database'
    });

    const level = '1';
    const params = [level, level, level];

    const query = `
        WITH AllEnrollments AS (
            SELECT 
                h.user_id, 
                sd.student_number, 
                h.student_name, 
                sd.level,
                rcu.course_code
            FROM course_unit_registration_headers h
            JOIN registered_course_units rcu ON h.id = rcu.header_id
            JOIN student_details sd ON h.user_id = sd.user_id
            WHERE h.status = 'Approved' AND sd.level = ?

            UNION DISTINCT

            SELECT 
                h.user_id, 
                sd.student_number, 
                h.student_name, 
                sd.level,
                arc.course_code
            FROM add_drop_request_headers h
            JOIN add_drop_requested_courses arc ON h.id = arc.header_id
            JOIN student_details sd ON h.user_id = sd.user_id
            WHERE h.status = 'Approved' AND arc.action = 'Add' AND sd.level = ?
        ),
        ExcludedEnrollments AS (
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
            AND EXISTS (
                SELECT 1 FROM batch_configurations bc 
                WHERE REPLACE(bc.course_code, ' ', '') = REPLACE(e.course_code, ' ', '')
            )
        )
        SELECT 
            fe.user_id,
            fe.student_number,
            fe.student_name,
            fe.level,
            fe.course_code,
            c.title as course_title,
            DATE_FORMAT(et.date, '%W, %e %M, %Y') as exam_date,
            CONCAT(DATE_FORMAT(s.start_time, '%l:%i %p'), ' - ', DATE_FORMAT(s.end_time, '%l:%i %p')) as start_time,
            GROUP_CONCAT(DISTINCT da.venue ORDER BY da.venue SEPARATOR ', ') as venues,
            et.academic_year
        FROM FinalEnrollments fe
        LEFT JOIN modules c ON REPLACE(fe.course_code, ' ', '') = REPLACE(c.course_code, ' ', '') AND et.academic_year = c.academic_year
        LEFT JOIN exam_timetables et ON REPLACE(fe.course_code, ' ', '') = REPLACE(et.course_code, ' ', '')
        LEFT JOIN exam_slots s ON et.timetable_id = s.timetable_id
        LEFT JOIN exam_draft_allocations da ON et.timetable_id = da.exam_id AND da.is_published = 1
        GROUP BY 
            fe.user_id, 
            fe.student_number, 
            fe.student_name, 
            fe.level, 
            fe.course_code, 
            c.title,
            et.academic_year,
            et.date, 
            s.start_time,
            s.end_time
        ORDER BY fe.student_number, et.date, s.start_time, s.end_time
    `;

    try {
        console.log('Running test query...');
        await connection.query(query, params);
        console.log('Query successful (unexpectedly)!');
    } catch (error) {
        console.error('Query failed as expected:');
        console.error(error.message);
    } finally {
        await connection.end();
    }
}

testQuery();
