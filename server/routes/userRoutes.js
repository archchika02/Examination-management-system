const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET users by role with verification and approval status filters
router.get('/role/:role', async (req, res) => {
    const { role } = req.params;
    try {
        const query = `
            SELECT user_id, name, email 
            FROM users 
            WHERE role = ? 
            AND is_verified = 1 
            AND approval_status = 'Approved'
        `;
        const [rows] = await pool.query(query, [role]);
        res.json(rows);
    } catch (err) {
        console.error(`Error fetching users for role ${role}:`, err);
        res.status(500).json({ message: 'Error fetching users by role', error: err.message });
    }
});

// GET students by level
router.get('/students/level/:level', async (req, res) => {
    const { level } = req.params;
    try {
        const query = `
            SELECT u.user_id, u.name, u.email, s.student_number 
            FROM users u
            JOIN student_details s ON u.user_id = s.user_id
            WHERE u.role = 'Student' 
            AND u.is_verified = 1 
            AND u.approval_status = 'approved'
            AND s.level = ?
        `;
        const [rows] = await pool.query(query, [level]);
        res.json(rows);
    } catch (err) {
        console.error(`Error fetching students for level ${level}:`, err);
        res.status(500).json({ message: 'Error fetching students by level', error: err.message });
    }
});

// POST to swap BatchRep
router.post('/swap-batchrep', async (req, res) => {
    const { currentBatchRepId, newBatchRepId } = req.body;

    if (!currentBatchRepId || !newBatchRepId) {
        return res.status(400).json({ message: 'Missing user IDs' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Update current Batch Rep to Student
        await connection.execute(
            'UPDATE users SET role = "Student" WHERE user_id = ? AND role = "BatchRep"',
            [currentBatchRepId]
        );

        // Update selected Student to Batch Rep
        await connection.execute(
            'UPDATE users SET role = "BatchRep" WHERE user_id = ? AND role = "Student"',
            [newBatchRepId]
        );

        await connection.commit();
        res.json({ message: 'Roles swapped successfully.' });
    } catch (err) {
        await connection.rollback();
        console.error('Error swapping batch rep:', err);
        res.status(500).json({ message: 'Error swapping batch rep roles', error: err.message });
    } finally {
        connection.release();
    }
});

module.exports = router;
