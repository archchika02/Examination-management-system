require('dotenv').config();
const pool = require('./config/db');

const fs = require('fs');

async function checkToken() {
    try {
        const [rows] = await pool.execute('SELECT * FROM password_resets ORDER BY created_at DESC LIMIT 1');
        if (rows.length > 0) {
            const row = rows[0];
            const content = `Link: http://localhost:5173/reset-password?token=${row.token}&email=${row.email}`;
            fs.writeFileSync('latest_token.txt', content);
            console.log("Token written to latest_token.txt");
        } else {
            fs.writeFileSync('latest_token.txt', "No tokens found");
        }
    } catch (err) {
        fs.writeFileSync('latest_token.txt', "Error: " + err.message);
    } finally {
        process.exit();
    }
}

checkToken();
