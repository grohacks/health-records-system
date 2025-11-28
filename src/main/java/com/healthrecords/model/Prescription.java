package com.healthrecords.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "prescriptions")
@EntityListeners(AuditingEntityListener.class)
public class Prescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "medical_record_id", nullable = false)
    @JsonBackReference
    private MedicalRecord medicalRecord;

    @NotBlank
    @Column(nullable = false)
    private String medicationName;

    @Column(columnDefinition = "TEXT")
    private String dosage;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}