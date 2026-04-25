const fetch = require('node-fetch');

(async () => {
    try {
        const response = await fetch('http://localhost:5000/api/users/role/HallAttendant');
        if (response.ok) {
            const data = await response.json();
            console.log('--- Hall Attendants from API ---');
            console.table(data);
        } else {
            console.log('Response not ok:', response.status);
        }
    } catch (err) {
        console.error(err);
    }
})();
