const pool = require('../config/db');

async function verifyPriorityLogic() {
    const testCourseCodes = ['INTE 11213', 'INTE 21213', 'MGTE 31222'];
    
    console.log('--- Verifying Priority Title Logic ---');
    
    try {
        // Get base year
        const [gtc] = await pool.query('SELECT academic_year as base_year FROM global_timetable_config LIMIT 1');
        const baseYear = gtc[0].base_year;
        console.log(`Base Academic Year: ${baseYear}`);

        for (const code of testCourseCodes) {
            const [rows] = await pool.query(`
                SELECT 
                    ? as input_code,
                    COALESCE(m_medical.course_title, m_target.title, 'Unknown Title') as resolved_title,
                    CASE 
                        WHEN m_medical.course_title IS NOT NULL THEN 'From Medical/Repeat'
                        WHEN m_target.title IS NOT NULL THEN 'From Modules (Leveled)'
                        ELSE 'Fallback'
                    END as source
                FROM (SELECT 1) dummy
                LEFT JOIN (
                    SELECT mrc.course_code, MAX(mrc.course_title) as course_title
                    FROM medical_repeat_requested_courses mrc
                    JOIN medical_repeat_request_headers h ON mrc.header_id = h.id
                    WHERE h.status = 'Approved'
                      AND h.academic_year = ?
                    GROUP BY mrc.course_code
                ) m_medical ON REPLACE(?, ' ', '') = REPLACE(m_medical.course_code, ' ', '')
                LEFT JOIN modules m_target ON REPLACE(?, ' ', '') = REPLACE(m_target.course_code, ' ', '')
                AND m_target.academic_year = (
                    SELECT CONCAT(
                        CAST(SUBSTRING_INDEX(?, '/', 1) AS SIGNED) - (CAST(SUBSTRING(REGEXP_REPLACE(?, '[^0-9]', ''), 1, 1) AS SIGNED) - 1),
                        '/',
                        CAST(SUBSTRING_INDEX(?, '/', -1) AS SIGNED) - (CAST(SUBSTRING(REGEXP_REPLACE(?, '[^0-9]', ''), 1, 1) AS SIGNED) - 1)
                    )
                )
            `, [code, baseYear, code, code, baseYear, code, baseYear, code]);
            
            console.log(`Code: ${code}`);
            console.log(`  Source: ${rows[0].source}`);
            console.log(`  Resolved Title: ${rows[0].resolved_title}`);
            console.log('---------------------------');
        }
    } catch (error) {
        console.error('Error during verification:', error);
    } finally {
        process.exit();
    }
}

verifyPriorityLogic();
