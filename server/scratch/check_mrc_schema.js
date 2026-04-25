const pool = require('../config/db');

async function checkSchema() {
    try {
        console.log('--- Checking Schema: medical_repeat_requested_courses ---');
        const [columns] = await pool.query('DESCRIBE medical_repeat_requested_courses');
        console.table(columns);
    } catch (error) {
        console.error('Error during schema check:', error);
    } finally {
        process.exit();
    }
}

checkSchema();
