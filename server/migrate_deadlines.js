/**
 * Migration: Set up deadline notification tables
 * 
 * Changes:
 *   - ALTER deadlines table: add form_name, notify_email, notify_system, created_by columns
 *   - CREATE deadline_roles table: links deadlines to roles that should be notified
 *   - CREATE deadline_notification_reads table: per-user read tracking
 */
const pool = require('./config/db');

const migrate = async () => {
    const connection = await pool.getConnection();
    try {
        console.log('Starting deadline notification migration...');

        // 1. Add new columns to deadlines table (ignore if they already exist)
        const alterColumns = [
            `ALTER TABLE deadlines ADD COLUMN IF NOT EXISTS form_name VARCHAR(100) NULL`,
            `ALTER TABLE deadlines ADD COLUMN IF NOT EXISTS notify_email TINYINT(1) NOT NULL DEFAULT 0`,
            `ALTER TABLE deadlines ADD COLUMN IF NOT EXISTS notify_system TINYINT(1) NOT NULL DEFAULT 1`,
            `ALTER TABLE deadlines ADD COLUMN IF NOT EXISTS created_by INT NULL`,
        ];

        for (const sql of alterColumns) {
            try {
                await connection.execute(sql);
                console.log('OK:', sql.split(' ADD COLUMN IF NOT EXISTS ')[1] || sql.substring(0, 60));
            } catch (e) {
                // MySQL < 8.0 does not support ADD COLUMN IF NOT EXISTS; handle gracefully
                if (e.code !== 'ER_DUP_FIELDNAME') {
                    console.warn('Skipped (already exists or error):', e.message);
                }
            }
        }

        // 2. CREATE deadline_roles table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS deadline_roles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                deadline_id INT NOT NULL,
                role_name VARCHAR(100) NOT NULL,
                FOREIGN KEY (deadline_id) REFERENCES deadlines(id) ON DELETE CASCADE,
                UNIQUE KEY unique_deadline_role (deadline_id, role_name)
            )
        `);
        console.log('OK: deadline_roles table');

        // 3. CREATE deadline_notification_reads table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS deadline_notification_reads (
                id INT AUTO_INCREMENT PRIMARY KEY,
                deadline_id INT NOT NULL,
                user_id INT NOT NULL,
                read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (deadline_id) REFERENCES deadlines(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_deadline (user_id, deadline_id)
            )
        `);
        console.log('OK: deadline_notification_reads table');

        console.log('\nMigration complete!');
    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        connection.release();
        process.exit(0);
    }
};

migrate();
