const pool = require('../server/config/db');

async function checkUser() {
    const email = 'mahaf55625@okexbit.com';
    console.log(`Checking status for: ${email}`);

    try {
        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            console.log('User not found in the database.');
        } else {
            const user = users[0];
            console.log('User Found:');
            console.log(JSON.stringify(user, null, 2));
            
            if (!user.is_verified) {
                console.log('Reason: User is NOT verified.');
            }
            if ((user.role === 'FacultyStaff' || user.role === 'DeptStaff') && user.approval_status !== 'Approved') {
                console.log('Reason: User is NOT approved.');
            }
        }
    } catch (error) {
        console.error('Error querying database:', error);
    } finally {
        process.exit();
    }
}

checkUser();
