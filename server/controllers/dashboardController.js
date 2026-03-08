const pool = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        const [addDropCount] = await pool.execute(
            "SELECT COUNT(*) as count FROM add_drop_request_headers WHERE status = 'Pending Supervisor'"
        );
        // Get the latest academic year and its course count from the courses table
        const [latestYear] = await pool.execute(
            "SELECT academic_year, COUNT(*) as count FROM courses WHERE academic_year IS NOT NULL GROUP BY academic_year ORDER BY academic_year DESC LIMIT 1"
        );
        const courseUnitCount = latestYear.length > 0 ? latestYear[0].count : 0;
        const latestAcademicYear = latestYear.length > 0 ? latestYear[0].academic_year : null;

        const [alertCount] = await pool.execute(
            'SELECT COUNT(*) as count FROM alerts WHERE is_active = TRUE'
        );

        res.json({
            pendingAddDrop: addDropCount[0].count,
            totalCourseUnits: courseUnitCount,
            latestAcademicYear: latestAcademicYear,
            activeAlerts: alertCount[0].count
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};

exports.getRecentActivity = async (req, res) => {
    try {
        const [activities] = await pool.execute(
            'SELECT * FROM activities ORDER BY created_at DESC LIMIT 5'
        );
        res.json(activities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching activities' });
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

    try {
        await pool.execute(
            "UPDATE users SET approval_status = ? WHERE user_id = ?",
            [status, id]
        );
        res.json({ message: `Staff status updated to ${status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating staff status' });
    }
};
