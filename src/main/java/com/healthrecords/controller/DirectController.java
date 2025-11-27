package com.healthrecords.controller;

import com.healthrecords.dto.SimpleAppointmentRequest;
import com.healthrecords.model.Appointment;
import com.healthrecords.model.User;
import com.healthrecords.model.UserRole;
import com.healthrecords.repository.AppointmentRepository;
import com.healthrecords.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller for direct endpoints with no security
 * This is a temporary solution for testing
 */
@RestController
@CrossOrigin(originPatterns = {"http://localhost:*"}, allowCredentials = "false")
@RequestMapping("/direct")
public class DirectController {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;

    public DirectController(UserRepository userRepository, AppointmentRepository appointmentRepository) {
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
    }

    /**
     * Direct test endpoint
     */
    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(Map.of(
            "message", "Direct test endpoint is working",
            "timestamp", LocalDateTime.now().toString(),
            "status", "success"
        ));
    }

    /**
     * Direct appointment creation endpoint
     * This bypasses all security and validation
     */
    @PostMapping("/appointment")
    public ResponseEntity<?> createAppointment(@RequestBody SimpleAppointmentRequest request) {
        try {
            System.out.println("==== Received request to create direct appointment ====");
            System.out.println("Request: " + request);

            // Validate required fields
            Map<String, Object> errors = new HashMap<>();

            if (request.getDoctorId() == null) {
                errors.put("doctorId", "Doctor ID is required");
            }

            if (request.getPatientId() == null) {
                errors.put("patientId", "Patient ID is required");
            }

            if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
                errors.put("title", "Title is required");
            }

            if (request.getAppointmentDateTime() == null) {
                errors.put("appointmentDateTime", "Appointment date/time is required");
            }

            if (!errors.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "errors", errors,
                    "status", "error"
                ));
            }

            // Get the doctor
            User doctor = userRepository.findById(request.getDoctorId())
                .orElse(null);

            if (doctor == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Doctor not found with ID: " + request.getDoctorId(),
                    "status", "error"
                ));
            }

            // Get the patient
            User patient = userRepository.findById(request.getPatientId())
                .orElse(null);

            if (patient == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Patient not found with ID: " + request.getPatientId(),
                    "status", "error"
                ));
            }

            // Create appointment directly
            LocalDateTime now = LocalDateTime.now();
            Appointment appointment = Appointment.builder()
                .doctor(doctor)
                .patient(patient)
                .appointmentDateTime(request.getAppointmentDateTime())
                .title(request.getTitle())
                .description(request.getDescription())
                .status(Appointment.AppointmentStatus.PENDING) // Was REQUESTED
                .notes(request.getNotes())
                .isVideoConsultation(request.getIsVideoConsultation() != null ? request.getIsVideoConsultation() : false)
                .meetingLink(request.getMeetingLink())
                .createdAt(now)
                .updatedAt(now)
                .build();

            // Save appointment directly
            System.out.println("Saving direct appointment to database");
            Appointment savedAppointment = appointmentRepository.save(appointment);
            System.out.println("Direct appointment saved with ID: " + savedAppointment.getId());

            return ResponseEntity.ok(savedAppointment);
        } catch (Exception e) {
            System.out.println("Error creating direct appointment: " + e.getMessage());
            e.printStackTrace();

            // Return a simple error response
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to create appointment: " + e.getMessage(),
                "status", "error"
            ));
        }
    }
}
