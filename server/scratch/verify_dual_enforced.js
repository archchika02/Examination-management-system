const pool = require('../config/db');

async function verify() {
    try {
        const [gc] = await pool.query('SELECT academic_year FROM global_timetable_config LIMIT 1');
        const baseYear = gc[0].academic_year;
        console.log("Base Academic Year:", baseYear);

        const userId = 14; 
        console.log(`\n--- Testing for User ID: ${userId} (Staff assigned to MGTE41252) ---`);

        const query = `
            SELECT DISTINCT ea.course_code, m_cycle.title as course_title, ea.academic_year as ea_year, m_cycle.academic_year as cycle_year
            FROM examiner_appointments ea
            CROSS JOIN (SELECT academic_year as base_year FROM global_timetable_config LIMIT 1) gtc
            -- Mandatory join for the Shifted Batch Cycle module entry
            JOIN modules m_cycle ON REPLACE(ea.course_code, ' ', '') = REPLACE(m_cycle.course_code, ' ', '')
            AND m_cycle.academic_year = (
                SELECT CONCAT(
                    CAST(SUBSTRING_INDEX(gtc.base_year, '/', 1) AS SIGNED) - (CAST(SUBSTRING(REGEXP_REPLACE(ea.course_code, '[^0-9]', ''), 1, 1) AS SIGNED) - 1),
                    '/',
                    CAST(SUBSTRING_INDEX(gtc.base_year, '/', -1) AS SIGNED) - (CAST(SUBSTRING(REGEXP_REPLACE(ea.course_code, '[^0-9]', ''), 1, 1) AS SIGNED) - 1)
                )
            )
            WHERE ea.user_id = ? 
            AND ea.status = 'Active'
            AND (
                -- Condition 1: Assignment matches the shifted cycle year
                ea.academic_year = m_cycle.academic_year
                OR
                -- Condition 2: Assignment matches the current base year
                ea.academic_year = gtc.base_year
            )
            ORDER BY ea.course_code ASC
        `;

        const [results] = await pool.query(query, [userId]);
        if (results.length > 0) {
            console.log(`Found ${results.length} valid modules:`);
            results.forEach(r => {
                console.log(` - ${r.course_code} | EA Year: ${r.ea_year} | Cycle Year: ${r.cycle_year} | Title: ${r.course_title}`);
            });
            const hasMGTE = results.some(r => r.course_code === 'MGTE41252');
            console.log("\nMGTE41252 found:", hasMGTE);
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
