import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Tabs,
  Tab,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  TextField,
} from "@mui/material";
import {
  Add as AddIcon,
  Event as EventIcon,
  List as ListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  VideoCall as VideoCallIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useAppointments } from "../hooks/useAppointments";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Appointment } from "../types";
import AppointmentCalendar from "../components/AppointmentCalendar";
import AppointmentForm from "../components/AppointmentForm";
import AppointmentActions from "../components/AppointmentActions";
import NotificationCenter from "../components/NotificationCenter";
import { format } from "date-fns";
import {
  StyledTableContainer,
  StyledTable,
  StyledTableHead,
  StyledTableRow,
  StyledTableCell,
  StyledTableBody,
  GradientTypography,
} from "../styles/shared";

const Appointments: React.FC = () => {
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [openForm, setOpenForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    appointmentId: number | null;
    reason: string;
  }>({
    open: false,
    appointmentId: null,
    reason: "",
  });

  const { user } = useSelector((state: RootState) => state.auth);
  const {
    appointments,
    loading,
    error,
    getAppointments,
    getMyUpcomingAppointments,
    removeAppointment,
    confirmAppointmentStatus,
    rejectAppointment,
  } = useAppointments();

  // Load appointments function - stabilized with useCallback
  const loadAppointments = useCallback(async () => {
    if (!user) return;
    
    try {
      if (user.role === "ROLE_ADMIN") {
        await getAppointments();
      } else {
        await getMyUpcomingAppointments();
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    }
  }, [user?.role, user?.id, getAppointments, getMyUpcomingAppointments]);

  // Load appointments when component mounts - SIMPLIFIED
  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;
    
    const initializeAppointments = async () => {
      if (!isMounted) return;
      
      if (import.meta.env.DEV) {
        console.log("Initializing appointments for user:", user.email, "role:", user.role);
      }
      
      await loadAppointments();
    };
    
    // Only initialize once
    initializeAppointments();

    // Set up refresh interval
    const interval = setInterval(() => {
      if (isMounted) {
        loadAppointments();
      }
    }, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user?.id, loadAppointments]); // Depend on stable loadAppointments

  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setOpenForm(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setOpenForm(true);
  };

  const handleDeleteAppointment = async (id: number) => {
    if (confirmDelete === id) {
      try {
        if (import.meta.env.DEV) {
          console.log("Deleting appointment with ID:", id);
        }
        
        await removeAppointment(id);
        
        // Show success message
        alert("Appointment deleted successfully.");
        
        // Clear confirmation state
        setConfirmDelete(null);
        
        // Refresh appointments list
        loadAppointments();
        
        if (import.meta.env.DEV) {
          console.log("Appointment deleted and list refreshed");
        }
      } catch (error) {
        console.error("Error deleting appointment:", error);
        alert("Failed to delete appointment. Please try again.");
        setConfirmDelete(null);
      }
    } else {
      setConfirmDelete(id);
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const handleConfirmAppointment = async (id: number) => {
    try {
      await confirmAppointmentStatus(id);
      // Show success message
      alert(
        "Appointment approved successfully. The patient has been notified."
      );
      // Refresh the appointments list
      loadAppointments();
    } catch (error) {
      console.error("Error confirming appointment:", error);
      alert("Failed to approve appointment. Please try again.");
    }
  };

  const handleRejectAppointment = (id: number) => {
    setRejectDialog({
      open: true,
      appointmentId: id,
      reason: "",
    });
  };

  const handleCloseRejectDialog = () => {
    setRejectDialog({
      open: false,
      appointmentId: null,
      reason: "",
    });
  };

  const handleRejectReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRejectDialog({
      ...rejectDialog,
      reason: e.target.value,
    });
  };

  const handleRejectConfirm = async () => {
    if (rejectDialog.appointmentId && rejectDialog.reason) {
      try {
        await rejectAppointment(
          rejectDialog.appointmentId,
          rejectDialog.reason
        );
        // Show success message
        alert(
          "Appointment rejected successfully. The patient has been notified."
        );
        handleCloseRejectDialog();
        // Refresh the appointments list
        loadAppointments();
      } catch (error) {
        console.error("Error rejecting appointment:", error);
        alert("Failed to reject appointment. Please try again.");
      }
    }
  };

  const handleFormSuccess = () => {
    setOpenForm(false);
    // Refresh appointments
    if (user?.role === "ROLE_ADMIN") {
      getAppointments();
    } else {
      getMyUpcomingAppointments();
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Chip label="Approved" color="success" size="small" />;
      case "PENDING":
        return <Chip label="Pending" color="warning" size="small" />;
      case "CANCELLED":
        return <Chip label="Cancelled" color="error" size="small" />;
      case "COMPLETED":
        return <Chip label="Completed" color="info" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  if (loading && appointments.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={400}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <GradientTypography variant="h4" gutterBottom>
              <EventIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Appointments
            </GradientTypography>
            <Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateAppointment}
                sx={{ mr: 1 }}
              >
                New Appointment
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  if (import.meta.env.DEV) {
                    console.log("Manual refresh triggered");
                  }
                  if (user?.role === "ROLE_DOCTOR") {
                    getMyUpcomingAppointments();
                  } else if (user?.role === "ROLE_ADMIN") {
                    getAppointments();
                  } else {
                    loadAppointments();
                  }

                  // Force switch to list view to see appointments
                  setView("list");
                }}
              >
                Refresh Appointments
              </Button>
            </Box>
          </Box>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Tabs
              value={view}
              onChange={(_, newValue) => setView(newValue)}
              indicatorColor="primary"
              textColor="primary"
              centered
            >
              <Tab
                icon={<EventIcon />}
                label="Calendar View"
                value="calendar"
              />
              <Tab icon={<ListIcon />} label="List View" value="list" />
            </Tabs>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          {view === "calendar" ? (
            <Paper elevation={3} sx={{ p: 3 }}>
              <AppointmentCalendar
                onSelectAppointment={handleEditAppointment}
              />
            </Paper>
          ) : (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Upcoming Appointments ({appointments.length})
              </Typography>

              {/* Debug info */}
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    console.log("Current appointments:", appointments);
                    console.log("User role:", user?.role);
                    console.log("User ID:", user?.id);
                  }}
                >
                  Debug Info
                </Button>
              </Box>

              <StyledTableContainer>
                <StyledTable>
                  <StyledTableHead>
                    <StyledTableRow>
                      <StyledTableCell>Date & Time</StyledTableCell>
                      <StyledTableCell>Title</StyledTableCell>
                      {user?.role !== "ROLE_PATIENT" && (
                        <StyledTableCell>Patient</StyledTableCell>
                      )}
                      {user?.role !== "ROLE_DOCTOR" && (
                        <StyledTableCell>Doctor</StyledTableCell>
                      )}
                      <StyledTableCell>Status</StyledTableCell>
                      <StyledTableCell>Type</StyledTableCell>
                      <StyledTableCell align="right">Actions</StyledTableCell>
                    </StyledTableRow>
                  </StyledTableHead>
                  <StyledTableBody>
                    {appointments.length === 0 ? (
                      <StyledTableRow>
                        <StyledTableCell colSpan={7} align="center">
                          No appointments found
                        </StyledTableCell>
                      </StyledTableRow>
                    ) : (
                      appointments.map((appointment) => {
                        return (
                          <StyledTableRow key={appointment.id}>
                            <StyledTableCell>
                              {format(
                                new Date(appointment.appointmentDateTime),
                                "MMM d, yyyy h:mm a"
                              )}
                            </StyledTableCell>
                            <StyledTableCell>
                              {appointment.title}
                            </StyledTableCell>
                            {user?.role !== "ROLE_PATIENT" && (
                              <StyledTableCell>
                                {typeof appointment.patient === "object"
                                  ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                                  : "Patient"}
                              </StyledTableCell>
                            )}
                            {user?.role !== "ROLE_DOCTOR" && (
                              <StyledTableCell>
                                {typeof appointment.doctor === "object"
                                  ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                                  : "Doctor"}
                              </StyledTableCell>
                            )}
                            <StyledTableCell>
                              {getStatusChip(appointment.status)}
                            </StyledTableCell>
                            <StyledTableCell>
                              {appointment.isVideoConsultation ? (
                                <Chip
                                  icon={<VideoCallIcon />}
                                  label="Video"
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              ) : (
                                <Chip
                                  label="In-person"
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              {/* Edit button - available to all */}
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleEditAppointment(appointment)
                                  }
                                  sx={{ mr: 1 }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>

                              {/* Approve/Reject buttons - only for doctors and admins with PENDING appointments */}
                              <AppointmentActions
                                appointmentId={appointment.id}
                                status={appointment.status}
                                userRole={user?.role}
                                onApprove={handleConfirmAppointment}
                                onReject={handleRejectAppointment}
                              />

                              {/* Delete button - only for doctors and admins */}
                              {(user?.role === "ROLE_DOCTOR" ||
                                user?.role === "ROLE_ADMIN") && (
                                <Tooltip
                                  title={
                                    confirmDelete === appointment.id
                                      ? "Click again to confirm"
                                      : "Delete"
                                  }
                                >
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() =>
                                      handleDeleteAppointment(appointment.id)
                                    }
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </StyledTableCell>
                          </StyledTableRow>
                        );
                      })
                    )}
                  </StyledTableBody>
                </StyledTable>
              </StyledTableContainer>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Appointment Form Dialog */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <AppointmentForm
            appointment={selectedAppointment || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => setOpenForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Reject Appointment Dialog */}
      <Dialog
        open={rejectDialog.open}
        onClose={handleCloseRejectDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Appointment</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Reason for rejection"
              value={rejectDialog.reason}
              onChange={handleRejectReasonChange}
              multiline
              rows={4}
              placeholder="Please provide a reason for rejecting this appointment"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRejectDialog}>Cancel</Button>
          <Button
            onClick={handleRejectConfirm}
            color="error"
            variant="contained"
            disabled={!rejectDialog.reason}
          >
            Reject Appointment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Center */}
      <Box sx={{ position: "fixed", top: 70, right: 20, zIndex: 1000 }}>
        <NotificationCenter />
      </Box>
    </motion.div>
  );
};

export default Appointments;
