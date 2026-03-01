const pool = require('./config/db');

async function updateRolesAndCreateTables() {
    try {
        console.log("Updating approval statuses...");
        // Update user approval statuses
        const [result] = await pool.execute(
            `UPDATE users 
             SET approval_status = 'Approved' 
             WHERE role IN ('Dean', 'AcademicSupervisor', 'Student', 'BatchRep', 'HallAttendant')`
        );
        console.log(`Updated ${result.affectedRows} users to Approved.`);

        console.log("Creating exam_draft_allocations table...");
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS exam_draft_allocations (
                alloc_id INT AUTO_INCREMENT PRIMARY KEY,
                exam_id INT NOT NULL,
                venue VARCHAR(255),
                assigned_non_repeat INT DEFAULT 0,
                assigned_repeat INT DEFAULT 0,
                supervisor_id INT,
                attendants VARCHAR(255),
                FOREIGN KEY (exam_id) REFERENCES exam_timetables(timetable_id) ON DELETE CASCADE,
                FOREIGN KEY (supervisor_id) REFERENCES users(user_id) ON DELETE SET NULL
            )
        `);

        console.log("Creating exam_draft_invigilators table...");
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS exam_draft_invigilators (
                alloc_id INT NOT NULL,
                invigilator_id INT NOT NULL,
                PRIMARY KEY (alloc_id, invigilator_id),
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

updateRolesAndCreateTables();
