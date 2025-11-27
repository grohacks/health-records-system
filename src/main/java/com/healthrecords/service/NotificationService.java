package com.healthrecords.service;

import com.healthrecords.model.Appointment;
import com.healthrecords.model.Notification;
import com.healthrecords.model.User;
import com.healthrecords.repository.NotificationRepository;
import com.healthrecords.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.Instant;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // Simple cache for unread notification counts
    private final Map<Long, Long> unreadCountCache = new HashMap<>();
    private final Map<Long, Instant> cacheTimestamps = new HashMap<>();
    private static final Duration CACHE_DURATION = Duration.ofMinutes(2); // Cache for 2 minutes

    /**
     * Get all notifications for the current user
     */
    public List<Notification> getMyNotifications() {
        User currentUser = getCurrentUser();
        return notificationRepository.findByUserOrderByCreatedAtDesc(currentUser);
    }

    /**
     * Get unread notifications for the current user
     */
    public List<Notification> getMyUnreadNotifications() {
        User currentUser = getCurrentUser();
        return notificationRepository.findByUserAndIsRead(currentUser, false);
    }

    /**
     * Get notification by ID with access control
     */
    public Notification getNotificationById(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found with id: " + id));

        User currentUser = getCurrentUser();

        // Users can only access their own notifications
        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You don't have permission to access this notification");
        }

        return notification;
    }

    /**
     * Mark a notification as read
     */
    @Transactional
    public Notification markAsRead(Long id) {
        Notification notification = getNotificationById(id);
        notification.setIsRead(true);

        // Invalidate cache for this user
        Long userId = notification.getUser().getId();
        unreadCountCache.remove(userId);
        cacheTimestamps.remove(userId);

        return notificationRepository.save(notification);
    }

    /**
     * Mark all notifications as read for the current user
     */
    @Transactional
    public void markAllAsRead() {
        User currentUser = getCurrentUser();
        List<Notification> unreadNotifications = notificationRepository.findByUserAndIsRead(currentUser, false);

        unreadNotifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);

        // Invalidate cache for this user
        Long userId = currentUser.getId();
        unreadCountCache.remove(userId);
        cacheTimestamps.remove(userId);
    }

    /**
     * Create a notification for appointment request
     */
    @Transactional
    public Notification createAppointmentRequestNotification(Appointment appointment) {
        User doctor = appointment.getDoctor();

        Notification notification = Notification.builder()
                .user(doctor)
                .title("New Appointment Request")
                .message("Patient " + appointment.getPatient().getFirstName() + " " +
                         appointment.getPatient().getLastName() + " has requested an appointment on " +
                         appointment.getAppointmentDateTime().toLocalDate())
                .type(Notification.NotificationType.APPOINTMENT_REQUESTED)
                .isRead(false)
                .relatedAppointment(appointment)
                .build();

        // Invalidate cache for the doctor
        Long userId = doctor.getId();
        unreadCountCache.remove(userId);
        cacheTimestamps.remove(userId);

        return notificationRepository.save(notification);
    }

    /**
     * Create a notification for appointment confirmation
     */
    @Transactional
    public Notification createAppointmentConfirmationNotification(Appointment appointment) {
        User patient = appointment.getPatient();

        Notification notification = Notification.builder()
                .user(patient)
                .title("Appointment Confirmed")
                .message("Your appointment with Dr. " + appointment.getDoctor().getFirstName() + " " +
                         appointment.getDoctor().getLastName() + " on " +
                         appointment.getAppointmentDateTime().toLocalDate() + " has been confirmed")
                .type(Notification.NotificationType.APPOINTMENT_CONFIRMED)
                .isRead(false)
                .relatedAppointment(appointment)
                .build();

        // Invalidate cache for the patient
        Long userId = patient.getId();
        unreadCountCache.remove(userId);
        cacheTimestamps.remove(userId);

        return notificationRepository.save(notification);
    }

    /**
     * Create a notification for appointment rejection
     */
    @Transactional
    public Notification createAppointmentRejectionNotification(Appointment appointment, String reason) {
        User patient = appointment.getPatient();

        Notification notification = Notification.builder()
                .user(patient)
                .title("Appointment Rejected")
                .message("Your appointment with Dr. " + appointment.getDoctor().getFirstName() + " " +
                         appointment.getDoctor().getLastName() + " on " +
                         appointment.getAppointmentDateTime().toLocalDate() + " has been rejected. " +
                         "Reason: " + reason)
                .type(Notification.NotificationType.APPOINTMENT_REJECTED)
                .isRead(false)
                .relatedAppointment(appointment)
                .build();

        // Invalidate cache for the patient
        Long userId = patient.getId();
        unreadCountCache.remove(userId);
        cacheTimestamps.remove(userId);

        return notificationRepository.save(notification);
    }

    /**
     * Count unread notifications for the current user
     * Uses a simple in-memory cache to reduce database queries
     */
    public Long countUnreadNotifications() {
        try {
            User currentUser = getCurrentUser();
            Long userId = currentUser.getId();

            // Check if we have a cached value that's still valid
            if (unreadCountCache.containsKey(userId) && cacheTimestamps.containsKey(userId)) {
                Instant cachedTime = cacheTimestamps.get(userId);
                if (Duration.between(cachedTime, Instant.now()).compareTo(CACHE_DURATION) < 0) {
                    // Cache is still valid
                    System.out.println("Using cached unread notification count for user: " + currentUser.getEmail());
                    return unreadCountCache.get(userId);
                }
            }

            System.out.println("Counting unread notifications for user: " + currentUser.getEmail() +
                              " with role: " + currentUser.getRole());

            // Cache miss or expired cache, query the database
            Long count = notificationRepository.countUnreadNotifications(currentUser);
            System.out.println("Found " + count + " unread notifications");

            // Update the cache
            unreadCountCache.put(userId, count);
            cacheTimestamps.put(userId, Instant.now());

            // Only log detailed notification info if there are unread notifications
            if (count > 0) {
                // Debug: List all notifications for this user
                List<Notification> allNotifications = notificationRepository.findByUser(currentUser);
                System.out.println("Total notifications for user: " + allNotifications.size());
                for (Notification notification : allNotifications) {
                    if (!notification.getIsRead()) {
                        System.out.println("Unread Notification ID: " + notification.getId() +
                                          ", Title: " + notification.getTitle() +
                                          ", Type: " + notification.getType());
                    }
                }
            }

            return count;
        } catch (Exception e) {
            System.out.println("Error in countUnreadNotifications: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Delete notifications related to an appointment
     * This is used when deleting an appointment to avoid foreign key constraint violations
     */
    @Transactional
    public void deleteNotificationsByAppointment(Appointment appointment) {
        try {
            System.out.println("Deleting notifications for appointment ID: " + appointment.getId());
            
            // Find all notifications related to this appointment
            List<Notification> relatedNotifications = notificationRepository.findByRelatedAppointment(appointment);
            
            System.out.println("Found " + relatedNotifications.size() + " notifications to delete");
            
            // Delete all related notifications
            if (!relatedNotifications.isEmpty()) {
                notificationRepository.deleteAll(relatedNotifications);
                
                // Clear cache for affected users
                for (Notification notification : relatedNotifications) {
                    Long userId = notification.getUser().getId();
                    unreadCountCache.remove(userId);
                    cacheTimestamps.remove(userId);
                }
            }
            
            System.out.println("Successfully deleted notifications for appointment ID: " + appointment.getId());
        } catch (Exception e) {
            System.out.println("Error deleting notifications for appointment: " + e.getMessage());
            e.printStackTrace();
            // Don't throw exception - notification deletion shouldn't prevent appointment deletion
        }
    }

    /**
     * Count unread notifications for a specific user (for testing)
     */
    public Long countUnreadNotificationsForUser(Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

            System.out.println("Counting unread notifications for user ID: " + userId +
                              ", Email: " + user.getEmail() +
                              ", Role: " + user.getRole());

            Long count = notificationRepository.countUnreadNotifications(user);
            System.out.println("Found " + count + " unread notifications for user ID: " + userId);

            // List all notifications for this user
            List<Notification> allNotifications = notificationRepository.findByUser(user);
            System.out.println("Total notifications for user ID " + userId + ": " + allNotifications.size());
            for (Notification notification : allNotifications) {
                System.out.println("Notification ID: " + notification.getId() +
                                  ", Title: " + notification.getTitle() +
                                  ", IsRead: " + notification.getIsRead() +
                                  ", Type: " + notification.getType());
            }

            return count;
        } catch (Exception e) {
            System.out.println("Error in countUnreadNotificationsForUser: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Get the current authenticated user
     */
    private User getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null) {
                System.out.println("No authentication found in SecurityContext");
                throw new EntityNotFoundException("No authenticated user found");
            }

            System.out.println("Getting current user with email: " + authentication.getName());
            // Print authorities in a safe way that doesn't cause serialization issues
            System.out.println("Authentication authorities: " +
                authentication.getAuthorities().stream()
                    .map(auth -> auth.getAuthority())
                    .collect(java.util.stream.Collectors.joining(", ")));

            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + authentication.getName()));

            System.out.println("Found user: " + user.getEmail() + " with role: " + user.getRole());
            return user;
        } catch (Exception e) {
            System.out.println("Error in getCurrentUser: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
