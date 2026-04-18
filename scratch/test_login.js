async function testLogin() {
    const email = 'mahaf55625@okexbit.com';
    const password = 'TestPass@123';
    
    console.log(`Simulating login for: ${email}`);
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('Login Successful!');
            console.log('Token received:', data.token.substring(0, 20) + '...');
            console.log('User data:', JSON.stringify(data.user, null, 2));
        } else {
            console.log(`Login Failed with status ${response.status}:`);
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('Fetch Error:', error.message);
    }
}

testLogin();
