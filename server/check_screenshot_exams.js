const pool = require('./config/db');

async function debug() {
    try {
        const courseCodes = ['INTE 21213', 'inte 11213', 'inte22303', 'inte 21343', 'inte 12223', 'inte 22283'];
        console.log('--- Diagnostic for Screenshot Exams ---');

        for (const code of courseCodes) {
            console.log(`\n>> Checking: ${code}`);
            const cleanCode = code.replace(/\s+/g, '').toLowerCase();
            const [et] = await pool.query(
                "SELECT timetable_id, academic_year, course_code, date FROM exam_timetables WHERE REPLACE(course_code, ' ', '') = ?",
                [cleanCode]
            );

            if (et.length > 0) {
                const tId = et[0].timetable_id;
                console.log(`Found Timetable ID: ${tId}, Year: ${et[0].academic_year}, Date: ${et[0].date}`);

                const [slots] = await pool.query("SELECT start_time, end_time FROM exam_slots WHERE timetable_id = ?", [tId]);
                console.log(`Slots: ${JSON.stringify(slots)}`);

                const [allocs] = await pool.query("SELECT supervisor_id FROM exam_draft_allocations WHERE exam_id = ?", [tId]);
                if (allocs.length > 0) {
                    console.log(`Supervisor ID: ${allocs[0].supervisor_id}`);
                    if (allocs[0].supervisor_id) {
                        const [sup] = await pool.query("SELECT name FROM users WHERE user_id = ?", [allocs[0].supervisor_id]);
                        console.log(`Supervisor Name: ${sup.length > 0 ? sup[0].name : 'NOT FOUND'}`);
                    }
                } else {
                    console.log('No allocations found.');
                }
            } else {
                console.log('No timetable entry found.');
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

debug();
