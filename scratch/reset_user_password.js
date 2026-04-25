const pool = require('../server/config/db');
const bcrypt = require('bcrypt');

async function resetPassword() {
    const email = 'mahaf55625@okexbit.com';
    const newPassword = 'TestPass@123';
    
    console.log(`Attempting to reset password for: ${email}`);

    try {
        // Generate Salt & Hash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the database
        const [result] = await pool.execute(
            'UPDATE users SET password_hash = ? WHERE email = ?',
            [hashedPassword, email]
        );

        if (result.affectedRows === 0) {
            console.log(`Failed: User ${email} not found.`);
        } else {
            console.log(`Success! Password for ${email} has been reset to: ${newPassword}`);
        }
    } catch (error) {
        console.error('Database Error:', error);
    } finally {
        process.exit();
    }
}

resetPassword();
