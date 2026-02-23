const pool = require('./config/db');

const checkDB = async () => {
    try {
        const email = 'test@student.com';
        const [rows] = await pool.execute('SELECT user_id, email FROM users WHERE email = ?', [email]);
        console.log("Users found:", rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDB();
