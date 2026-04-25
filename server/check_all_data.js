const pool = require('./config/db');

async function debug() {
    try {
        console.log('--- Table Counts ---');
        const [etCount] = await pool.query('SELECT COUNT(*) as count FROM exam_timetables');
        const [esCount] = await pool.query('SELECT COUNT(*) as count FROM exam_slots');
        const [edaCount] = await pool.query('SELECT COUNT(*) as count FROM exam_draft_allocations');
        const [edAttCount] = await pool.query('SELECT COUNT(*) as count FROM exam_draft_attendants');
        const [uCount] = await pool.query('SELECT COUNT(*) as count FROM users');
        console.log(`Timetables: ${etCount[0].count}, Slots: ${esCount[0].count}, Allocs: ${edaCount[0].count}, Attendants: ${edAttCount[0].count}, Users: ${uCount[0].count}`);

        console.log('\n--- Sample Exam Slots ---');
        const [slots] = await pool.query('SELECT * FROM exam_slots LIMIT 5');
        console.log(JSON.stringify(slots, null, 2));

        console.log('\n--- Sample Allocations with Supervisors ---');
        const [allocs] = await pool.query('SELECT alloc_id, exam_id, supervisor_id FROM exam_draft_allocations WHERE supervisor_id IS NOT NULL LIMIT 5');
        console.log(JSON.stringify(allocs, null, 2));

        console.log('\n--- Checking for Matches between Timetables and Slots ---');
        const [matches] = await pool.query(`
            SELECT et.timetable_id, et.course_code, COUNT(s.slot_id) as slot_count
            FROM exam_timetables et
            LEFT JOIN exam_slots s ON et.timetable_id = s.timetable_id
            GROUP BY et.timetable_id
            HAVING slot_count > 0
            LIMIT 5
        `);
        console.table(matches);

        console.log('\n--- Checking for Published Attendant Exams Joining Status ---');
        const [joined] = await pool.query(`
            SELECT 
                eda.attendant_id,
                a.alloc_id,
                et.course_code,
                s.start_time,
                u_sup.name as supervisorName
            FROM exam_draft_attendants eda
            JOIN exam_draft_allocations a ON eda.alloc_id = a.alloc_id
            JOIN exam_timetables et ON a.exam_id = et.timetable_id
            LEFT JOIN exam_slots s ON et.timetable_id = s.timetable_id
            LEFT JOIN users u_sup ON a.supervisor_id = u_sup.user_id
            WHERE eda.is_published = 1
            LIMIT 5
        `);
        console.log(JSON.stringify(joined, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

debug();
