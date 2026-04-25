const pool = require('./config/db');

async function updateInvigilatorsSchema() {
    try {
        console.log("Dropping old table if it exists...");
        await pool.execute('DROP TABLE IF EXISTS exam_draft_invigilators');

        console.log("Creating exam_draft_invigilators table with new primary key...");
        await pool.execute(`
            CREATE TABLE exam_draft_invigilators (
                id INT AUTO_INCREMENT PRIMARY KEY,
                alloc_id INT NOT NULL,
                invigilator_id INT NOT NULL,
                FOREIGN KEY (alloc_id) REFERENCES exam_draft_allocations(alloc_id) ON DELETE CASCADE,
                FOREIGN KEY (invigilator_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        `);

        console.log("Schema update completed successfully.");
    } catch (err) {
        console.error("Error updating schema:", err);
    } finally {
        process.exit(0);
    }
}

updateInvigilatorsSchema();
