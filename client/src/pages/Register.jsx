import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import authBg from '../assets/auth-bg.png';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Student',
        mobile: '',
        student_number: '',
        level: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [availableRoles, setAvailableRoles] = useState(['Student', 'BatchRepresentative']);
    const [takenRoles, setTakenRoles] = useState({ dean: false, supervisor: false });

    // Real-time Validation State
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        hasLetter: false,
        hasNumber: false,
        hasSpecial: false
    });
    const [passwordsMatch, setPasswordsMatch] = useState(true); // Default true to hide error initially

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/auth/check-roles');
                const data = await res.json();
                setTakenRoles({ dean: data.deanExists, supervisor: data.supervisorExists });
            } catch (err) {
                console.error("Failed to check roles", err);
            }
        };
        fetchRoles();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === 'email') {
                if (value.endsWith('@stu.kln.ac.lk') || value === 'setoh45412@gxuzi.com' || value === 'hemoyev878@gamening.com') {
                    setAvailableRoles(['Student', 'BatchRepresentative']);
                    if (!['Student', 'BatchRepresentative'].includes(newData.role)) {
                        newData.role = 'Student';
                    }
                } else if (value.endsWith('@kln.ac.lk') || value === 'archchika27@gmail.com' || value === 'wenahof206@sepole.com' || value === 'heneweb112@okexbit.com' || value === 'pigig20161@sepole.com' || value === 'borem80471@gxuzi.com' || value === 'ganab30286@gxuzi.com') {
                    let staffRoles = ['FacultyStaff', 'DeptStaff', 'Dean', 'HallAttendant', 'AcademicSupervisor'];
                    if (takenRoles.dean) staffRoles = staffRoles.filter(r => r !== 'Dean');
                    if (takenRoles.supervisor) staffRoles = staffRoles.filter(r => r !== 'AcademicSupervisor');
                    setAvailableRoles(staffRoles);
                    if (!staffRoles.includes(newData.role)) {
                        newData.role = staffRoles[0] || '';
                    }
                } else {
                    let allRoles = ['Student', 'BatchRepresentative', 'FacultyStaff', 'DeptStaff', 'Dean', 'HallAttendant', 'AcademicSupervisor'];
                    if (takenRoles.dean) allRoles = allRoles.filter(r => r !== 'Dean');
                    if (takenRoles.supervisor) allRoles = allRoles.filter(r => r !== 'AcademicSupervisor');
                    setAvailableRoles(allRoles);
                }
            }

            // Real-time checks
            if (name === 'password') {
                setPasswordCriteria({
                    length: value.length >= 8,
                    hasLetter: /[A-Za-z]/.test(value),
                    hasNumber: /[0-9]/.test(value),
                    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(value)
                });
                if (newData.confirmPassword) {
                    setPasswordsMatch(value === newData.confirmPassword);
                }
            }
            if (name === 'confirmPassword') {
                setPasswordsMatch(newData.password === value);
            }

            return newData;
        });
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

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.role === 'Student' || formData.role === 'BatchRepresentative') {
            if (!formData.email.endsWith('@stu.kln.ac.lk') && formData.email !== 'archchika27@gmail.com' && formData.email !== 'setoh45412@gxuzi.com' && formData.email !== 'hemoyev878@gamening.com') {
                setError('Student/BatchRepresentative must use @stu.kln.ac.lk email');
                return;
            }
        } else {
            if (!formData.email.endsWith('@kln.ac.lk') && formData.email !== 'archchika27@gmail.com' && formData.email !== 'wenahof206@sepole.com' && formData.email !== 'heneweb112@okexbit.com' && formData.email !== 'pigig20161@sepole.com' && formData.email !== 'borem80471@gxuzi.com' && formData.email !== 'ganab30286@gxuzi.com') {
                setError('Staff roles must use @kln.ac.lk email');
                return;
            }
        }

        if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
            setError('Mobile number must be exactly 10 digits');
            return;
        }

        const pwdError = validatePassword();
        if (pwdError) {
            setError(pwdError);
            return;
        }

        try {
            const data = await register(formData);
            if (data.requiresVerification) {
                alert(data.message);
                navigate('/login');
            } else {
                alert('Registration successful! Please login.');
                navigate('/login');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Image */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-50 items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-indigo-900/10"></div>
                <img
                    src={authBg}
                    alt="University Campus"
                    className="w-full h-full object-contain relative z-10"
                />
                <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-gray-900/80 to-transparent z-20">
                    <h1 className="text-4xl font-bold text-white mb-4">Join the Community</h1>
                    <p className="text-lg text-gray-200">
                        Create your account to start managing assessments and academic progress.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-white overflow-y-auto min-h-screen z-30">
                <div className="max-w-md w-full space-y-6">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-normal">
                            Create an Account
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Register using your university credentials
                        </p>
                    </div>

                    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded flex items-start animate-pulse">
                                <span className="mr-2">⚠️</span> {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 leading-normal">Full Name</label>
                                <input name="name" type="text" required className="appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition sm:text-sm bg-gray-50 focus:bg-white leading-normal" placeholder="Archchika" onChange={handleChange} value={formData.name} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 leading-normal">University Email</label>
                                <input name="email" type="email" required className="appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition sm:text-sm bg-gray-50 focus:bg-white leading-normal" placeholder="example@kln.ac.lk" onChange={handleChange} value={formData.email} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 leading-normal">Password</label>
                                    <input name="password" type="password" required className="appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition sm:text-sm bg-gray-50 focus:bg-white leading-normal" placeholder="••••••••" onChange={handleChange} value={formData.password} />
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
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1 leading-normal">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            name="confirmPassword"
                                            type="password"
                                            required
                                            className={`appearance-none block w-full px-4 py-2.5 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition sm:text-sm bg-gray-50 focus:bg-white leading-normal ${!passwordsMatch && formData.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                                            placeholder="••••••••"
                                            onChange={handleChange}
                                            value={formData.confirmPassword}
                                        />
                                        {formData.confirmPassword && (
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                {passwordsMatch ? (
                                                    <span className="text-green-500 text-lg">✓</span>
                                                ) : (
                                                    <span className="text-red-500 text-lg">✕</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {!passwordsMatch && formData.confirmPassword && (
                                        <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 leading-normal">Mobile Number</label>
                                <input name="mobile" type="text" className="appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition sm:text-sm bg-gray-50 focus:bg-white leading-normal" placeholder="07xxxxxxxx" onChange={handleChange} value={formData.mobile} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 leading-normal">Role</label>
                                <select name="role" value={formData.role} onChange={handleChange} className="appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition sm:text-sm bg-white leading-normal">
                                    {availableRoles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                            {(formData.role === 'Student' || formData.role === 'BatchRepresentative') && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fadeIn">
                                    <div className="col-span-1 md:col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Student Details</div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 leading-normal">Student Number</label>
                                        <input name="student_number" type="text" required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm leading-normal" placeholder="IM/20xx/xxx" onChange={handleChange} value={formData.student_number} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 leading-normal">Level</label>
                                        <input name="level" type="text" placeholder="e.g. 1" className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm leading-normal" onChange={handleChange} value={formData.level} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-indigo-900 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-900 transition-all shadow-lg active:scale-95 cursor-pointer"
                            >
                                Register Account
                            </button>
                        </div>
                    </form >

                    <div className="mt-6 text-center border-t border-gray-100 pt-6">
                        <span className="text-sm text-gray-500">Already have an account? </span>
                        <Link to="/login" className="ml-1 text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                            Log in to your account
                        </Link>
                    </div>
                </div >
            </div >
        </div >
    );
};

export default Register;
