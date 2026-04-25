const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config({ path: './server/.env' });

async function debug() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'ems_database'
        });

        console.log('--- Checking for Published Attendant Exams ---');
        const query = `
            SELECT 
                eda.attendant_id,
                a.alloc_id as id,
                a.exam_id,
                et.date,
                et.course_code,
                a.venue,
                a.supervisor_id
            FROM exam_draft_attendants eda
            JOIN exam_draft_allocations a ON eda.alloc_id = a.alloc_id
            JOIN exam_timetables et ON a.exam_id = et.timetable_id
            WHERE eda.is_published = 1
            LIMIT 10
        `;
        const [rows] = await connection.execute(query);
        console.table(rows);

        if (rows.length > 0) {
            const examId = rows[0].exam_id;
            console.log(`--- Checking slots for exam_id: ${examId} ---`);
            const [slots] = await connection.execute('SELECT * FROM exam_slots WHERE timetable_id = ?', [examId]);
            console.table(slots);

            const supervisorId = rows[0].supervisor_id;
            if (supervisorId) {
                console.log(`--- Checking user for supervisor_id: ${supervisorId} ---`);
                const [users] = await connection.execute('SELECT user_id, name, role FROM users WHERE user_id = ?', [supervisorId]);
                console.table(users);
            } else {
                console.log('No supervisor_id assigned to this allocation.');
            }
        }

    } catch (err) {
        console.error('Error during debug:', err);
    } finally {
        if (connection) await connection.end();
        process.exit();
    }
}

debug();
