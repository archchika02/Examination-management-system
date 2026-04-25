const pool = require('../config/db');

async function debugCourse() {
    const courseCode = 'MGTE31222';
    
    try {
        console.log(`--- Debugging Course: ${courseCode} ---`);
        
        // 1. Check Course registration history for this code
        const [modules] = await pool.query('SELECT * FROM modules WHERE REPLACE(course_code, " ", "") = ?', [courseCode.replace(' ', '')]);
        console.log('Available records in modules table:');
        console.table(modules);

        // 2. Check Global Config
        const [gtc] = await pool.query('SELECT academic_year FROM global_timetable_config LIMIT 1');
        const baseYear = gtc[0].academic_year;
        console.log(`Current Base Academic Year: ${baseYear}`);

        // 3. Calculate Target Year (Level 3)
        const level = 3;
        const targetYear = await pool.query(`
            SELECT CONCAT(
                CAST(SUBSTRING_INDEX(?, '/', 1) AS SIGNED) - (? - 1),
                '/',
                CAST(SUBSTRING_INDEX(?, '/', -1) AS SIGNED) - (? - 1)
            ) as target`, [baseYear, level, baseYear, level]);
        
        console.log(`Calculated Target Year for Level 3: ${targetYear[0][0].target}`);

        // 4. Check if a match exists with the calculated year
        const match = modules.find(m => m.academic_year === targetYear[0][0].target);
        if (match) {
            console.log(`Match Found: ${match.title}`);
        } else {
            console.log('No Match Found for the calculated target year.');
        }

    } catch (error) {
        console.error('Debug Error:', error);
    } finally {
        process.exit();
    }
}

debugCourse();
