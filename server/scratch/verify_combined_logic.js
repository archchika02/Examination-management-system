const pool = require('../config/db');

async function verify() {
    try {
        const [gc] = await pool.query('SELECT academic_year FROM global_timetable_config LIMIT 1');
        const baseYear = gc[0].academic_year;
        console.log("Base Academic Year:", baseYear);

        const testUsers = [18, 14]; // User 18 (Level 1/2), User 14 (Level 2/4)
        
        for (const userId of testUsers) {
             console.log(`\n--- Testing for User ID: ${userId} ---`);

             const query = `
                SELECT DISTINCT ea.course_code, 
                       COALESCE(m_cycle.title, m_base.title, m_latest.title) as course_title,
                       ea.academic_year as ea_year
                FROM examiner_appointments ea
                CROSS JOIN (SELECT academic_year as base_year FROM global_timetable_config LIMIT 1) gtc
                -- Match cycle year for title
                LEFT JOIN modules m_cycle ON REPLACE(ea.course_code, ' ', '') = REPLACE(m_cycle.course_code, ' ', '')
                AND m_cycle.academic_year = (
                    SELECT CONCAT(
                        CAST(SUBSTRING_INDEX(gtc.base_year, '/', 1) AS SIGNED) - (CAST(SUBSTRING(REGEXP_REPLACE(ea.course_code, '[^0-9]', ''), 1, 1) AS SIGNED) - 1),
                        '/',
                        CAST(SUBSTRING_INDEX(gtc.base_year, '/', -1) AS SIGNED) - (CAST(SUBSTRING(REGEXP_REPLACE(ea.course_code, '[^0-9]', ''), 1, 1) AS SIGNED) - 1)
                    )
                )
                -- Match base year for title
                LEFT JOIN modules m_base ON REPLACE(ea.course_code, ' ', '') = REPLACE(m_base.course_code, ' ', '')
                AND m_base.academic_year = gtc.base_year
                -- Fallback for latest title
                LEFT JOIN (
                    SELECT m1.course_code, m1.title
                    FROM modules m1
                    WHERE m1.academic_year = (SELECT MAX(m2.academic_year) FROM modules m2 WHERE REPLACE(m2.course_code, ' ', '') = REPLACE(m1.course_code, ' ', ''))
                ) m_latest ON REPLACE(ea.course_code, ' ', '') = REPLACE(m_latest.course_code, ' ', '')
                WHERE ea.user_id = ? 
                AND ea.status = 'Active'
                AND (
                    -- Option 1: Assignment matches the shifted cycle year
                    ea.academic_year = (
                        SELECT CONCAT(
                            CAST(SUBSTRING_INDEX(gtc.base_year, '/', 1) AS SIGNED) - (CAST(SUBSTRING(REGEXP_REPLACE(ea.course_code, '[^0-9]', ''), 1, 1) AS SIGNED) - 1),
                            '/',
                            CAST(SUBSTRING_INDEX(gtc.base_year, '/', -1) AS SIGNED) - (CAST(SUBSTRING(REGEXP_REPLACE(ea.course_code, '[^0-9]', ''), 1, 1) AS SIGNED) - 1)
                        )
                    )
                    OR
                    -- Option 2: Assignment matches the current base year
                    ea.academic_year = gtc.base_year
                )
                ORDER BY ea.course_code ASC
            `;

            const [results] = await pool.query(query, [userId]);
            if (results.length > 0) {
                console.log(`Found ${results.length} valid modules:`);
                results.forEach(r => {
                    console.log(` - ${r.course_code} | EA Year: ${r.ea_year} | Title: ${r.course_title}`);
                });
            } else {
                console.log("No valid modules found.");
            }
        }

    } catch (e) {
        console.error("Verification Error:", e);
    } finally {
        process.exit(0);
    }
}

verify();
