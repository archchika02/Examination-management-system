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
app.use(express.json());
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
app.use('/api/courses', courseRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);


// --- Background Jobs ---
// Delete unverified accounts older than 24 hours. Runs every hour at minute 0.
cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Running daily cleanup of unverified accounts...');
    try {
        // Find users who are not verified and whose created_at is older than 24 hours
        // student_details row deletes itself due to ON DELETE CASCADE on user_id if setup correctly, 
        // but let's do a join delete to be extra safe in case DB constraints vary
        const [result] = await pool.execute(
            `DELETE users FROM users 
             WHERE is_verified = FALSE 
             AND created_at < (NOW() - INTERVAL 24 HOUR)`
        );

        if (result.affectedRows > 0) {
            console.log(`[CRON] Successfully deleted ${result.affectedRows} unverified user(s) older than 24 hours.`);
        } else {
            console.log('[CRON] No unverified accounts needed cleanup.');
        }
    } catch (err) {
        console.error('[CRON ERROR] Failed to clean up unverified accounts:', err);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
