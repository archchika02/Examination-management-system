require('dotenv').config();
const jwt = require('jsonwebtoken');

const testGetForms = async () => {
    try {
        const secret = process.env.JWT_SECRET || 'your_jwt_secret';
        // Simulating a Faculty Staff user
        const token = jwt.sign({ user_id: 2, role: 'Faculty Staff' }, secret, { expiresIn: '1h' });

        console.log('Fetching all medical/repeat forms...');
        const res = await fetch('http://127.0.0.1:5000/api/medical-repeat', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Response Status:', res.status);
        const data = await res.json();
        console.log('Response Data:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Error during test:', error);
    }
};

testGetForms();
