const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function debugData() {
    let pool;
    try {
        pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'ems'
        });

        let output = '';

        output += '--- Modules Table (Top 50) ---\n';
        const [modules] = await pool.query('SELECT course_code, title, academic_year FROM modules LIMIT 50');
        modules.forEach(m => {
            output += `Code: ${m.course_code}, Title: ${m.title}, Year: ${m.academic_year}\n`;
        });

        output += '\n--- Exam Timetables (Unique Codes/Years) ---\n';
        const [exams] = await pool.query('SELECT DISTINCT course_code, academic_year FROM exam_timetables LIMIT 50');
        exams.forEach(e => {
            output += `Code: ${e.course_code}, Year: ${e.academic_year}\n`;
        });

        fs.writeFileSync('debug_output.txt', output);
        console.log('Output written to debug_output.txt');
        
        await pool.end();
    } catch (err) {
        console.error(err);
    }
}

debugData();
