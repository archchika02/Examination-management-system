const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/admission-cards', reportController.getAdmissionCards);
router.get('/attendance-sheets', reportController.getAttendanceSheets);
router.get('/examiner-courses/:userId', reportController.getExaminerCourses);
router.get('/course-examiners', reportController.getCourseExaminers);
router.get('/exam-dates', reportController.getExamDates);
router.get('/exam-courses/:date', reportController.getExamCoursesByDate);

module.exports = router;
