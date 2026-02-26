const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const medicalRepeatController = require('../controllers/medicalRepeatController');
const multer = require('multer');
const path = require('path');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'uploads/'));
    },
    filename: function (req, file, cb) {
        // Create unique filename
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (err) {
            console.error('JWT Verification Error:', err.message, 'Token:', token);
            return res.status(401).json({ message: 'Unauthorized access' });
        }
    } else {
        return res.status(401).json({ message: 'Authorization header missing' });
    }
};

const roleMiddleware = (allowedRoles) => (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    next();
};

// Submit a new application (Students)
// Adjust roleMiddleware if you only want students to submit
router.post('/submit', verifyToken, upload.fields([
    { name: 'medical_certificate', maxCount: 1 },
    { name: 'payment_receipt', maxCount: 1 }
]), medicalRepeatController.submitForm);

// Get all applications (Faculty Staff)
router.get('/', verifyToken, roleMiddleware(['FacultyStaff', 'FacultyAdmin']), medicalRepeatController.getAllForms);

// Get a specific application by ID
router.get('/:id', verifyToken, medicalRepeatController.getFormById);

// Get applications submitted by a specific student
router.get('/student/:user_id', verifyToken, roleMiddleware(['Student', 'BatchRepresentative']), medicalRepeatController.getStudentForms);

// Update application status (Approve/Reject - Faculty Staff)
router.put('/:id/status', verifyToken, roleMiddleware(['FacultyStaff', 'FacultyAdmin']), medicalRepeatController.updateFormStatus);

module.exports = router;
