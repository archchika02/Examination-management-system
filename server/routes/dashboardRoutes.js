const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/stats', dashboardController.getStats);
router.get('/activities', dashboardController.getRecentActivity);
router.get('/deadlines', dashboardController.getUpcomingDeadlines);

module.exports = router;
