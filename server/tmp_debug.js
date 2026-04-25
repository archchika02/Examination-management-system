const pool = require('./config/db');
const fs = require('fs');

async function debug() {
    try {
        const results = {};

        const [dbNameRow] = await pool.query('SELECT DATABASE() as db');
        const dbName = dbNameRow[0].db;
        results.database = dbName;

        const [tables] = await pool.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);
        results.tables = tableNames;

        results.table_details = {};
        for (const tableName of tableNames) {
            const [cols] = await pool.query(`DESCRIBE ${tableName}`);
            const [fks] = await pool.query(`
                SELECT 
                    COLUMN_NAME, 
                    CONSTRAINT_NAME, 
                    REFERENCED_TABLE_NAME, 
                    REFERENCED_COLUMN_NAME
                FROM
                    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE
                    TABLE_NAME = ? AND TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL
            `, [tableName, dbName]);
            results.table_details[tableName] = { columns: cols, fks: fks };
        }

        fs.writeFileSync('schema_debug_full.json', JSON.stringify(results, null, 2));
        console.log('Full results saved to schema_debug_full.json');

    } catch (err) {
        console.error('Error debugging schema:', err);
    } finally {
        process.exit();
    }
}

debug();
