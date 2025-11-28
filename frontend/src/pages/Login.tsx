import React, { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useAppDispatch } from '../hooks/useAppDispatch'
import {
  Container,
  Box,
  TextField,
  Button,
  Link,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material'
import { toast } from 'react-toastify'
import { login } from '../store/slices/authSlice'
import { GradientTypography, GradientButton } from '../styles/shared'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await dispatch(login({ email, password })).unwrap()
      if (result.token) {
        navigate('/dashboard')
      } else {
        throw new Error('No token received')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
      toast.error(err.message || 'Login failed')
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
              Welcome Back
            </GradientTypography>
            <Typography variant="body1" color="text.secondary">
              Sign in to access your health records
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
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
            />
            <GradientButton
              type="submit"
              fullWidth
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
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
                Don't have an account?
              </Typography>
              <Link
                component={RouterLink}
                to="/register"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Sign Up Now
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default Login 