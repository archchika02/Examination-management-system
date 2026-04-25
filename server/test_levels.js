const pool = require('./config/db');

async function run() {
    try {
        console.log("Checking exact level values in course_unit_registration_headers:");
        const [hRows] = await pool.query('SELECT DISTINCT level FROM course_unit_registration_headers');
        console.log(hRows);

        console.log("\nChecking exact level values in student_details:");
        const [sRows] = await pool.query('SELECT DISTINCT level FROM student_details');
        console.log(sRows);

        console.log("\nQuerying with level = 1 (Integer):");
        const [res1] = await pool.query('SELECT COUNT(*) as count FROM course_unit_registration_headers WHERE status = "Approved" AND level = ?', [1]);
        console.log("Integer 1:", res1[0].count);

        console.log("\nQuerying with level = 'Level 1' (String):");
        const [res2] = await pool.query('SELECT COUNT(*) as count FROM course_unit_registration_headers WHERE status = "Approved" AND level = ?', ['Level 1']);
        console.log("String 'Level 1':", res2[0].count);

        console.log("\nQuerying student_details with level = 'Level 1' (String):");
        const [res3] = await pool.query('SELECT COUNT(*) as count FROM student_details WHERE level = ?', ['Level 1']);
        console.log("student_details String 'Level 1':", res3[0].count);

        console.log("\nQuerying student_details with level = 1 (Integer):");
        const [res4] = await pool.query('SELECT COUNT(*) as count FROM student_details WHERE level = ?', [1]);
        console.log("student_details Integer 1:", res4[0].count);

        console.log("\nQuerying student_details with level = '1' (String):");
        const [res5] = await pool.query('SELECT COUNT(*) as count FROM student_details WHERE level = ?', ['1']);
        console.log("student_details String '1':", res5[0].count);

    } catch (err) {
        console.error("SQL ERROR:", err.message);
    } finally {
        process.exit();
    }
}
run();
