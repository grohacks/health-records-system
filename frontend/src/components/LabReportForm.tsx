import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  FormHelperText,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useNavigate } from "react-router-dom";
import { useLabReports } from "../hooks/useLabReports";
import { useUsers } from "../hooks/useUsers";
import { LabReport, User } from "../types";
import { GradientButton, StyledCard } from "../styles/shared";
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";

interface LabReportFormProps {
  labReportId?: number;
  onSuccess?: () => void;
}

const LabReportForm: React.FC<LabReportFormProps> = ({
  labReportId,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const {
    currentReport,
    loading,
    error,
    filePreview,
    uploadedFile,
    getReportById,
    createReport,
    updateReport,
    previewFile,
    clearPreview,
    clearErrorMessage,
  } = useLabReports();

  const { users, loading: loadingUsers, getUsers } = useUsers();

  // Form state
  const [testName, setTestName] = useState("");
  const [testResults, setTestResults] = useState("");
  const [testDate, setTestDate] = useState<Date | null>(new Date());
  const [reportDate, setReportDate] = useState<Date | null>(new Date());
  const [patientId, setPatientId] = useState<number | "">("");
  const [doctorId, setDoctorId] = useState<number | "">("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Use refs to track initialization state and prevent multiple API calls
  const initializationRef = useRef<{ [key: string]: boolean }>({});
  const isMountedRef = useRef(true);

  // File upload state
  const [fileError, setFileError] = useState<string | null>(null);

  // Filter users by role
  const patients = users.filter((user) => user.role === "ROLE_PATIENT");
  const doctors = users.filter((user) => user.role === "ROLE_DOCTOR");

  // Load data on component mount - SINGLE INITIALIZATION ONLY
  useEffect(() => {
    const initKey = `${labReportId || 'new'}`;
    
    const initializeForm = async () => {
      if (initializationRef.current[initKey] || !isMountedRef.current) return;
      
      initializationRef.current[initKey] = true;
      
      // Always get users first
      if (isMountedRef.current) {
        await getUsers();
      }
      
      // Then get report if editing
      if (labReportId && isMountedRef.current) {
        await getReportById(labReportId);
      }
    };

    initializeForm();

    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labReportId]); // Only depend on labReportId

  // Populate form when editing an existing report - ONLY RUN ONCE WHEN DATA CHANGES
  useEffect(() => {
    const initKey = `${labReportId || 'new'}`;
    if (currentReport && labReportId && initializationRef.current[initKey]) {
      setTestName(currentReport.testName);
      setTestResults(currentReport.testResults || "");
      setTestDate(
        currentReport.testDate ? new Date(currentReport.testDate) : null
      );
      setReportDate(
        currentReport.reportDate ? new Date(currentReport.reportDate) : null
      );

      if (currentReport.patient && currentReport.patient.id) {
        setPatientId(currentReport.patient.id);
      }

      if (currentReport.doctor && currentReport.doctor.id) {
        setDoctorId(currentReport.doctor.id);
      }
    }
  }, [currentReport?.id, labReportId]); // Only depend on report ID changes

  // Cleanup effect to ensure proper unmounting
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      clearErrorMessage();
    };
  }, [clearErrorMessage]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!testName.trim()) {
      errors.testName = "Test name is required";
    }

    if (!testDate) {
      errors.testDate = "Test date is required";
    }

    if (!reportDate) {
      errors.reportDate = "Report date is required";
    }

    if (patientId === "") {
      errors.patientId = "Patient is required";
    }

    if (doctorId === "") {
      errors.doctorId = "Doctor is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    if (!allowedTypes.includes(file.type)) {
      setFileError(
        "File type not supported. Please upload a PDF or image file (JPG, PNG)."
      );
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setFileError("File size exceeds 10MB limit.");
      return;
    }

    setFileError(null);
    previewFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrorMessage();

    if (!validateForm()) {
      return;
    }

    if (patientId === "" || doctorId === "") {
      return;
    }

    const reportData: Omit<LabReport, "id" | "createdAt" | "updatedAt"> = {
      testName,
      testResults,
      testDate: testDate ? testDate.toISOString() : new Date().toISOString(),
      reportDate: reportDate
        ? reportDate.toISOString()
        : new Date().toISOString(),
      patient: { id: patientId } as User,
      doctor: { id: doctorId } as User,
      medicalRecordId: undefined, // Set to undefined to avoid constraint violation
    };

    let success = false;

    if (labReportId) {
      // Update existing report
      success = await updateReport(
        labReportId,
        reportData,
        uploadedFile || undefined
      );
    } else {
      // Create new report
      success = await createReport(reportData, uploadedFile || undefined);
    }

    if (success) {
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/lab-reports");
      }
    }
  };

  const handleCancel = () => {
    navigate("/lab-reports");
  };

  return (
    <StyledCard>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              {labReportId ? "Edit Lab Report" : "Create New Lab Report"}
            </Typography>
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!formErrors.patientId}>
              <InputLabel>Patient</InputLabel>
              <Select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value as number)}
                label="Patient"
                disabled={loading || loadingUsers}
              >
                {patients.map((patient) => (
                  <MenuItem key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.patientId && (
                <FormHelperText>{formErrors.patientId}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!formErrors.doctorId}>
              <InputLabel>Doctor</InputLabel>
              <Select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value as number)}
                label="Doctor"
                disabled={loading || loadingUsers}
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {doctor.firstName} {doctor.lastName}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.doctorId && (
                <FormHelperText>{formErrors.doctorId}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Test Name"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              required
              disabled={loading}
              error={!!formErrors.testName}
              helperText={formErrors.testName}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Test Date"
                value={testDate}
                onChange={(newValue) => setTestDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    disabled: loading,
                    error: !!formErrors.testDate,
                    helperText: formErrors.testDate,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Report Date"
                value={reportDate}
                onChange={(newValue) => setReportDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    disabled: loading,
                    error: !!formErrors.reportDate,
                    helperText: formErrors.reportDate,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Test Results"
              value={testResults}
              onChange={(e) => setTestResults(e.target.value)}
              multiline
              rows={4}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Upload Report File (PDF, JPG, PNG - Max 10MB)
            </Typography>
            <input
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: "none" }}
              id="report-file-upload"
              type="file"
              onChange={handleFileChange}
              disabled={loading}
            />
            <label htmlFor="report-file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                disabled={loading}
              >
                Upload File
              </Button>
            </label>

            {fileError && <FormHelperText error>{fileError}</FormHelperText>}
          </Grid>

          {filePreview && (
            <Grid item xs={12}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  position: "relative",
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                }}
              >
                <IconButton
                  size="small"
                  onClick={clearPreview}
                  sx={{ position: "absolute", top: 8, right: 8 }}
                >
                  <CloseIcon />
                </IconButton>

                <Typography variant="subtitle2" gutterBottom>
                  File Preview:
                </Typography>

                {uploadedFile && (
                  <Typography variant="body2">
                    {uploadedFile.name} (
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </Typography>
                )}

                {uploadedFile && uploadedFile.type.startsWith("image/") && (
                  <Box sx={{ mt: 2, textAlign: "center" }}>
                    <img
                      src={filePreview}
                      alt="Preview"
                      style={{ maxWidth: "100%", maxHeight: "300px" }}
                    />
                  </Box>
                )}

                {uploadedFile && uploadedFile.type === "application/pdf" && (
                  <Box sx={{ mt: 2, textAlign: "center" }}>
                    <Typography>PDF file selected</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          )}

          <Grid
            item
            xs={12}
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}
          >
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <GradientButton
              type="submit"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : undefined}
            >
              {labReportId ? "Update" : "Create"} Lab Report
            </GradientButton>
          </Grid>
        </Grid>
      </Box>
    </StyledCard>
  );
};

export default LabReportForm;
