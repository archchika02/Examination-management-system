const pool = require('../config/db');

async function migrate() {
    try {
        const connection = await pool.getConnection();
        
        console.log('Checking global_timetable_config table...');
        
        // Add academic_year column if it doesn't exist
        const [columns] = await connection.query('SHOW COLUMNS FROM global_timetable_config LIKE "academic_year"');
        
        if (columns.length === 0) {
            console.log('Adding academic_year column...');
            await connection.query('ALTER TABLE global_timetable_config ADD COLUMN academic_year VARCHAR(50) DEFAULT "" AFTER deadline');
            console.log('Column added successfully.');
        } else {
            console.log('academic_year column already exists.');
        }

        connection.release();
        console.log('Migration complete.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
