import React, { useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Grid,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import {
  Link as RouterLink,
  useParams,
  useNavigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { usePrescriptions } from "../hooks/usePrescriptions";
import {
  Print as PrintIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";

const PrescriptionView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const prescriptionId = id ? parseInt(id) : 0;
  const { user } = useSelector((state: RootState) => state.auth);

  const {
    currentPrescription,
    loading,
    error,
    getPrescriptionById,
    downloadFile,
  } = usePrescriptions();

  // Check if user has edit permissions
  const canEdit =
    user && (user.role === "ROLE_ADMIN" || user.role === "ROLE_DOCTOR");

  useEffect(() => {
    if (prescriptionId) {
      getPrescriptionById(prescriptionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prescriptionId]);

  const handleEdit = () => {
    navigate(`/prescriptions/edit/${prescriptionId}`);
  };

  const handleDownload = () => {
    if (currentPrescription) {
      downloadFile(prescriptionId, `prescription-${prescriptionId}.pdf`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate("/prescriptions");
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!currentPrescription) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">Prescription not found</Alert>
      </Container>
    );
  }

  // Determine if prescription is active or expired
  const now = new Date();
  const endDate = new Date(currentPrescription.endDate);
  const isActive = endDate >= now;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link component={RouterLink} to="/dashboard" color="inherit">
            Dashboard
          </Link>
          <Link component={RouterLink} to="/prescriptions" color="inherit">
            Prescriptions
          </Link>
          <Typography color="text.primary">
            Prescription Details
          </Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Prescription Details
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Print
          </Button>
          {canEdit && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit
            </Button>
          )}
        </Box>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Medication
            </Typography>
            <Typography variant="h6" gutterBottom>
              {currentPrescription.medicationName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Status
            </Typography>
            <Chip
              label={isActive ? "Active" : "Expired"}
              color={isActive ? "success" : "error"}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Start Date
            </Typography>
            <Typography variant="body1" gutterBottom>
              {new Date(currentPrescription.startDate).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              End Date
            </Typography>
            <Typography variant="body1" gutterBottom>
              {new Date(currentPrescription.endDate).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Dosage
            </Typography>
            <Typography variant="body1" gutterBottom>
              {currentPrescription.dosage || "Not specified"}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Instructions
            </Typography>
            <Typography variant="body1" gutterBottom>
              {currentPrescription.instructions || "No special instructions"}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Patient
            </Typography>
            <Typography variant="body1" gutterBottom>
              {currentPrescription.patientName || "Unknown Patient"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Doctor
            </Typography>
            <Typography variant="body1" gutterBottom>
              {currentPrescription.doctorName || "Unknown Doctor"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button variant="outlined" onClick={handleBack}>
          Back to Prescriptions
        </Button>
      </Box>
    </Container>
  );
};

export default PrescriptionView;
