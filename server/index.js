const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');
const pool = require('./config/db');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic Route
app.get('/', (req, res) => {
    res.send('EMS Server is running');
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

const configurationRoutes = require('./routes/configurationRoutes');
app.use('/api/configurations', configurationRoutes);

const courseRegistrationRoutes = require('./routes/courseRegistrationRoutes');
app.use('/api/course-registration', courseRegistrationRoutes);

const addDropRoutes = require('./routes/addDropRoutes');
app.use('/api/add-drop', addDropRoutes);

const medicalRepeatRoutes = require('./routes/medicalRepeatRoutes');
app.use('/api/medical-repeat', medicalRepeatRoutes);

const courseRoutes = require('./routes/courseRoutes');
app.use('/api/modules', courseRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);

const deadlineRoutes = require('./routes/deadlineRoutes');
app.use('/api/deadlines', deadlineRoutes);


// --- Background Jobs ---

// Cleanup function: deletes unverified accounts older than 24 hours
const cleanupUnverifiedUsers = async () => {
    console.log('[CRON] Running cleanup of unverified accounts...');
    // Get a dedicated connection so FK_CHECKS is scoped only to this operation
    const connection = await pool.getConnection();
    try {
        // Find expired unverified users first
        const [expired] = await connection.execute(
            `SELECT user_id, email FROM users 
             WHERE is_verified = FALSE 
             AND created_at < (NOW() - INTERVAL 24 HOUR)`
        );

        if (expired.length === 0) {
            console.log('[CRON] No unverified accounts needed cleanup.');
            return;
        }

        const userIds = expired.map(u => u.user_id);
        const ids = userIds.map(() => '?').join(',');

        // Disable FK checks temporarily so we can delete from users directly
        // (child tables like student_details, email_verifications, etc. will cascade or have SET NULL)
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

        const [result] = await connection.execute(
            `DELETE FROM users WHERE user_id IN (${ids})`, userIds
        );

        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

        console.log(`[CRON] Deleted ${result.affectedRows} unverified user(s) older than 24 hours.`);
    } catch (err) {
        // Always re-enable FK checks even on error
        try { await connection.execute('SET FOREIGN_KEY_CHECKS = 1'); } catch (_) { }
        console.error('[CRON ERROR] Failed to clean up unverified accounts:', err.message || err);
    } finally {
        connection.release();
    }
};

// Run once immediately on server start (handles cases where server was restarted)
cleanupUnverifiedUsers();

// Then run every 5 minutes to reliably catch expired accounts
// (Using '*/5 * * * *' instead of hourly to survive nodemon restarts in development)
cron.schedule('*/5 * * * *', cleanupUnverifiedUsers);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
