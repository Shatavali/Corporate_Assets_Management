// client/src/redux/slices/authslice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

// Login thunk
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      
      if (response.success && response.data?.token) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(user));
        toast.success('Login successful!');
        return response.data;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Register thunk
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        toast.success('Registration successful! Please verify your email.');
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Logout thunk
export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
  } catch (error) {
    console.error('Logout error:', error);
  }
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  toast.success('Logged out successfully');
  return null;
});

// Check auth thunk
export const checkAuth = createAsyncThunk('auth/checkAuth', async () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  let user = null;
  try {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData && userData !== 'undefined' && userData !== 'null') {
      user = JSON.parse(userData);
    }
  } catch (error) {
    console.log('Invalid user data in localStorage');
    user = null;
  }
  
  if (token && user) {
    return { token, user };
  }
  return null;
});

// Safe localStorage parsing for initialState
let savedUser = null;
let savedToken = null;

try {
  const tokenData = localStorage.getItem('token') || sessionStorage.getItem('token');
  const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
  
  if (tokenData && tokenData !== 'undefined' && tokenData !== 'null') {
    savedToken = tokenData;
  }
  
  if (userData && userData !== 'undefined' && userData !== 'null') {
    savedUser = JSON.parse(userData);
  }
} catch (error) {
  console.log('Error parsing localStorage data:', error);
  savedUser = null;
  savedToken = null;
}

const initialState = {
  user: savedUser,
  token: savedToken,
  isAuthenticated: !!savedToken && !!savedUser,
  isLoading: false,
  error: null,
  requiresVerification: false,
  verificationEmail: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setVerificationEmail: (state, action) => {
      state.verificationEmail = action.payload;
      state.requiresVerification = true;
    },
    resetAuthState: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.requiresVerification = false;
      state.verificationEmail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload?.user || null;
        state.token = action.payload?.token || null;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requiresVerification = true;
        state.verificationEmail = action.payload?.email;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.requiresVerification = false;
        state.verificationEmail = null;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
        state.isLoading = false;
      })
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearError, setVerificationEmail, resetAuthState } = authSlice.actions;
export default authSlice.reducer;