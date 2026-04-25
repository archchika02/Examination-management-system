const pool = require('./config/db');

async function checkModules() {
    try {
        console.log("--- MODULE DETAILS ---");
        const [rows] = await pool.query(
            "SELECT course_code, level, academic_year FROM modules WHERE REPLACE(course_code, ' ', '') IN ('INTE21213', 'INTE31373')"
        );
        console.table(rows);
        
        console.log("\n--- REGISTRATION DETAILS for Student 5 ---");
        const [regs] = await pool.query(
            `SELECT rcu.course_code, cur.academic_year, cur.status 
             FROM registered_course_units rcu 
             JOIN course_unit_registration_headers cur ON rcu.header_id = cur.id 
             WHERE cur.user_id = 5 AND REPLACE(rcu.course_code, ' ', '') IN ('INTE21213', 'INTE31373')`
        );
        console.table(regs);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkModules();
