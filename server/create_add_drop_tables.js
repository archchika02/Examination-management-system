const pool = require('./config/db');

const createAddDropTables = async () => {
    try {
        const connection = await pool.getConnection();

        // 1. Create Add/Drop Request Headers Table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS add_drop_request_headers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT, 
                student_number VARCHAR(50),
                student_name VARCHAR(150),
                contact_number VARCHAR(50),
                email VARCHAR(150),
                combination VARCHAR(100),
                year VARCHAR(20),
                sem1_credits INT,
                sem2_credits INT,
                total_credits INT,
                signature LONGTEXT NOT NULL,
                signature_date DATE,
                status ENUM('Pending', 'Pending Supervisor', 'Pending Dean', 'Approved', 'Rejected by Supervisor', 'Rejected by Dean', 'Rejected') DEFAULT 'Pending Supervisor',
                reject_reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
            )
        `);
        console.log('Checked/Created add_drop_request_headers table');

        // 2. Create Add/Drop Requested Courses Table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS add_drop_requested_courses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                header_id INT,
                course_code VARCHAR(20) NOT NULL,
                action ENUM('Add', 'Drop') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (header_id) REFERENCES add_drop_request_headers(id) ON DELETE CASCADE
            )
        `);
        console.log('Checked/Created add_drop_requested_courses table');

        connection.release();
        process.exit(0);
    } catch (err) {
        console.error('Error creating add/drop tables:', err);
        process.exit(1);
    }
};

createAddDropTables();
