const pool = require('./config/db');

async function diagnostic() {
    try {
        const [gtc] = await pool.query('SELECT academic_year FROM global_timetable_config LIMIT 1');
        const baseYear = gtc[0].academic_year;
        console.log("Global Academic Year:", baseYear);

        // This is EXACTLY the query from configurationRoutes.js
        const query = `
            SELECT 
                REPLACE(m.norm_code, ' ', '') AS course_code,
                enrollments.user_id,
                m.level,
                enrollments.academic_year
            FROM (
                SELECT cur.user_id, rcu.course_code, cur.academic_year
                FROM registered_course_units rcu 
                JOIN course_unit_registration_headers cur ON rcu.header_id = cur.id 
                WHERE cur.status = 'Approved'
                UNION ALL
                SELECT adr.user_id, adc.course_code, adr.academic_year
                FROM add_drop_requested_courses adc 
                JOIN add_drop_request_headers adr ON adc.header_id = adr.id 
                WHERE adc.action = 'Add' AND adr.status = 'Approved'
                UNION ALL
                SELECT mrr.user_id, mrc.course_code, mrr.academic_year
                FROM medical_repeat_requested_courses mrc 
                JOIN medical_repeat_request_headers mrr ON mrc.header_id = mrr.id 
                WHERE mrr.status = 'Approved'
            ) AS enrollments
            INNER JOIN (
                SELECT REPLACE(course_code, ' ', '') as norm_code, MAX(level) as level
                FROM modules
                GROUP BY REPLACE(course_code, ' ', '')
            ) AS m ON REPLACE(enrollments.course_code, ' ', '') = m.norm_code
            WHERE enrollments.academic_year = (
                SELECT CONCAT(
                    CAST(SUBSTRING_INDEX(?, '/', 1) AS SIGNED) - (m.level - 1),
                    '/',
                    CAST(SUBSTRING_INDEX(?, '/', -1) AS SIGNED) - (m.level - 1)
                )
            )
        `;

        const [rows] = await pool.query(query, [baseYear, baseYear]);
        
        const a = rows.filter(r => r.course_code === 'INTE21213').map(r => r.user_id);
        const b = rows.filter(r => r.course_code === 'INTE31373').map(r => r.user_id);
        
        console.log(`L2 students (INTE21213): ${a.length}`);
        console.log(`L3 students (INTE31373): ${b.length}`);
        
        const intersection = a.filter(id => b.includes(id));
        console.log("Intersection (Conflict) Students:", intersection);

        if (intersection.length > 0) {
            console.log("\nDetails for first intersection student:");
            const studentId = intersection[0];
            const studentRegs = rows.filter(r => r.user_id === studentId && (r.course_code === 'INTE21213' || r.course_code === 'INTE31373'));
            console.table(studentRegs);
        }

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

diagnostic();
