const pool = require('./config/db');

async function testDrafts() {
    try {
        const query = `
            SELECT 
                a.alloc_id as id,
                a.exam_id,
                (
                    SELECT GROUP_CONCAT(i.invigilator_id) 
                    FROM exam_draft_invigilators i 
                    JOIN users u ON i.invigilator_id = u.user_id
                    WHERE i.alloc_id = a.alloc_id 
                    AND u.role IN ('DeptStaff', 'AcademicSupervisor') 
                    AND u.approval_status = 'Approved' 
                    AND u.is_verified = 1
                ) as invigilators
            FROM exam_draft_allocations a
        `;
        const [rows] = await pool.query(query);
        console.log("Drafts returned:", rows);

        const drafts = rows.map(r => ({
            ...r,
            invigilators: r.invigilators ? r.invigilators.split(',').map(Number) : []
        }));
        console.log("Parsed Drafts:", drafts);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
testDrafts();
