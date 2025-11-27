package com.healthrecords.controller;

import com.healthrecords.dto.DirectAppointmentRequest;
import com.healthrecords.model.Appointment;
import com.healthrecords.service.DirectAppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for direct appointment creation
 * This controller bypasses all security and validation
 */
@RestController
@RequestMapping("/direct-appointment")
@CrossOrigin(originPatterns = {"http://localhost:*"}, allowCredentials = "false")
@RequiredArgsConstructor
public class DirectAppointmentController {

    private final DirectAppointmentService directAppointmentService;

    /**
     * Test endpoint to check if the controller is accessible
     */
    @GetMapping("/test")
    public ResponseEntity<?> test() {
        System.out.println("==== Direct Appointment Controller: Test ====");

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Direct appointment test successful");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("status", "success");

        return ResponseEntity.ok(response);
    }

    /**
     * Create a new appointment directly
     * This endpoint bypasses all security and validation
     */
    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody Map<String, Object> requestMap) {
        System.out.println("==== Direct Appointment Controller: Create Appointment ====");
        System.out.println("Request: " + requestMap);

        // Convert the map to our DTO, ignoring any extra fields
        DirectAppointmentRequest request = new DirectAppointmentRequest();

        try {
            // Convert the map to our DTO
            if (requestMap.containsKey("doctorId")) {
                request.setDoctorId(((Number) requestMap.get("doctorId")).longValue());
            }

            if (requestMap.containsKey("patientId")) {
                request.setPatientId(((Number) requestMap.get("patientId")).longValue());
            }

            if (requestMap.containsKey("title")) {
                request.setTitle((String) requestMap.get("title"));
            }

            if (requestMap.containsKey("description")) {
                request.setDescription((String) requestMap.get("description"));
            }

            if (requestMap.containsKey("appointmentDateTime")) {
                request.setAppointmentDateTime((String) requestMap.get("appointmentDateTime"));
            }

            if (requestMap.containsKey("notes")) {
                request.setNotes((String) requestMap.get("notes"));
            }

            if (requestMap.containsKey("isVideoConsultation")) {
                request.setIsVideoConsultation((Boolean) requestMap.get("isVideoConsultation"));
            }

            if (requestMap.containsKey("meetingLink")) {
                request.setMeetingLink((String) requestMap.get("meetingLink"));
            }

            // Log the converted request
            System.out.println("Converted request: " + request);
            // Validate required fields
            if (request.getDoctorId() == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Doctor ID is required",
                    "status", "error"
                ));
            }

            if (request.getPatientId() == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Patient ID is required",
                    "status", "error"
                ));
            }

            if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Title is required",
                    "status", "error"
                ));
            }

            if (request.getAppointmentDateTime() == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Appointment date/time is required",
                    "status", "error"
                ));
            }

            // Create appointment
            Appointment savedAppointment = directAppointmentService.createDirectAppointment(request);

            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Appointment created successfully");
            response.put("id", savedAppointment.getId());
            response.put("createdAt", savedAppointment.getCreatedAt().toString());
            response.put("status", savedAppointment.getStatus().toString());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error creating appointment: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to create appointment: " + e.getMessage(),
                "status", "error"
            ));
        }
    }
}
