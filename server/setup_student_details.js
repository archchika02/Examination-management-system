const pool = require('./config/db');

const setupStudentDetails = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to database...');

        // 1. Create student_details table if not exists
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS student_details (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                student_number VARCHAR(50),
                level INT DEFAULT 1,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        `);
        console.log('Checked/Created student_details table');

        // 2. Check if user 1 exists and has details (Mock Batch Rep)
        // We assume user_id 1 is our test user.
        const [users] = await connection.execute('SELECT user_id FROM users WHERE user_id = 1');

        if (users.length > 0) {
            const [details] = await connection.execute('SELECT * FROM student_details WHERE user_id = 1');
            if (details.length === 0) {
                console.log('Seeding student details for User 1 (Level 2)...');
                await connection.execute('INSERT INTO student_details (user_id, student_number, level) VALUES (?, ?, ?)', [1, 'STU001', 2]);
            } else {
                console.log('User 1 already has student details. Updating to Level 2 for testing...');
                await connection.execute('UPDATE student_details SET level = 2 WHERE user_id = 1');
            }
        } else {
            console.log('User 1 does not exist. Please create a user first or seeding skipped.');
            // Optional: Create User 1 if strictly needed for specific dev env
        }

        connection.release();
        console.log('Setup complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

setupStudentDetails();
