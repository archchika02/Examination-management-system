const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/stats', dashboardController.getStats);
router.get('/activities', dashboardController.getRecentActivity);
router.get('/deadlines', dashboardController.getUpcomingDeadlines);
router.get('/faculty-staff', dashboardController.getFacultyStaff);
router.get('/department-staff', dashboardController.getDepartmentStaff);
router.get('/activities/unread-count', dashboardController.getUnreadActivityCount);
router.post('/activities/:id/mark-read', dashboardController.markActivityRead);
router.put('/faculty-staff/:id/status', dashboardController.updateStaffStatus); // Can be reused or aliased

module.exports = router;
