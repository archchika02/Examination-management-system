const pool = require('../config/db');

async function verify() {
    try {
        const userId = 14; 
        console.log(`Testing for User ID: ${userId} (Assigned to MGTE41252)`);

        const query = `
            SELECT DISTINCT ea.course_code, m.title as course_title, ea.academic_year as ea_year, m.academic_year as m_year
            FROM examiner_appointments ea
            CROSS JOIN (SELECT academic_year as base_year FROM global_timetable_config LIMIT 1) gtc
            JOIN modules m ON REPLACE(ea.course_code, ' ', '') = REPLACE(m.course_code, ' ', '')
            AND m.academic_year = (
                SELECT CONCAT(
                    CAST(SUBSTRING_INDEX(gtc.base_year, '/', 1) AS SIGNED) - (CAST(SUBSTRING(REGEXP_REPLACE(ea.course_code, '[^0-9]', ''), 1, 1) AS SIGNED) - 1),
                    '/',
                    CAST(SUBSTRING_INDEX(gtc.base_year, '/', -1) AS SIGNED) - (CAST(SUBSTRING(REGEXP_REPLACE(ea.course_code, '[^0-9]', ''), 1, 1) AS SIGNED) - 1)
                )
            )
            WHERE ea.user_id = ? 
            AND ea.status = 'Active'
            ORDER BY ea.course_code ASC
        `;

        const [results] = await pool.query(query, [userId]);
        if (results.length > 0) {
            console.log(`Found ${results.length} valid modules:`);
            results.forEach(r => {
                console.log(` - ${r.course_code} -> Assignment Year: ${r.ea_year}, Module Year: ${r.m_year}`);
            });
            const hasTarget = results.some(r => r.course_code === 'MGTE41252');
            console.log("\nMGTE41252 found in results:", hasTarget);
        } else {
            console.log("No valid modules found.");
        }

    } catch (e) {
        console.error("Verification Error:", e);
    } finally {
        process.exit(0);
    }
}

verify();
