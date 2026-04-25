const pool = require('./config/db');
async function test() {
    const c = await pool.getConnection();
    try {
        const [rows] = await c.query('SHOW COLUMNS FROM batch_configurations LIKE "status"');
        console.log("Exam timetables foreign keys:", rows);
    } catch(e) {
        console.log(e);
    } finally {
        c.release();
        pool.end();
    }
}
test();
