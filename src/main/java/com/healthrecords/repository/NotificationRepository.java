package com.healthrecords.repository;

import com.healthrecords.model.Appointment;
import com.healthrecords.model.Notification;
import com.healthrecords.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByUser(User user);
    
    List<Notification> findByUserAndIsRead(User user, Boolean isRead);
    
    List<Notification> findByRelatedAppointment(Appointment appointment);
    
    @Query("SELECT n FROM Notification n WHERE n.user = ?1 ORDER BY n.createdAt DESC")
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user = ?1 AND n.isRead = false")
    Long countUnreadNotifications(User user);
}
