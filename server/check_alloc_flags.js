const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
    const pool = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ems_database'
    });
    try {
        const [rows] = await pool.query('SELECT alloc_id, exam_id, is_published, is_submitted_to_faculty FROM exam_draft_allocations LIMIT 20');
        console.log('--- Allocations Status ---');
        console.log(JSON.stringify(rows, null, 2));

        const [counts] = await pool.query('SELECT is_published, is_submitted_to_faculty, COUNT(*) as count FROM exam_draft_allocations GROUP BY is_published, is_submitted_to_faculty');
        console.log('\n--- Summary Counts ---');
        console.log(JSON.stringify(counts, null, 2));
        
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
})();
