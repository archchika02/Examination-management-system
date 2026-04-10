const pool = require('./config/db');

async function checkApiOutput() {
    try {
        const [gtc] = await pool.execute('SELECT academic_year FROM global_timetable_config LIMIT 1');
        const baseYear = gtc[0].academic_year;
        console.log("Base Academic Year:", baseYear);

        const query = `
            SELECT 
                REPLACE(m.norm_code, ' ', '') AS course_code,
                enrollments.user_id,
                enrollments.academic_year,
                m.level,
                (
                    SELECT CONCAT(
                        CAST(SUBSTRING_INDEX(?, '/', 1) AS SIGNED) - (m.level - 1),
                        '/',
                        CAST(SUBSTRING_INDEX(?, '/', -1) AS SIGNED) - (m.level - 1)
                    )
                ) as targetYear
            FROM (
                SELECT cur.user_id, rcu.course_code, cur.academic_year FROM registered_course_units rcu JOIN course_unit_registration_headers cur ON rcu.header_id = cur.id WHERE cur.status = 'Approved'
                UNION ALL
                SELECT adr.user_id, adc.course_code, adr.academic_year FROM add_drop_requested_courses adc JOIN add_drop_request_headers adr ON adc.header_id = adr.id WHERE adc.action = 'Add' AND adr.status = 'Approved'
                UNION ALL
                SELECT mrr.user_id, mrc.course_code, mrr.academic_year FROM medical_repeat_requested_courses mrc JOIN medical_repeat_request_headers mrr ON mrc.header_id = mrr.id WHERE mrr.status = 'Approved'
            ) AS enrollments
            INNER JOIN (
                SELECT REPLACE(course_code, ' ', '') as norm_code, MAX(level) as level
                FROM modules
                GROUP BY REPLACE(course_code, ' ', '')
            ) AS m ON REPLACE(enrollments.course_code, ' ', '') = m.norm_code
            WHERE REPLACE(m.norm_code, ' ', '') IN ('INTE21213', 'INTE31373')
            AND (
                enrollments.academic_year = (
                    SELECT CONCAT(
                        CAST(SUBSTRING_INDEX(?, '/', 1) AS SIGNED) - (m.level - 1),
                        '/',
                        CAST(SUBSTRING_INDEX(?, '/', -1) AS SIGNED) - (m.level - 1)
                    )
                )
                OR enrollments.academic_year IS NULL
            )
        `;

        const [rows] = await pool.query(query, [baseYear, baseYear, baseYear, baseYear]);
        console.log("Students that ARE being picked up by the API:");
        console.table(rows);

        const counts = {};
        rows.forEach(r => {
            counts[r.course_code] = (counts[r.course_code] || 0) + 1;
        });
        console.log("Counts:", counts);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkApiOutput();
