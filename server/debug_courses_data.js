const mysql = require('mysql2/promise');
const fs = require('fs');

async function debug() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'A09rChChIkA27',
        database: 'ems_database',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        console.log('--- courses data sample ---');
        const [rows] = await pool.query('SELECT course_code, title FROM courses LIMIT 20');
        fs.writeFileSync('courses_data.json', JSON.stringify(rows, null, 2), 'utf8');

    } catch (error) {
        console.error('Debug Error:', error);
    } finally {
        await pool.end();
    }
}

debug();
