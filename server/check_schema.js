const pool = require('./config/db');

async function checkSchema() {
    try {
        const [rows] = await pool.query('DESCRIBE exam_timetables');
        console.log('exam_timetables:', rows.map(r => r.Field));
    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
}

checkSchema();
