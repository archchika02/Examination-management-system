const pool = require('./config/db');
async function go() {
    const conn = await pool.getConnection();
    try {
        // Show the actual columns of deadline_roles first
        const [cols] = await conn.execute('DESCRIBE deadline_roles');
        console.log('Current deadline_roles columns:');
        cols.forEach(r => console.log(`  ${r.Field} | ${r.Type} | NULL:${r.Null}`));

        // Drop and recreate with correct columns
        await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
        await conn.execute('DROP TABLE IF EXISTS deadline_roles');
        await conn.execute(`
            CREATE TABLE deadline_roles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                deadline_id INT NOT NULL,
                role_name VARCHAR(100) NOT NULL,
                FOREIGN KEY (deadline_id) REFERENCES deadlines(id) ON DELETE CASCADE,
                UNIQUE KEY unique_deadline_role (deadline_id, role_name)
            )
        `);
        await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Recreated deadline_roles table with correct columns');

        // Verify
        const [cols2] = await conn.execute('DESCRIBE deadline_roles');
        console.log('New columns:');
        cols2.forEach(r => console.log(`  ${r.Field} | ${r.Type}`));

        // Test the full insert flow
        const [r1] = await conn.execute(
            `INSERT INTO deadlines (form_name, title, due_date, description, notify_email, notify_system) VALUES (?, ?, ?, ?, ?, ?)`,
            ['Add/Drop Form', 'Add/Drop Form', '2026-04-01', 'Test', 0, 1]
        );
        console.log('\nDeadline insert OK, id:', r1.insertId);

        await conn.execute(`INSERT IGNORE INTO deadline_roles (deadline_id, role_name) VALUES (?, ?)`, [r1.insertId, 'Students']);
        console.log('Role insert OK');

        await conn.execute('DELETE FROM deadline_roles WHERE deadline_id = ?', [r1.insertId]);
        await conn.execute('DELETE FROM deadlines WHERE id = ?', [r1.insertId]);
        console.log('Cleanup done. Everything works!');
    } catch (e) {
        await conn.execute('SET FOREIGN_KEY_CHECKS = 1').catch(() => { });
        console.error('ERROR:', e.message, e.code);
    } finally {
        conn.release();
        process.exit(0);
    }
}
go();
