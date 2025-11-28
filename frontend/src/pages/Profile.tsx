import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material'
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material'
import { useAppSelector } from '../hooks/useAppDispatch'
import { userApi } from '../services/api'
import { motion } from 'framer-motion'
import { styled } from '@mui/material/styles'

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
}))

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  margin: '0 auto',
  background: 'linear-gradient(45deg, #667eea, #764ba2)',
  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
}))

const Profile = () => {
  const { user } = useAppSelector((state) => state.auth)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  const handleEdit = () => {
    setIsEditing(true)
    setError('')
    setSuccess('')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    })
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')
      await userApi.updateProfile(formData)
      setSuccess('Profile updated successfully')
      setIsEditing(false)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            fontWeight: 700,
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Profile
        </Typography>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <StyledCard>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <StyledAvatar>
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </StyledAvatar>
              <Typography variant="h5" sx={{ mt: 2, fontWeight: 600 }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user?.role?.replace('ROLE_', '')}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              {!isEditing ? (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  sx={{
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #764ba2, #667eea)',
                    },
                  }}
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={loading}
                    sx={{
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #764ba2, #667eea)',
                      },
                    }}
                  >
                    Save Changes
                  </Button>
                </>
              )}
            </Box>
          </CardContent>
        </StyledCard>
      </motion.div>
    </Box>
  )
}

export default Profile 