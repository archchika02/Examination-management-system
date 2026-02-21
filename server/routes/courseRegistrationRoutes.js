const express = require('express');
const router = express.Router();
const courseRegistrationController = require('../controllers/courseRegistrationController');

// Submit Course Registration Form (3NF)
router.post('/submit', courseRegistrationController.submitRegistration);

// Get Course Registrations (e.g. for admin dashboard)
router.get('/list', courseRegistrationController.listRegistrations);

// Update Status (Approve/Reject)
router.patch('/:id/status', courseRegistrationController.updateStatus);

module.exports = router;
