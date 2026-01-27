const pool = require('./config/db');

const migrate = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to database...');

        // Add approval_status to users table if it doesn't exist
        try {
            await connection.execute("ALTER TABLE users ADD COLUMN approval_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending'");
            console.log('Added approval_status column to users table.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('approval_status column already exists.');
            } else {
                console.error('Error adding column:', err.message);
            }
        }

        connection.release();
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
