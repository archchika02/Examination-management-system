const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
    const pool = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ems_database'
    });
    try {
        console.log('--- Checking is_submitted_to_faculty status ---');
        const [subStatus] = await pool.query('SELECT is_published, is_submitted_to_faculty, COUNT(*) as count FROM exam_draft_allocations GROUP BY is_published, is_submitted_to_faculty');
        console.log(JSON.stringify(subStatus, null, 2));

        console.log('\n--- Checking for missing titles ---');
        const [missingTitles] = await pool.query(`
            SELECT DISTINCT et.course_code, et.academic_year
            FROM exam_draft_allocations a
            JOIN exam_timetables et ON a.exam_id = et.timetable_id
            LEFT JOIN modules c ON REPLACE(et.course_code, ' ', '') = REPLACE(c.course_code, ' ', '') AND et.academic_year = c.academic_year
            WHERE a.is_submitted_to_faculty = 1 AND c.title IS NULL
        `);
        console.log('Exams with missing titles:', JSON.stringify(missingTitles, null, 2));

        console.log('\n--- Checking modules table for one of the missing codes (if any) ---');
        if (missingTitles.length > 0) {
            const code = missingTitles[0].course_code;
            const [modInfo] = await pool.query('SELECT course_code, academic_year, title FROM modules WHERE REPLACE(course_code, " ", "") = REPLACE(?, " ", "")', [code]);
            console.log(`Modules matching ${code}:`, JSON.stringify(modInfo, null, 2));
        }

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
})();
