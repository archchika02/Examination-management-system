const fetch = require('node-fetch');

(async () => {
    try {
        const response = await fetch('http://localhost:5000/api/configurations/faculty-attendant-allocations');
        if (response.ok) {
            const data = await response.json();
            console.log('--- Full Response Sample ---');
            data.slice(0, 1).forEach(tt => {
                console.log('Exam ID:', tt.id);
                tt.allocations.forEach(al => {
                    console.log(`Alloc ID: ${al.id}, Attendants: ${al.attendants}, Attendant IDs:`, al.attendantIds);
                });
            });
        }
 else {
            console.log('Response not ok:', response.status);
        }
    } catch (err) {
        console.error(err);
    }
})();
