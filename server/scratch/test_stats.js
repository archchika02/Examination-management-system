const mysql = require('mysql2/promise');

async function testStats() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'A09rChChIkA27',
        database: 'ems_database'
    });

    try {
        const [globalConfig] = await pool.execute('SELECT academic_year FROM global_timetable_config LIMIT 1');
        const currentAY = globalConfig.length > 0 ? globalConfig[0].academic_year : '2024/2025';
        console.log('Current Global AY:', currentAY);

        const subtractYears = (ay, offset) => {
            if (!ay || !ay.includes('/')) return ay;
            const parts = ay.split('/');
            const y1 = parseInt(parts[0]);
            const y2 = parseInt(parts[1]);
            return isNaN(y1) || isNaN(y2) ? ay : `${y1 - offset}/${y2 - offset}`;
        };

        const levelMapping = {
            1: currentAY,
            2: subtractYears(currentAY, 1),
            3: subtractYears(currentAY, 2),
            4: subtractYears(currentAY, 3)
        };
        console.log('Level Mapping:', levelMapping);

        for (const [level, year] of Object.entries(levelMapping)) {
            const [data] = await pool.execute(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN non_written_type = 'Non-written' THEN 1 ELSE 0 END) as nonWritten,
                    SUM(CASE WHEN non_written_type = 'Written' OR non_written_type IS NULL THEN 1 ELSE 0 END) as written
                FROM modules 
                WHERE level = ? AND academic_year = ?
            `, [level, year]);
            
            console.log(`Level ${level} (${year}):`, data[0]);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

testStats();
