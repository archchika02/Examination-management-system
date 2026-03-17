const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function getSchema() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'ems'
        });

        const [rows] = await pool.query('DESCRIBE modules');
        fs.writeFileSync('module_schema.json', JSON.stringify(rows, null, 2));
        console.log('Schema written to module_schema.json');
        await pool.end();
    } catch (err) {
        console.error(err);
    }
}

getSchema();
