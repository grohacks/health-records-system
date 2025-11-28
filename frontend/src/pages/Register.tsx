import React, { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useAppDispatch } from '../hooks/useAppDispatch'
import {
  Container,
  Box,
  TextField,
  Link,
  Paper,
  Typography,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material'
import { toast } from 'react-toastify'
import { register } from '../store/slices/authSlice'
import { GradientTypography, GradientButton } from '../styles/shared'

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'ROLE_PATIENT',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await dispatch(register(formData)).unwrap()
      toast.success('Registration successful! Please login.')
      navigate('/login')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <GradientTypography variant="h4" gutterBottom>
              Create Account
            </GradientTypography>
            <Typography variant="body1" color="text.secondary">
              Join our health records platform
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="firstName"
              label="First Name"
              name="firstName"
              autoComplete="given-name"
              autoFocus
              value={formData.firstName}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="lastName"
              label="Last Name"
              name="lastName"
              autoComplete="family-name"
              value={formData.lastName}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              select
              name="role"
              label="Role"
              value={formData.role}
              onChange={handleChange}
              sx={{ mb: 3 }}
            >
              <MenuItem value="ROLE_PATIENT">Patient</MenuItem>
              <MenuItem value="ROLE_DOCTOR">Doctor</MenuItem>
              <MenuItem value="ROLE_ADMIN">Admin</MenuItem>
            </TextField>
            <GradientButton
              type="submit"
              fullWidth
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
            </GradientButton>
            <Box 
              sx={{ 
                textAlign: 'center',
                mt: 2,
                p: 2,
                borderRadius: '12px',
                background: 'rgba(102, 126, 234, 0.05)',
                border: '1px solid rgba(102, 126, 234, 0.1)',
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Already have an account?
              </Typography>
              <Link
                component={RouterLink}
                to="/login"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Sign In Now
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default Register 