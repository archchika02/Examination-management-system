const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../server/.env') });

async function analyzeConflict() {
    const pool = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [gtc] = await pool.execute('SELECT academic_year FROM global_timetable_config LIMIT 1');
        const baseYear = gtc[0].academic_year;
        console.log(`Global Academic Year: ${baseYear}\n`);

        const codes = ['INTE 21213', 'INTE 31373'];
        
        console.log('--- Level and Staggered Year Check ---');
        const mappings = [];
        for (const code of codes) {
            const [rows] = await pool.execute(
                'SELECT level FROM modules WHERE REPLACE(course_code, " ", "") = REPLACE(?, " ", "") ORDER BY academic_year DESC LIMIT 1',
                [code]
            );
            const level = rows.length > 0 ? rows[0].level : 'N/A';
            
            // Staggered calculation (matches my SQL code)
            const [start, end] = baseYear.split('/').map(Number);
            const offset = level - 1;
            const targetYear = `${start - offset}/${end - offset}`;
            
            mappings.push({ code, level, targetYear });
            console.log(`${code}: Level ${level} => Target Batch Year ${targetYear}`);
        }

        console.log('\n--- Actual Database Registration Years ---');
        for (const code of codes) {
            const [rows] = await pool.execute(`
                SELECT cur.academic_year, COUNT(*) as count 
                FROM registered_course_units rcu 
                JOIN course_unit_registration_headers cur ON rcu.header_id = cur.id 
                WHERE REPLACE(rcu.course_code, ' ', '') = REPLACE(?, ' ', '') 
                GROUP BY cur.academic_year
            `, [code]);
            console.log(`\nDegrees of registration for ${code}:`);
            console.table(rows);
        }

        console.log('\n--- Checking for Student Overlap in Target Batches ---');
        const getStudents = async (code, year) => {
            const [rows] = await pool.query(`
                SELECT DISTINCT user_id FROM (
                    SELECT cur.user_id FROM registered_course_units rcu JOIN course_unit_registration_headers cur ON rcu.header_id = cur.id WHERE REPLACE(rcu.course_code, ' ', '') = REPLACE(?, ' ', '') AND cur.status = 'Approved' AND cur.academic_year = ?
                    UNION
                    SELECT adr.user_id FROM add_drop_requested_courses adc JOIN add_drop_request_headers adr ON adc.header_id = adr.id WHERE REPLACE(adc.course_code, ' ', '') = REPLACE(?, ' ', '') AND adc.action = 'Add' AND adr.status = 'Approved' AND adr.academic_year = ?
                    UNION
                    SELECT mrr.user_id FROM medical_repeat_requested_courses mrc JOIN medical_repeat_request_headers mrr ON mrc.header_id = mrr.id WHERE REPLACE(mrc.course_code, ' ', '') = REPLACE(?, ' ', '') AND mrr.status = 'Approved' AND mrr.academic_year = ?
                ) AS Pool
            `, [code, year, code, year, code, year]);
            return rows.map(r => r.user_id);
        };

        const studentsA = await getStudents(mappings[0].code, mappings[0].targetYear);
        const studentsB = await getStudents(mappings[1].code, mappings[1].targetYear);

        const overlap = studentsA.filter(id => studentsB.includes(id));

        if (overlap.length > 0) {
            console.log(`\nConflict detected! Overlapping student IDs: ${overlap.join(', ')}`);
            const [users] = await pool.query('SELECT user_id, username, email FROM users WHERE user_id IN (?)', [overlap]);
            console.table(users);
        } else {
            console.log('\nNo overlapping students found using the staggered year logic.');
            
            console.log('\n--- BROAD CHECK (Ignoring Year) ---');
            const getAllStudents = async (code) => {
                const [rows] = await pool.query(`
                    SELECT DISTINCT user_id FROM (
                        SELECT cur.user_id FROM registered_course_units rcu JOIN course_unit_registration_headers cur ON rcu.header_id = cur.id WHERE REPLACE(rcu.course_code, ' ', '') = REPLACE(?, ' ', '') AND cur.status = 'Approved'
                        UNION
                        SELECT adr.user_id FROM add_drop_requested_courses adc JOIN add_drop_request_headers adr ON adc.header_id = adr.id WHERE REPLACE(adc.course_code, ' ', '') = REPLACE(?, ' ', '') AND adc.action = 'Add' AND adr.status = 'Approved'
                    ) AS Pool
                `, [code, code]);
                return rows.map(r => r.user_id);
            };
            const allA = await getAllStudents(mappings[0].code);
            const allB = await getAllStudents(mappings[1].code);
            const broadOverlap = allA.filter(id => allB.includes(id));
            console.log(`Broad overlap (any year): ${broadOverlap.length} students.`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

analyzeConflict();
