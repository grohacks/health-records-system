import React, { useEffect } from 'react';
import {
  Grid,
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Science as ScienceIcon,
  Person as PersonIcon,
  MedicalServices as MedicalServicesIcon,
  CalendarToday as CalendarTodayIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useLabReports } from '../hooks/useLabReports';
import { GradientButton, GradientTypography, StyledCard } from '../styles/shared';

const LabReportView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Get the current user from Redux store
  const { user } = useSelector((state: RootState) => state.auth);

  // Get lab reports hook
  const { currentReport, loading, error, getReportById, downloadFile, clearReport } = useLabReports();

  // Load data on component mount
  useEffect(() => {
    if (id) {
      getReportById(parseInt(id));
    }

    return () => {
      clearReport();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Check if user has edit permissions
  const canEdit = user && (user.role === 'ROLE_ADMIN' || user.role === 'ROLE_DOCTOR');

  const handleDownload = () => {
    if (currentReport && currentReport.fileName) {
      downloadFile(currentReport.id, currentReport.fileName);
    }
  };

  if (loading) {
    return (
      <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '200px' }}>
        <CircularProgress />
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Alert severity="error">{error}</Alert>
        </Grid>
      </Grid>
    );
  }

  if (!currentReport) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Alert severity="warning">Lab report not found</Alert>
        </Grid>
      </Grid>
    );
  }

  // Format dates
  const testDate = new Date(currentReport.testDate).toLocaleString();
  const reportDate = new Date(currentReport.reportDate).toLocaleString();
  const createdAt = new Date(currentReport.createdAt).toLocaleString();
  const updatedAt = new Date(currentReport.updatedAt).toLocaleString();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/lab-reports')}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <GradientTypography variant="h4">
              Lab Report Details
            </GradientTypography>
          </Box>

          <Box display="flex" gap={2}>
            {currentReport.fileUrl && (
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
              >
                Download Report
              </Button>
            )}
            
            {canEdit && (
              <GradientButton
                startIcon={<EditIcon />}
                onClick={() => navigate(`/lab-reports/edit/${id}`)}
              >
                Edit
              </GradientButton>
            )}
          </Box>
        </Box>
      </Grid>

      <Grid item xs={12}>
        <StyledCard>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h5" fontWeight="bold">
                  <ScienceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {currentReport.testName}
                </Typography>
                <Chip
                  icon={<CalendarTodayIcon />}
                  label={`Test Date: ${testDate}`}
                  variant="outlined"
                />
              </Box>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Patient
                </Typography>
                <Typography variant="body1">
                  {currentReport.patient.firstName} {currentReport.patient.lastName}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  <MedicalServicesIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Doctor
                </Typography>
                <Typography variant="body1">
                  {currentReport.doctor.firstName} {currentReport.doctor.lastName}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Test Results
              </Typography>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="body1" paragraph>
                  {currentReport.testResults || 'No results provided'}
                </Typography>
              </Paper>
            </Grid>

            {currentReport.fileUrl && (
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Attached File
                </Typography>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1">
                      {currentReport.fileName} 
                      {currentReport.fileSize && (
                        <span> ({(currentReport.fileSize / 1024 / 1024).toFixed(2)} MB)</span>
                      )}
                    </Typography>
                    <Button
                      startIcon={<DownloadIcon />}
                      onClick={handleDownload}
                      variant="outlined"
                      size="small"
                    >
                      Download
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Typography variant="caption" color="textSecondary">
                  Report Date: {reportDate}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Last updated: {updatedAt}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </StyledCard>
      </Grid>
    </Grid>
  );
};

export default LabReportView;
