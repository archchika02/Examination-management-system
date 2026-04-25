const pool = require('./config/db');

async function testFetch() {
    try {
        const userId = 8; // Test with a deptStaff ID like 8
        const query = `
            SELECT 
                et.date,
                et.time,
                et.course_code as courseUnit,
                a.venue,
                CASE 
                    WHEN a.supervisor_id = ? THEN 'Supervisor'
                    WHEN (SELECT COUNT(*) FROM exam_draft_invigilators i WHERE i.alloc_id = a.alloc_id AND i.invigilator_id = ?) > 0 THEN 'Invigilator'
                    WHEN (SELECT COUNT(*) FROM exam_draft_attendants at WHERE at.alloc_id = a.alloc_id AND at.attendant_id = ?) > 0 THEN 'Hall Attendant'
                    ELSE 'Staff'
                END as role
            FROM exam_draft_allocations a
            JOIN exam_timetables et ON a.exam_id = et.timetable_id
            WHERE a.is_published = 1
            AND (
                a.supervisor_id = ? 
                OR EXISTS (SELECT 1 FROM exam_draft_invigilators i WHERE i.alloc_id = a.alloc_id AND i.invigilator_id = ?)
                OR EXISTS (SELECT 1 FROM exam_draft_attendants at WHERE at.alloc_id = a.alloc_id AND at.attendant_id = ?)
            )
            ORDER BY et.date ASC, et.time ASC
        `;
        const [rows] = await pool.query(query, [userId, userId, userId, userId, userId, userId]);
        console.log("Returned for userId 8:", rows);

        const [allocs] = await pool.query('SELECT alloc_id, is_published, supervisor_id FROM exam_draft_allocations');
        console.log("All Allocations:", allocs);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
testFetch();
