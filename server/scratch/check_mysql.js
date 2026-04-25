const pool = require('../config/db');

async function check() {
    try {
        const [version] = await pool.query('SELECT VERSION() as v');
        console.log("MySQL Version:", version[0].v);

        const [test] = await pool.query('SELECT REGEXP_REPLACE("INTE21213", "[^0-9]", "") as digits');
        console.log("REGEXP_REPLACE test result:", test[0].digits);
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        process.exit(0);
    }
}
check();
