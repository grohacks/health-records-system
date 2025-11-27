import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useMedicalRecords } from "../hooks/useMedicalRecords";
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  Button,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  MedicalServices as MedicalServicesIcon,
  Science as ScienceIcon,
  Medication as MedicationIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  Notes as NotesIcon,
} from "@mui/icons-material";
import {
  StyledCard,
  GradientTypography,
  GradientButton,
} from "../styles/shared";

const MedicalRecordView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Get the current user from Redux store
  const { user } = useSelector((state: RootState) => state.auth);

  // Get medical records hook
  const { currentRecord, loading, error, getRecordById, clearRecord } =
    useMedicalRecords();

  // Load data on component mount
  useEffect(() => {
    if (id) {
      getRecordById(parseInt(id));
    }

    return () => {
      clearRecord();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Check if user has edit permissions
  const canEdit =
    user && (user.role === "ROLE_ADMIN" || user.role === "ROLE_DOCTOR");

  if (loading) {
    return (
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        style={{ minHeight: "200px" }}
      >
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

  if (!currentRecord) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Alert severity="warning">Medical record not found</Alert>
        </Grid>
      </Grid>
    );
  }

  // Format dates
  const createdAt = new Date(currentRecord.createdAt).toLocaleString();
  const updatedAt = new Date(currentRecord.updatedAt).toLocaleString();

  // Get doctor and patient names
  const getDoctorName = () => {
    if (
      typeof currentRecord.doctor === "object" &&
      currentRecord.doctor.firstName
    ) {
      return `${currentRecord.doctor.firstName} ${currentRecord.doctor.lastName}`;
    } else if (
      typeof currentRecord.doctor === "object" &&
      currentRecord.doctor.id
    ) {
      // If we only have the ID, display it
      return `Doctor ID: ${currentRecord.doctor.id}`;
    } else if (typeof currentRecord.doctor === "number") {
      // If doctor is just a number (ID)
      return `Doctor ID: ${currentRecord.doctor}`;
    }
    return "Unknown Doctor";
  };

  const getPatientName = () => {
    if (
      typeof currentRecord.patient === "object" &&
      currentRecord.patient.firstName
    ) {
      return `${currentRecord.patient.firstName} ${currentRecord.patient.lastName}`;
    } else if (
      typeof currentRecord.patient === "object" &&
      currentRecord.patient.id
    ) {
      // If we only have the ID, display it
      return `Patient ID: ${currentRecord.patient.id}`;
    } else if (typeof currentRecord.patient === "number") {
      // If patient is just a number (ID)
      return `Patient ID: ${currentRecord.patient}`;
    }
    return "Unknown Patient";
  };

  // Log the current record for debugging
  console.log("Current medical record:", currentRecord);

  // Log doctor and patient details specifically
  console.log("Doctor details:", currentRecord.doctor);
  console.log("Patient details:", currentRecord.patient);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/medical-records")}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <GradientTypography variant="h4">
              Medical Record Details
            </GradientTypography>
          </Box>

          {canEdit && (
            <GradientButton
              startIcon={<EditIcon />}
              onClick={() => navigate(`/medical-records/edit/${id}`)}
            >
              Edit
            </GradientButton>
          )}
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
                  Diagnosis
                </Typography>
                <Chip
                  icon={<CalendarTodayIcon />}
                  label={`Created: ${createdAt}`}
                  variant="outlined"
                />
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" paragraph>
                {currentRecord.diagnosis}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2, height: "100%" }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  <PersonIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  Patient
                </Typography>
                <Typography variant="body1">{getPatientName()}</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2, height: "100%" }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  <MedicalServicesIcon
                    sx={{ mr: 1, verticalAlign: "middle" }}
                  />
                  Doctor
                </Typography>
                <Typography variant="body1">{getDoctorName()}</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Treatment Plan
              </Typography>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="body1" paragraph>
                  {currentRecord.treatment}
                </Typography>
              </Paper>
            </Grid>

            {currentRecord.notes && (
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  <NotesIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  Notes
                </Typography>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="body1" paragraph>
                    {currentRecord.notes}
                  </Typography>
                </Paper>
              </Grid>
            )}

            {/* Prescriptions section - if we have them */}
            {currentRecord.prescriptions &&
              currentRecord.prescriptions.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    <MedicationIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                    Prescriptions
                  </Typography>
                  <Paper elevation={1} sx={{ p: 2 }}>
                    <List>
                      {currentRecord.prescriptions.map((prescription) => (
                        <ListItem key={prescription.id}>
                          <ListItemIcon>
                            <MedicationIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={prescription.medicationName}
                            secondary={`${prescription.dosage} - ${prescription.instructions}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              )}

            {/* Lab Reports section - if we have them */}
            {currentRecord.labReports &&
              currentRecord.labReports.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    <ScienceIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                    Lab Reports
                  </Typography>
                  <Paper elevation={1} sx={{ p: 2 }}>
                    <List>
                      {currentRecord.labReports.map((report) => (
                        <ListItem key={report.id}>
                          <ListItemIcon>
                            <ScienceIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={report.testName}
                            secondary={`Date: ${new Date(
                              report.testDate
                            ).toLocaleDateString()}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              )}

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={2}>
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

export default MedicalRecordView;
