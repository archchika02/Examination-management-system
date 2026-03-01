const pool = require('./config/db');

async function addIsPublished() {
    try {
        console.log("Checking for is_published column...");
        const [columns] = await pool.query(`SHOW COLUMNS FROM exam_draft_allocations LIKE 'is_published'`);
        if (columns.length === 0) {
            console.log("Adding is_published column...");
            await pool.query('ALTER TABLE exam_draft_allocations ADD COLUMN is_published BOOLEAN DEFAULT FALSE');
            console.log("Column added.");
        } else {
            console.log("Column already exists.");
        }
    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        process.exit();
    }
}
addIsPublished();
