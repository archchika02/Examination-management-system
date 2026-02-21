const pool = require('./config/db');

const createTable = async () => {
    try {
        const connection = await pool.getConnection();

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS course_unit_registrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT, 
                form_data JSON NOT NULL,
                signature LONGTEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
            )
        `);
        console.log('Checked/Created course_unit_registrations table');

        connection.release();
        process.exit(0);
    } catch (err) {
        console.error('Error creating table:', err);
        process.exit(1);
    }
};

createTable();
