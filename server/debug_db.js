const pool = require('./server/config/db');

async function debug() {
    try {
        console.log('--- Exam Timetables ---');
        const [timetables] = await pool.query('SELECT * FROM exam_timetables LIMIT 5');
        console.table(timetables);

        console.log('--- Exam Slots ---');
        const [slots] = await pool.query('SELECT * FROM exam_slots LIMIT 5');
        console.table(slots);

        console.log('--- Exam Draft Allocations ---');
        const [allocs] = await pool.query('SELECT * FROM exam_draft_allocations LIMIT 5');
        console.table(allocs);

        console.log('--- Users ---');
        const [users] = await pool.query('SELECT user_id, name, role FROM users LIMIT 5');
        console.table(users);

        console.log('--- Joined Data Check ---');
        const query = `
            SELECT 
                a.alloc_id,
                et.timetable_id,
                et.course_code,
                s.start_time,
                s.end_time,
                a.supervisor_id
            FROM exam_draft_allocations a
            JOIN exam_timetables et ON a.exam_id = et.timetable_id
            LEFT JOIN exam_slots s ON et.timetable_id = s.timetable_id
            LIMIT 5
        `;
        const [joined] = await pool.query(query);
        console.table(joined);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

debug();
