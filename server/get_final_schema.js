const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');

(async () => {
    const pool = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'examination_management'
    });
    try {
        const [rows] = await pool.query('DESCRIBE exam_draft_attendants');
        fs.writeFileSync('att_schema_final.json', JSON.stringify(rows, null, 2));
        console.log('Schema written to att_schema_final.json');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
})();
