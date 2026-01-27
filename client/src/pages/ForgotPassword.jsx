import { useState } from 'react';
import { Link } from 'react-router-dom';
import authBg from '../assets/auth-bg.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setMessage(data.message + " (Check server console for link)");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
                <div className="mx-auto h-16 w-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                    <img src={authBg} alt="Logo" className="h-10 w-10" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                    Examination Management System
                </h1>
            </div>

            <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="text-left">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Forgot Password
                    </h2>
                    <p className="text-gray-500 mb-8">
                        Enter your university email to reset your password
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">
                            {message}
                        </div>
                    )}

                    <div>
                        {/* Requirement: Omit the require indicator that red start */}
                        <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-2">
                            University Email
                        </label>
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            required
                            className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-lg placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="example@university.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-[#1e293b] hover:bg-[#0f172a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors shadow-sm"
                        >
                            Send Reset Link
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-gray-500 mt-4 mb-8">
                            Use your official university email address.
                        </p>
                        <Link to="/login" className="font-medium text-gray-600 hover:text-gray-900 transition-colors text-sm">
                            Return to login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
