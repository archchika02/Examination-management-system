require('dotenv').config();
const jwt = require('jsonwebtoken');

const testSubmit = async () => {
    try {
        const secret = process.env.JWT_SECRET || 'your_jwt_secret';
        const token = jwt.sign({ user_id: 1, role: 'Student' }, secret, { expiresIn: '1h' });

        const payload = {
            student_number: 'IM/2022/999',
            student_name: 'Test Student Medical',
            contact_number: '0712345678',
            email: 'testmed@std.kln.ac.lk',
            form_type: 'Medical',
            signature: 'Test Signature',
            signature_date: '2024-03-15',
            courses: [
                {
                    course_code: 'IT3030',
                    course_title: 'Software Engineering',
                    results_obtained: 'MED',
                    academic_year: '2022/2023 - Sem 1'
                }
            ]
        };

        console.log('Submitting medical form...');
        const res = await fetch('http://127.0.0.1:5000/api/medical-repeat/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        console.log('Response Status:', res.status);
        const data = await res.json();
        console.log('Response Data:', data);

    } catch (error) {
        console.error('Error during test:', error);
    }
};

testSubmit();
