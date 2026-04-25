const pool = require('./config/db');
async function go() {
    const conn = await pool.getConnection();
    try {
        // Step 1: Show all columns for all deadline* tables
        for (const tbl of ['deadlines', 'deadline_roles', 'deadline_notification_reads']) {
            const [cols] = await conn.execute(`DESCRIBE ${tbl}`);
            console.log(`\n=== ${tbl} ===`);
            cols.forEach(r => console.log(`  ${r.Field} | ${r.Type} | NULL:${r.Null} | KEY:${r.Key}`));
        }

        // Step 2: Try the insert step-by-step
        console.log('\n--- Testing INSERT deadlines ---');
        const [r1] = await conn.execute(
            `INSERT INTO deadlines (form_name, title, due_date, description, notify_email, notify_system) VALUES (?, ?, ?, ?, ?, ?)`,
            ['Test Form', 'Test Form', '2026-04-01', '', 0, 1]
        );
        console.log('OK, id:', r1.insertId);

        console.log('--- Testing INSERT deadline_roles ---');
        await conn.execute(
            `INSERT IGNORE INTO deadline_roles (deadline_id, role_name) VALUES (?, ?)`,
            [r1.insertId, 'Students']
        );
        console.log('OK');

        // Cleanup
        await conn.execute('DELETE FROM deadline_roles WHERE deadline_id = ?', [r1.insertId]);
        await conn.execute('DELETE FROM deadlines WHERE id = ?', [r1.insertId]);
        console.log('Cleanup done. All good!');
    } catch (e) {
        console.error('STEP FAILED:', e.message, e.code);
    } finally {
        conn.release();
        process.exit(0);
    }
}
go();
