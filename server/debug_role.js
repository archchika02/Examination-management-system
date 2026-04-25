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
        const [rows] = await pool.query("SELECT user_id, name, role FROM users WHERE role = 'FacultyStaff'");
        console.log('FACULTY_STAFF_USERS:');
        console.log(JSON.stringify(rows, null, 2));

        const [rows2] = await pool.query("SELECT user_id, name, role FROM users WHERE role = 'Faculty'");
        console.log('FACULTY_USERS:');
        console.log(JSON.stringify(rows2, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
})();
