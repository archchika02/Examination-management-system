const pool = require('./config/db');

async function debug() {
    try {
        console.log('--- 1. Table Schema Check ---');
        const [etCols] = await pool.query('DESCRIBE exam_timetables');
        const [esCols] = await pool.query('DESCRIBE exam_slots');
        const [edaCols] = await pool.query('DESCRIBE exam_draft_allocations');

        console.log('exam_timetables:', etCols.map(c => c.Field).join(', '));
        console.log('exam_slots:', esCols.map(c => c.Field).join(', '));
        console.log('exam_draft_allocations:', edaCols.map(c => c.Field).join(', '));

        console.log('\n--- 2. Checking INTE 21213 specifically ---');
        const [et] = await pool.query("SELECT * FROM exam_timetables WHERE course_code LIKE '%INTE 21213%'");
        console.log('Timetable Data:', JSON.stringify(et, null, 2));

        if (et.length > 0) {
            const tId = et[0].timetable_id;
            const cCode = et[0].course_code;

            console.log(`\n--- Searching Slots for Timetable ID: ${tId} ---`);
            const [slotsById] = await pool.query("SELECT * FROM exam_slots WHERE timetable_id = ?", [tId]);
            console.log('Slots by ID:', JSON.stringify(slotsById, null, 2));

            console.log(`\n--- Searching Slots for Course Code: ${cCode} ---`);
            const [slotsByCode] = await pool.query("SELECT * FROM exam_slots WHERE course_code = ?", [cCode]);
            console.log('Slots by Code:', JSON.stringify(slotsByCode, null, 2));

            console.log(`\n--- Searching Allocations for Exam ID: ${tId} ---`);
            const [allocs] = await pool.query("SELECT * FROM exam_draft_allocations WHERE exam_id = ?", [tId]);
            console.log('Allocations:', JSON.stringify(allocs, null, 2));
        }

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

debug();
