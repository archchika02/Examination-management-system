const pool = require('./config/db');

const createTables = async () => {
    try {
        const connection = await pool.getConnection();

        // 1. Create Headers Table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS course_unit_registration_headers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT, 
                student_number VARCHAR(50),
                student_name VARCHAR(150),
                level VARCHAR(10),
                course_unit_combination VARCHAR(100),
                total_credits INT,
                signature LONGTEXT NOT NULL,
                status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
                reject_reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
            )
        `);
        console.log('Checked/Created course_unit_registration_headers table');

        // 2. Create Course Units Table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS registered_course_units (
                id INT AUTO_INCREMENT PRIMARY KEY,
                header_id INT,
                course_code VARCHAR(20) NOT NULL,
                course_type ENUM('Compulsory', 'Optional', 'Auxiliary') NOT NULL,
                semester INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (header_id) REFERENCES course_unit_registration_headers(id) ON DELETE CASCADE
            )
        `);
        console.log('Checked/Created registered_course_units table');

        connection.release();
        process.exit(0);
    } catch (err) {
        console.error('Error creating tables:', err);
        process.exit(1);
    }
};

createTables();
