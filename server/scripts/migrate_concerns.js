const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // Drop existing table to avoid conflicts with new schema
        await pool.query('DROP TABLE IF EXISTS staff_concerns');

        const sql = `
            CREATE TABLE IF NOT EXISTS staff_concerns (
                concern_id INT AUTO_INCREMENT PRIMARY KEY,
                alloc_id INT NOT NULL,
                exam_id INT NOT NULL,
                staff_id INT NOT NULL,
                role VARCHAR(50) NOT NULL,
                reason TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                replacement_staff_id INT DEFAULT NULL,
                FOREIGN KEY (staff_id) REFERENCES users(user_id),
                FOREIGN KEY (alloc_id) REFERENCES exam_draft_allocations(alloc_id)
            )
        `;
        await pool.query(sql);
        console.log('Table staff_concerns created successfully with refined schema');
    } catch (e) {
        console.error('Error creating table:', e);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

main();
