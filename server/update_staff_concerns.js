const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function updateStaffConcernsTable() {
    let connection;
    try {
        console.log("Connecting to the database...");
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'A09rChChIkA27',
            database: process.env.DB_NAME || 'ems_database'
        });

        console.log("Adding replacement_staff_id column...");
        await connection.execute(`
            ALTER TABLE staff_concerns
            ADD COLUMN replacement_staff_id INT DEFAULT NULL;
        `);
        console.log("Column added successfully.");

    } catch (err) {
        console.error("Error updating table:", err);
    } finally {
        if (connection) {
            await connection.end();
            console.log("Database connection closed.");
        }
    }
}

updateStaffConcernsTable();
