const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../server/.env') });

async function debugConflict() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        const [gtc] = await pool.execute('SELECT academic_year AS baseYear FROM global_timetable_config LIMIT 1');
        const baseYear = gtc[0].baseYear;
        console.log('--- GLOBAL CONFIG ---');
        console.log('Base Academic Year:', baseYear);

        const codes = ['INTE 21213', 'INTE 31373'];
        const metadata = [];

        for (const code of codes) {
            const [mod] = await pool.execute(
                'SELECT level FROM modules WHERE REPLACE(course_code, " ", "") = REPLACE(?, " ", "") ORDER BY academic_year DESC LIMIT 1',
                [code]
            );
            const level = mod[0].level;
            
            // Staggered calculation
            const [start, end] = baseYear.split('/').map(Number);
            const offset = level - 1;
            const targetYear = `${start - offset}/${end - offset}`;
            
            metadata.push({ code, level, targetYear });
        }

        console.log('\n--- TARGET BATCHES ---');
        metadata.forEach(m => console.log(`${m.code}: Level ${m.level} -> Batch Year ${m.targetYear}`));

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

        const studentsA = await getStudents(metadata[0].code, metadata[0].targetYear);
        const studentsB = await getStudents(metadata[1].code, metadata[1].targetYear);

        console.log(`\n--- STUDENT COUNTS ---`);
        console.log(`${metadata[0].code} (${metadata[0].targetYear}): ${studentsA.length} students`);
        console.log(`${metadata[1].code} (${metadata[1].targetYear}): ${studentsB.length} students`);

        const intersection = studentsA.filter(id => studentsB.includes(id));

        console.log(`\n--- INTERSECTION ---`);
        if (intersection.length > 0) {
            console.log(`OVERLAPPING STUDENTS FOUND:`, intersection);
            const [userDetails] = await pool.query('SELECT user_id, email, username FROM users WHERE user_id IN (?)', [intersection]);
            console.table(userDetails);
        } else {
            console.log('NO OVERLAPPING STUDENTS FOUND in the specified batches.');
        }

    } catch (err) {
        console.error('DEBUG ERROR:', err);
    } finally {
        await pool.end();
    }
}

debugConflict();
