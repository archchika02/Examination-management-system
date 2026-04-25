const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
    const pool = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'examination_management'
    });
    try {
        const [allocSchema] = await pool.query('DESCRIBE exam_draft_allocations');
        const [slotsSchema] = await pool.query('DESCRIBE exam_slots');
        const [timetableSchema] = await pool.query('DESCRIBE exam_timetables');
        
        const fs = require('fs');
        const output = {
            exam_draft_allocations: allocSchema,
            exam_slots: slotsSchema,
            exam_timetables: timetableSchema
        };
        fs.writeFileSync('schema_output.json', JSON.stringify(output, null, 2));
        console.log('Schema written to schema_output.json');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
})();
