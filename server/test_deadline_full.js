// Replicate exact logic from deadlineRoutes.js POST handler
const pool = require('./config/db');
async function go() {
    const formName = 'Add/Drop Form';
    const deadline = '2026-03-20';
    const roles = ['Students', 'Hall Attendant'];
    const description = 'Test';
    const notifyEmail = false;
    const notifySystem = true;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.execute(
            `INSERT INTO deadlines (form_name, title, due_date, description, notify_email, notify_system) VALUES (?, ?, ?, ?, ?, ?)`,
            [formName, formName, deadline, description || '', notifyEmail ? 1 : 0, notifySystem ? 1 : 0]
        );
        const deadlineId = result.insertId;
        console.log('Deadline inserted, id:', deadlineId);

        for (const role of roles) {
            await connection.execute(
                `INSERT IGNORE INTO deadline_roles (deadline_id, role_name) VALUES (?, ?)`,
                [deadlineId, role]
            );
            console.log('Role inserted:', role);
        }

        await connection.commit();
        console.log('COMMIT OK — full flow works!');

        // Cleanup
        await pool.execute('DELETE FROM deadline_roles WHERE deadline_id = ?', [deadlineId]);
        await pool.execute('DELETE FROM deadlines WHERE id = ?', [deadlineId]);
        console.log('Cleanup done');
    } catch (err) {
        await connection.rollback();
        console.error('ROUTE LOGIC ERROR:', err.message, err.code, err.sqlState);
    } finally {
        connection.release();
        process.exit(0);
    }
}
go();
