const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function checkData() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'A09rChChIkA27',
        database: process.env.DB_NAME || 'ems_database'
    });

    try {
        const [rows] = await pool.execute('SELECT course_code, level, academic_year, non_written_type FROM modules LIMIT 10');
        console.log('Sample Modules:');
        console.table(rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkData();
