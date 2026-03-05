const pool = require('./config/db');

async function debug() {
    try {
        console.log('--- Checking ALL published allocations for supervisors and times ---');
        const [rows] = await pool.query(`
            SELECT 
                a.alloc_id, a.supervisor_id, a.exam_id,
                et.course_code,
                s.start_time, s.end_time
            FROM exam_draft_allocations a
            JOIN exam_timetables et ON a.exam_id = et.timetable_id
            LEFT JOIN exam_slots s ON et.timetable_id = s.timetable_id
            WHERE EXISTS (SELECT 1 FROM exam_draft_attendants eda WHERE eda.alloc_id = a.alloc_id AND eda.is_published = 1)
            LIMIT 20
        `);

        console.log('Sample Data (JSON):');
        console.log(JSON.stringify(rows, null, 2));

        const supervisors = rows.map(r => r.supervisor_id).filter(id => id);
        console.log('Found Supervisor IDs:', supervisors);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

debug();
