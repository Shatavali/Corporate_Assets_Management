// client/src/pages/Auth/Login.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { 
  Package, Mail, Lock, Eye, EyeOff, ArrowRight, 
  Shield, Zap, CheckCircle, AlertCircle, Loader2,
  Award
} from "lucide-react";
import { login, clearError, resetAuthState } from "../../redux/slices/authslice";

const corporateImage = "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&h=300&fit=crop&crop=center";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get auth state from Redux
  const { isAuthenticated, user, isLoading: authLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  // ✅ CLEAN SESSION ON MOUNT - Reset any stale state
  useEffect(() => {
    // Reset redirect state when component mounts
    dispatch(resetAuthState());
    
    // Check for valid session
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const userData = localStorage.getItem("user") || sessionStorage.getItem("user");
    
    console.log("🔍 Login page loaded:", { 
      hasToken: !!token, 
      hasUserData: !!userData,
      isAuthenticated 
    });

    // If we have a valid session, redirect to dashboard
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && parsedUser.email) {
          console.log("✅ Valid session found, redirecting to dashboard...");
          navigate("/dashboard", { replace: true });
          return;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        // Clear corrupted data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
      }
    }
  }, [dispatch, navigate]);

  // ✅ Watch for authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("✅ User authenticated, redirecting to dashboard...");
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errorMsg) setErrorMsg("");
    if (successMsg) setSuccessMsg("");
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      setErrorMsg("Email is required");
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      setErrorMsg("Please enter a valid email address");
      return false;
    }
    if (!formData.password) {
      setErrorMsg("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || loading || authLoading) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      console.log("🔐 Attempting login with:", formData.email);
      
      const resultAction = await dispatch(login({
        email: formData.email.trim(),
        password: formData.password,
      }));

      console.log("📦 Login result:", resultAction);

      if (login.fulfilled.match(resultAction)) {
        console.log("✅ Login successful!");
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }
        
        setSuccessMsg("Login successful! Redirecting...");
        
        // The useEffect will handle the redirect
        // But we also do a direct redirect as fallback
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 500);
        
      } else if (login.rejected.match(resultAction)) {
        console.log("❌ Login failed:", resultAction.payload);
        setErrorMsg(resultAction.payload || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("💥 Login error:", error);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If already authenticated, show redirecting message
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex overflow-hidden">
      {/* Left Side - Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-600 to-blue-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-yellow-400 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 py-12">
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <Package className="w-7 h-7 text-indigo-600" />
            </div>
            <span className="text-4xl font-bold text-white tracking-tight">AssetHub</span>
          </div>

          <div className="mb-12 relative group">
            <div className="absolute -inset-4 bg-white/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <img 
              src={corporateImage} 
              alt="Corporate Asset Management" 
              className="relative w-full max-w-md object-cover rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
              style={{ height: '300px' }}
            />
          </div>

          <div className="text-center text-white max-w-md">
            <div className="flex justify-center mb-4">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Award key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
            <blockquote className="text-lg leading-relaxed mb-4 italic">
              "AssetHub transformed our asset management. 300% increase in efficiency and complete visibility."
            </blockquote>
            <p className="font-semibold text-white/90">— Sarah Johnson</p>
            <p className="text-sm text-white/70">CIO, TechCorp Industries</p>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 text-white/80">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">10K+</div>
              <div className="text-xs text-white/60">Assets Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-xs text-white/60">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">4.9★</div>
              <div className="text-xs text-white/60">User Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                AssetHub
              </span>
            </div>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-lg">
              Sign in to manage your assets efficiently
            </p>
          </div>

          <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
            <div className="flex items-center space-x-1.5 px-4 py-1.5 bg-indigo-50 rounded-full border border-indigo-100">
              <Shield size={16} className="text-indigo-600" />
              <span className="text-xs font-medium text-indigo-700">Enterprise Security</span>
            </div>
            <div className="flex items-center space-x-1.5 px-4 py-1.5 bg-blue-50 rounded-full border border-blue-100">
              <Zap size={16} className="text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Real-time Sync</span>
            </div>
            <div className="flex items-center space-x-1.5 px-4 py-1.5 bg-green-50 rounded-full border border-green-100">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-xs font-medium text-green-700">Smart Analytics</span>
            </div>
          </div>

          {successMsg && (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm">
              <CheckCircle size={18} className="flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-sm">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className={`relative transition-all duration-200 ${
                focusedField === 'email' ? 'ring-2 ring-indigo-500 ring-offset-2 rounded-xl' : ''
              }`}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="john@company.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                  disabled={loading || authLoading}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className={`relative transition-all duration-200 ${
                focusedField === 'password' ? 'ring-2 ring-indigo-500 ring-offset-2 rounded-xl' : ''
              }`}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                  disabled={loading || authLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-indigo-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading || authLoading}
                >
                  {showPassword ? 
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : 
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  }
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                  disabled={loading || authLoading}
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                  Remember me
                </span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold transition-colors hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || authLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-3.5 rounded-xl font-semibold transition-all transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              {(loading || authLoading) ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{authLoading ? "Loading..." : "Signing In..."}</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link 
                to="/register" 
                className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>

          {import.meta.env.DEV && (
            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
              <p className="text-xs text-gray-500 text-center font-medium">
                🚀 Demo Credentials
              </p>
              <div className="flex justify-center gap-6 text-xs text-gray-600 mt-1">
                <span><span className="font-semibold">Email:</span> demo@assethub.com</span>
                <span><span className="font-semibold">Password:</span> password123</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;