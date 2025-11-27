import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useMedicalRecords } from "../hooks/useMedicalRecords";
import { useUsers } from "../hooks/useUsers";
import { toast } from "react-toastify";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  Alert,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { MedicalRecord, User } from "../types";
import {
  StyledCard,
  GradientTypography,
  GradientButton,
} from "../styles/shared";

const MedicalRecordForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = id !== "new";
  const navigate = useNavigate();

  // Get the current user from Redux store
  const { user } = useSelector((state: RootState) => state.auth);

  // Get medical records and users hooks
  const {
    currentRecord,
    loading: recordLoading,
    error: recordError,
    getRecordById,
    createRecord,
    updateRecord,
    clearRecord,
  } = useMedicalRecords();
  const {
    users,
    loading: usersLoading,
    error: usersError,
    getUsers,
  } = useUsers();

  // Form state
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [patientId, setPatientId] = useState<number | "">("");
  const [doctorId, setDoctorId] = useState<number | "">("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Filter users by role
  const doctors = users.filter((u) => u.role === "ROLE_DOCTOR");
  const patients = users.filter((u) => u.role === "ROLE_PATIENT");

  // Load data on component mount
  useEffect(() => {
    getUsers();

    if (isEditMode && id) {
      getRecordById(parseInt(id));
    } else {
      clearRecord();
    }

    return () => {
      clearRecord();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, id]);

  // Set form values when currentRecord changes
  useEffect(() => {
    if (currentRecord && isEditMode) {
      setDiagnosis(currentRecord.diagnosis || "");
      setTreatment(currentRecord.treatment || "");
      setNotes(currentRecord.notes || "");

      // Handle different types of doctor/patient fields
      if (typeof currentRecord.doctor === "object" && currentRecord.doctor.id) {
        setDoctorId(currentRecord.doctor.id);
      } else if (typeof currentRecord.doctor === "number") {
        setDoctorId(currentRecord.doctor);
      }

      if (
        typeof currentRecord.patient === "object" &&
        currentRecord.patient.id
      ) {
        setPatientId(currentRecord.patient.id);
      } else if (typeof currentRecord.patient === "number") {
        setPatientId(currentRecord.patient);
      }
    } else if (!isEditMode && user) {
      // For new records, set the current user as doctor if they are a doctor
      if (user.role === "ROLE_DOCTOR") {
        setDoctorId(user.id);
      }
    }
  }, [currentRecord, isEditMode, user]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate form
    if (!diagnosis.trim()) {
      setFormError("Diagnosis is required");
      return;
    }

    if (!treatment.trim()) {
      setFormError("Treatment is required");
      return;
    }

    if (!patientId) {
      setFormError("Patient is required");
      return;
    }

    if (!doctorId) {
      setFormError("Doctor is required");
      return;
    }

    try {
      setSubmitting(true);

      // Create proper objects for patient and doctor
      const recordData = {
        diagnosis,
        treatment,
        notes,
        patient: { id: patientId },
        doctor: { id: doctorId },
      };

      console.log("Submitting medical record data:", recordData);

      if (isEditMode && id) {
        try {
          await updateRecord(parseInt(id), recordData);
          // Wait a bit to check for errors
          setTimeout(() => {
            if (!recordError) {
              toast.success("Medical record updated successfully");
              navigate("/medical-records");
            } else {
              setFormError(`Failed to update medical record: ${recordError}`);
            }
          }, 500);
        } catch (err) {
          console.error("Error updating medical record:", err);
          setFormError(
            `Failed to update medical record: ${
              err instanceof Error ? err.message : "Unknown error"
            }`
          );
        }
      } else {
        try {
          console.log("Creating medical record with data:", recordData);
          await createRecord(
            recordData as Omit<MedicalRecord, "id" | "createdAt" | "updatedAt">
          );

          // Wait a bit to check for errors
          setTimeout(() => {
            if (!recordError) {
              toast.success("Medical record created successfully");
              navigate("/medical-records");
            } else {
              setFormError(`Failed to create medical record: ${recordError}`);
            }
          }, 500);
        } catch (err) {
          console.error("Error creating medical record:", err);
          setFormError(
            `Failed to create medical record: ${
              err instanceof Error ? err.message : "Unknown error"
            }`
          );
        }
      }
    } catch (error) {
      console.error("Error saving medical record:", error);
      setFormError(
        `Failed to save medical record: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (recordLoading || usersLoading) {
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

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box display="flex" alignItems="center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/medical-records")}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <GradientTypography variant="h4">
            {isEditMode ? "Edit Medical Record" : "New Medical Record"}
          </GradientTypography>
        </Box>
      </Grid>

      {(recordError || usersError || formError) && (
        <Grid item xs={12}>
          <Alert severity="error">
            {formError || recordError || usersError}
          </Alert>
        </Grid>
      )}

      <Grid item xs={12}>
        <StyledCard>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="patient-label">Patient</InputLabel>
                  <Select
                    labelId="patient-label"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value as number)}
                    label="Patient"
                    disabled={submitting || user?.role === "ROLE_PATIENT"}
                  >
                    {patients.map((patient) => (
                      <MenuItem key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName} ({patient.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="doctor-label">Doctor</InputLabel>
                  <Select
                    labelId="doctor-label"
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value as number)}
                    label="Doctor"
                    disabled={submitting || user?.role === "ROLE_DOCTOR"}
                  >
                    {doctors.map((doctor) => (
                      <MenuItem key={doctor.id} value={doctor.id}>
                        {doctor.firstName} {doctor.lastName} ({doctor.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required
                  multiline
                  rows={2}
                  disabled={submitting}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Treatment"
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  required
                  multiline
                  rows={3}
                  disabled={submitting}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  multiline
                  rows={3}
                  disabled={submitting}
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/medical-records")}
                    sx={{ mr: 2 }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <GradientButton
                    type="submit"
                    startIcon={<SaveIcon />}
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : "Save"}
                  </GradientButton>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </StyledCard>
      </Grid>
    </Grid>
  );
};

export default MedicalRecordForm;
