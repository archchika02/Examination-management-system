const pool = require('../config/db');

async function createTable() {
    try {
        const connection = await pool.getConnection();
        await connection.query(`
            CREATE TABLE IF NOT EXISTS global_timetable_config (
                id INT AUTO_INCREMENT PRIMARY KEY,
                allowed_dates JSON,
                deadline VARCHAR(20),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Table global_timetable_config created or already exists.');

        // ensure there is at least one row
        const [rows] = await connection.query('SELECT * FROM global_timetable_config LIMIT 1');
        if (rows.length === 0) {
            await connection.query('INSERT INTO global_timetable_config (allowed_dates, deadline) VALUES (?, ?)', [JSON.stringify([]), '']);
        }

        connection.release();
        process.exit(0);
    } catch (err) {
        console.error('Error creating table:', err);
        process.exit(1);
    }
}

createTable();
