const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ems_db',
    });
    try {
        console.log("Altering the status ENUM...");
        await pool.query("ALTER TABLE add_drop_request_headers MODIFY COLUMN status ENUM('Pending', 'Approved', 'Rejected', 'Pending Supervisor', 'Pending Dean', 'Rejected by Supervisor', 'Rejected by Dean') DEFAULT 'Pending Supervisor'");
        console.log("Table altered successfully.");

        // Optionally, update existing 'Pending' to 'Pending Supervisor' right a way to help test/migrate
        await pool.query("UPDATE add_drop_request_headers SET status = 'Pending Supervisor' WHERE status = 'Pending'");
        console.log("Migrated existing 'Pending' statuses to 'Pending Supervisor'.");
    } catch (e) {
        console.error("Migration failed", e);
    } finally {
        pool.end();
    }
}
run();
