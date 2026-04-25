const pool = require('./config/db');

async function checkSchema() {
    try {
        const [rows] = await pool.query('DESCRIBE exam_slots');
        console.log('exam_slots fields:', rows.map(r => r.Field));
    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
}

checkSchema();
