const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');

(async () => {
    const pool = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'examination_management'
    });
    try {
        const [rows] = await pool.query(`
            SELECT 
                COLUMN_NAME, 
                CONSTRAINT_NAME, 
                REFERENCED_TABLE_NAME, 
                REFERENCED_COLUMN_NAME 
            FROM 
                INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE 
                TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'staff_concerns' 
                AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        fs.writeFileSync('staff_concerns_fks.json', JSON.stringify(rows, null, 2));
        console.log('FKs written to staff_concerns_fks.json');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
})();
