const pool = require('./config/db');

const createTables = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to database. Creating tables...');

        // Course Units Table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS course_units (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(20) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL,
                credits INT NOT NULL,
                supervisor_id INT, -- Assuming link to user table
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Checked/Created course_units table');

        // Add/Drop Requests Table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS add_drop_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                course_id INT NOT NULL,
                type ENUM('ADD', 'DROP') NOT NULL,
                status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
                request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Checked/Created add_drop_requests table');

        // Alerts Table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS alerts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                message TEXT,
                type ENUM('INFO', 'WARNING', 'CRITICAL') DEFAULT 'INFO',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Checked/Created alerts table');

        // Activities Table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS activities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                description VARCHAR(255) NOT NULL,
                user_id INT,
                type VARCHAR(50), -- e.g., 'SUBMISSION', 'APPROVAL', 'CONFLICT'
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Checked/Created activities table');

        // Deadlines Table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS deadlines (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                due_date DATETIME NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Checked/Created deadlines table');

        // Seed some sample data if tables are empty (for demonstration)
        const [courses] = await connection.execute('SELECT COUNT(*) as count FROM course_units');
        if (courses[0].count === 0) {
            console.log('Seeding initial data...');
            await connection.execute(`
                INSERT INTO course_units (code, name, credits) VALUES 
                ('CS101', 'Intro to CS', 3),
                ('CS102', 'Data Structures', 4)
            `);
            await connection.execute(`
                INSERT INTO alerts (title, message, type) VALUES 
                ('System Maintenance', 'Scheduled for Friday', 'INFO'),
                ('Exam Clash', 'Clash detected in Level 2', 'CRITICAL'),
                ('Grade Submission', 'Due next week', 'WARNING')
            `);
            await connection.execute(`
                INSERT INTO deadlines (title, due_date) VALUES 
                ('Timetable Submission', DATE_ADD(NOW(), INTERVAL 2 DAY)),
                ('Module Registration', DATE_ADD(NOW(), INTERVAL 5 DAY))
            `);
            await connection.execute(`
                INSERT INTO add_drop_requests (student_id, course_id, type) VALUES 
                (1, 1, 'ADD'), (1, 2, 'DROP'), (2, 1, 'ADD'), (3, 1, 'ADD'), 
                (4, 2, 'DROP'), (5, 1, 'ADD'), (6, 1, 'ADD'), (7, 2, 'ADD')
            `);
            await connection.execute(`
                INSERT INTO activities (description, type) VALUES 
                ('New timetable submitted for Level 1', 'SUBMISSION'),
                ('Timetable approval pending', 'APPROVAL')
            `);
            console.log('Seeded data.');
        }

        // Batch Configurations Table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS batch_configurations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                batch_rep_id INT, -- context user id
                level INT DEFAULT 1,
                course_code VARCHAR(50) NOT NULL,
                preferred_dates JSON,
                status ENUM('DRAFT', 'SENT') DEFAULT 'DRAFT',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Checked/Created batch_configurations table');

        connection.release();
        console.log('Database setup complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error setting up database:', err);
        process.exit(1);
    }
};

createTables();
