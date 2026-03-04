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
            AND approval_status = 'approved'
        `;
        const [rows] = await pool.query(query, [role]);
        res.json(rows);
    } catch (err) {
        console.error(`Error fetching users for role ${role}:`, err);
        res.status(500).json({ message: 'Error fetching users by role', error: err.message });
    }
});

module.exports = router;
