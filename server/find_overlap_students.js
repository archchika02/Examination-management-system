const pool = require('./config/db');

async function findConflictingStudents() {
    try {
        console.log("--- FINDING STUDENTS REGISTERED FOR BOTH ---");
        const query = `
            SELECT 
                a.user_id, 
                a.academic_year as year_L2_course, 
                b.academic_year as year_L3_course,
                a.course_code as code_L2,
                b.course_code as code_L3
            FROM (
                SELECT cur.user_id, cur.academic_year, rcu.course_code 
                FROM registered_course_units rcu 
                JOIN course_unit_registration_headers cur ON rcu.header_id = cur.id 
                WHERE REPLACE(rcu.course_code, ' ', '') = 'INTE21213' AND cur.status = 'Approved'
            ) a
            JOIN (
                SELECT cur.user_id, cur.academic_year, rcu.course_code 
                FROM registered_course_units rcu 
                JOIN course_unit_registration_headers cur ON rcu.header_id = cur.id 
                WHERE REPLACE(rcu.course_code, ' ', '') = 'INTE31373' AND cur.status = 'Approved'
            ) b ON a.user_id = b.user_id
        `;

        const [rows] = await pool.query(query);
        console.log(`Found ${rows.length} student(s) registered for both modules:`);
        console.table(rows);

        if (rows.length > 0) {
            console.log("\nDetails of these students:");
            const [users] = await pool.query('SELECT user_id, username, email FROM users WHERE user_id IN (?)', [rows.map(r => r.user_id)]);
            console.table(users);
        }

    } catch (err) {
        console.error("SQL Error:", err);
    } finally {
        process.exit();
    }
}

findConflictingStudents();
