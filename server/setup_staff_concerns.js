const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function createStaffConcernsTable() {
    let connection;
    try {
        console.log("Connecting to the database...");
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'A09rChChIkA27',
            database: process.env.DB_NAME || 'ems_database'
        });

        console.log("Connected. Creating staff_concerns table if not exists...");

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS staff_concerns (
                concern_id INT AUTO_INCREMENT PRIMARY KEY,
                alloc_id INT NOT NULL,
                exam_id INT NOT NULL,
                staff_id INT NOT NULL,
                role VARCHAR(50) NOT NULL,
                reason TEXT NOT NULL,
                status ENUM('Pending', 'Resolved') DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (staff_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        `);

        console.log("staff_concerns table created or already exists.");

    } catch (err) {
        console.error("Error creating table:", err);
    } finally {
        if (connection) {
            await connection.end();
            console.log("Database connection closed.");
        }
    }
}

createStaffConcernsTable();
