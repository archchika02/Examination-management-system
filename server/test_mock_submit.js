const pool = require('./config/db');
async function test() {
    const c = await pool.getConnection();
    try {
        await c.beginTransaction();
        await c.execute('DELETE FROM staff_concerns');
        await c.execute('DELETE FROM exam_draft_attendants');
        await c.execute('DELETE FROM exam_draft_invigilators');
        await c.execute('DELETE FROM exam_draft_allocations');
        await c.execute('DELETE FROM department_concerns');
        await c.execute('DELETE FROM allocations');
        await c.execute('DELETE FROM venue_allocations');
        await c.execute('DELETE FROM exam_slots');
        await c.execute('DELETE FROM exam_timetables');
        
        await c.execute(
            'INSERT INTO exam_timetables (course_code, date, academic_year, semester, created_by) VALUES (?, ?, ?, ?, ?)',
            ['INTE 12223', '2025-11-15', '2024/2025', 1, 1] 
        );
        
        await c.execute(
            'UPDATE batch_configurations SET preferred_dates = ?, academic_year = ?, status = ? WHERE course_code = ?',
            [JSON.stringify(['2025-11-15']), '2024/2025', 'SUBMITTED', 'INTE 12223']
        );
        
        await c.commit();
        console.log("Success");
    } catch(e) {
        await c.rollback();
        console.log("Error during mock submit:", e.message, e.sqlMessage);
    } finally {
        c.release();
        pool.end();
    }
}
test();
