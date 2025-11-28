import { styled } from '@mui/material/styles'
import { Card, TableContainer, Avatar, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material'

export const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
}))

export const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  '& .MuiTableCell-root': {
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
  }
}))

export const StyledTable = styled(Table)(({ theme }) => ({
  '& .MuiTableCell-root': {
    padding: theme.spacing(2),
  },
}))

export const StyledTableHead = styled(TableHead)(({ theme }) => ({
  '& .MuiTableCell-root': {
    fontWeight: 600,
    color: theme.palette.text.primary,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
}))

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
}))

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: theme.palette.text.secondary,
}))

export const StyledTableBody = styled(TableBody)(({ theme }) => ({
  '& .MuiTableRow-root:last-child .MuiTableCell-root': {
    borderBottom: 'none',
  },
}))

export const StyledAvatar = styled(Avatar)(({ theme }) => ({
  background: 'linear-gradient(45deg, #667eea, #764ba2)',
  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
}))

export const GradientTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  background: 'linear-gradient(45deg, #667eea, #764ba2)',
  backgroundClip: 'text',
  textFillColor: 'transparent',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}))

export const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '12px 24px',
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  },
}))

export const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #667eea, #764ba2)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(45deg, #764ba2, #667eea)',
  },
}))

export const pageContainerStyles = {
  p: 3,
}

export const headerContainerStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  mb: 4,
}

export const actionButtonContainerStyles = {
  display: 'flex',
  gap: 2,
}

export const loadingContainerStyles = {
  display: 'flex',
  justifyContent: 'center',
  p: 4,
}

export const errorAlertStyles = {
  mb: 2,
}

export const motionVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
}

export const motionTransition = {
  duration: 0.5,
}

export const tableHeaderStyles = {
  fontWeight: 600,
  color: 'text.primary',
}

export const tableCellStyles = {
  color: 'text.secondary',
} 