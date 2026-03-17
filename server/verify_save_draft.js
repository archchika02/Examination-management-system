const fetch = require('node-fetch');

async function testSaveDraft() {
    console.log("Starting Save Draft Verification with Valid Data...");
    
    // Using valid ID 314 from diag_save_draft.js
    // Using user_id 8 (DeptStaff) and 27 (HallAttendant) from get_valid_users.js
    const exams = [
        {
            id: 314,
            allocations: [
                {
                    id: 'test-alloc-1',
                    venue: 'Main Hall',
                    assignedNonRepeat: 45,
                    assignedRepeat: 12,
                    supervisor: "8",
                    invigilators: ["8"],
                    attendants: ["27"]
                }
            ]
        }
    ];

    try {
        const response = await fetch('http://localhost:5000/api/configurations/save-allocation-draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ exams })
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log("SUCCESS:", result.message);
        } else {
            console.error("FAILED:", response.status, result);
        }
    } catch (error) {
        console.error("ERROR during fetch:", error.message);
    }
}

testSaveDraft();
