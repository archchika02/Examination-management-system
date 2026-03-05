const pool = require('./config/db');

async function debug() {
    try {
        const attendantId = 27; // Testing with ID 27
        console.log(`--- Simulating NEW JS-side aggregation for Attendant ID: ${attendantId} ---`);

        const query = `
            SELECT 
                a.alloc_id as id,
                a.exam_id,
                et.academic_year as academicYear,
                et.date,
                et.course_code,
                c.title as courseTitle,
                a.venue,
                s.start_time,
                s.end_time,
                u_sup.name as supervisorName,
                eda.is_published,
                (SELECT COUNT(*) FROM staff_concerns sc 
                 WHERE sc.alloc_id = a.alloc_id 
                 AND sc.staff_id = ? 
                 AND sc.status = 'Pending'
                 LIMIT 1) as has_pending_concern
            FROM exam_draft_attendants eda
            JOIN exam_draft_allocations a ON eda.alloc_id = a.alloc_id
            JOIN exam_timetables et ON a.exam_id = et.timetable_id
            LEFT JOIN exam_slots s ON et.timetable_id = s.timetable_id
            LEFT JOIN courses c ON REPLACE(et.course_code, ' ', '') = REPLACE(c.course_code, ' ', '')
            LEFT JOIN users u_sup ON a.supervisor_id = u_sup.user_id
            WHERE eda.attendant_id = ? AND eda.is_published = 1
            ORDER BY et.date ASC, s.start_time ASC
        `;
        const [rawRows] = await pool.query(query, [attendantId, attendantId]);

        const formatTime = (timeStr) => {
            if (!timeStr) return null;
            const time = typeof timeStr === 'string' ? timeStr : timeStr.toString();
            // Handle cases where toString() might return full Date string or HH:mm:ss
            const match = time.match(/(\d{2}:\d{2}:\d{2})/);
            const cleanTime = match ? match[1] : time;
            const [h, m] = cleanTime.split(':');
            const hour = parseInt(h);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const h12 = hour % 12 || 12;
            return `${h12.toString().padStart(2, '0')}:${m} ${ampm}`;
        };

        const grouped = {};
        rawRows.forEach(row => {
            if (!grouped[row.id]) {
                grouped[row.id] = {
                    id: row.id,
                    exam_id: row.exam_id,
                    academicYear: row.academicYear,
                    date: row.date ? new Date(row.date).toLocaleDateString('en-GB') : 'N/A',
                    courseUnit: `${row.course_code} - ${row.courseTitle || 'No Title'}`,
                    venue: row.venue,
                    supervisorName: row.supervisorName || 'N/A',
                    is_published: row.is_published,
                    has_pending_concern: row.has_pending_concern,
                    minStart: row.start_time,
                    maxEnd: row.end_time
                };
            } else {
                if (row.start_time && (!grouped[row.id].minStart || row.start_time < grouped[row.id].minStart)) {
                    grouped[row.id].minStart = row.start_time;
                }
                if (row.end_time && (!grouped[row.id].maxEnd || row.end_time > grouped[row.id].maxEnd)) {
                    grouped[row.id].maxEnd = row.end_time;
                }
            }
        });

        const result = Object.values(grouped).map(item => {
            let startTime = 'N/A';
            let endTime = 'N/A';
            let time = 'N/A';
            let durationMinutes = 0;

            if (item.minStart && item.maxEnd) {
                startTime = formatTime(item.minStart);
                endTime = formatTime(item.maxEnd);
                time = `${startTime} - ${endTime}`;

                const getSec = (t) => {
                    const str = typeof t === 'string' ? t : t.toString();
                    const m = str.match(/(\d{2}):(\d{2}):(\d{2})/);
                    if (!m) return 0;
                    return parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseInt(m[3]);
                };
                const startSec = getSec(item.minStart);
                const endSec = getSec(item.maxEnd);
                durationMinutes = Math.floor((endSec - startSec) / 60);
            }

            return { ...item, startTime, endTime, time, durationMinutes };
        });

        console.log('--- Result JSON ---');
        console.log(JSON.stringify(result, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

debug();
