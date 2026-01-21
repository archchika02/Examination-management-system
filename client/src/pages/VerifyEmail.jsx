import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token || !email) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, token })
                });

                const data = await res.json();
                if (res.ok) {
                    setStatus('success');
                    setMessage(data.message);
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Verification failed.');
                }
            } catch (err) {
                setStatus('error');
                setMessage('Network error. Please try again.');
            }
        };

        verify();
    }, [token, email]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg text-center">
                <h2 className="text-3xl font-extrabold text-gray-900">Email Verification</h2>

                {status === 'verifying' && (
                    <div className="text-indigo-600">Verifying your email...</div>
                )}

                {status === 'success' && (
                    <div>
                        <div className="text-green-600 font-medium text-lg mb-4">
                            ✅ {message}
                        </div>
                        <Link to="/login" className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                            Go to Login
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div>
                        <div className="text-red-500 font-medium text-lg mb-4">
                            ❌ {message}
                        </div>
                        <Link to="/register" className="text-indigo-600 hover:text-indigo-500">
                            Back to Registration
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
