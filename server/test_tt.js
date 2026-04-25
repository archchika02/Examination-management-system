const pool = require('./config/db');

async function test() {
    try {
        const userId = 28; // User ID for IM/2022/100
        const query = `
      SELECT 
          a.alloc_id,
          a.exam_id,
          et.date,
          et.academic_year,
          DATE_FORMAT(s.start_time, '%l:%i %p') AS time,
          et.course_code as courseUnit,
          c.title as courseTitle,
          a.venue,
          'Student' as role,
          NULL as examinerRole
      FROM exam_draft_allocations a
      JOIN exam_timetables et ON a.exam_id = et.timetable_id
      JOIN exam_slots s ON et.timetable_id = s.timetable_id
      LEFT JOIN courses c ON REPLACE(et.course_code, ' ', '') = REPLACE(c.course_code, ' ', '')
      WHERE a.is_published_to_students = 1
      AND (
          EXISTS (
              SELECT 1 FROM registered_course_units rcu 
              JOIN course_unit_registration_headers cur ON rcu.header_id = cur.id 
              WHERE cur.user_id = ? AND cur.status = 'Approved'
              AND REPLACE(rcu.course_code, ' ', '') = REPLACE(et.course_code, ' ', '')
              AND cur.academic_year = et.academic_year
          )
          OR
          EXISTS (
              SELECT 1 FROM add_drop_requested_courses adc 
              JOIN add_drop_request_headers adr ON adc.header_id = adr.id 
              WHERE adr.user_id = ? AND adc.action = 'Add' AND adr.status = 'Approved'
              AND REPLACE(adc.course_code, ' ', '') = REPLACE(et.course_code, ' ', '')
              AND adr.academic_year = et.academic_year
          )
          OR
          EXISTS (
              SELECT 1 FROM medical_repeat_requested_courses mrc 
              JOIN medical_repeat_request_headers mrr ON mrc.header_id = mrr.id 
              WHERE mrr.user_id = ? AND mrr.status = 'Approved'
              AND REPLACE(mrc.course_code, ' ', '') = REPLACE(et.course_code, ' ', '')
              AND mrr.academic_year = et.academic_year
          )
      )
      AND NOT EXISTS (
          SELECT 1 FROM add_drop_requested_courses adc 
          JOIN add_drop_request_headers adr ON adc.header_id = adr.id 
          WHERE adr.user_id = ? AND adc.action = 'Drop' AND adr.status = 'Approved'
          AND REPLACE(adc.course_code, ' ', '') = REPLACE(et.course_code, ' ', '')
          AND adr.academic_year = et.academic_year
      )
      ORDER BY et.date ASC, s.start_time ASC
    `;
        const params = [userId, userId, userId, userId];

        const [rows] = await pool.query(query, params);
        console.log('Rows returned:', rows.length);
        console.log('Courses:', rows.map(r => r.courseUnit));
        const mrc_exam = rows.find(r => r.courseUnit.toLowerCase().replace(/\s/g, '') === 'inte22283');
        console.log('Contains inte22283?', !!mrc_exam, mrc_exam);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

test();
