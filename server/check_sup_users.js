const pool = require('./config/db');

async function checkUsers() {
    const [users] = await pool.execute('SELECT user_id, email, role, name FROM users');
    const matched = users.filter(u => u.name === 'as' || u.role.includes('Supervisor'));
    console.log(JSON.stringify(matched, null, 2));
    process.exit(0);
}

checkUsers().catch(console.error);
