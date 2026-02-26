const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/add-drop/list',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        // Provide a mock token representing a student or admin (replace with valid token structure if secret matches)
        // Since we removed 'verifyToken' middleware initially and decoded manually, we need to sign one.
    }
};

const jwt = require('jsonwebtoken');
require('dotenv').config();

// Sign a temporary token using the active JWT_SECRET
const token = jwt.sign({ user_id: 1, role: 'Student' }, process.env.JWT_SECRET || 'your_super_secret_key_which_should_be_long_and_secure', { expiresIn: '1h' });

options.headers['Authorization'] = `Bearer ${token}`;

const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Body:`, JSON.parse(data));
    });
});

req.on('error', error => {
    console.error(error);
});

req.end();
