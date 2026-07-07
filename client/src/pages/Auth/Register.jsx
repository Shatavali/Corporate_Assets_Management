import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Package, Mail, Lock, Eye, EyeOff, User, Building2,
    ArrowRight, CheckCircle, XCircle, AlertCircle, Send,
    Shield, Briefcase, Phone
} from 'lucide-react';
import { clearError } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';
import api from '../../services/api';

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { error } = useSelector((state) => state.auth);

    // Local loading state to prevent duplicate submissions
    const [localLoading, setLocalLoading] = useState(false);

    const [step, setStep] = useState('register');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'employee',
        department: 'IT',
        phoneNumber: '',
    });
    const [otpData, setOtpData] = useState({
        email: '',
        otp: '',
    });
    const [errors, setErrors] = useState({});
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        message: '',
        hasMinLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
    });
    const [registrationData, setRegistrationData] = useState(null);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else {
            setResendDisabled(false);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    useEffect(() => {
        const password = formData.password;
        const hasMinLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        let score = 0;
        if (hasMinLength) score++;
        if (hasUpperCase) score++;
        if (hasLowerCase) score++;
        if (hasNumber) score++;
        if (hasSpecial) score++;

        let message = '';
        let color = '';
        if (score === 5) { message = 'Excellent'; color = 'text-blue-600'; }
        else if (score >= 4) { message = 'Strong'; color = 'text-green-600'; }
        else if (score === 3) { message = 'Good'; color = 'text-yellow-600'; }
        else if (score === 2) { message = 'Fair'; color = 'text-orange-600'; }
        else if (score === 1) { message = 'Weak'; color = 'text-red-600'; }

        setPasswordStrength({
            score,
            message,
            color,
            hasMinLength,
            hasUpperCase,
            hasLowerCase,
            hasNumber,
            hasSpecial,
        });
    }, [formData.password]);

    const validateRegisterForm = () => {
        const newErrors = {};

        if (!formData.name) {
            newErrors.name = 'Name is required';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (passwordStrength.score < 4) {
            newErrors.password = 'Password is too weak. Please use a stronger password.';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.phoneNumber) {
            newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Please enter a valid phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateOTPForm = () => {
        const newErrors = {};
        if (!otpData.otp) {
            newErrors.otp = 'OTP is required';
        } else if (!/^\d{6}$/.test(otpData.otp)) {
            newErrors.otp = 'OTP must be 6 digits';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: '',
            });
        }
    };

    const handleOtpChange = (e) => {
        setOtpData({
            ...otpData,
            [e.target.name]: e.target.value,
        });
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: '',
            });
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validateRegisterForm()) return;
        
        // Prevent duplicate submissions
        if (localLoading) return;
        setLocalLoading(true);

        try {
            const { confirmPassword, ...registerData } = formData;
            const response = await api.post('/auth/register', registerData);

            if (response.data.success) {
                toast.success('Registration successful! OTP sent to your email.');
                setRegistrationData(response.data.data);
                setOtpData({ ...otpData, email: formData.email });
                setStep('otp');
                setResendDisabled(true);
                setCountdown(60);
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
        } finally {
            setLocalLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (!validateOTPForm()) return;
        
        if (localLoading) return;
        setLocalLoading(true);

        try {
            const response = await api.post('/auth/verify-email', {
                email: otpData.email,
                otp: otpData.otp
            });

            if (response.data.success) {
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
                toast.success('Email verified successfully!');
                navigate('/dashboard');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Invalid OTP';
            toast.error(message);
        } finally {
            setLocalLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (resendDisabled) return;
        
        setResendDisabled(true);
        setCountdown(60);

        try {
            await api.post('/auth/resend-otp', {
                email: otpData.email,
                type: 'verification'
            });
            toast.success('OTP resent successfully!');
        } catch (error) {
            toast.error('Failed to resend OTP');
            setResendDisabled(false);
            setCountdown(0);
        }
    };

    const PasswordStrengthIndicator = () => (
        <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${
                            passwordStrength.score === 5 ? 'w-full bg-blue-600' :
                                passwordStrength.score === 4 ? 'w-4/5 bg-green-500' :
                                    passwordStrength.score === 3 ? 'w-3/5 bg-yellow-500' :
                                        passwordStrength.score === 2 ? 'w-2/5 bg-orange-500' :
                                            'w-1/5 bg-red-500'
                        }`}
                    />
                </div>
                {formData.password && (
                    <span className={`text-xs ml-2 font-medium ${passwordStrength.color}`}>
                        {passwordStrength.message}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div className="flex items-center space-x-1">
                    {passwordStrength.hasMinLength ?
                        <CheckCircle size={12} className="text-green-500" /> :
                        <XCircle size={12} className="text-gray-400" />
                    }
                    <span className={passwordStrength.hasMinLength ? 'text-gray-700' : 'text-gray-500'}>
                        Min 8 characters
                    </span>
                </div>
                <div className="flex items-center space-x-1">
                    {passwordStrength.hasUpperCase ?
                        <CheckCircle size={12} className="text-green-500" /> :
                        <XCircle size={12} className="text-gray-400" />
                    }
                    <span className={passwordStrength.hasUpperCase ? 'text-gray-700' : 'text-gray-500'}>
                        Uppercase letter
                    </span>
                </div>
                <div className="flex items-center space-x-1">
                    {passwordStrength.hasLowerCase ?
                        <CheckCircle size={12} className="text-green-500" /> :
                        <XCircle size={12} className="text-gray-400" />
                    }
                    <span className={passwordStrength.hasLowerCase ? 'text-gray-700' : 'text-gray-500'}>
                        Lowercase letter
                    </span>
                </div>
                <div className="flex items-center space-x-1">
                    {passwordStrength.hasNumber ?
                        <CheckCircle size={12} className="text-green-500" /> :
                        <XCircle size={12} className="text-gray-400" />
                    }
                    <span className={passwordStrength.hasNumber ? 'text-gray-700' : 'text-gray-500'}>
                        Number
                    </span>
                </div>
                <div className="flex items-center space-x-1 col-span-2">
                    {passwordStrength.hasSpecial ?
                        <CheckCircle size={12} className="text-green-500" /> :
                        <XCircle size={12} className="text-gray-400" />
                    }
                    <span className={passwordStrength.hasSpecial ? 'text-gray-700' : 'text-gray-500'}>
                        Special character (!@#$%^&*)
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-6xl">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse"></div>
                    <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse delay-1000"></div>
                </div>
            </div>

            {/* Main Container - Full Screen Split Layout */}
            <div className="h-full w-full flex">
                {/* Left Panel - Branding Section - Full Height */}
                <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex-col justify-between p-10 h-full overflow-y-auto">
                    <div>
                        <div className="flex items-center space-x-2 mb-10">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold">AssetHub</span>
                        </div>

                        <h2 className="text-3xl font-bold mb-4">Join our community</h2>
                        <p className="text-blue-100 mb-8 leading-relaxed">
                            Create an account to start managing your assets efficiently and securely with our enterprise-grade platform.
                        </p>

                        <div className="space-y-5">
                            <div className="flex items-start space-x-3">
                                <div className="bg-white/20 p-1 rounded-full mt-0.5">
                                    <Shield className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-semibold">Secure Platform</p>
                                    <p className="text-sm text-blue-100">Enterprise-grade security with 256-bit encryption</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="bg-white/20 p-1 rounded-full mt-0.5">
                                    <Briefcase className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-semibold">Asset Management</p>
                                    <p className="text-sm text-blue-100">Track, assign, and manage all your company assets</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="bg-white/20 p-1 rounded-full mt-0.5">
                                    <CheckCircle className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-semibold">Easy Onboarding</p>
                                    <p className="text-sm text-blue-100">Get started in minutes with our intuitive interface</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/20">
                        <p className="text-sm text-blue-100">
                            © 2024 AssetHub. All rights reserved.
                        </p>
                    </div>
                </div>

                {/* Right Panel - Form Section - Full Height Scrollable */}
                <div className="w-full lg:w-3/5 bg-white h-full overflow-y-auto">
                    <div className="max-w-2xl mx-auto px-6 py-10 lg:py-16">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {step === 'register' ? 'Create Account' : 'Verify Your Email'}
                            </h1>
                            <p className="text-gray-500 mt-1">
                                {step === 'register'
                                    ? 'Get started with your free account'
                                    : `We've sent a verification code to ${otpData.email}`}
                            </p>
                        </div>

                        {step === 'register' ? (
                            <form onSubmit={handleRegister} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name
                                    </label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 w-5 h-5 transition-colors" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2.5 pl-10 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                                                errors.name
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                                            }`}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <AlertCircle size={12} /> {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 w-5 h-5 transition-colors" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2.5 pl-10 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                                                errors.email
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                                            }`}
                                            placeholder="hello@example.com"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <AlertCircle size={12} /> {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number
                                    </label>
                                    <div className="relative group">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 w-5 h-5 transition-colors" />
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2.5 pl-10 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                                                errors.phoneNumber
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                                            }`}
                                            placeholder="+1 (555) 000-9999"
                                        />
                                    </div>
                                    {errors.phoneNumber && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <AlertCircle size={12} /> {errors.phoneNumber}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Department
                                        </label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <select
                                                name="department"
                                                value={formData.department}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-900 appearance-none cursor-pointer"
                                            >
                                                <option value="IT">IT</option>
                                                <option value="HR">HR</option>
                                                <option value="Finance">Finance</option>
                                                <option value="Operations">Operations</option>
                                                <option value="Sales">Sales</option>
                                                <option value="Marketing">Marketing</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Role
                                        </label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-900 appearance-none cursor-pointer"
                                        >
                                            <option value="employee">Employee</option>
                                            <option value="manager">Manager</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 w-5 h-5 transition-colors" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2.5 pl-10 pr-10 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                                                errors.password
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                                            }`}
                                            placeholder="Create a strong password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <PasswordStrengthIndicator />
                                    {errors.password && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <AlertCircle size={12} /> {errors.password}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm Password
                                    </label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 w-5 h-5 transition-colors" />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2.5 pl-10 pr-10 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                                                errors.confirmPassword
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                                            }`}
                                            placeholder="Confirm your password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <AlertCircle size={12} /> {errors.confirmPassword}
                                        </p>
                                    )}
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    type="submit"
                                    disabled={localLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {localLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span className="ml-2">Creating account...</span>
                                        </div>
                                    ) : (
                                        <span className="flex items-center justify-center">
                                            Create Account
                                            <ArrowRight className="ml-2 w-4 h-4" />
                                        </span>
                                    )}
                                </motion.button>

                                <div className="text-center pt-2">
                                    <p className="text-gray-500 text-sm">
                                        Already have an account?{' '}
                                        <Link
                                            to="/login"
                                            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                                        >
                                            Sign In
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <p className="text-sm text-gray-500">Verifying email:</p>
                                    <p className="text-gray-900 font-medium">{otpData.email}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Enter Verification Code
                                    </label>
                                    <div className="relative">
                                        <Send className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            name="otp"
                                            value={otpData.otp}
                                            onChange={handleOtpChange}
                                            maxLength={6}
                                            className={`w-full px-4 py-3 pl-10 text-center text-2xl tracking-widest bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 ${
                                                errors.otp
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                                            }`}
                                            placeholder="000000"
                                            autoFocus
                                        />
                                    </div>
                                    {errors.otp && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <AlertCircle size={12} /> {errors.otp}
                                        </p>
                                    )}
                                </div>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        disabled={resendDisabled}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {resendDisabled ? `Resend code in ${countdown}s` : 'Resend verification code'}
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep('register');
                                        setOtpData({ ...otpData, otp: '' });
                                    }}
                                    className="text-sm text-gray-500 hover:text-gray-700 text-center w-full"
                                >
                                    ← Back to registration
                                </button>

                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    type="submit"
                                    disabled={localLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {localLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span className="ml-2">Verifying...</span>
                                        </div>
                                    ) : (
                                        <span className="flex items-center justify-center">
                                            Verify & Continue
                                            <CheckCircle className="ml-2 w-4 h-4" />
                                        </span>
                                    )}
                                </motion.button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;