const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

const alterTable = async () => {
    // Assuming standard localhost configuration for your local DB
    const pool = mysql.createPool({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ems_db',
    });

    try {
        console.log("Adding columns to course_unit_registration_headers...");

        await pool.query(`
            ALTER TABLE course_unit_registration_headers 
            ADD COLUMN address VARCHAR(255), 
            ADD COLUMN mobile VARCHAR(20), 
            ADD COLUMN email VARCHAR(100);
        `);

        console.log("Migration successful!");
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("Columns already exist, skipping.");
        } else {
            console.error("Migration failed:", err);
        }
    } finally {
        pool.end();
    }
};

alterTable();
