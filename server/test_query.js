const pool = require('./config/db');

async function checkVerified() {
    try {
        const [users] = await pool.query('SELECT user_id, name, is_verified, approval_status FROM users WHERE user_id IN (14, 20)');
        console.log("Users:", users);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
checkVerified();
