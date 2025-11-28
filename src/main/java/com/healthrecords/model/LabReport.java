package com.healthrecords.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "lab_reports")
@EntityListeners(AuditingEntityListener.class)
public class LabReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "medical_record_id", nullable = true)
    @JsonBackReference
    private MedicalRecord medicalRecord;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @NotBlank(message = "Test name is required")
    @Size(max = 100, message = "Test name must be less than 100 characters")
    @Column(nullable = false)
    private String testName;

    @Column(columnDefinition = "TEXT")
    private String testResults;

    private String fileUrl;
    private String fileName;
    private String fileType;
    private Long fileSize;

    @NotNull(message = "Test date is required")
    private LocalDateTime testDate;

    @NotNull(message = "Report date is required")
    private LocalDateTime reportDate;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}