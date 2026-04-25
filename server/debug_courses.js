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
        console.log('--- courses table sample ---');
        const [courses] = await pool.query('SELECT course_code, course_title FROM courses LIMIT 50');
        fs.writeFileSync('courses_debug.json', JSON.stringify(courses, null, 2), 'utf8');
        console.log('Output written to courses_debug.json');

    } catch (error) {
        console.error('Debug Error:', error);
    } finally {
        await pool.end();
    }
}

debug();
