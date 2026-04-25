const pool = require('./config/db');

async function testQuery() {
    try {
        const type = 'Academic';
        const numericLevel = 1;
        const params = [numericLevel, numericLevel];

        const query = `
                WITH AllEnrollments AS (
                    -- Standard Registrations
                    SELECT 
                        h.user_id, 
                        sd.student_number, 
                        h.student_name, 
                        sd.level,
                        rcu.course_code
                    FROM course_unit_registration_headers h
                    JOIN registered_course_units rcu ON h.id = rcu.header_id
                    JOIN student_details sd ON h.user_id = sd.user_id
                    WHERE h.status = 'Approved' AND sd.level = ?

                    UNION DISTINCT

                    -- Add-Drop "Add" actions
                    SELECT 
                        h.user_id, 
                        sd.student_number, 
                        h.student_name, 
                        sd.level,
                        arc.course_code
                    FROM add_drop_request_headers h
                    JOIN add_drop_requested_courses arc ON h.id = arc.header_id
                    JOIN student_details sd ON h.user_id = sd.user_id
                    WHERE h.status = 'Approved' AND arc.action = 'Add' AND sd.level = ?
                ),
                ExcludedEnrollments AS (
                    -- Add-Drop "Drop" actions
                    SELECT 
                        h.user_id, 
                        arc.course_code
                    FROM add_drop_request_headers h
                    JOIN add_drop_requested_courses arc ON h.id = arc.header_id
                    WHERE h.status = 'Approved' AND arc.action = 'Drop'
                ),
                FinalEnrollments AS (
                    SELECT e.*
                    FROM AllEnrollments e
                    LEFT JOIN ExcludedEnrollments ex ON e.user_id = ex.user_id AND REPLACE(e.course_code, ' ', '') = REPLACE(ex.course_code, ' ', '')
                    WHERE ex.user_id IS NULL
                )
                SELECT * FROM FinalEnrollments
            `;

        const [rows] = await pool.query(query, params);
        console.log("Rows found: ", rows.length);
        if (rows.length > 0) {
            console.log("Sample:", rows[0]);
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
testQuery();
