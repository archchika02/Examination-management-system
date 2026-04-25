const pool = require('./server/config/db');

async function debug() {
    try {
        console.log('--- Checking for Published Attendant Exams ---');
        const query = `
            SELECT 
                eda.attendant_id,
                a.alloc_id as id,
                a.exam_id,
                et.course_code,
                et.academic_year,
                a.supervisor_id,
                u.name as attendantName
            FROM exam_draft_attendants eda
            JOIN exam_draft_allocations a ON eda.alloc_id = a.alloc_id
            JOIN exam_timetables et ON a.exam_id = et.timetable_id
            JOIN users u ON eda.attendant_id = u.user_id
            WHERE eda.is_published = 1
            LIMIT 5
        `;
        const [rows] = await pool.query(query);
        console.log('Published Exams Found:', rows.length);
        console.table(rows);

        if (rows.length > 0) {
            const timetableIds = rows.map(r => r.exam_id);
            console.log(`--- Checking slots for timetable_ids: ${timetableIds.join(', ')} ---`);
            const [slots] = await pool.query('SELECT * FROM exam_slots WHERE timetable_id IN (?)', [timetableIds]);
            console.table(slots);

            const supervisorIds = [...new Set(rows.map(r => r.supervisor_id).filter(id => id))];
            if (supervisorIds.length > 0) {
                console.log(`--- Checking users for supervisor_ids: ${supervisorIds.join(', ')} ---`);
                const [users] = await pool.query('SELECT user_id, name, role FROM users WHERE user_id IN (?)', [supervisorIds]);
                console.table(users);
            } else {
                console.log('No supervisor_ids assigned to these allocations.');
            }
        }

        console.log('--- Checking Users table for all Hall Attendants ---');
        const [ha] = await pool.query('SELECT user_id, name FROM users WHERE role = "HallAttendant" LIMIT 5');
        console.table(ha);

    } catch (err) {
        console.error('Error during debug:', err);
    } finally {
        process.exit();
    }
}

debug();
