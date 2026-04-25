const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
    const pool = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'examination_management'
    });
    try {
        console.log('--- Valid Exam IDs ---');
        const [rows] = await pool.query('SELECT timetable_id FROM exam_timetables LIMIT 10');
        console.log(rows);

        console.log('\n--- Table Structure: exam_draft_allocations ---');
        const [createTable] = await pool.query('SHOW CREATE TABLE exam_draft_allocations');
        console.log(createTable[0]['Create Table']);
        
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
})();
