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
        console.log('Testing bulk insert simulation...');
        const alloc_id = 999999; // Dummy ID
        const attendantIds = [1, 2, 3];
        const uniqueIds = [...new Set(attendantIds)];
        const values = uniqueIds.map(id => [alloc_id, id]);
        
        // Try bulk insert
        const [result] = await pool.query('INSERT INTO exam_draft_attendants (alloc_id, attendant_id) VALUES ?', [values]);
        console.log('Insert success:', result);

        // Cleanup
        await pool.query('DELETE FROM exam_draft_attendants WHERE alloc_id = ?', [alloc_id]);
        console.log('Cleanup success');

    } catch (err) {
        console.error('SIMULATION ERROR:', err);
    } finally {
        await pool.end();
    }
})();
