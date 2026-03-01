const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ems_db',
    connectionLimit: 10
});

async function migrateExaminerAppointments() {
    try {
        console.log('Starting migration for examiner_appointments table...');

        // 1. Drop existing FK constraint
        console.log('Dropping fk constraint examiner_appointments_ibfk_1 (course_unit_id)...');
        await pool.execute('ALTER TABLE examiner_appointments DROP FOREIGN KEY examiner_appointments_ibfk_1');

        // 2. Drop existing UNIQUE constraint since it uses course_unit_id
        console.log('Dropping unique constraint unique_appointment...');
        try {
            await pool.execute('ALTER TABLE examiner_appointments DROP INDEX unique_appointment');
        } catch (e) { console.log('Notice: unique_appointment key not found or already dropped.'); }

        // 3. Drop existing course_unit_id column
        console.log('Dropping course_unit_id column...');
        await pool.execute('ALTER TABLE examiner_appointments DROP COLUMN course_unit_id');

        // 4. Clean up any orphaned rows before adding the new constraint if we had to map data (we're going to TRUNCATE for safety since it's mock data or not valid anymore)
        console.log('Truncating examiner_appointments to discard old invalid data structure...');
        await pool.execute('TRUNCATE TABLE examiner_appointments');

        // 5. Add new course_code column
        console.log('Adding course_code column...');
        await pool.execute('ALTER TABLE examiner_appointments ADD COLUMN course_code VARCHAR(20) NOT NULL AFTER appointment_id');

        // 6. Add new Foreign Key constraint to courses table
        console.log('Adding foreign key fk_exam_appt_course...');
        await pool.execute('ALTER TABLE examiner_appointments ADD CONSTRAINT fk_exam_appt_course FOREIGN KEY (course_code) REFERENCES courses(course_code) ON DELETE CASCADE');

        // 7. Re-add a composite UNIQUE constraint to prevent duplicate examiner roles per course per year
        console.log('Adding new unique_appointment constraint...');
        await pool.execute('ALTER TABLE examiner_appointments ADD CONSTRAINT unique_appointment UNIQUE (course_code, academic_year, examiner_role)');

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
        process.exit();
    }
}

migrateExaminerAppointments();
