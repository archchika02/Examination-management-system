const pool = require('../server/config/db');

async function debug() {
    try {
        console.log('--- Columns in exam_timetables ---');
        const [rows] = await pool.query('DESCRIBE exam_timetables');
        console.table(rows);

        console.log('\n--- Columns in exam_slots ---');
        const [rowsSlots] = await pool.query('DESCRIBE exam_slots');
        console.table(rowsSlots);

        console.log('\n--- Foreign Keys in exam_slots ---');
        const [dbNameRow] = await pool.query('SELECT DATABASE() as db');
        const dbName = dbNameRow[0].db;
        console.log(`Using database: ${dbName}`);

        const [fks] = await pool.query(`
            SELECT 
                COLUMN_NAME, 
                CONSTRAINT_NAME, 
                REFERENCED_TABLE_NAME, 
                REFERENCED_COLUMN_NAME
            FROM
                INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE
                TABLE_NAME = 'exam_slots' AND TABLE_SCHEMA = ?
        `, [dbName]);
        console.table(fks);

    } catch (err) {
        console.error('Error debugging schema:', err);
    } finally {
        process.exit();
    }
}

debug();
