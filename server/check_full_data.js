const pool = require('./config/db');

async function run() {
    try {
        console.log('--- Comprehensive Data Check for Published Exams ---');
        const [rows] = await pool.query(`
            SELECT 
                eda.attendant_id,
                a.alloc_id,
                a.supervisor_id,
                et.timetable_id,
                et.academic_year,
                u_sup.name as supervisorName,
                (SELECT COUNT(*) FROM exam_slots WHERE timetable_id = et.timetable_id) as slot_count
            FROM exam_draft_attendants eda
            JOIN exam_draft_allocations a ON eda.alloc_id = a.alloc_id
            JOIN exam_timetables et ON a.exam_id = et.timetable_id
            LEFT JOIN users u_sup ON a.supervisor_id = u_sup.user_id
            WHERE eda.is_published = 1
        `);
        console.log(`Total Published Rows: ${rows.length}`);
        console.log(JSON.stringify(rows, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
