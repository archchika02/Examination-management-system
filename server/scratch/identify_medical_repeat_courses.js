const pool = require('../config/db');

async function identifyMedicalRepeatCourses() {
    try {
        console.log('--- Identifying Medical/Repeat Courses ---');
        
        // 1. Get current academic year
        const [gtc] = await pool.query('SELECT academic_year FROM global_timetable_config LIMIT 1');
        const currentYear = gtc[0].academic_year;
        console.log(`Current Academic Year: ${currentYear}`);

        // 2. Query approved medical/repeat registrations for the current year
        const [rows] = await pool.query(`
            SELECT DISTINCT mrc.course_code, m.title
            FROM medical_repeat_request_headers h
            JOIN medical_repeat_requested_courses mrc ON h.id = mrc.header_id
            LEFT JOIN (
                SELECT course_code, title 
                FROM modules 
                WHERE (course_code, academic_year) IN (
                    SELECT course_code, MAX(academic_year) 
                    FROM modules 
                    GROUP BY course_code
                )
            ) m ON REPLACE(mrc.course_code, ' ', '') = REPLACE(m.course_code, ' ', '')
            WHERE h.status = 'Approved' 
              AND h.academic_year = ?
            ORDER BY mrc.course_code ASC
        `, [currentYear]);

        if (rows.length === 0) {
            console.log('No approved medical/repeat registrations found for the current academic year.');
        } else {
            console.log(`Found ${rows.length} courses with approved medical/repeat registrations:`);
            console.table(rows);
        }

    } catch (error) {
        console.error('Error during identification:', error);
    } finally {
        process.exit();
    }
}

identifyMedicalRepeatCourses();
