const pool = require('./config/db');

async function verifyAttendanceYearMatch() {
    const courseCode = 'MGTE 11233'; 
    
    try {
        console.log(`--- Verifying Attendance Year Match for ${courseCode} ---`);
        
        // 1. Get Exam Data
        const [exams] = await pool.query(`
            SELECT 
                et.timetable_id, 
                et.course_code, 
                et.academic_year
            FROM exam_timetables et
            WHERE REPLACE(et.course_code, ' ', '') = REPLACE(?, ' ', '')
        `, [courseCode]);

        if (exams.length === 0) {
            console.log('No exam found for this course. Please use a course with a scheduled exam.');
            return;
        }

        const exam = exams[0];
        console.log(`Exam found: ID ${exam.timetable_id}, Academic Year: ${exam.academic_year}`);

        // 2. Test the query logic
        console.log('\n--- Testing Student Fetch Logic with Year Match ---');
        const [students] = await pool.query(`
            WITH AllEnrollments AS (
                SELECT sd.student_number
                FROM course_unit_registration_headers h
                JOIN registered_course_units rcu ON h.id = rcu.header_id
                JOIN student_details sd ON h.user_id = sd.user_id
                WHERE h.status = 'Approved' 
                  AND h.academic_year = ?
                  AND REPLACE(rcu.course_code, ' ', '') = REPLACE(?, ' ', '')
                  
                UNION DISTINCT
                
                SELECT sd.student_number
                FROM add_drop_request_headers h
                JOIN add_drop_requested_courses arc ON h.id = arc.header_id
                JOIN student_details sd ON h.user_id = sd.user_id
                WHERE h.status = 'Approved' 
                  AND h.academic_year = ?
                  AND arc.action = 'Add'
                  AND REPLACE(arc.course_code, ' ', '') = REPLACE(?, ' ', '')
            )
            SELECT * FROM AllEnrollments
        `, [exam.academic_year, courseCode, exam.academic_year, courseCode]);

        console.log(`Students found matching academic year ${exam.academic_year}:`, students.length);
        if (students.length > 0) {
            console.log('Sample student:', students[0].student_number);
        }

        // 3. Test negative case (different academic year)
        const wrongYear = '1999/2000';
        const [wrongYearStudents] = await pool.query(`
            SELECT sd.student_number
            FROM course_unit_registration_headers h
            JOIN registered_course_units rcu ON h.id = rcu.header_id
            JOIN student_details sd ON h.user_id = sd.user_id
            WHERE h.status = 'Approved' 
              AND h.academic_year = ?
              AND REPLACE(rcu.course_code, ' ', '') = REPLACE(?, ' ', '')
        `, [wrongYear, courseCode]);

        console.log(`Students found matching wrong year (${wrongYear}):`, wrongYearStudents.length);
        
        if (wrongYearStudents.length === 0) {
            console.log('\nVerification Successful: Filtering by academic year works correctly.');
        } else {
            console.log('\nWait: Found students in wrong year. This indicates no match was found in the correct year, but we still need to ensure the query correctly isolates the specific year provided.');
        }

        console.log('\nVerification Complete!');
    } catch (error) {
        console.error('Verification Failed:', error.message);
    } finally {
        process.exit();
    }
}

verifyAttendanceYearMatch();
