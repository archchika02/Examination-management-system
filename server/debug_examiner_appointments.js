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

    let output = '';
    const log = (msg) => {
        console.log(msg);
        output += msg + '\n';
    };

    try {
        log('--- examiner_appointments table structure ---');
        const [columns] = await pool.query('DESCRIBE examiner_appointments');
        output += JSON.stringify(columns, null, 2) + '\n';

        log('\n--- Sample data from examiner_appointments ---');
        const [rows] = await pool.query('SELECT * FROM examiner_appointments LIMIT 50');
        output += JSON.stringify(rows, null, 2) + '\n';

        log('\n--- examiner_roles in table ---');
        const [roles] = await pool.query('SELECT DISTINCT examiner_role FROM examiner_appointments');
        output += JSON.stringify(roles, null, 2) + '\n';

        log('\n--- status in table ---');
        const [status] = await pool.query('SELECT DISTINCT status FROM examiner_appointments');
        output += JSON.stringify(status, null, 2) + '\n';

        log('\n--- users table sample ---');
        const [users] = await pool.query('SELECT user_id, name, role FROM users LIMIT 50');
        output += JSON.stringify(users, null, 2) + '\n';

        fs.writeFileSync('debug_output_utf8.json', output, 'utf8');
        console.log('Output written to debug_output_utf8.json');

    } catch (error) {
        console.error('Debug Error:', error);
    } finally {
        await pool.end();
    }
}

debug();
