const pool = require('./config/db');

async function debug() {
    try {
        console.log('--- Diagnostic for INTE 21213 ---');
        const [et] = await pool.query("SELECT * FROM exam_timetables WHERE course_code LIKE '%INTE 21213%'");
        console.log('Timetables found:', et.length);
        console.table(et);

        if (et.length > 0) {
            const tId = et[0].timetable_id;
            console.log(`--- Slots for ID ${tId} ---`);
            const [slots] = await pool.query("SELECT * FROM exam_slots WHERE timetable_id = ?", [tId]);
            console.table(slots);

            console.log(`--- Allocations for ID ${tId} ---`);
            const [allocs] = await pool.query("SELECT * FROM exam_draft_allocations WHERE exam_id = ?", [tId]);
            console.table(allocs);

            if (allocs.length > 0) {
                const sId = allocs[0].supervisor_id;
                console.log(`--- Supervisor with ID ${sId} ---`);
                const [users] = await pool.query("SELECT user_id, name, role FROM users WHERE user_id = ?", [sId]);
                console.table(users);
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

debug();
