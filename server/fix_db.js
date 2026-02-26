const pool = require('./config/db');

async function fix() {
    try {
        await pool.query('ALTER TABLE batch_configurations DROP FOREIGN KEY fk_batch_course');
        console.log("Dropped fk_batch_course");

        await pool.query('ALTER TABLE batch_configurations DROP FOREIGN KEY fk_batch_rep');
        console.log("Dropped fk_batch_rep");

        console.log("Done");
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
fix();
