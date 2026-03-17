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
        console.log('--- Investigating missing course titles in attendant-published-exams ---');
        
        const query = `
            SELECT 
                et.timetable_id,
                et.course_code as et_code,
                et.academic_year as et_year,
                c.course_code as m_code,
                c.academic_year as m_year,
                c.title
            FROM exam_timetables et
            LEFT JOIN modules c ON REPLACE(et.course_code, ' ', '') = REPLACE(c.course_code, ' ', '') 
                AND REPLACE(et.academic_year, ' ', '') = REPLACE(c.academic_year, ' ', '')
            WHERE c.title IS NULL
            LIMIT 20
        `;
        
        const [results] = await pool.query(query);
        console.log('Records with missing titles (with strict year match):');
        console.log(JSON.stringify(results, null, 2));

        if (results.length > 0) {
            console.log('\n--- Checking for same course code in different years ---');
            for (const row of results) {
                const [alternatives] = await pool.query(
                    'SELECT academic_year, title FROM modules WHERE REPLACE(course_code, " ", "") = REPLACE(?, " ", "")',
                    [row.et_code]
                );
                console.log(`Course: ${row.et_code}, Wanted Year: ${row.et_year}`);
                if (alternatives.length > 0) {
                    console.log('Available in modules table:');
                    console.log(JSON.stringify(alternatives, null, 2));
                } else {
                    console.log('NOT FOUND in modules table at all!');
                }
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
})();
