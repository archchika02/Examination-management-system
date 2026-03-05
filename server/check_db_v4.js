const pool = require('./config/db');

async function debug() {
    try {
        const query = `
            SELECT 
                eda.attendant_id,
                a.alloc_id as id,
                a.exam_id,
                et.course_code,
                et.academic_year,
                a.supervisor_id
            FROM exam_draft_attendants eda
            JOIN exam_draft_allocations a ON eda.alloc_id = a.alloc_id
            JOIN exam_timetables et ON a.exam_id = et.timetable_id
            WHERE eda.is_published = 1
            LIMIT 10
        `;
        const [rows] = await pool.query(query);
        console.log('--- Published Attendant Exams ---');
        console.log(JSON.stringify(rows, null, 2));

        if (rows.length > 0) {
            const tIds = rows.map(r => r.exam_id);
            const [slots] = await pool.query('SELECT * FROM exam_slots WHERE timetable_id IN (?)', [tIds]);
            console.log('--- Exam Slots for these Timetables ---');
            console.log(JSON.stringify(slots, null, 2));

            const sIds = rows.map(r => r.supervisor_id).filter(id => id);
            if (sIds.length > 0) {
                const [users] = await pool.query('SELECT user_id, name FROM users WHERE user_id IN (?)', [sIds]);
                console.log('--- Supervisors ---');
                console.log(JSON.stringify(users, null, 2));
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

debug();
