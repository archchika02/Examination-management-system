const pool = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        const [addDropCount] = await pool.execute(
            "SELECT COUNT(*) as count FROM add_drop_request_headers WHERE status = 'Pending Supervisor'"
        );
        const [deanAddDropCount] = await pool.execute(
            "SELECT COUNT(*) as count FROM add_drop_request_headers WHERE status = 'Pending Dean'"
        );
        const [totalFacultyStaff] = await pool.execute(
            "SELECT COUNT(*) as count FROM users WHERE role = 'FacultyStaff'"
        );
        const [pendingFacultyStaff] = await pool.execute(
            "SELECT COUNT(*) as count FROM users WHERE role = 'FacultyStaff' AND approval_status = 'Pending'"
        );

        // Get the global current academic year from configuration
        const [globalConfig] = await pool.execute('SELECT academic_year FROM global_timetable_config LIMIT 1');
        const currentAY = globalConfig.length > 0 ? globalConfig[0].academic_year : '2024/2025';

        const subtractYears = (ay, offset) => {
            if (!ay || !ay.includes('/')) return ay;
            const parts = ay.split('/');
            const y1 = parseInt(parts[0]);
            const y2 = parseInt(parts[1]);
            return isNaN(y1) || isNaN(y2) ? ay : `${y1 - offset}/${y2 - offset}`;
        };

        const levelMapping = {
            1: currentAY,
            2: subtractYears(currentAY, 1),
            3: subtractYears(currentAY, 2),
            4: subtractYears(currentAY, 3)
        };

        const levelStats = {};
        let totalCountAllLevels = 0;

        for (const [level, year] of Object.entries(levelMapping)) {
            const [data] = await pool.execute(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN non_written_type = 'Non-written' THEN 1 ELSE 0 END) as nonWritten,
                    SUM(CASE WHEN non_written_type = 'Written' OR non_written_type IS NULL THEN 1 ELSE 0 END) as written
                FROM modules 
                WHERE level = ? AND academic_year = ?
            `, [level, year]);

            const row = data[0];
            levelStats[level] = {
                year: year,
                total: row.total || 0,
                written: row.written || 0,
                nonWritten: row.nonWritten || 0
            };
            totalCountAllLevels += (row.total || 0);
        }

        const [alertCount] = await pool.execute(
            'SELECT COUNT(*) as count FROM alerts WHERE is_active = TRUE'
        );

        res.json({
            pendingAddDrop: addDropCount[0].count,
            pendingDeanAddDrop: deanAddDropCount[0].count,
            totalFacultyStaff: totalFacultyStaff[0].count,
            pendingFacultyStaff: pendingFacultyStaff[0].count,
            totalCourseUnits: totalCountAllLevels,
            latestAcademicYear: currentAY,
            levelBreakdown: levelStats,
            activeAlerts: alertCount[0].count
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};

exports.getRecentActivity = async (req, res) => {
    try {
        const { userId } = req.query;
        let activityQuery = 'SELECT id, description, created_at, type, is_read FROM activities';
        let activityParams = [];

        if (userId) {
            activityQuery += ' WHERE user_id = ?';
            activityParams.push(userId);
        }

        activityQuery += ' ORDER BY created_at DESC LIMIT 10';

        const [activities] = await pool.execute(activityQuery, activityParams);

        const [alerts] = await pool.execute(
            'SELECT title as description, created_at, "NOTIFICATION" as type FROM alerts ORDER BY created_at DESC LIMIT 5'
        );

        // Combine and sort
        const combined = [...activities, ...alerts]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        res.json(combined);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching activities' });
    }
};

exports.markActivityRead = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('UPDATE activities SET is_read = 1 WHERE id = ?', [id]);
        res.json({ message: 'Activity marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error marking activity as read' });
    }
};

exports.getUnreadActivityCount = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ count: 0 });

        const [rows] = await pool.execute(
            "SELECT COUNT(*) as count FROM activities WHERE user_id = ? AND type = 'notification' AND is_read = 0",
            [userId]
        );
        res.json({ count: rows[0].count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ count: 0 });
    }
};

exports.getUpcomingDeadlines = async (req, res) => {
    try {
        const [deadlines] = await pool.execute(
            'SELECT * FROM deadlines WHERE due_date >= NOW() ORDER BY due_date ASC LIMIT 5'
        );
        res.json(deadlines);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching deadlines' });
    }
};

exports.getFacultyStaff = async (req, res) => {
    try {
        const [staff] = await pool.execute(
            "SELECT user_id as id, name, email, mobile, approval_status as status, created_at as requestedAt FROM users WHERE role = 'FacultyStaff'"
        );
        res.json(staff);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching faculty staff' });
    }
};

exports.getDepartmentStaff = async (req, res) => {
    try {
        const [staff] = await pool.execute(
            "SELECT user_id as id, name, email, mobile, approval_status as status, created_at as requestedAt FROM users WHERE role = 'DeptStaff'"
        );
        res.json(staff);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching department staff' });
    }
};

exports.updateStaffStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'Approved' or 'Rejected'

    const authHeader = req.headers.authorization;
    let userId = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
            userId = decoded.user_id || decoded.id;
        } catch (err) {
            console.warn("JWT verification failed in updateStaffStatus");
        }
    }

    try {
        await pool.execute(
            "UPDATE users SET approval_status = ? WHERE user_id = ?",
            [status, id]
        );

        const [user] = await pool.execute('SELECT name FROM users WHERE user_id = ?', [id]);
        if (user.length > 0) {
            const actionText = status === 'Approved' ? 'approved' : 'rejected';
            const actionType = status === 'Approved' ? 'APPROVAL' : 'REJECTION';
            await pool.execute(
                'INSERT INTO activities (user_id, description, type) VALUES (?, ?, ?)',
                [userId, `${user[0].name} staff was ${actionText}`, actionType]
            );
        }

        res.json({ message: `Staff status updated to ${status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating staff status' });
    }
};
