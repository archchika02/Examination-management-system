const pool = require('./server/config/db');

async function debug() {
    try {
        const attendantId = 9;
        console.log(`--- Simulating Query for Attendant ID: ${attendantId} ---`);

        const query = `
            SELECT 
                a.alloc_id as id,
                a.exam_id,
                et.academic_year as academicYear,
                DATE_FORMAT(et.date, '%d/%m/%Y') as date,
                TIME_FORMAT(s.start_time, '%h:%i %p') AS startTime,
                TIME_FORMAT(s.end_time, '%h:%i %p') AS endTime,
                FLOOR(TIME_TO_SEC(TIMEDIFF(s.end_time, s.start_time)) / 60) as durationMinutes,
                CONCAT(TIME_FORMAT(s.start_time, '%h:%i %p'), ' - ', TIME_FORMAT(s.end_time, '%h:%i %p')) AS time,
                CONCAT(et.course_code, ' - ', IFNULL(c.title, 'No Title')) as courseUnit,
                a.venue,
                u_sup.name as supervisorName,
                MAX(eda.is_published) as is_published,
                (SELECT COUNT(*) FROM staff_concerns sc 
                 WHERE sc.alloc_id = a.alloc_id 
                 AND sc.staff_id = ? 
                 AND sc.status = 'Pending'
                 LIMIT 1) as has_pending_concern
            FROM exam_draft_attendants eda
            JOIN exam_draft_allocations a ON eda.alloc_id = a.alloc_id
            JOIN exam_timetables et ON a.exam_id = et.timetable_id
            LEFT JOIN exam_slots s ON et.timetable_id = s.timetable_id
            LEFT JOIN courses c ON REPLACE(et.course_code, ' ', '') = REPLACE(c.course_code, ' ', '')
            LEFT JOIN users u_sup ON a.supervisor_id = u_sup.user_id
            WHERE eda.attendant_id = ? AND eda.is_published = 1
            GROUP BY a.alloc_id, a.exam_id, et.date, et.academic_year, s.start_time, s.end_time, et.course_code, c.title, a.venue, u_sup.name
            ORDER BY et.date ASC, s.start_time ASC
        `;

        const [rows] = await pool.query(query, [attendantId, attendantId]);
        console.log('--- Result JSON ---');
        console.log(JSON.stringify(rows, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

debug();
