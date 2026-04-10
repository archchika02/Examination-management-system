const pool = require('./config/db.js');

async function run() {
    try {
        const [rows] = await pool.query("SELECT rh.academic_year, rcu.course_code, rh.status, rh.user_id FROM registered_course_units rcu JOIN course_unit_registration_headers rh ON rcu.header_id = rh.id WHERE REPLACE(rcu.course_code, ' ', '') = 'INTE41403'");
        console.log('Base Registrations:', rows);
        
        const [addRows] = await pool.query("SELECT ah.academic_year, ac.course_code, ah.status, ac.action, ah.user_id FROM add_drop_requested_courses ac JOIN add_drop_request_headers ah ON ac.header_id = ah.id WHERE REPLACE(ac.course_code, ' ', '') = 'INTE41403'");
        console.log('Add/Drop Entries:', addRows);

        const [medRows] = await pool.query("SELECT mh.academic_year, mc.course_code, mh.status, mh.user_id FROM medical_repeat_requested_courses mc JOIN medical_repeat_request_headers mh ON mc.header_id = mh.id WHERE REPLACE(mc.course_code, ' ', '') = 'INTE41403'");
        console.log('Med/Repeat Entries:', medRows);
        
        const [ttRows] = await pool.query("SELECT timetable_id, course_code, academic_year, semester, date FROM exam_timetables WHERE REPLACE(course_code, ' ', '') = 'INTE41403'");
        console.log('Timetables:', ttRows);

    } catch(e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
run();
