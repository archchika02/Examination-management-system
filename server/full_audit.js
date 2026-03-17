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
        const tables = ['exam_draft_allocations', 'exam_draft_invigilators', 'exam_draft_attendants'];
        const result = {};

        for (const table of tables) {
            const [schema] = await pool.query(`DESCRIBE ${table}`);
            const [fks] = await pool.query(`
                SELECT 
                    COLUMN_NAME, 
                    CONSTRAINT_NAME, 
                    REFERENCED_TABLE_NAME, 
                    REFERENCED_COLUMN_NAME
                FROM 
                    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE 
                    TABLE_SCHEMA = 'examination_management' 
                    AND TABLE_NAME = ?
                    AND REFERENCED_TABLE_NAME IS NOT NULL
            `, [table]);
            
            result[table] = { schema, fks };
        }

        fs.writeFileSync('draft_tables_full_audit.json', JSON.stringify(result, null, 2));
        console.log('Audit written to draft_tables_full_audit.json');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
})();
