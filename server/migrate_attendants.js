const pool = require('./config/db');

async function migrateAttendants() {
    try {
        console.log("Dropping old attendants column...");
        await pool.execute('ALTER TABLE exam_draft_allocations DROP COLUMN attendants');

        console.log("Creating exam_draft_attendants table...");
        await pool.execute(`
            CREATE TABLE exam_draft_attendants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                alloc_id INT NOT NULL,
                attendant_id INT NOT NULL,
                FOREIGN KEY (alloc_id) REFERENCES exam_draft_allocations(alloc_id) ON DELETE CASCADE,
                FOREIGN KEY (attendant_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        `);

        console.log("Migration completed.");
    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        process.exit(0);
    }
}

migrateAttendants();
