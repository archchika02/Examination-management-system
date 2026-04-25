const pool = require('./config/db');

async function test() {
    try {
        const [invigs] = await pool.query('SELECT * FROM exam_draft_invigilators');
        console.log("Invigilators:", invigs);
        const [allocs] = await pool.query('SELECT alloc_id, exam_id FROM exam_draft_allocations');
        console.log("Allocations:", allocs);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
test();
