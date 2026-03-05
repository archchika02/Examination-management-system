const pool = require('./server/config/db');

async function debug() {
    try {
        console.log('--- Checking for Published Attendant Exams ---');
        // We don't have a specific attendantId here, so we'll look for all
        const query = `
            SELECT 
                eda.attendant_id,
                a.alloc_id as id,
                a.exam_id,
                et.date,
                s.start_time,
                s.end_time,
                u_sup.name as supervisorName
            FROM exam_draft_attendants eda
            JOIN exam_draft_allocations a ON eda.alloc_id = a.alloc_id
            JOIN exam_timetables et ON a.exam_id = et.timetable_id
            LEFT JOIN exam_slots s ON et.timetable_id = s.timetable_id
            LEFT JOIN users u_sup ON a.supervisor_id = u_sup.user_id
            WHERE eda.is_published = 1
            LIMIT 10
        `;
        const [rows] = await pool.query(query);
        console.table(rows);

        if (rows.length === 0) {
            console.log('No published attendant exams found. Checking all allocations...');
            const [allAllocs] = await pool.query('SELECT alloc_id, exam_id, venue, supervisor_id FROM exam_draft_allocations LIMIT 5');
            console.table(allAllocs);

            const [allSlots] = await pool.query('SELECT timetable_id, start_time, end_time FROM exam_slots LIMIT 5');
            console.table(allSlots);
        }

    } catch (err) {
        console.error('Error during debug:', err);
    } finally {
        process.exit();
    }
}

debug();
