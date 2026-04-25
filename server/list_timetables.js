const pool = require('./config/db');

async function listTimetables() {
    try {
        const [rows] = await pool.query('SELECT DISTINCT course_code, academic_year FROM exam_timetables LIMIT 10');
        console.log('Available Timetables:', rows);
    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
}

listTimetables();
