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
        console.log('--- Table: exam_draft_attendants (Recent 10) ---');
        const [att] = await pool.query('SELECT * FROM exam_draft_attendants ORDER BY id DESC LIMIT 10');
        console.table(att);

        console.log('\n--- Checking for Orphan Attendants (No matching alloc_id in allocations) ---');
        const [orphans] = await pool.query(`
            SELECT ea.alloc_id, COUNT(*) as count 
            FROM exam_draft_attendants ea 
            LEFT JOIN exam_draft_allocations a ON ea.alloc_id = a.alloc_id 
            WHERE a.alloc_id IS NULL 
            GROUP BY ea.alloc_id
        `);
        console.table(orphans);

        console.log('\n--- Checking a sample allocation response ---');
        // Simulate the logic in /faculty-attendant-allocations
        const [allocs] = await pool.query('SELECT alloc_id, exam_id FROM exam_draft_allocations WHERE is_submitted_to_faculty IN (1, 2) LIMIT 1');
        if (allocs.length > 0) {
            const allocId = allocs[0].alloc_id;
            const [attendants] = await pool.query(
                `SELECT ea.attendant_id, u.name FROM exam_draft_attendants ea JOIN users u ON ea.attendant_id = u.user_id WHERE ea.alloc_id = ?`,
                [allocId]
            );
            console.log(`Attendants for alloc_id ${allocId}:`, attendants);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
})();
