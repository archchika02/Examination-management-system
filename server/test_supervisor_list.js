const http = require('http');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Temporary mock token for supervisor
const token = jwt.sign({ user_id: 2, role: 'Academic Supervisor' }, process.env.JWT_SECRET || 'your_super_secret_key_which_should_be_long_and_secure', { expiresIn: '1h' });

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/add-drop/list',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
};

const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Body length:`, data.length);
        try {
            console.log(JSON.parse(data));
        } catch (e) { console.log(data); }
    });
});
req.on('error', console.error);
req.end();
