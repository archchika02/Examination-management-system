const http = require('http');
const body = JSON.stringify({
    formName: 'Add/Drop Form',
    deadline: '2026-03-20',
    roles: ['Students', 'Hall Attendant'],
    description: 'Test deadline',
    notifyEmail: false,
    notifySystem: true,
    createdBy: null
});
const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/deadlines',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
};
const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
        process.exit(0);
    });
});
req.on('error', e => { console.error('Request error:', e.message); process.exit(1); });
req.write(body);
req.end();
