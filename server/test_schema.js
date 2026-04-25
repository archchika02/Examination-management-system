const mysql = require('mysql2/promise');

async function test() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'A09rChChIkA27',
        database: 'ems_database'
    });

    const [rows, fields] = await connection.query("SHOW CREATE TABLE allocation_drafts");
    console.log(rows[0]['Create Table']);

    connection.end();
}
test();
