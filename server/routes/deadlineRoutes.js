const express = require('express');
const router = express.Router();
const pool = require('../config/db');

/**
 * POST /api/deadlines
 * Save a new deadline with roles and notify settings.
 * Body: { formName, deadline, roles, description, notifyEmail, notifySystem, createdBy }
 */
router.post('/', async (req, res) => {
    const { formName, deadline, roles, description, notifyEmail, notifySystem, createdBy, academicYear } = req.body;

    if (!formName || !deadline || !roles || roles.length === 0) {
        return res.status(400).json({ message: 'formName, deadline, and at least one role are required' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Insert into deadlines table
        const [result] = await connection.execute(
            `INSERT INTO deadlines (form_name, title, due_date, description, notify_email, notify_system, academic_year)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                formName,
                formName,
                deadline,
                description || '',
                notifyEmail ? 1 : 0,
                notifySystem ? 1 : 0,
                academicYear || null
            ]
        );

        const deadlineId = result.insertId;

        // Insert into deadline_roles table
        for (const role of roles) {
            await connection.execute(
                `INSERT IGNORE INTO deadline_roles (deadline_id, role_name) VALUES (?, ?)`,
                [deadlineId, role]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Deadline saved', deadlineId });
    } catch (err) {
        await connection.rollback();
        console.error('Error saving deadline:', err);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        connection.release();
    }
});

/**
 * GET /api/deadlines
 * Get all deadlines with their roles.
 * Used by Faculty Staff to list all deadlines they set.
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                d.id, d.form_name, d.title, d.due_date AS deadline, d.description,
                d.notify_email, d.notify_system, d.created_at, d.academic_year,
                GROUP_CONCAT(dr.role_name ORDER BY dr.role_name SEPARATOR ',') AS roles
            FROM deadlines d
            LEFT JOIN deadline_roles dr ON d.id = dr.deadline_id
            WHERE d.form_name IS NOT NULL
            GROUP BY d.id
            ORDER BY d.created_at DESC
        `);

        const deadlines = rows.map(r => ({
            ...r,
            roles: r.roles ? r.roles.split(',') : []
        }));

        res.json(deadlines);
    } catch (err) {
        console.error('Error fetching deadlines:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * GET /api/deadlines/notifications?userId=X&role=Y
 * Get deadline notifications for a specific user in a specific role.
 * Returns deadlines + whether that user has read each one.
 */
router.get('/notifications', async (req, res) => {
    const { userId, role } = req.query;

    if (!userId || !role) {
        return res.status(400).json({ message: 'userId and role are required' });
    }

    try {
        const [rows] = await pool.execute(`
            SELECT 
                d.id,
                d.form_name,
                d.title,
                d.due_date AS deadline,
                d.description,
                d.notify_system,
                d.created_at,
                IF(dnr.user_id IS NOT NULL, 1, 0) AS is_read
            FROM deadlines d
            INNER JOIN deadline_roles dr ON d.id = dr.deadline_id AND dr.role_name = ?
            LEFT JOIN deadline_notification_reads dnr ON d.id = dnr.deadline_id AND dnr.user_id = ?
            WHERE d.notify_system = 1 AND d.form_name IS NOT NULL
            ORDER BY d.created_at DESC
        `, [role, userId]);

        res.json(rows);
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * GET /api/deadlines/unread-count?userId=X&role=Y
 * Get count of unread deadline notifications for a user+role.
 */
router.get('/unread-count', async (req, res) => {
    const { userId, role } = req.query;

    if (!userId || !role) {
        return res.status(400).json({ count: 0 });
    }

    try {
        const [rows] = await pool.execute(`
            SELECT COUNT(*) AS count
            FROM deadlines d
            INNER JOIN deadline_roles dr ON d.id = dr.deadline_id AND dr.role_name = ?
            LEFT JOIN deadline_notification_reads dnr ON d.id = dnr.deadline_id AND dnr.user_id = ?
            WHERE d.notify_system = 1 AND d.form_name IS NOT NULL AND dnr.user_id IS NULL
        `, [role, userId]);

        res.json({ count: rows[0].count });
    } catch (err) {
        console.error('Error fetching unread count:', err);
        res.status(500).json({ count: 0 });
    }
});

/**
 * POST /api/deadlines/mark-read
 * Mark a deadline as read for a specific user.
 * Body: { userId, deadlineId }
 */
router.post('/mark-read', async (req, res) => {
    const { userId, deadlineId } = req.body;

    if (!userId || !deadlineId) {
        return res.status(400).json({ message: 'userId and deadlineId are required' });
    }

    try {
        await pool.execute(
            `INSERT IGNORE INTO deadline_notification_reads (deadline_id, user_id) VALUES (?, ?)`,
            [deadlineId, userId]
        );
        res.json({ message: 'Marked as read' });
    } catch (err) {
        console.error('Error marking as read:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * POST /api/deadlines/mark-all-read
 * Mark all deadline notifications as read for a user+role.
 * Body: { userId, role }
 */
router.post('/mark-all-read', async (req, res) => {
    const { userId, role } = req.body;

    if (!userId || !role) {
        return res.status(400).json({ message: 'userId and role are required' });
    }

    try {
        // Get all unread deadline IDs for this role+user combination
        const [unread] = await pool.execute(`
            SELECT d.id FROM deadlines d
            INNER JOIN deadline_roles dr ON d.id = dr.deadline_id AND dr.role_name = ?
            LEFT JOIN deadline_notification_reads dnr ON d.id = dnr.deadline_id AND dnr.user_id = ?
            WHERE d.notify_system = 1 AND d.form_name IS NOT NULL AND dnr.user_id IS NULL
        `, [role, userId]);

        for (const row of unread) {
            await pool.execute(
                `INSERT IGNORE INTO deadline_notification_reads (deadline_id, user_id) VALUES (?, ?)`,
                [row.id, userId]
            );
        }

        res.json({ message: `Marked ${unread.length} as read` });
    } catch (err) {
        console.error('Error marking all as read:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
