import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  FormHelperText,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useAppointments } from "../hooks/useAppointments";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Appointment, User } from "../types";
import { userApi } from "../services/api";

interface AppointmentFormProps {
  appointment?: Appointment;
  onSuccess: () => void;
  onCancel: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  appointment,
  onSuccess,
  onCancel,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { addAppointment, editAppointment, loading: hookLoading } = useAppointments();

  // Local loading state for form submission
  const [loading, setLoading] = useState(false);

  // Local error state
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [appointmentDateTime, setAppointmentDateTime] = useState<Date | null>(
    new Date()
  );
  const [doctorId, setDoctorId] = useState<number | "">("");
  const [patientId, setPatientId] = useState<number | "">("");
  const [isVideoConsultation, setIsVideoConsultation] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Appointment["status"]>("PENDING"); // Was REQUESTED

  const [doctors, setDoctors] = useState<User[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  // Fetch doctors and patients if needed
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setUserError(null);

      try {
        // Different API calls based on user role
        if (user?.role === "ROLE_ADMIN") {
          // Admins need both doctors and patients - fetch all users
          const response = await userApi.getAll();
          const allUsers = response.data;

          const doctorsList = allUsers.filter(
            (u: User) => u.role === "ROLE_DOCTOR"
          );
          const patientsList = allUsers.filter(
            (u: User) => u.role === "ROLE_PATIENT"
          );

          setDoctors(doctorsList);
          setPatients(patientsList);
        } else if (user?.role === "ROLE_DOCTOR") {
          // Doctors need patients and their own info
          // First, fetch all patients using the dedicated endpoint
          const response = await userApi.getPatients();
          const patientsList = response.data;
          setPatients(patientsList);

          // Then, set the current doctor
          if (!appointment) {
            // For new appointments, set the current doctor
            setDoctorId(user.id);
          }
        } else if (user?.role === "ROLE_PATIENT") {
          // Patients only need doctors
          console.log("Patient user fetching doctors from API");
          try {
            console.log("Attempting to fetch doctors from public endpoint");

            // Try to fetch from the public endpoint
            const response = await userApi.getDoctors();
            console.log("Successfully fetched doctors:", response.data);

            if (response.data && Array.isArray(response.data)) {
              setDoctors(response.data);
              console.log(
                `Loaded ${response.data.length} doctors successfully`
              );
            } else {
              console.error("Invalid response format:", response.data);
              setUserError("Received invalid data format from the server");
              setDoctors([]);
            }
          } catch (error: any) {
            console.error("Error fetching doctors:", error);

            // More detailed error logging
            if (error.response) {
              console.error("Error response data:", error.response.data);
              console.error("Error status:", error.response.status);
              console.error("Error headers:", error.response.headers);

              setUserError(
                `Server error (${error.response.status}): ${
                  error.response.data?.message || "Unable to load doctors"
                }`
              );
            } else if (error.request) {
              console.error("Error request:", error.request);
              console.error("Error message:", error.message);

              if (error.message && error.message.includes("CORS")) {
                setUserError(
                  "Unable to load the list of doctors due to a CORS issue. Please contact support."
                );
              } else {
                setUserError(
                  "Unable to connect to the server. Please check your connection and try again."
                );
              }
            } else {
              setUserError(
                "An unexpected error occurred. Please try again later."
              );
            }

            // Set an empty array to prevent further errors
            setDoctors([]);
          }
        }

        setLoadingUsers(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUserError("Failed to load users");
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [user?.role, user?.id, appointment]);

  // Populate form if editing an existing appointment
  useEffect(() => {
    if (appointment) {
      setTitle(appointment.title);
      setDescription(appointment.description || "");
      setAppointmentDateTime(new Date(appointment.appointmentDateTime));
      setIsVideoConsultation(appointment.isVideoConsultation);
      setMeetingLink(appointment.meetingLink || "");
      setNotes(appointment.notes || "");
      setStatus(appointment.status);

      // Set doctor and patient IDs
      if (typeof appointment.doctor === "object") {
        setDoctorId(appointment.doctor.id);
      } else {
        setDoctorId(appointment.doctor as number);
      }

      if (typeof appointment.patient === "object") {
        setPatientId(appointment.patient.id);
      } else {
        setPatientId(appointment.patient as number);
      }
    } else {
      // For new appointments, set defaults based on user role
      if (user?.role === "ROLE_PATIENT") {
        setPatientId(user.id);
      } else if (user?.role === "ROLE_DOCTOR") {
        setDoctorId(user.id);
        setStatus("APPROVED"); // Was CONFIRMED
      }
    }
  }, [appointment, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (loading) {
      return;
    }

    if (!appointmentDateTime) {
      return;
    }

    // Set loading state to prevent double submission
    setLoading(true);
    setError(""); // Clear any previous errors

    // Ensure patientId is set
    const finalPatientId = user?.role === "ROLE_PATIENT" ? user.id : patientId;

    // Create appointment data based on user role
    const appointmentData: any = {
      title,
      description,
      appointmentDateTime: appointmentDateTime.toISOString(),
      doctorId: doctorId,
      patientId: finalPatientId,
      isVideoConsultation,
      meetingLink,
      notes,
    };

    // Only include status if user is admin or doctor
    // For direct appointment endpoint, we'll let the backend set the status
    // This prevents the "Data truncated for column 'status'" error
    // if (user?.role === "ROLE_ADMIN" || user?.role === "ROLE_DOCTOR") {
    //   appointmentData.status = status;
    // }

    try {
      // Check if token exists
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        return;
      }

      console.log(
        "Creating appointment with token:",
        token.substring(0, 10) + "..."
      );

      // Validate required fields
      if (!title) {
        setError("Title is required");
        return;
      }

      if (!appointmentDateTime) {
        setError("Appointment date and time are required");
        return;
      }

      if (!doctorId) {
        setError("Doctor selection is required");
        return;
      }

      if (user?.role !== "ROLE_PATIENT" && !patientId) {
        setError("Patient selection is required");
        return;
      }

      console.log("Sending appointment data:", appointmentData);

      try {
        if (appointment) {
          // Update existing appointment
          await editAppointment(appointment.id, appointmentData);
        } else {
          // Create new appointment
          console.log(
            "Creating new appointment with data:",
            JSON.stringify(appointmentData)
          );

          // Validate required fields on the client side
          if (!appointmentData.title) {
            throw new Error("Title is required");
          }

          if (!appointmentData.appointmentDateTime) {
            throw new Error("Appointment date and time are required");
          }

          if (!appointmentData.doctorId) {
            throw new Error("Doctor selection is required");
          }

          // Send the request to the correct public endpoint for patients
          console.log(
            "Sending appointment data to /api/open/appointments:",
            JSON.stringify(appointmentData)
          );

          try {
            const axios = (await import("axios")).default;
            // Remove status field if present
            if ("status" in appointmentData) {
              delete appointmentData.status;
            }
            // POST to the correct endpoint for public/patient appointment creation
            const response = await axios.post(
              "/api/open/appointments",
              appointmentData,
              {
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
              }
            );
            console.log("Appointment creation result:", response.data);
            // Don't return here - we need to call onSuccess()
          } catch (apiError: any) {
            console.error("API error:", apiError);
            if (apiError.response) {
              console.error("Error response:", apiError.response.data);
              throw new Error(
                apiError.response.data?.error ||
                  "Failed to create appointment: " + apiError.response.status
              );
            } else {
              throw new Error(
                typeof apiError === "string"
                  ? apiError
                  : apiError.message || "Failed to create appointment"
              );
            }
          }
        }
      } catch (err: any) {
        console.error("Error in API call:", err);

        // Check for specific error formats
        if (err.error) {
          throw new Error(err.error);
        } else if (err.message) {
          throw new Error(err.message);
        } else {
          throw err; // Re-throw to be caught by the outer catch block
        }
      }

      // Show success message and close form
      onSuccess();
    } catch (error: any) {
      setLoading(false); // Reset loading state on error
      console.error("Error saving appointment:", error);

      // Show a more specific error message
      console.error("Error details:", error);

      if (typeof error === "string") {
        setError(error);
      } else if (error.message) {
        setError(error.message);
      } else if (error.title && error.title.startsWith("ERROR:")) {
        // Handle error response from the server
        setError(error.title.substring(7)); // Remove "ERROR: " prefix
      } else {
        setError("Failed to save appointment. Please try again.");
      }

      // Log additional details if available
      if (error.response) {
        console.error("Server response:", error.response);
      }
    } finally {
      // Always reset loading state
      setLoading(false);
    }
  };

  if (loadingUsers) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {appointment ? "Edit Appointment" : "New Appointment"}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {userError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {userError}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Appointment Date & Time"
                value={appointmentDateTime}
                onChange={(newValue) => setAppointmentDateTime(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    disabled: loading,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          {/* Doctor selection - visible to admins and patients */}
          {user?.role === "ROLE_ADMIN" || user?.role === "ROLE_PATIENT" ? (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required disabled={loading}>
                <InputLabel>Doctor</InputLabel>
                <Select
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value as number)}
                  label="Doctor"
                >
                  {doctors.length > 0 ? (
                    doctors.map((doctor) => (
                      <MenuItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.firstName} {doctor.lastName}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      No doctors available. Please try again later.
                    </MenuItem>
                  )}
                </Select>
                {userError && (
                  <FormHelperText error>
                    {userError.includes("Unable to load")
                      ? "Error loading doctors list"
                      : ""}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
          ) : (
            user?.role === "ROLE_DOCTOR" && (
              // For doctors, show a read-only field with their name
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Doctor"
                  value={`Dr. ${user?.firstName} ${user?.lastName}`}
                  disabled
                  InputProps={{
                    readOnly: true,
                  }}
                  helperText="You are the doctor for this appointment"
                />
              </Grid>
            )
          )}

          {/* Patient selection - visible to admins and doctors */}
          {(user?.role === "ROLE_ADMIN" || user?.role === "ROLE_DOCTOR") && (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required disabled={loading}>
                <InputLabel>Patient</InputLabel>
                <Select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value as number)}
                  label="Patient"
                >
                  {patients.map((patient) => (
                    <MenuItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Status selection - visible to admins and doctors */}
          {(user?.role === "ROLE_ADMIN" || user?.role === "ROLE_DOCTOR") && (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required disabled={loading}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as Appointment["status"])
                  }
                  label="Status"
                >
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={isVideoConsultation}
                  onChange={(e) => setIsVideoConsultation(e.target.checked)}
                  disabled={loading}
                />
              }
              label="Video Consultation"
            />
          </Grid>

          {isVideoConsultation && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meeting Link"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                disabled={loading}
              />
            </Grid>
          )}

          {/* Notes - visible to admins and doctors */}
          {(user?.role === "ROLE_ADMIN" || user?.role === "ROLE_DOCTOR") && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (only visible to staff)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                rows={3}
                disabled={loading}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button variant="outlined" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? (
                  <CircularProgress size={24} />
                ) : appointment ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default AppointmentForm;
