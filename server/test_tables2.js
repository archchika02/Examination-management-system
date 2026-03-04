const mysql = require('mysql2/promise');

async function test() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'A09rChChIkA27',
        database: 'ems_database'
    });

    const [rows] = await connection.query("SHOW TABLES");
    console.log(rows.map(r => Object.values(r)[0]).join(', '));

    connection.end();
}
test();
