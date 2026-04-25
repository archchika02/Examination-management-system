const pool = require('./config/db');

const updateSchema = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to database. Updating schema...');

        try {
            await connection.execute(`
                ALTER TABLE batch_configurations
                ADD COLUMN level INT DEFAULT 1 AFTER batch_rep_id
            `);
            console.log('Added level column to batch_configurations table');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Column level already exists');
            } else {
                throw err;
            }
        }

        connection.release();
        console.log('Schema update complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error updating schema:', err);
        process.exit(1);
    }
};

updateSchema();
