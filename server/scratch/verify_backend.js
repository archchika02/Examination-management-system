async function verify() {
    try {
        console.log("Verifying /examiner-courses...");
        const coursesRes = await fetch('http://localhost:5000/api/configurations/examiner-courses');
        const courses = await coursesRes.json();
        console.log("Sample Course:", courses[0]);

        console.log("\nVerifying /examiner-appointments...");
        const apptsRes = await fetch('http://localhost:5000/api/configurations/examiner-appointments');
        const appts = await apptsRes.json();
        console.log("Sample Appointment Course String:", appts[0].course);
        
        // Check if the format matches
        const mainCourse = courses[0];
        const match = appts.find(a => a.course === mainCourse);
        
        if (match) {
            console.log("\nSUCCESS: Found exact match between appointment and course list.");
        } else {
            console.log("\nWARNING: No exact match found in current sample data, but check the format manually above.");
            console.log("Are they both 'CODE - TITLE (YEAR)'? ");
        }
        
    } catch (err) {
        console.error("Verification failed:", err.message);
    }
}

verify();
