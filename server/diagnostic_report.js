const pool = require('./config/db');

async function debug() {
    try {
        console.log('--- 1. Checking exam_draft_attendants and allocations ---');
        const [attendants] = await pool.query(`
            SELECT eda.*, a.supervisor_id, a.exam_id, et.course_code
            FROM exam_draft_attendants eda
            JOIN exam_draft_allocations a ON eda.alloc_id = a.alloc_id
            JOIN exam_timetables et ON a.exam_id = et.timetable_id
            WHERE eda.is_published = 1
            LIMIT 5
        `);
        console.log('Attendants/Allocs:', JSON.stringify(attendants, null, 2));

        if (attendants.length > 0) {
            const supervisorIds = attendants.map(a => a.supervisor_id).filter(id => id);
            if (supervisorIds.length > 0) {
                console.log('--- 2. Checking if Superviosr IDs exist in users table ---');
                const [users] = await pool.query('SELECT user_id, name FROM users WHERE user_id IN (?)', [supervisorIds]);
                console.log('Supervisors found:', JSON.stringify(users, null, 2));
            } else {
                console.log('--- 2. No supervisor_ids found in allocations! ---');
            }

            const timetableIds = attendants.map(a => a.exam_id);
            console.log('--- 3. Checking if timetable_ids exist in exam_slots ---');
            const [slots] = await pool.query('SELECT timetable_id, course_code, start_time, end_time FROM exam_slots WHERE timetable_id IN (?)', [timetableIds]);
            console.log('Slots found:', JSON.stringify(slots, null, 2));

            console.log('--- 4. Checking if course_codes match between et and slots ---');
            attendants.forEach(a => {
                const match = slots.find(s => s.timetable_id === a.exam_id);
                console.log(`Exam ID ${a.exam_id} (${a.course_code}): Slot Match? ${match ? 'YES' : 'NO'}`);
            });
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

debug();
