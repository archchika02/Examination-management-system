const pool = require('../server/config/db');

async function checkModules() {
    try {
        console.log("--- Checking modules table ---");
        const [rows] = await pool.query("SELECT course_code, level FROM modules WHERE REPLACE(course_code, ' ', '') IN ('MGTE31222', 'INTE41253')");
        console.table(rows);

        console.log("\n--- Checking raw registrations for INTE41253 ---");
        const [reg] = await pool.query("SELECT * FROM registered_course_units WHERE REPLACE(course_code, ' ', '') = 'INTE41253'");
        console.log("Count:", reg.length);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkModules();
