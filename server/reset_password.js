const pool = require('./config/db');
const bcrypt = require('bcrypt');

async function resetPassword() {
    const email = 'testbatchrep@stu.kln.ac.lk';
    const newPassword = 'password123';

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            console.log(`User with email ${email} not found.`);
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await pool.query('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, email]);

        console.log(`Password for ${email} has been reset to: ${newPassword}`);
    } catch (err) {
        console.error('Error resetting password:', err);
    } finally {
        process.exit(0);
    }
}

resetPassword();
