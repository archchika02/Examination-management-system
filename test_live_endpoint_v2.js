const http = require('http');
const pool = require('./server/config/db');

async function testFetch() {
    try {
        const [ha] = await pool.query('SELECT DISTINCT attendant_id FROM exam_draft_attendants WHERE is_published = 1 LIMIT 1');
        if (ha.length === 0) {
            console.log('No published attendants found.');
            return;
        }
        const attendantId = ha[0].attendant_id;
        console.log(`Testing with Attendant ID: ${attendantId}`);

        http.get(`http://localhost:5000/api/configurations/attendant-published-exams?attendantId=${attendantId}`, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                console.log('--- Raw Response Data ---');
                console.log(JSON.stringify(JSON.parse(data), null, 2));
                process.exit();
            });
        }).on("error", (err) => {
            console.log("Error: " + err.message);
            process.exit();
        });

    } catch (err) {
        console.error(err);
        process.exit();
    }
}

testFetch();
