package com.healthrecords.service;

import com.healthrecords.dto.SimpleAppointmentRequest;
import com.healthrecords.model.Appointment;
import com.healthrecords.model.User;
import com.healthrecords.model.UserRole;
import com.healthrecords.repository.AppointmentRepository;
import com.healthrecords.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /**
     * Get all appointments - accessible only to admins
     */
    public List<Appointment> getAllAppointments() {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != UserRole.ROLE_ADMIN) {
            throw new AccessDeniedException("Only administrators can access all appointments");
        }
        return appointmentRepository.findAll();
    }

    /**
     * Get appointments by date range - accessible to admins for all appointments,
     * doctors for their appointments, patients for their own appointments
     */
    public List<Appointment> getAppointmentsByDateRange(LocalDateTime start, LocalDateTime end) {
        User currentUser = getCurrentUser();
        List<Appointment> appointments;

        if (currentUser.getRole() == UserRole.ROLE_ADMIN) {
            appointments = appointmentRepository.findByDateRange(start, end);
        } else if (currentUser.getRole() == UserRole.ROLE_DOCTOR) {
            appointments = appointmentRepository.findByDoctorAndDateRange(currentUser, start, end);
        } else {
            appointments = appointmentRepository.findByPatientAndDateRange(currentUser, start, end);
        }

        // Ensure we're not returning null
        return appointments != null ? appointments : new ArrayList<>();
    }

    /**
     * Get appointment by ID - with role-based access control
     */
    public Appointment getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found with id: " + id));

        User currentUser = getCurrentUser();

        // Admins can access any appointment
        if (currentUser.getRole() == UserRole.ROLE_ADMIN) {
            return appointment;
        }

        // Doctors can access appointments where they are the doctor
        if (currentUser.getRole() == UserRole.ROLE_DOCTOR &&
            appointment.getDoctor().getId().equals(currentUser.getId())) {
            return appointment;
        }

        // Patients can access only their own appointments
        if (currentUser.getRole() == UserRole.ROLE_PATIENT &&
            appointment.getPatient().getId().equals(currentUser.getId())) {
            return appointment;
        }

        throw new AccessDeniedException("You don't have permission to access this appointment");
    }

    /**
     * Create a new appointment
     */
    @Transactional
    public Appointment createAppointment(Appointment appointment) {
        System.out.println("==== Creating Appointment ====");
        User currentUser = getCurrentUser();
        System.out.println("Current user: " + currentUser.getEmail() + " with role: " + currentUser.getRole());
        System.out.println("Appointment data: " + appointment);

        // Validate required fields
        if (appointment.getAppointmentDateTime() == null) {
            System.out.println("Error: Appointment date/time is required");
            throw new IllegalArgumentException("Appointment date/time is required");
        }

        if (appointment.getTitle() == null || appointment.getTitle().trim().isEmpty()) {
            System.out.println("Error: Appointment title is required");
            throw new IllegalArgumentException("Appointment title is required");
        }

        // Validate doctor exists
        if (appointment.getDoctor() == null || appointment.getDoctor().getId() == null) {
            System.out.println("Error: Doctor is null or has null ID");
            throw new IllegalArgumentException("Doctor is required");
        }

        User doctor = userRepository.findById(appointment.getDoctor().getId())
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));
        System.out.println("Doctor found: " + doctor.getEmail());

        if (doctor.getRole() != UserRole.ROLE_DOCTOR) {
            System.out.println("Error: Selected user is not a doctor. Role: " + doctor.getRole());
            throw new IllegalArgumentException("Selected user is not a doctor");
        }

        // Set patient based on role
        if (currentUser.getRole() == UserRole.ROLE_PATIENT) {
            // Patients can only create appointments for themselves
            System.out.println("Patient creating appointment for themselves");
            appointment.setPatient(currentUser);
            appointment.setStatus(Appointment.AppointmentStatus.PENDING); // Was REQUESTED
            System.out.println("Set appointment status to REQUESTED");
        } else if (currentUser.getRole() == UserRole.ROLE_DOCTOR) {
            // Doctors can create appointments for any patient
            if (appointment.getPatient() == null || appointment.getPatient().getId() == null) {
                System.out.println("Error: Patient is null or has null ID");
                throw new IllegalArgumentException("Patient is required");
            }

            User patient = userRepository.findById(appointment.getPatient().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Patient not found"));
            System.out.println("Patient found: " + patient.getEmail());

            if (patient.getRole() != UserRole.ROLE_PATIENT) {
                System.out.println("Error: Selected user is not a patient. Role: " + patient.getRole());
                throw new IllegalArgumentException("Selected user is not a patient");
            }

            appointment.setStatus(Appointment.AppointmentStatus.APPROVED); // Was CONFIRMED
            System.out.println("Set appointment status to CONFIRMED");
        } else if (currentUser.getRole() == UserRole.ROLE_ADMIN) {
            // Admins can create appointments for any patient with any doctor
            if (appointment.getPatient() == null || appointment.getPatient().getId() == null) {
                System.out.println("Error: Patient is null or has null ID");
                throw new IllegalArgumentException("Patient is required");
            }

            User patient = userRepository.findById(appointment.getPatient().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Patient not found"));
            System.out.println("Patient found: " + patient.getEmail());

            if (patient.getRole() != UserRole.ROLE_PATIENT) {
                System.out.println("Error: Selected user is not a patient. Role: " + patient.getRole());
                throw new IllegalArgumentException("Selected user is not a patient");
            }

            appointment.setStatus(Appointment.AppointmentStatus.APPROVED); // Was CONFIRMED
            System.out.println("Set appointment status to CONFIRMED");
        }

        // Ensure all required fields are set
        if (appointment.getIsVideoConsultation() == null) {
            System.out.println("Setting default value for isVideoConsultation: false");
            appointment.setIsVideoConsultation(false);
        }

        // Set createdAt and updatedAt if they're null
        LocalDateTime now = LocalDateTime.now();
        if (appointment.getCreatedAt() == null) {
            System.out.println("Setting createdAt to now");
            appointment.setCreatedAt(now);
        }

        if (appointment.getUpdatedAt() == null) {
            System.out.println("Setting updatedAt to now");
            appointment.setUpdatedAt(now);
        }

        // Double-check all required fields
        if (appointment.getPatient() == null) {
            throw new IllegalArgumentException("Patient is required");
        }

        if (appointment.getDoctor() == null) {
            throw new IllegalArgumentException("Doctor is required");
        }

        if (appointment.getAppointmentDateTime() == null) {
            throw new IllegalArgumentException("Appointment date/time is required");
        }

        if (appointment.getTitle() == null || appointment.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Title is required");
        }

        if (appointment.getStatus() == null) {
            throw new IllegalArgumentException("Status is required");
        }

        System.out.println("Saving appointment to database");
        System.out.println("Final appointment data: " + appointment);

        Appointment savedAppointment;
        try {
            // Print all fields for debugging
            System.out.println("==== Appointment Fields Before Save ====");
            System.out.println("ID: " + appointment.getId());
            System.out.println("Patient: " + (appointment.getPatient() != null ? appointment.getPatient().getId() : "null"));
            System.out.println("Doctor: " + (appointment.getDoctor() != null ? appointment.getDoctor().getId() : "null"));
            System.out.println("DateTime: " + appointment.getAppointmentDateTime());
            System.out.println("Title: " + appointment.getTitle());
            System.out.println("Description: " + appointment.getDescription());
            System.out.println("Status: " + appointment.getStatus());
            System.out.println("Notes: " + appointment.getNotes());
            System.out.println("IsVideoConsultation: " + appointment.getIsVideoConsultation());
            System.out.println("MeetingLink: " + appointment.getMeetingLink());
            System.out.println("CreatedAt: " + appointment.getCreatedAt());
            System.out.println("UpdatedAt: " + appointment.getUpdatedAt());

            // Try to save the appointment
            savedAppointment = appointmentRepository.save(appointment);
            System.out.println("Appointment saved with ID: " + savedAppointment.getId());
        } catch (Exception e) {
            System.out.println("Error saving appointment: " + e.getMessage());
            System.out.println("Root cause: " + getRootCause(e).getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save appointment: " + e.getMessage(), e);
        }

        // Create notification if appointment is requested by a patient
        if (currentUser.getRole() == UserRole.ROLE_PATIENT &&
            savedAppointment.getStatus() == Appointment.AppointmentStatus.PENDING) { // Was REQUESTED
            System.out.println("Creating notification for doctor about appointment request");
            notificationService.createAppointmentRequestNotification(savedAppointment);
        }

        System.out.println("Appointment creation completed successfully");
        return savedAppointment;
    }

    /**
     * Update an appointment with role-based permissions
     */
    @Transactional
    public Appointment updateAppointment(Long id, Appointment appointmentDetails) {
        Appointment appointment = getAppointmentById(id); // This checks permissions
        User currentUser = getCurrentUser();

        // Update fields based on role
        if (currentUser.getRole() == UserRole.ROLE_PATIENT) {
            // Patients can only update certain fields
            appointment.setDescription(appointmentDetails.getDescription());

            // Patients can cancel their appointments
            if (appointmentDetails.getStatus() == Appointment.AppointmentStatus.CANCELLED) {
                appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
            }
        } else {
            // Doctors and admins can update all fields
            appointment.setAppointmentDateTime(appointmentDetails.getAppointmentDateTime());
            appointment.setTitle(appointmentDetails.getTitle());
            appointment.setDescription(appointmentDetails.getDescription());
            appointment.setStatus(appointmentDetails.getStatus());
            appointment.setNotes(appointmentDetails.getNotes());
            appointment.setIsVideoConsultation(appointmentDetails.getIsVideoConsultation());
            appointment.setMeetingLink(appointmentDetails.getMeetingLink());

            // Only admins can change the doctor
            if (currentUser.getRole() == UserRole.ROLE_ADMIN && appointmentDetails.getDoctor() != null) {
                User doctor = userRepository.findById(appointmentDetails.getDoctor().getId())
                        .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));

                if (doctor.getRole() != UserRole.ROLE_DOCTOR) {
                    throw new IllegalArgumentException("Selected user is not a doctor");
                }

                appointment.setDoctor(doctor);
            }
        }

        return appointmentRepository.save(appointment);
    }

    /**
     * Delete an appointment - only admins and doctors can delete appointments
     */
    @Transactional
    public void deleteAppointment(Long id) {
        Appointment appointment = getAppointmentById(id); // This checks permissions
        User currentUser = getCurrentUser();

        if (currentUser.getRole() == UserRole.ROLE_PATIENT) {
            throw new AccessDeniedException("Patients cannot delete appointments");
        }

        System.out.println("Deleting appointment with ID: " + id);
        
        try {
            // First, delete any related notifications
            notificationService.deleteNotificationsByAppointment(appointment);
            
            // Then delete the appointment
            appointmentRepository.delete(appointment);
            
            System.out.println("Successfully deleted appointment with ID: " + id);
        } catch (Exception e) {
            System.out.println("Error deleting appointment: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to delete appointment: " + e.getMessage());
        }
    }

    /**
     * Get appointments for the current user
     */
    public List<Appointment> getMyAppointments() {
        User currentUser = getCurrentUser();

        if (currentUser.getRole() == UserRole.ROLE_DOCTOR) {
            return appointmentRepository.findByDoctor(currentUser);
        } else if (currentUser.getRole() == UserRole.ROLE_PATIENT) {
            return appointmentRepository.findByPatient(currentUser);
        } else {
            throw new AccessDeniedException("Invalid role for this operation");
        }
    }

    /**
     * Get upcoming appointments for the current user
     */
    public List<Appointment> getMyUpcomingAppointments() {
        User currentUser = getCurrentUser();
        LocalDateTime now = LocalDateTime.now();
        List<Appointment> appointments;

        if (currentUser.getRole() == UserRole.ROLE_DOCTOR) {
            appointments = appointmentRepository.findByDoctorAndDateRange(currentUser, now, now.plusMonths(1));
        } else if (currentUser.getRole() == UserRole.ROLE_PATIENT) {
            appointments = appointmentRepository.findByPatientAndDateRange(currentUser, now, now.plusMonths(1));
        } else if (currentUser.getRole() == UserRole.ROLE_ADMIN) {
            // Allow admins to see all upcoming appointments
            appointments = appointmentRepository.findByDateRange(now, now.plusMonths(1));
        } else {
            throw new AccessDeniedException("Invalid role for this operation");
        }

        // Ensure we're not returning null
        return appointments != null ? appointments : new ArrayList<>();
    }

    /**
     * Confirm an appointment - only doctors and admins can confirm appointments
     */
    @Transactional
    public Appointment confirmAppointment(Long id) {
        Appointment appointment = getAppointmentById(id); // This checks permissions
        User currentUser = getCurrentUser();

        if (currentUser.getRole() == UserRole.ROLE_PATIENT) {
            throw new AccessDeniedException("Patients cannot confirm appointments");
        }

        System.out.println("Confirming appointment with ID: " + appointment.getId() + " and status: " + appointment.getStatus());

        // Only pending appointments can be confirmed
        if (appointment.getStatus() != Appointment.AppointmentStatus.PENDING) { // Was REQUESTED
            System.out.println("Cannot confirm appointment with status: " + appointment.getStatus());
            System.out.println("Only PENDING appointments can be confirmed");
            throw new IllegalStateException("Only pending appointments can be confirmed");
        }

        appointment.setStatus(Appointment.AppointmentStatus.APPROVED); // Was CONFIRMED
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Create notification for the patient
        notificationService.createAppointmentConfirmationNotification(savedAppointment);

        return savedAppointment;
    }

    /**
     * Reject an appointment - only doctors and admins can reject appointments
     */
    @Transactional
    public Appointment rejectAppointment(Long id, String reason) {
        Appointment appointment = getAppointmentById(id); // This checks permissions
        User currentUser = getCurrentUser();

        if (currentUser.getRole() == UserRole.ROLE_PATIENT) {
            throw new AccessDeniedException("Patients cannot reject appointments");
        }

        // Only pending appointments can be rejected
        if (appointment.getStatus() != Appointment.AppointmentStatus.PENDING) { // Was REQUESTED
            System.out.println("Cannot reject appointment with status: " + appointment.getStatus());
            System.out.println("Only PENDING appointments can be rejected");
            throw new IllegalStateException("Only pending appointments can be rejected");
        }

        System.out.println("Rejecting appointment with ID: " + appointment.getId() + " and status: " + appointment.getStatus());

        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointment.setNotes(appointment.getNotes() != null ?
                            appointment.getNotes() + "\n\nRejection reason: " + reason :
                            "Rejection reason: " + reason);

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Create notification for the patient
        notificationService.createAppointmentRejectionNotification(savedAppointment, reason);

        return savedAppointment;
    }

    /**
     * Get the current authenticated user
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    /**
     * Get the root cause of an exception
     */
    private Throwable getRootCause(Throwable throwable) {
        Throwable cause = throwable.getCause();
        if (cause == null) {
            return throwable;
        }
        return getRootCause(cause);
    }

    /**
     * Create a simple appointment with minimal required fields
     * This method uses a more direct approach to avoid database errors
     */
    @Transactional
    public Appointment createSimpleAppointment(SimpleAppointmentRequest request, User currentUser) {
        System.out.println("==== Creating Simple Appointment ====");

        try {
            // Get doctor
            User doctor;
            if (request.getDoctorId() != null) {
                doctor = userRepository.findById(request.getDoctorId())
                    .orElseThrow(() -> new EntityNotFoundException("Doctor not found with id: " + request.getDoctorId()));

                if (doctor.getRole() != UserRole.ROLE_DOCTOR) {
                    throw new IllegalArgumentException("Selected user is not a doctor");
                }
            } else {
                throw new IllegalArgumentException("Doctor ID is required");
            }

            // Get patient based on role
            User patient;
            if (currentUser.getRole() == UserRole.ROLE_PATIENT) {
                // Patients can only create appointments for themselves
                patient = currentUser;
            } else if (request.getPatientId() != null) {
                // Doctors and admins need to specify a patient
                patient = userRepository.findById(request.getPatientId())
                    .orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + request.getPatientId()));

                if (patient.getRole() != UserRole.ROLE_PATIENT) {
                    throw new IllegalArgumentException("Selected user is not a patient");
                }
            } else {
                throw new IllegalArgumentException("Patient ID is required for doctors and admins");
            }

            // Set status based on role
            Appointment.AppointmentStatus status;
            // For public endpoints, currentUser might be null
            if (currentUser == null || currentUser.getRole() == UserRole.ROLE_PATIENT) {
                status = Appointment.AppointmentStatus.PENDING; // Was REQUESTED
            } else if (currentUser.getRole() == UserRole.ROLE_DOCTOR || currentUser.getRole() == UserRole.ROLE_ADMIN) {
                status = Appointment.AppointmentStatus.APPROVED; // Was CONFIRMED
            } else {
                // Default to PENDING for any other role
                status = Appointment.AppointmentStatus.PENDING; // Was REQUESTED
            }

            // Create appointment using builder pattern
            LocalDateTime now = LocalDateTime.now();
            Appointment appointment = Appointment.builder()
                .doctor(doctor)
                .patient(patient)
                .appointmentDateTime(request.getAppointmentDateTime())
                .title(request.getTitle())
                .description(request.getDescription())
                .status(status)
                .notes(request.getNotes())
                .isVideoConsultation(request.getIsVideoConsultation() != null ? request.getIsVideoConsultation() : false)
                .meetingLink(request.getMeetingLink())
                .createdAt(now)
                .updatedAt(now)
                .build();

            // Save appointment
            System.out.println("Saving simple appointment to database");
            Appointment savedAppointment = appointmentRepository.save(appointment);
            System.out.println("Simple appointment saved with ID: " + savedAppointment.getId());

            // Create notification if needed
            if ((currentUser != null && currentUser.getRole() == UserRole.ROLE_PATIENT) ||
                savedAppointment.getStatus() == Appointment.AppointmentStatus.PENDING) { // Was REQUESTED
                try {
                    notificationService.createAppointmentRequestNotification(savedAppointment);
                    System.out.println("Created notification for appointment request");
                } catch (Exception e) {
                    System.out.println("Error creating notification: " + e.getMessage());
                    // Don't fail the appointment creation if notification fails
                }
            }

            return savedAppointment;
        } catch (Exception e) {
            System.out.println("Error in createSimpleAppointment: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
