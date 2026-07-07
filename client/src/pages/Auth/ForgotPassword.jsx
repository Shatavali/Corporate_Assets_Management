// ForgotPassword.jsx - White & Blue Professional Theme
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);
  
  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [countdown, resendDisabled]);
  
  const handleSendOTP = async (e) => {
    e.preventDefault();
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message || 'OTP sent to your email!' });
        setStep('reset');
        setResendDisabled(true);
        setCountdown(60);
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to send OTP.' });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Network error. Please try again.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendOTP = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/resend-otp`, {
        email,
        type: 'reset',
      });
      if (response.data.success) {
        setMessage({ type: 'success', text: 'New OTP sent to your email!' });
        setResendDisabled(true);
        setCountdown(60);
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to resend OTP.' });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to resend OTP.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const otpRegex = /^\d{6}$/;
    if (!otp.trim() || !otpRegex.test(otp)) {
      setMessage({ type: 'error', text: 'Please enter a valid 6-digit OTP.' });
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        email,
        otp,
        newPassword,
      });
      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message || 'Password reset successful! Redirecting to login...' });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to reset password.' });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error resetting password. Please try again.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };
  
  const handleBackToEmail = () => {
    setStep('request');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage({ type: '', text: '' });
    setResendDisabled(false);
    setCountdown(0);
  };
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header - Blue */}
        <div className="bg-blue-600 px-6 py-8 text-center">
          <h1 className="text-3xl font-bold text-white">Corporate Asset Management</h1>
          <p className="text-blue-100 mt-2">Reset Your Password</p>
        </div>
        
        <div className="p-6 md:p-8">
          {message.text && (
            <div className={`mb-6 p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}
          
          {step === 'request' && (
            <form onSubmit={handleSendOTP}>
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll send a 6-digit OTP to this email address.
                </p>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Reset OTP'
                )}
              </button>
              
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-sm text-blue-600 hover:text-blue-800 transition"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}
          
          {step === 'reset' && (
            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  OTP Code
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="6-digit code"
                  required
                  disabled={loading}
                  maxLength="6"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Minimum 6 characters"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Confirm your new password"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="mb-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendDisabled || loading}
                  className="text-sm text-blue-600 hover:text-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendDisabled ? `Resend OTP (${countdown}s)` : 'Resend OTP'}
                </button>
                
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="text-sm text-gray-500 hover:text-gray-700 transition"
                >
                  Change Email
                </button>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
              
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-sm text-blue-600 hover:text-blue-800 transition"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
        
        <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-200">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Corporate Asset Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;