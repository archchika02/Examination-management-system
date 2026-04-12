const pool = require('../config/db');

async function verifyTitleLogic() {
    const testCourseCodes = ['INTE 11213', 'INTE 21213', 'INTE 31213', 'INTE 41213', 'NONESUCH 999'];
    
    console.log('--- Verifying Title Logic ---');
    
    try {
        // Get base year
        const [gtc] = await pool.query('SELECT academic_year as base_year FROM global_timetable_config LIMIT 1');
        const baseYear = gtc[0].base_year;
        console.log(`Base Academic Year: ${baseYear}`);

        for (const code of testCourseCodes) {
            const [rows] = await pool.query(`
                SELECT 
                    ? as input_code,
                    CAST(SUBSTRING(REGEXP_REPLACE(?, '[^0-9]', ''), 1, 1) AS SIGNED) as extracted_level,
                    (
                        SELECT CONCAT(
                            CAST(SUBSTRING_INDEX(?, '/', 1) AS SIGNED) - (CAST(SUBSTRING(REGEXP_REPLACE(?, '[^0-9]', ''), 1, 1) AS SIGNED) - 1),
                            '/',
                            CAST(SUBSTRING_INDEX(?, '/', -1) AS SIGNED) - (CAST(SUBSTRING(REGEXP_REPLACE(?, '[^0-9]', ''), 1, 1) AS SIGNED) - 1)
                        )
                    ) as calculated_target_year,
                    COALESCE(m.title, 'Unknown Title') as title
                FROM (SELECT 1) dummy
                LEFT JOIN modules m ON REPLACE(?, ' ', '') = REPLACE(m.course_code, ' ', '')
                    AND m.academic_year = (
                        SELECT CONCAT(
                            CAST(SUBSTRING_INDEX(?, '/', 1) AS SIGNED) - (CAST(SUBSTRING(REGEXP_REPLACE(?, '[^0-9]', ''), 1, 1) AS SIGNED) - 1),
                            '/',
                            CAST(SUBSTRING_INDEX(?, '/', -1) AS SIGNED) - (CAST(SUBSTRING(REGEXP_REPLACE(?, '[^0-9]', ''), 1, 1) AS SIGNED) - 1)
                        )
                    )
            `, [code, code, baseYear, code, baseYear, code, code, baseYear, code, baseYear, code]);
            
            console.log(`Code: ${code}`);
            console.log(`  Extracted Level: ${rows[0].extracted_level}`);
            console.log(`  Target Year: ${rows[0].calculated_target_year}`);
            console.log(`  Resolved Title: ${rows[0].title}`);
            console.log('---------------------------');
        }
    } catch (error) {
        console.error('Error during verification:', error);
    } finally {
        process.exit();
    }
}

verifyTitleLogic();
