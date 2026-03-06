const pool = require('./config/db');

async function testBatchRep() {
    try {
        const [rows] = await pool.query('SELECT u.user_id, u.role, sd.level, sd.student_number FROM users u JOIN student_details sd ON u.user_id = sd.user_id WHERE u.role IN ("Student", "BatchRep")');
        console.log("Users in student_details:");
        console.table(rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
testBatchRep();
