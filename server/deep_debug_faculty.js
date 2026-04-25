const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');

(async () => {
    const logFile = 'deep_debug_faculty.log';
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync(logFile, (typeof msg === 'string' ? msg : JSON.stringify(msg, null, 2)) + '\n');
    };

    if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

    const pool = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ems_database'
    });

    try {
        log('--- Table Summary: exam_timetables ---');
        const [tt] = await pool.query('SELECT DISTINCT course_code, academic_year FROM exam_timetables');
        log(tt);

        log('\n--- Table Summary: modules ---');
        const [mods] = await pool.query('SELECT DISTINCT course_code, academic_year, title FROM modules');
        log(mods);

        log('\n--- Join Failure Analysis ---');
        const [missing] = await pool.query(`
            SELECT 
                et.course_code as tt_code, 
                et.academic_year as tt_year,
                (SELECT COUNT(*) FROM modules m WHERE REPLACE(m.course_code, ' ', '') = REPLACE(et.course_code, ' ', '')) as code_matches_any_year,
                (SELECT COUNT(*) FROM modules m WHERE REPLACE(m.course_code, ' ', '') = REPLACE(et.course_code, ' ', '') AND m.academic_year = et.academic_year) as direct_matches
            FROM exam_timetables et
            HAVING direct_matches = 0
            LIMIT 20
        `);
        log(missing);

        log('\n--- Allocation Submission Status ---');
        const [allocs] = await pool.query(`
            SELECT 
                a.alloc_id, 
                a.exam_id, 
                a.is_published, 
                a.is_submitted_to_faculty,
                et.course_code,
                et.academic_year
            FROM exam_draft_allocations a
            JOIN exam_timetables et ON a.exam_id = et.timetable_id
            ORDER BY a.alloc_id DESC
            LIMIT 20
        `);
        log(allocs);

        log('\n--- Search for specific codes (e.g., INTE41) ---');
        const [search] = await pool.query('SELECT course_code, academic_year FROM modules WHERE course_code LIKE "INTE%"');
        log(search);

    } catch (err) {
        log('ERROR: ' + err.message);
    } finally {
        await pool.end();
        log('\n--- Debugging session complete ---');
    }
})();
