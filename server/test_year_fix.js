const pool = require('./config/db');

async function testYearIsolation() {
    console.log('--- TEST: Academic Year Isolation in batch_configurations ---');
    const courseCode = 'TEST999';
    const repId = 999;
    const level = 1;

    try {
        // 1. Mock first year save (2024/2025)
        console.log('Saving config for 2024/2025...');
        const config1 = {
            batch_rep_id: repId,
            course_code: courseCode,
            preferred_dates: ['2024-12-12'],
            status: 'SENT',
            level: level,
            academic_year: '2024/2025'
        };

        // We simulate the route logic here
        const [existing1] = await pool.execute(
            'SELECT id FROM batch_configurations WHERE batch_rep_id = ? AND course_code = ? AND academic_year = ?',
            [repId, courseCode, '2024/2025']
        );
        if (existing1.length === 0) {
            await pool.execute(
                'INSERT INTO batch_configurations (batch_rep_id, course_code, preferred_dates, status, level, academic_year) VALUES (?, ?, ?, ?, ?, ?)',
                [repId, courseCode, JSON.stringify(config1.preferred_dates), 'SENT', level, '2024/2025']
            );
        }

        // 2. Mock second year save (2025/2026)
        console.log('Saving config for 2025/2026...');
        const config2 = {
            batch_rep_id: repId,
            course_code: courseCode,
            preferred_dates: ['2025-12-12'],
            status: 'SENT',
            level: level,
            academic_year: '2025/2026'
        };

        const [existing2] = await pool.execute(
            'SELECT id FROM batch_configurations WHERE batch_rep_id = ? AND course_code = ? AND academic_year = ?',
            [repId, courseCode, '2025/2026']
        );
        if (existing2.length === 0) {
            await pool.execute(
                'INSERT INTO batch_configurations (batch_rep_id, course_code, preferred_dates, status, level, academic_year) VALUES (?, ?, ?, ?, ?, ?)',
                [repId, courseCode, JSON.stringify(config2.preferred_dates), 'SENT', level, '2025/2026']
            );
        } else {
             await pool.execute(
                'UPDATE batch_configurations SET preferred_dates = ?, status = ? WHERE id = ?',
                [JSON.stringify(config2.preferred_dates), 'SENT', existing2[0].id]
            );
        }

        // 3. Verify counts
        const [rows] = await pool.execute('SELECT academic_year, preferred_dates FROM batch_configurations WHERE course_code = ?', [courseCode]);
        console.log('Resulting records for course:', courseCode);
        console.log(JSON.stringify(rows, null, 2));

        if (rows.length === 2) {
            console.log('SUCCESS: Two distinct records exist for different years!');
        } else {
            console.log('FAILURE: Records were overwritten or duplicates not handled correctly.');
        }

        // Cleanup
        await pool.execute('DELETE FROM batch_configurations WHERE course_code = ?', [courseCode]);
        console.log('Cleanup done.');

    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        process.exit();
    }
}

testYearIsolation();
