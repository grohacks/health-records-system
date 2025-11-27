package com.healthrecords.controller;

import com.healthrecords.dto.SimpleAppointmentRequest;
import com.healthrecords.model.Appointment;
import com.healthrecords.model.User;
import com.healthrecords.service.AppointmentService;
import com.healthrecords.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for public appointment endpoints
 * These endpoints don't require authentication
 */
@RestController
@RequestMapping("/api/open/appointments")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = {"http://localhost:*"}, allowCredentials = "false")
public class AppointmentPublicController {

    private final AppointmentService appointmentService;
    private final UserService userService;

    /**
     * Test endpoint
     */
    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        System.out.println("==== Test endpoint reached ====");
        return ResponseEntity.ok(Map.of(
            "message", "AppointmentPublicController is working",
            "timestamp", java.time.LocalDateTime.now().toString(),
            "status", "success"
        ));
    }

    /**
     * Create a new appointment without authentication
     */
    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody SimpleAppointmentRequest request) {
        try {
            System.out.println("==== Received request to create open appointment ====");
            System.out.println("Request: " + request);
            System.out.println("Raw JSON received: " + request);
            
            // Print all fields individually for debugging
            System.out.println("doctorId: " + request.getDoctorId());
            System.out.println("patientId: " + request.getPatientId());
            System.out.println("title: " + request.getTitle());
            System.out.println("appointmentDateTime: " + request.getAppointmentDateTime());
            System.out.println("description: " + request.getDescription());
            
            // Validate required fields
            if (request.getDoctorId() == null) {
                System.out.println("ERROR: Doctor ID is null");
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Doctor ID is required",
                    "status", "error"
                ));
            }
            
            if (request.getPatientId() == null) {
                System.out.println("ERROR: Patient ID is null");
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Patient ID is required",
                    "status", "error"
                ));
            }
            
            if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
                System.out.println("ERROR: Title is null or empty");
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Title is required",
                    "status", "error"
                ));
            }
            
            if (request.getAppointmentDateTime() == null) {
                System.out.println("ERROR: AppointmentDateTime is null");
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Appointment date/time is required",
                    "status", "error"
                ));
            }
            
            // Get the patient from the ID
            User patient;
            try {
                patient = userService.getUserById(request.getPatientId());
                System.out.println("Using patient from request: " + patient.getEmail());
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid patient ID: " + request.getPatientId(),
                    "status", "error"
                ));
            }
            
            // Create appointment using the service
            Appointment appointment = appointmentService.createSimpleAppointment(request, patient);
            System.out.println("Open appointment created successfully with ID: " + appointment.getId());
            
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            System.out.println("Error creating open appointment: " + e.getMessage());
            e.printStackTrace();
            
            // Return a simple error response
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to create appointment: " + e.getMessage(),
                "status", "error"
            ));
        }
    }
}
