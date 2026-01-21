const pool = require('./config/db');

const migrate = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to database...');

        // 1. Add is_verified to users table if it doesn't exist
        try {
            await connection.execute("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE");
            console.log('Added is_verified column to users table.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('is_verified column already exists.');
            } else {
                console.error('Error adding column:', err.message);
            }
        }

        // 2. Create email_verifications table
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS email_verifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                token VARCHAR(255) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
            )
        `;
        await connection.execute(createTableQuery);
        console.log('Created/Verified email_verifications table.');

        connection.release();
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
