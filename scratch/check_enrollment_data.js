const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../server/.env') });

async function checkEnrollmentData() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        const [gtc] = await pool.execute('SELECT academic_year FROM global_timetable_config LIMIT 1');
        const baseYear = gtc[0].academic_year;

        const query = `
            SELECT 
                REPLACE(m.course_code, ' ', '') AS course_code,
                enrollments.user_id,
                enrollments.academic_year,
                m.level
            FROM (
                SELECT cur.user_id, rcu.course_code, cur.academic_year FROM registered_course_units rcu JOIN course_unit_registration_headers cur ON rcu.header_id = cur.id WHERE cur.status = 'Approved'
                UNION
                SELECT adr.user_id, adc.course_code, adr.academic_year FROM add_drop_requested_courses adc JOIN add_drop_request_headers adr ON adc.header_id = adr.id WHERE adc.action = 'Add' AND adr.status = 'Approved'
                UNION
                SELECT mrr.user_id, mrc.course_code, mrr.academic_year FROM medical_repeat_requested_courses mrc JOIN medical_repeat_request_headers mrr ON mrc.header_id = mrr.id WHERE mrr.status = 'Approved'
            ) AS enrollments
            INNER JOIN (
                SELECT REPLACE(course_code, ' ', '') as norm_code, MAX(level) as level
                FROM modules
                GROUP BY REPLACE(course_code, ' ', '')
            ) AS m ON REPLACE(enrollments.course_code, ' ', '') = m.norm_code
            WHERE REPLACE(m.course_code, ' ', '') IN ('INTE21213', 'INTE31373')
            AND enrollments.academic_year = (
                SELECT CONCAT(
                    CAST(SUBSTRING_INDEX(?, '/', 1) AS SIGNED) - (m.level - 1),
                    '/',
                    CAST(SUBSTRING_INDEX(?, '/', -1) AS SIGNED) - (m.level - 1)
                )
            )
        `;

        const [rows] = await pool.query(query, [baseYear, baseYear]);
        console.log(`Enrollments for ${baseYear} (Staggered):`);
        console.table(rows);

        const studentsA = rows.filter(r => r.course_code === 'INTE21213').map(r => r.user_id);
        const studentsB = rows.filter(r => r.course_code === 'INTE31373').map(r => r.user_id);
        const intersection = studentsA.filter(id => studentsB.includes(id));

        console.log('Intersection Students:', intersection);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkEnrollmentData();
