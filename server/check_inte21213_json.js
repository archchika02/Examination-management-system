const pool = require('./config/db');

async function debug() {
    try {
        const [et] = await pool.query("SELECT * FROM exam_timetables WHERE course_code LIKE '%INTE 21213%'");
        if (et.length > 0) {
            const tId = et[0].timetable_id;
            const [slots] = await pool.query("SELECT * FROM exam_slots WHERE timetable_id = ?", [tId]);
            const [allocs] = await pool.query("SELECT * FROM exam_draft_allocations WHERE exam_id = ?", [tId]);

            console.log('--- Timetable ---');
            console.log(JSON.stringify(et, null, 2));
            console.log('--- Slots ---');
            console.log(JSON.stringify(slots, null, 2));
            console.log('--- Allocations ---');
            console.log(JSON.stringify(allocs, null, 2));

            if (allocs.length > 0) {
                const sId = allocs[0].supervisor_id;
                if (sId) {
                    const [users] = await pool.query("SELECT user_id, name, role FROM users WHERE user_id = ?", [sId]);
                    console.log('--- Supervisor ---');
                    console.log(JSON.stringify(users, null, 2));
                }
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

debug();
