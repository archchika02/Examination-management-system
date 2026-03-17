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
        const [rows] = await pool.query('DESCRIBE activities');
        console.log('ACTIVITIES_SCHEMA:');
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
})();
