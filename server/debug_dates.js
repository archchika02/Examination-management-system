const pool = require('./config/db');

async function debugDates() {
    try {
        console.log('--- Raw Dates from exam_slots ---');
        const [rows] = await pool.query('SELECT date FROM exam_slots LIMIT 5');
        rows.forEach(r => {
            console.log('Value:', r.date, 'Type:', typeof r.date);
            if (r.date instanceof Date) {
                console.log('  ISO String:', r.date.toISOString());
                console.log('  Locale String:', r.date.toLocaleDateString());
            }
        });

        console.log('\n--- Formatted Dates (DATE_FORMAT) ---');
        const [formatted] = await pool.query("SELECT DISTINCT DATE_FORMAT(date, '%Y-%m-%d') as fmt_date FROM exam_slots");
        console.log('Formatted dates:', formatted.map(f => f.fmt_date));

    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
}

debugDates();
