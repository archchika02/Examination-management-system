const pool = require('./config/db.js');

async function run() {
    try {
        const [rows] = await pool.query(`
            SELECT 
                t.timetable_id,
                t.course_code,
                COUNT(*) as count
            FROM exam_timetables t
            JOIN exam_slots s ON t.timetable_id = s.timetable_id
            LEFT JOIN (
                SELECT course_code, MAX(level) as level
                FROM modules
                GROUP BY course_code
            ) ml ON REPLACE(t.course_code, ' ', '') = REPLACE(ml.course_code, ' ', '')
            CROSS JOIN (
                SELECT academic_year as base_year FROM global_timetable_config LIMIT 1
            ) gtc
            LEFT JOIN modules m_map ON REPLACE(t.course_code, ' ', '') = REPLACE(m_map.course_code, ' ', '')
                AND m_map.academic_year = (
                    SELECT CONCAT(
                        CAST(SUBSTRING_INDEX(gtc.base_year, '/', 1) AS SIGNED) - (ml.level - 1),
                        '/',
                        CAST(SUBSTRING_INDEX(gtc.base_year, '/', -1) AS SIGNED) - (ml.level - 1)
                    )
                )
            LEFT JOIN (
                SELECT m1.course_code, m1.title, m1.academic_year
                FROM modules m1
                WHERE m1.academic_year = (SELECT MAX(m2.academic_year) FROM modules m2 WHERE REPLACE(m2.course_code, ' ', '') = REPLACE(m1.course_code, ' ', ''))
            ) m_latest ON REPLACE(t.course_code, ' ', '') = REPLACE(m_latest.course_code, ' ', '')
            LEFT JOIN examiner_appointments ea 
                ON REPLACE(t.course_code, ' ', '') = REPLACE(ea.course_code, ' ', '') 
                AND t.academic_year = ea.academic_year 
                AND ea.examiner_role = 'Examiner 1' 
                AND ea.status = 'Active'
            WHERE t.is_submitted = TRUE AND s.start_time IS NOT NULL AND s.end_time IS NOT NULL
            GROUP BY t.timetable_id, t.course_code
            HAVING count > 1
        `);
        console.log('Duplicates count per exam:', rows);

        // check multiple in m_latest
        for (const row of rows) {
            const [latest] = await pool.query("SELECT * FROM modules WHERE REPLACE(course_code, ' ', '') = REPLACE(?, ' ', '')", [row.course_code]);
            console.log(`Modules for ${row.course_code}:`, latest);
        }

    } catch(e) {
        console.error(e.message);
    } finally {
        process.exit();
    }
}
run();
