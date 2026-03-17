const pool = require('./config/db');

async function verifyNewEndpoints() {
    try {
        console.log('--- Testing /api/reports/exam-dates ---');
        const [dates] = await pool.query("SELECT DISTINCT DATE_FORMAT(date, '%Y-%m-%d') as date FROM exam_slots ORDER BY date ASC");
        console.log('Dates found:', dates.map(d => d.date));

        if (dates.length > 0) {
            const testDate = dates[0].date;
            console.log(`\n--- Testing /api/reports/exam-courses/${testDate} ---`);
            const [courses] = await pool.query(`
                SELECT DISTINCT es.course_code, m.title
                FROM exam_slots es
                LEFT JOIN modules m ON REPLACE(es.course_code, ' ', '') = REPLACE(m.course_code, ' ', '')
                WHERE DATE_FORMAT(es.date, '%Y-%m-%d') = ?
            `, [testDate]);
            console.log(`Courses on ${testDate}:`, courses.map(c => `${c.course_code} (${c.title})`));
        }

        console.log('\nVerification Successful!');
    } catch (error) {
        console.error('Verification Failed:', error.message);
    } finally {
        process.exit();
    }
}

verifyNewEndpoints();
