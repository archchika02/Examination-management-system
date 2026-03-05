const axios = require('axios');

async function testFetch() {
    try {
        // Need a valid attendantId. I'll find one first.
        const pool = require('./server/config/db');
        const [ha] = await pool.query('SELECT attendant_id FROM exam_draft_attendants WHERE is_published = 1 LIMIT 1');
        if (ha.length === 0) {
            console.log('No published attendants found.');
            return;
        }
        const attendantId = ha[0].attendant_id;
        console.log(`Testing with Attendant ID: ${attendantId}`);

        const response = await axios.get(`http://localhost:5000/api/configurations/attendant-published-exams?attendantId=${attendantId}`);
        console.log('--- Raw Response Data ---');
        console.log(JSON.stringify(response.data, null, 2));

    } catch (err) {
        console.error('Fetch failed:', err.message);
        if (err.response) {
            console.error('Response Status:', err.response.status);
            console.error('Response Data:', err.response.data);
        }
    } finally {
        process.exit();
    }
}

testFetch();
