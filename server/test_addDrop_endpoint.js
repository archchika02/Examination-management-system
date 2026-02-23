require('dotenv').config();
const jwt = require('jsonwebtoken');
const http = require('http');

const secret = process.env.JWT_SECRET || 'your_jwt_secret';
const token = jwt.sign({ user_id: 1, role: 'Student' }, secret, { expiresIn: '1h' });

const payload = JSON.stringify({
    student_number: 'IM22096',
    student_name: 'Test Student',
    contact_number: '0712345678',
    email: 'test@student.com',
    combination: 'CS-MATH',
    year: '2',
    sem1_credits: 15,
    sem2_credits: 13,
    total_credits: 28,
    signature: 'Test Signature Value',
    signature_date: '2026-02-21',
    added_courses: ['SENG11223', 'CMIS12122'],
    dropped_courses: ['STAT11111']
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/add-drop/submit',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': payload.length
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Body: ${data}`);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(payload);
req.end();
