const pool = require('../config/db');

async function investigate() {
    try {
        const courseCode = 'MGTE41252';
        const normCode = 'MGTE41252';

        console.log(`Investigating Course: ${courseCode}`);

        // 1. Check assignments
        const [assignments] = await pool.query(`
            SELECT appointment_id, user_id, academic_year, status 
            FROM examiner_appointments 
            WHERE REPLACE(course_code, ' ', '') = ?
        `, [normCode]);
        console.log("\nExaminer Assignments:", assignments);

        // 2. Check modules
        const [modules] = await pool.query(`
            SELECT academic_year, title, level 
            FROM modules 
            WHERE REPLACE(course_code, ' ', '') = ?
        `, [normCode]);
        console.log("\nModules Entries:", modules);

        // 3. Check Global Config
        const [gc] = await pool.query('SELECT academic_year FROM global_timetable_config LIMIT 1');
        const baseYear = gc[0].academic_year;
        console.log("\nBase Academic Year:", baseYear);

        // 4. Test Calculation
        const firstDigit = normCode.match(/\d/)[0];
        const level = parseInt(firstDigit);
        console.log(`\nExtracted Level from Code: ${level}`);

        const baseStart = parseInt(baseYear.split('/')[0]);
        const baseEnd = parseInt(baseYear.split('/')[1]);
        
        const targetStart = baseStart - (level - 1);
        const targetEnd = baseEnd - (level - 1);
        const targetYear = `${targetStart}/${targetEnd}`;
        
        console.log(`Calculated Target Year for Level ${level}: ${targetYear}`);

        // 5. Compare with assignments
        const matches = assignments.filter(a => a.academic_year === targetYear && a.status === 'Active');
        console.log(`\nMatching Active Assignments for ${targetYear}:`, matches);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

investigate();
