package com.healthrecords.controller;

import com.healthrecords.model.Appointment;
import com.healthrecords.model.Notification;
import com.healthrecords.model.User;
import com.healthrecords.repository.AppointmentRepository;
import com.healthrecords.repository.NotificationRepository;
import com.healthrecords.service.NotificationService;
import com.healthrecords.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller with no security at all
 * This controller is completely separate from Spring Security
 */
@RestController
@RequestMapping("/no-security")
@CrossOrigin(originPatterns = {"http://localhost:*"}, allowCredentials = "false")
public class NoSecurityController {

    private final UserService userService;
    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;

    public NoSecurityController(UserService userService,
                               AppointmentRepository appointmentRepository,
                               NotificationService notificationService,
                               NotificationRepository notificationRepository) {
        this.userService = userService;
        this.appointmentRepository = appointmentRepository;
        this.notificationService = notificationService;
        this.notificationRepository = notificationRepository;
    }

    /**
     * Test endpoint
     */
    @GetMapping("/test")
    public ResponseEntity<?> test() {
        System.out.println("==== No Security Controller: Test ====");
        Map<String, Object> response = new HashMap<>();
        response.put("message", "No security test successful");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("status", "success");

        return ResponseEntity.ok(response);
    }

    /**
     * Test endpoint to check notifications for a specific user
     */
    @GetMapping("/check-notifications/{userId}")
    public ResponseEntity<?> checkNotifications(@PathVariable Long userId) {
        System.out.println("==== No Security Controller: Check Notifications ====");
        System.out.println("Checking notifications for user ID: " + userId);

        try {
            // Get the user
            User user = userService.getUserById(userId);
            System.out.println("Found user: " + user.getEmail() + " with role: " + user.getRole());

            // Count unread notifications
            Long unreadCount = notificationService.countUnreadNotificationsForUser(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("userEmail", user.getEmail());
            response.put("userRole", user.getRole().toString());
            response.put("unreadNotifications", unreadCount);
            response.put("timestamp", LocalDateTime.now().toString());
            response.put("status", "success");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error checking notifications: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to check notifications: " + e.getMessage(),
                "status", "error"
            ));
        }
    }

    /**
     * Test endpoint to create a notification for a user
     */
    @PostMapping("/create-test-notification")
    public ResponseEntity<?> createTestNotification(@RequestBody Map<String, Object> request) {
        System.out.println("==== No Security Controller: Create Test Notification ====");
        System.out.println("Request: " + request);

        try {
            // Extract data from request
            Long userId = ((Number) request.get("userId")).longValue();
            String title = (String) request.getOrDefault("title", "Test Notification");
            String message = (String) request.getOrDefault("message", "This is a test notification");

            // Get the user
            User user = userService.getUserById(userId);
            System.out.println("Creating notification for user: " + user.getEmail());

            // Create notification
            Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(Notification.NotificationType.SYSTEM)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

            // Save notification
            Notification savedNotification = notificationRepository.save(notification);
            System.out.println("Test notification created with ID: " + savedNotification.getId());

            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Test notification created successfully");
            response.put("notificationId", savedNotification.getId());
            response.put("userId", userId);
            response.put("timestamp", LocalDateTime.now().toString());
            response.put("status", "success");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error creating test notification: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to create test notification: " + e.getMessage(),
                "status", "error"
            ));
        }
    }

    /**
     * Echo endpoint
     */
    @PostMapping("/echo")
    public ResponseEntity<?> echo(@RequestBody Map<String, Object> request) {
        System.out.println("==== No Security Controller: Echo ====");
        System.out.println("Received request: " + request);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "No security echo successful");
        response.put("received", request);
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("status", "success");

        return ResponseEntity.ok(response);
    }

    /**
     * Create appointment endpoint
     */
    @PostMapping("/appointment")
    public ResponseEntity<?> createAppointment(@RequestBody Map<String, Object> request) {
        System.out.println("==== No Security Controller: Create Appointment ====");
        System.out.println("Received appointment request: " + request);

        try {
            // Extract data from request
            Long doctorId = ((Number) request.get("doctorId")).longValue();
            Long patientId = ((Number) request.get("patientId")).longValue();
            String title = (String) request.get("title");
            String description = (String) request.get("description");
            String appointmentDateTimeStr = (String) request.get("appointmentDateTime");
            Boolean isVideoConsultation = (Boolean) request.getOrDefault("isVideoConsultation", false);
            String meetingLink = (String) request.getOrDefault("meetingLink", "");
            String notes = (String) request.getOrDefault("notes", "");

            // Get status or default to PENDING (was REQUESTED)
            Appointment.AppointmentStatus status = Appointment.AppointmentStatus.PENDING;
            if (request.containsKey("status")) {
                Object statusObj = request.get("status");
                System.out.println("Status from request: " + statusObj + " (type: " + (statusObj != null ? statusObj.getClass().getName() : "null") + ")");

                if (statusObj instanceof String) {
                    String statusStr = (String) statusObj;
                    try {
                        status = Appointment.AppointmentStatus.valueOf(statusStr);
                        System.out.println("Using status from request: " + status);
                    } catch (IllegalArgumentException e) {
                        System.out.println("Invalid status value: " + statusStr + ". Using default: REQUESTED");
                    }
                } else {
                    System.out.println("Status is not a string. Using default: REQUESTED");
                }
            } else {
                System.out.println("No status in request. Using default: REQUESTED");
            }

            // Validate required fields
            if (doctorId == null || patientId == null || title == null || appointmentDateTimeStr == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Missing required fields",
                    "status", "error"
                ));
            }

            // Get the doctor and patient
            User doctor = userService.getUserById(doctorId);
            User patient = userService.getUserById(patientId);

            // Parse appointment date time
            LocalDateTime appointmentDateTime = LocalDateTime.parse(appointmentDateTimeStr.substring(0, 19));

            // Create appointment
            Appointment appointment = Appointment.builder()
                .title(title)
                .description(description)
                .appointmentDateTime(appointmentDateTime)
                .doctor(doctor)
                .patient(patient)
                .isVideoConsultation(isVideoConsultation)
                .meetingLink(meetingLink)
                .notes(notes)
                .status(status) // Use the parsed status or default
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

            // Log appointment details before saving
            System.out.println("Saving appointment with the following details:");
            System.out.println("- Title: " + appointment.getTitle());
            System.out.println("- Description: " + appointment.getDescription());
            System.out.println("- Doctor ID: " + appointment.getDoctor().getId());
            System.out.println("- Patient ID: " + appointment.getPatient().getId());
            System.out.println("- Date/Time: " + appointment.getAppointmentDateTime());
            System.out.println("- Status: " + appointment.getStatus());
            System.out.println("- Video Consultation: " + appointment.getIsVideoConsultation());

            // Save appointment
            Appointment savedAppointment = appointmentRepository.save(appointment);
            System.out.println("Appointment saved with ID: " + savedAppointment.getId());
            System.out.println("Appointment doctor: " + savedAppointment.getDoctor().getEmail());
            System.out.println("Appointment patient: " + savedAppointment.getPatient().getEmail());
            System.out.println("Appointment status after save: " + savedAppointment.getStatus());

            // Create notification for the doctor
            createDoctorNotification(savedAppointment);

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

    /**
     * Create a notification for the doctor about a new appointment request
     */
    private void createDoctorNotification(Appointment appointment) {
        try {
            System.out.println("Creating notification for doctor: " + appointment.getDoctor().getEmail());
            System.out.println("Doctor ID: " + appointment.getDoctor().getId());
            System.out.println("Appointment ID: " + appointment.getId());

            // Create and save notification using the service
            Notification notification = notificationService.createAppointmentRequestNotification(appointment);

            System.out.println("Notification created with ID: " + notification.getId());
            System.out.println("Notification for user ID: " + notification.getUser().getId());
            System.out.println("Notification is read: " + notification.getIsRead());
        } catch (Exception e) {
            System.out.println("Error creating notification: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
