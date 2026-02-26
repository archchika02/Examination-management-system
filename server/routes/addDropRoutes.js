const express = require('express');
const router = express.Router();
const addDropController = require('../controllers/addDropController');

router.post('/submit', addDropController.submitAddDropRequest);
router.get('/list', addDropController.getAddDropRequests);
router.patch('/:id/status', addDropController.updateAddDropStatus);

module.exports = router;
