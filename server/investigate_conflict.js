const pool = require('./config/db');

async function checkConflictData() {
    try {
        console.log("--- Checking INTE21213 and INTE31373 data ---");
        
        // 1. Check levels
        const [modules] = await pool.query(
            "SELECT course_code, level FROM modules WHERE REPLACE(course_code, ' ', '') IN ('INTE21213', 'INTE31373')"
        );
        console.log("Module Levels:", modules);

        // 2. Check registration years for these specific courses
        const [registrations] = await pool.query(
            `SELECT rcu.course_code, cur.academic_year, COUNT(*) as count 
             FROM registered_course_units rcu 
             JOIN course_unit_registration_headers cur ON rcu.header_id = cur.id 
             WHERE REPLACE(rcu.course_code, ' ', '') IN ('INTE21213', 'INTE31373') 
             GROUP BY rcu.course_code, cur.academic_year`
        );
        console.log("Registration Years:", registrations);

        // 3. Find if there are students who registered for both ACROSS ALL YEARS
        const [overlap] = await pool.query(
            `SELECT a.user_id, a.course_code as codeA, b.course_code as codeB, a.academic_year as yearA, b.academic_year as yearB
             FROM (
                SELECT cur.user_id, rcu.course_code, cur.academic_year 
                FROM registered_course_units rcu JOIN course_unit_registration_headers cur ON rcu.header_id = cur.id 
                WHERE REPLACE(rcu.course_code, ' ', '') = 'INTE21213' AND cur.status = 'Approved'
             ) a
             JOIN (
                SELECT cur.user_id, rcu.course_code, cur.academic_year 
                FROM registered_course_units rcu JOIN course_unit_registration_headers cur ON rcu.header_id = cur.id 
                WHERE REPLACE(rcu.course_code, ' ', '') = 'INTE31373' AND cur.status = 'Approved'
             ) b ON a.user_id = b.user_id`
        );
        console.log("Raw Overlap Count (Any Year):", overlap.length);
        if (overlap.length > 0) {
            console.log("First 5 overlaps:", overlap.slice(0, 5));
        }

        // 4. Check Global Config
        const [gtc] = await pool.query("SELECT academic_year FROM global_timetable_config LIMIT 1");
        console.log("Global Academic Year:", gtc[0].academic_year);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkConflictData();
