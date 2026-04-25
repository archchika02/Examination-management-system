const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'examination_management_system'
    });
    try {
        const [rows] = await pool.query('SELECT user_id, email, name, role FROM users WHERE role LIKE "%upervisor" OR email = "wevaw72949@gxuzi.com"');
        console.log("Supervisors found in DB:");
        console.log(rows);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
