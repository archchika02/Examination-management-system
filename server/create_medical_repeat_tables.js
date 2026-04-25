const pool = require('./config/db');

const createMedicalRepeatTables = async () => {
    try {
        const connection = await pool.getConnection();

        // 1. Create Medical/Repeat Request Headers Table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS medical_repeat_request_headers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT, 
                student_number VARCHAR(50),
                student_name VARCHAR(150),
                contact_number VARCHAR(50),
                email VARCHAR(150),
                form_type ENUM('Medical', 'Repeat') NOT NULL,
                signature LONGTEXT NOT NULL,
                signature_date DATE,
                medical_certificate_url VARCHAR(255),
                payment_receipt_url VARCHAR(255),
                status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
                reject_reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
            )
        `);
        console.log('Checked/Created medical_repeat_request_headers table');

        // 2. Create Medical/Repeat Requested Courses Table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS medical_repeat_requested_courses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                header_id INT,
                course_code VARCHAR(20) NOT NULL,
                course_title VARCHAR(150),
                results_obtained VARCHAR(20),
                academic_year VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (header_id) REFERENCES medical_repeat_request_headers(id) ON DELETE CASCADE
            )
        `);
        console.log('Checked/Created medical_repeat_requested_courses table');

        connection.release();
        process.exit(0);
    } catch (err) {
        console.error('Error creating medical/repeat tables:', err);
        process.exit(1);
    }
};

createMedicalRepeatTables();
