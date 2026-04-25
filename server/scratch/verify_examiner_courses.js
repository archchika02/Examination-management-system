const pool = require('../config/db');

async function verify() {
    try {
        const [gc] = await pool.query('SELECT academic_year FROM global_timetable_config LIMIT 1');
        const baseYear = gc[0].academic_year;
        console.log("Base Academic Year:", baseYear);

        // Find a user who is an examiner
        const [users] = await pool.query('SELECT DISTINCT user_id FROM examiner_appointments WHERE status = "Active" LIMIT 5');
        
        for (const u of users) {
             const userId = u.user_id;
             console.log(`\nTesting for User ID: ${userId}`);

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
                AND ea.academic_year = m.academic_year
                ORDER BY ea.course_code ASC
            `;

            const [results] = await pool.query(query, [userId]);
            if (results.length > 0) {
                console.log(`Found ${results.length} valid modules:`);
                results.forEach(r => {
                    const firstDigit = r.course_code.match(/\d/)[0];
                    console.log(` - ${r.course_code} (Level ${firstDigit}) -> Assignment Year: ${r.ea_year}, Module Year: ${r.m_year}`);
                });
            } else {
                console.log("No valid modules found matching the level-year cycle.");
            }
        }

    } catch (e) {
        console.error("Verification Error:", e);
    } finally {
        process.exit(0);
    }
}

verify();
