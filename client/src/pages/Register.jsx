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
        role: 'Student',
        mobile: '',
        student_number: '',
        level: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [availableRoles, setAvailableRoles] = useState(['Student', 'BatchRep']);
    const [takenRoles, setTakenRoles] = useState({ dean: false, supervisor: false });

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
                if (value.endsWith('@stu.kln.ac.lk') || value === 'archchika27@gmail.com') {
                    setAvailableRoles(['Student', 'BatchRep']);
                    if (!['Student', 'BatchRep'].includes(newData.role)) {
                        newData.role = 'Student';
                    }
                } else if (value.endsWith('@kln.ac.lk')) {
                    let staffRoles = ['FacultyStaff', 'DeptStaff', 'Dean', 'HallAttendant', 'AcademicSupervisor'];
                    if (takenRoles.dean) staffRoles = staffRoles.filter(r => r !== 'Dean');
                    if (takenRoles.supervisor) staffRoles = staffRoles.filter(r => r !== 'AcademicSupervisor');
                    setAvailableRoles(staffRoles);
                    if (!staffRoles.includes(newData.role)) {
                        newData.role = staffRoles[0] || '';
                    }
                } else {
                    let allRoles = ['Student', 'BatchRep', 'FacultyStaff', 'DeptStaff', 'Dean', 'HallAttendant', 'AcademicSupervisor'];
                    if (takenRoles.dean) allRoles = allRoles.filter(r => r !== 'Dean');
                    if (takenRoles.supervisor) allRoles = allRoles.filter(r => r !== 'AcademicSupervisor');
                    setAvailableRoles(allRoles);
                }
            }
            return newData;
        });
    };

    const validatePassword = (password) => {
        if (password.length < 8) return "Password must be at least 8 characters long.";
        if (!/[A-Za-z]/.test(password)) return "Password must contain at least one letter.";
        if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.role === 'Student' || formData.role === 'BatchRep') {
            if (!formData.email.endsWith('@stu.kln.ac.lk') && formData.email !== 'archchika27@gmail.com') {
                setError('Student/BatchRep must use @stu.kln.ac.lk email');
                return;
            }
        } else {
            if (!formData.email.endsWith('@kln.ac.lk')) {
                setError('Staff roles must use @kln.ac.lk email');
                return;
            }
        }

        const pwdError = validatePassword(formData.password);
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
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-white overflow-y-auto h-screen z-30">
                <div className="max-w-md w-full space-y-6">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                                <input name="name" type="text" required className="appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition sm:text-sm bg-gray-50 focus:bg-white" placeholder="Archchika" onChange={handleChange} value={formData.name} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">University Email <span className="text-red-500">*</span></label>
                                <input name="email" type="email" required className="appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition sm:text-sm bg-gray-50 focus:bg-white" placeholder="example@kln.ac.lk" onChange={handleChange} value={formData.email} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                                    <input name="password" type="password" required className="appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition sm:text-sm bg-gray-50 focus:bg-white" placeholder="••••••••" onChange={handleChange} value={formData.password} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                    <input name="mobile" type="text" className="appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition sm:text-sm bg-gray-50 focus:bg-white" placeholder="07xxxxxxxx" onChange={handleChange} value={formData.mobile} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
                                <select name="role" value={formData.role} onChange={handleChange} className="appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition sm:text-sm bg-white">
                                    {availableRoles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>

                            {formData.role === 'Student' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fadeIn">
                                    <div className="col-span-1 md:col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Student Details</div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Student Number <span className="text-red-500">*</span></label>
                                        <input name="student_number" type="text" required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm" placeholder="IM/20xx/xxx" onChange={handleChange} value={formData.student_number} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                                        <input name="level" type="text" placeholder="e.g. Level 1" className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm" onChange={handleChange} value={formData.level} />
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
                    </form>

                    <div className="mt-6 text-center border-t border-gray-100 pt-6">
                        <span className="text-sm text-gray-500">Already have an account? </span>
                        <Link to="/login" className="ml-1 text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                            Log in to your account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
