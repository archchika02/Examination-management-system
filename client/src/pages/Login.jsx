import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import authBg from '../assets/auth-bg.png';

const Login = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password, rememberMe);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Image Container */}
            {/* Using flex items-center justify-center with object-contain to ensure FULL image is visible without cropping */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-50 items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-indigo-900/10"></div> {/* Subtle overlay */}
                <img
                    src={authBg}
                    alt="University Life"
                    className="w-full h-full object-contain relative z-10"
                />
                <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-gray-900/80 to-transparent z-20">
                    <h1 className="text-4xl font-bold text-white mb-4">Welcome to EMS</h1>
                    <p className="text-lg text-gray-200">
                        Streamline your academic journey with our comprehensive Examination Management System.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-white shadow-xl z-30">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center lg:text-left">
                        <div className="lg:hidden mb-6 flex justify-center">
                            <div className="h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">U</div>
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Welcome
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Log in to access your account dashboard
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded flex items-start animate-pulse">
                                <span className="mr-2">⚠️</span> {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    University Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 sm:text-sm bg-gray-50 focus:bg-white"
                                    placeholder="example@kln.ac.lk"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 sm:text-sm bg-gray-50 focus:bg-white"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-indigo-900 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-900 transition-all shadow-lg active:scale-95 cursor-pointer"
                            >
                                Log In
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center border-t border-gray-100 pt-6">
                        <span className="text-sm text-gray-500">Don't have an account? </span>
                        <Link to="/register" className="ml-1 text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                            Register Now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
