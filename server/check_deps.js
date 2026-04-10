const pool = require('./config/db');

async function test() {
    const c = await pool.getConnection();
    try {
        const [rows] = await c.query('SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_SCHEMA = "ems_database" AND REFERENCED_TABLE_NAME = "exam_timetables"');
        console.log("Exam Timetables dependencies:", rows);
        
        const [rows2] = await c.query('SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_SCHEMA = "ems_database" AND REFERENCED_TABLE_NAME = "exam_slots"');
        console.log("Exam Slots dependencies:", rows2);

        const [rows3] = await c.query('SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_SCHEMA = "ems_database" AND REFERENCED_TABLE_NAME = "exam_draft_allocations"');
        console.log("Exam Draft Allocations dependencies:", rows3);
        
        const [rows4] = await c.query('SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_SCHEMA = "ems_database" AND REFERENCED_TABLE_NAME = "allocations"');
        console.log("Allocations dependencies:", rows4);
    } finally {
        c.release();
        pool.end();
    }
}
test();
