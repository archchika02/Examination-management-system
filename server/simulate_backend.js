const pool = require('./config/db');

async function debug() {
    try {
        console.log('--- Finding a Hall Attendant with Published Exams ---');
        const [ha] = await pool.query(`
            SELECT DISTINCT eda.attendant_id, u.name
            FROM exam_draft_attendants eda
            JOIN users u ON eda.attendant_id = u.user_id
            WHERE eda.is_published = 1
            LIMIT 1
        `);

        if (ha.length === 0) {
            console.log('No Hall Attendants with published exams found.');
            return;
        }

        const attendantId = ha[0].attendant_id;
        console.log(`Testing with Attendant ID: ${attendantId} (${ha[0].name})`);

        const query = `
            SELECT 
                a.alloc_id as id,
                a.exam_id,
                et.academic_year as academicYear,
                DATE_FORMAT(et.date, '%d/%m/%Y') as date,
                TIME_FORMAT(s.start_time, '%h:%i %p') AS startTime,
                TIME_FORMAT(s.end_time, '%h:%i %p') AS endTime,
                FLOOR(TIME_TO_SEC(TIMEDIFF(s.end_time, s.start_time)) / 60) as durationMinutes,
                CONCAT(et.course_code, ' - ', IFNULL(c.title, 'No Title')) as courseUnit,
                a.venue,
                u_sup.name as supervisorName
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

        const [rows] = await pool.query(query, [attendantId]);
        console.log('--- Backend Query Result (JSON) ---');
        console.log(JSON.stringify(rows, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

debug();
