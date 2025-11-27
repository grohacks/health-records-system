import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { AuthState, User } from '../../types'
import { authApi } from '../../services/api'

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  error: null,
}

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.login({ email, password })
      const { token, user } = response.data
      localStorage.setItem('token', token)
      return { token, user }
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Login error details:', error)
      }
      return rejectWithValue(error)
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    role: string
  }) => {
    const response = await authApi.register(userData)
    return response
  }
)

export const getProfile = createAsyncThunk('auth/getProfile', async () => {
  const response = await authApi.getProfile()
  return response.data
})

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: Partial<User>) => {
    const response = await authApi.updateProfile(userData)
    return response.data
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
        
        // Store token in localStorage
        localStorage.setItem('token', action.payload.token)
        
        // Log the user role for debugging (development only)
        if (import.meta.env.DEV) {
          console.log('User role after login:', action.payload.user?.role)
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.isAuthenticated = false
        state.user = null
        state.token = null
        localStorage.removeItem('token')
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Registration failed'
      })
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to get profile'
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update profile'
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer 