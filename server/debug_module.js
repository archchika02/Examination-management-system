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
        const [rows] = await pool.query("SELECT course_code, academic_year FROM modules WHERE course_code LIKE 'MGTE%'");
        console.log(rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
})();
