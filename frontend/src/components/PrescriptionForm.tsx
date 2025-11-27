import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Paper,
  IconButton,
  Chip,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { usePrescriptions } from "../hooks/usePrescriptions";
import { useMedicalRecords } from "../hooks/useMedicalRecords";
import { useUsers } from "../hooks/useUsers";
import { Prescription, User, MedicalRecord } from "../types";
import { StyledCard, GradientButton } from "../styles/shared";

interface PrescriptionFormProps {
  onSuccess?: () => void;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const prescriptionId = id ? parseInt(id) : undefined;

  // Hooks
  const {
    currentPrescription,
    loading,
    error,
    filePreview,
    fileInfo,
    uploadedFile,
    getPrescriptionById,
    createPrescriptionRecord,
    updatePrescriptionRecord,
    clearPrescription,
    previewFile,
    clearPreview,
    clearErrorMessage,
  } = usePrescriptions();

  const { records: medicalRecords, getAllRecords } = useMedicalRecords();
  const { users, loading: loadingUsers, getUsers } = useUsers();

  // Form state
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(
    new Date(new Date().setDate(new Date().getDate() + 30))
  );
  const [medicalRecordId, setMedicalRecordId] = useState<number | "">("");
  const [patientId, setPatientId] = useState<number | "">("");
  const [doctorId, setDoctorId] = useState<number | "">("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filter users by role
  const patients = users
    ? users.filter((user) => user.role === "ROLE_PATIENT")
    : [];
  const doctors = users
    ? users.filter((user) => user.role === "ROLE_DOCTOR")
    : [];

  // Load data on component mount
  useEffect(() => {
    getUsers();
    getAllRecords();

    if (prescriptionId) {
      getPrescriptionById(prescriptionId);
    } else {
      clearPrescription();
    }

    return () => {
      clearPrescription();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prescriptionId]);

  // Populate form when currentPrescription changes
  useEffect(() => {
    if (currentPrescription) {
      setMedicationName(currentPrescription.medicationName || "");
      setDosage(currentPrescription.dosage || "");
      setInstructions(currentPrescription.instructions || "");
      setStartDate(
        currentPrescription.startDate
          ? new Date(currentPrescription.startDate)
          : null
      );
      setEndDate(
        currentPrescription.endDate
          ? new Date(currentPrescription.endDate)
          : null
      );
      setMedicalRecordId(currentPrescription.medicalRecordId || "");

      // Find the medical record to get patient and doctor IDs
      if (currentPrescription.medicalRecordId && medicalRecords) {
        const medicalRecord = medicalRecords.find(
          (record) => record.id === currentPrescription.medicalRecordId
        );
        if (medicalRecord) {
          setPatientId(medicalRecord.patient?.id || "");
          setDoctorId(medicalRecord.doctor?.id || "");
        }
      }
    }
  }, [currentPrescription, medicalRecords]);

  // Filter medical records based on selected patient and doctor
  const filteredMedicalRecords = medicalRecords
    ? medicalRecords.filter((record) => {
        const matchesPatient =
          patientId === "" || record.patient?.id === patientId;
        const matchesDoctor = doctorId === "" || record.doctor?.id === doctorId;
        return matchesPatient && matchesDoctor;
      })
    : [];

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];

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

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!medicationName.trim()) {
      errors.medicationName = "Medication name is required";
    }

    if (!startDate) {
      errors.startDate = "Start date is required";
    }

    if (!endDate) {
      errors.endDate = "End date is required";
    }

    if (startDate && endDate && startDate > endDate) {
      errors.endDate = "End date must be after start date";
    }

    if (!medicalRecordId) {
      errors.medicalRecordId = "Medical record is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrorMessage();

    if (!validateForm()) {
      return;
    }

    if (medicalRecordId === "") {
      return;
    }

    const prescriptionData: Omit<
      Prescription,
      "id" | "createdAt" | "updatedAt"
    > = {
      medicationName,
      dosage,
      instructions,
      startDate: startDate ? startDate.toISOString() : new Date().toISOString(),
      endDate: endDate
        ? endDate.toISOString()
        : new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
      medicalRecordId: medicalRecordId as number,
    };

    let success = false;

    if (prescriptionId) {
      // Update existing prescription
      success = await updatePrescriptionRecord(
        prescriptionId,
        prescriptionData,
        uploadedFile || undefined
      );
    } else {
      // Create new prescription
      success = await createPrescriptionRecord(
        prescriptionData,
        uploadedFile || undefined
      );
    }

    if (success) {
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/prescriptions");
      }
    }
  };

  const handleCancel = () => {
    navigate("/prescriptions");
  };

  return (
    <StyledCard>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              {prescriptionId ? "Edit Prescription" : "Create New Prescription"}
            </Typography>
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          {(loading || loadingUsers) && (
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <CircularProgress />
              </Box>
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
            <FormControl fullWidth error={!!formErrors.medicalRecordId}>
              <InputLabel>Medical Record</InputLabel>
              <Select
                value={medicalRecordId}
                onChange={(e) => setMedicalRecordId(e.target.value as number)}
                label="Medical Record"
                disabled={loading}
              >
                {filteredMedicalRecords.map((record) => (
                  <MenuItem key={record.id} value={record.id}>
                    {record.description} - {record.patient?.firstName}{" "}
                    {record.patient?.lastName} (
                    {new Date(record.date).toLocaleDateString()})
                  </MenuItem>
                ))}
              </Select>
              {formErrors.medicalRecordId && (
                <FormHelperText>{formErrors.medicalRecordId}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Medication Name"
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
              required
              disabled={loading}
              error={!!formErrors.medicationName}
              helperText={formErrors.medicationName}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Dosage"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              multiline
              rows={2}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              multiline
              rows={4}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    disabled: loading,
                    error: !!formErrors.startDate,
                    helperText: formErrors.startDate,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    disabled: loading,
                    error: !!formErrors.endDate,
                    helperText: formErrors.endDate,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Upload Prescription File (PDF, JPG, PNG - Max 10MB)
            </Typography>
            <input
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: "none" }}
              id="prescription-file-upload"
              type="file"
              onChange={handleFileChange}
              disabled={loading}
            />
            <label htmlFor="prescription-file-upload">
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
              {prescriptionId ? "Update" : "Create"} Prescription
            </GradientButton>
          </Grid>
        </Grid>
      </Box>
    </StyledCard>
  );
};

export default PrescriptionForm;
