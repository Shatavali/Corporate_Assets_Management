import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { Package, Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Zap } from "lucide-react";
import corporateImage from "../../assets/Assets_image.png";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const abortControllerRef = useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Clear error when user types
  useEffect(() => {
    setErrorMsg("");
  }, [formData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setErrorMsg("");

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const res = await axios.post(
  `${API_BASE_URL}/auth/login`,
        {
          email: formData.email.trim(),
          password: formData.password,
        },
        {
          signal: abortControllerRef.current.signal,
          headers: { "Content-Type": "application/json" },
        }
      );

      const { token, user } = res.data?.data || {};
      if (!token || !user) {
        throw new Error("Invalid server response");
      }

      // ✅ Store token and user data
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", token);
      storage.setItem("user", JSON.stringify(user));
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        sessionStorage.removeItem("rememberMe");
        localStorage.removeItem("rememberMe");
      }

      // ✅ Also store token in the other storage for consistency (optional)
      if (rememberMe) {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      }

      dispatch({ type: "LOGIN_SUCCESS", payload: { user, token } });

      // ✅ ALWAYS navigate to "/dashboard" after login (lowercase d)
      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request cancelled");
        return;
      }

      let message = "Login failed. Please check your credentials and try again.";
      if (error.response?.status === 401) {
        message = "Invalid email or password";
      } else if (error.response?.status === 429) {
        message = "Too many attempts. Please try again later.";
      } else if (error.request) {
        message = "Network error: Cannot connect to server. Please check your connection.";
      }
      
      if (import.meta.env.DEV) {
        console.error("Login error:", error.response?.data || error.message);
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex overflow-hidden">
      {/* Left Side - Brand Section (unchanged) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-600 to-blue-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12">
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-3xl font-bold text-white">AssetHub</span>
          </div>
          <div className="mb-12">
            <img src={corporateImage} alt="Corporate Asset Management" className="w-full max-w-md object-contain rounded-2xl shadow-2xl" />
          </div>
          <div className="text-center text-white max-w-md">
            <div className="flex justify-center mb-4">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-lg leading-relaxed mb-4">
              "AssetHub transformed how we manage our corporate assets. The insights and efficiency gains have been remarkable."
            </p>
            <p className="font-semibold">— Sarah Johnson, CIO at TechCorp</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form (unchanged) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                AssetHub
              </span>
            </div>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">Welcome Back</h1>
            <p className="text-gray-600 text-lg">Sign in to access your asset management dashboard</p>
          </div>

          <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
            <div className="flex items-center space-x-1 px-3 py-1 bg-indigo-50 rounded-full">
              <Shield size={14} className="text-indigo-600" />
              <span className="text-xs text-indigo-700">Enterprise Security</span>
            </div>
            <div className="flex items-center space-x-1 px-3 py-1 bg-blue-50 rounded-full">
              <Zap size={14} className="text-blue-600" />
              <span className="text-xs text-blue-700">Real-time Sync</span>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@company.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold transition">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-3 rounded-xl font-semibold transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-700 transition">
                Create an account
              </Link>
            </p>
          </div>

          {import.meta.env.DEV && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Demo Credentials: demo@assethub.com / password123
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;