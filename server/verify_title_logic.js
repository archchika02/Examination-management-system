const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
    const pool = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const testCodes = ['CSC2101', 'INTE21333', 'INTE21313', 'NONEXISTENT123'];
    
    console.log('--- Verifying Module Title Logic ---');

    for (const code of testCodes) {
        const query = `
            SELECT 
                et.course_code, 
                COALESCE(m_map.title, m_latest.title, 'No Title') as courseTitle,
                ml.level,
                m_map.academic_year as mappedYear,
                m_latest.academic_year as latestYear
            FROM (SELECT ? as course_code) et
            LEFT JOIN (
                SELECT course_code, MAX(level) as level
                FROM modules
                GROUP BY course_code
            ) ml ON REPLACE(et.course_code, ' ', '') = REPLACE(ml.course_code, ' ', '')
            CROSS JOIN (
                SELECT academic_year as base_year FROM global_timetable_config LIMIT 1
            ) gtc
            LEFT JOIN modules m_map ON REPLACE(et.course_code, ' ', '') = REPLACE(m_map.course_code, ' ', '')
                AND m_map.academic_year = (
                    SELECT CONCAT(
                        CAST(SUBSTRING_INDEX(gtc.base_year, '/', 1) AS SIGNED) - (COALESCE(ml.level, 1) - 1),
                        '/',
                        CAST(SUBSTRING_INDEX(gtc.base_year, '/', -1) AS SIGNED) - (COALESCE(ml.level, 1) - 1)
                    )
                )
            LEFT JOIN (
                SELECT m1.course_code, m1.title, m1.academic_year
                FROM modules m1
                WHERE m1.academic_year = (SELECT MAX(m2.academic_year) FROM modules m2 WHERE REPLACE(m2.course_code, ' ', '') = REPLACE(m1.course_code, ' ', ''))
            ) m_latest ON REPLACE(et.course_code, ' ', '') = REPLACE(m_latest.course_code, ' ', '')
        `;

        const [rows] = await pool.query(query, [code]);
        const row = rows[0];
        console.log(`Course: ${code}`);
        console.log(`  Title: ${row.courseTitle}`);
        console.log(`  Level: ${row.level || 'N/A'}`);
        console.log(`  Mapped Year: ${row.mappedYear || 'N/A'}`);
        console.log(`  Latest Year: ${row.latestYear || 'N/A'}`);
        console.log('-----------------------------------');
    }

    await pool.end();
})();
