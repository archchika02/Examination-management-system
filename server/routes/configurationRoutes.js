const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Save or Update Configuration (Supports Bulk)
router.post('/save', async (req, res) => {
    const payload = Array.isArray(req.body) ? req.body : [req.body]; // Handle both array and single object

    if (payload.length === 0) {
        return res.status(400).json({ message: 'No configurations provided' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        for (const config of payload) {
            const { batch_rep_id, course_code, preferred_dates, status, level } = config;

            // Preferred dates should be JSON stringified if not already
            const datesStr = typeof preferred_dates === 'string' ? preferred_dates : JSON.stringify(preferred_dates);
            // Default level to 1 if not provided, favoring manual input then DB lookup if we wanted (but user asked for manual input preference)
            const finalLevel = level || 1;

            const [existing] = await connection.execute(
                'SELECT id FROM batch_configurations WHERE batch_rep_id = ? AND course_code = ?',
                [batch_rep_id || 1, course_code]
            );

            if (existing.length > 0) {
                // Update
                await connection.execute(
                    'UPDATE batch_configurations SET preferred_dates = ?, status = ?, level = ? WHERE id = ?',
                    [datesStr, status || 'DRAFT', finalLevel, existing[0].id]
                );
            } else {
                // Insert
                await connection.execute(
                    'INSERT INTO batch_configurations (batch_rep_id, course_code, preferred_dates, status, level) VALUES (?, ?, ?, ?, ?)',
                    [batch_rep_id || 1, course_code, datesStr, status || 'DRAFT', finalLevel]
                );
            }
        }

        await connection.commit();
        res.json({ message: 'Configurations saved successfully', count: payload.length });

    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ error: 'Server error saving configurations' });
    } finally {
        connection.release();
    }
});

// List Configurations
router.get('/list', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM batch_configurations ORDER BY created_at DESC');
        // Parse JSON dates
        const configs = rows.map(row => ({
            ...row,
            preferred_dates: typeof row.preferred_dates === 'string' ? JSON.parse(row.preferred_dates) : row.preferred_dates
        }));
        res.json(configs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching configurations' });
    }
});

module.exports = router;
