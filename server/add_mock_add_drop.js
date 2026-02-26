const http = require('http');

const requests = [
    {
        student_number: "SC/2021/1111",
        student_name: "Alice Smith",
        contact_number: "0771111111",
        email: "alice@student.kln.ac.lk",
        combination: "CS1",
        year: "3",
        sem1_credits: "15",
        sem2_credits: "15",
        total_credits: "30",
        signature: "data:image/png;base64,...",
        signature_date: "2023-11-01",
        added_courses: ["COMP31114", "MATH31114"],
        dropped_courses: ["PHYS31114"]
    },
    {
        student_number: "SC/2021/2222",
        student_name: "Bob Jones",
        contact_number: "0772222222",
        email: "bob@student.kln.ac.lk",
        combination: "MATH1",
        year: "2",
        sem1_credits: "12",
        sem2_credits: "12",
        total_credits: "24",
        signature: "data:image/png;base64,...",
        signature_date: "2023-11-02",
        added_courses: ["STAT21114"],
        dropped_courses: []
    }
];

function submitRequest(data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/add-drop/submit',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let resData = '';
            res.on('data', (chunk) => {
                resData += chunk;
            });
            res.on('end', () => {
                resolve({ status: res.statusCode, data: resData });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(postData);
        req.end();
    });
}

async function run() {
    for (const req of requests) {
        console.log(`Submitting for ${req.student_name}...`);
        try {
            const res = await submitRequest(req);
            console.log(`Response: ${res.status} - ${res.data}`);
        } catch (e) {
            console.error(`Error: ${e.message}`);
        }
    }
}

run();
