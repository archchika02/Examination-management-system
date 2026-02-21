import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Real-time Validation State
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        hasLetter: false,
        hasNumber: false,
        hasSpecial: false
    });
    const [passwordsMatch, setPasswordsMatch] = useState(true);

    const handlePasswordChange = (value) => {
        setPassword(value);
        setPasswordCriteria({
            length: value.length >= 8,
            hasLetter: /[A-Za-z]/.test(value),
            hasNumber: /[0-9]/.test(value),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(value)
        });
        if (confirmPassword) {
            setPasswordsMatch(value === confirmPassword);
        }
    };

    const handleConfirmPasswordChange = (value) => {
        setConfirmPassword(value);
        setPasswordsMatch(password === value);
    };

    const validatePassword = () => {
        if (!passwordCriteria.length) return "Password must be at least 8 characters long.";
        if (!passwordCriteria.hasLetter) return "Password must contain at least one letter.";
        if (!passwordCriteria.hasNumber) return "Password must contain at least one number.";
        if (!passwordCriteria.hasSpecial) return "Password must contain at least one special character.";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const pwdError = validatePassword();
        if (pwdError) {
            setError(pwdError);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, newPassword: password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            setMessage("Password reset successful. Redirecting...");
            setTimeout(() => navigate('/login'), 2000);

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900">
                        Reset Password
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <div className="text-red-500 text-center text-sm">{error}</div>}
                    {message && <div className="text-green-500 text-center text-sm">{message}</div>}

                    <div className="space-y-4">
                        <div>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => handlePasswordChange(e.target.value)}
                            />
                            {/* Real-time Checklist */}
                            <div className="mt-2 space-y-1">
                                <div className={`text-xs flex items-center ${passwordCriteria.length ? 'text-green-600' : 'text-gray-400'}`}>
                                    <span className="mr-1.5">{passwordCriteria.length ? '✓' : '○'}</span> At least 8 characters
                                </div>
                                <div className={`text-xs flex items-center ${passwordCriteria.hasLetter ? 'text-green-600' : 'text-gray-400'}`}>
                                    <span className="mr-1.5">{passwordCriteria.hasLetter ? '✓' : '○'}</span> At least one letter
                                </div>
                                <div className={`text-xs flex items-center ${passwordCriteria.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                                    <span className="mr-1.5">{passwordCriteria.hasNumber ? '✓' : '○'}</span> At least one number
                                </div>
                                <div className={`text-xs flex items-center ${passwordCriteria.hasSpecial ? 'text-green-600' : 'text-gray-400'}`}>
                                    <span className="mr-1.5">{passwordCriteria.hasSpecial ? '✓' : '○'}</span> At least one special char
                                </div>
                            </div>
                        </div>
                        <div className="relative mt-4">
                            <input
                                type="password"
                                required
                                className={`appearance-none rounded-md relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${!passwordsMatch && confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                            />
                            {confirmPassword && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    {passwordsMatch ? (
                                        <span className="text-green-500 text-lg">✓</span>
                                    ) : (
                                        <span className="text-red-500 text-lg">✕</span>
                                    )}
                                </div>
                            )}
                            {!passwordsMatch && confirmPassword && (
                                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                        >
                            Reset Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
