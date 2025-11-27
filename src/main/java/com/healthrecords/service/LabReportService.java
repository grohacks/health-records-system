package com.healthrecords.service;

import com.healthrecords.dto.LabReportDTO;
import com.healthrecords.model.LabReport;
import com.healthrecords.model.MedicalRecord;
import com.healthrecords.model.User;
import com.healthrecords.repository.LabReportRepository;
import com.healthrecords.repository.MedicalRecordRepository;
import com.healthrecords.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LabReportService {

    private final LabReportRepository labReportRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public List<LabReportDTO> getAllLabReports() {
        return labReportRepository.findAll().stream()
                .map(LabReportDTO::fromLabReport)
                .collect(Collectors.toList());
    }

    public List<LabReportDTO> getLabReportsByPatient(Long patientId) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + patientId));

        return labReportRepository.findByPatient(patient).stream()
                .map(LabReportDTO::fromLabReport)
                .collect(Collectors.toList());
    }

    public List<LabReportDTO> getLabReportsByDoctor(Long doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with id: " + doctorId));

        return labReportRepository.findByDoctor(doctor).stream()
                .map(LabReportDTO::fromLabReport)
                .collect(Collectors.toList());
    }

    public LabReportDTO getLabReportById(Long id) {
        LabReport labReport = labReportRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Lab report not found with id: " + id));
        return LabReportDTO.fromLabReport(labReport);
    }

    @Transactional
    public LabReportDTO createLabReport(LabReportDTO labReportDTO, MultipartFile file) {
        try {
            // Validate and store file if provided
            String fileUrl = null;
            if (file != null && !file.isEmpty()) {
                fileUrl = fileStorageService.storeFile(file);
            }

            // Create lab report entity
            LabReport labReport = new LabReport();

            // Set patient
            if (labReportDTO.getPatient() != null && labReportDTO.getPatient().getId() != null) {
                User patient = userRepository.findById(labReportDTO.getPatient().getId())
                        .orElseThrow(() -> new EntityNotFoundException("Patient not found"));
                labReport.setPatient(patient);
            } else {
                throw new IllegalArgumentException("Patient is required");
            }

            // Set doctor
            if (labReportDTO.getDoctor() != null && labReportDTO.getDoctor().getId() != null) {
                User doctor = userRepository.findById(labReportDTO.getDoctor().getId())
                        .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));
                labReport.setDoctor(doctor);
            } else {
                throw new IllegalArgumentException("Doctor is required");
            }

            // Set medical record if provided, otherwise explicitly set to null
            if (labReportDTO.getMedicalRecordId() != null) {
                MedicalRecord medicalRecord = medicalRecordRepository.findById(labReportDTO.getMedicalRecordId())
                        .orElseThrow(() -> new EntityNotFoundException("Medical record not found"));
                labReport.setMedicalRecord(medicalRecord);
            } else {
                // Explicitly set to null to avoid any default behavior
                labReport.setMedicalRecord(null);
            }

            // Set other fields
            labReport.setTestName(labReportDTO.getTestName());
            labReport.setTestResults(labReportDTO.getTestResults());
            labReport.setTestDate(labReportDTO.getTestDate());
            labReport.setReportDate(labReportDTO.getReportDate() != null ?
                    labReportDTO.getReportDate() : LocalDateTime.now());

            // Set file information if file was uploaded
            if (fileUrl != null) {
                labReport.setFileUrl(fileUrl);
                labReport.setFileName(file.getOriginalFilename());
                labReport.setFileType(file.getContentType());
                labReport.setFileSize(file.getSize());
            }

            // Save lab report
            LabReport savedReport = labReportRepository.save(labReport);
            return LabReportDTO.fromLabReport(savedReport);

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    @Transactional
    public LabReportDTO updateLabReport(Long id, LabReportDTO labReportDTO, MultipartFile file) {
        LabReport existingReport = labReportRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Lab report not found with id: " + id));

        try {
            // Handle file update if provided
            if (file != null && !file.isEmpty()) {
                // Delete old file if exists
                if (existingReport.getFileUrl() != null) {
                    fileStorageService.deleteFile(existingReport.getFileUrl());
                }

                // Store new file
                String fileUrl = fileStorageService.storeFile(file);
                existingReport.setFileUrl(fileUrl);
                existingReport.setFileName(file.getOriginalFilename());
                existingReport.setFileType(file.getContentType());
                existingReport.setFileSize(file.getSize());
            }

            // Update patient if provided
            if (labReportDTO.getPatient() != null && labReportDTO.getPatient().getId() != null) {
                User patient = userRepository.findById(labReportDTO.getPatient().getId())
                        .orElseThrow(() -> new EntityNotFoundException("Patient not found"));
                existingReport.setPatient(patient);
            }

            // Update doctor if provided
            if (labReportDTO.getDoctor() != null && labReportDTO.getDoctor().getId() != null) {
                User doctor = userRepository.findById(labReportDTO.getDoctor().getId())
                        .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));
                existingReport.setDoctor(doctor);
            }

            // Update medical record if provided
            if (labReportDTO.getMedicalRecordId() != null) {
                MedicalRecord medicalRecord = medicalRecordRepository.findById(labReportDTO.getMedicalRecordId())
                        .orElseThrow(() -> new EntityNotFoundException("Medical record not found"));
                existingReport.setMedicalRecord(medicalRecord);
            }

            // Update other fields if provided
            if (labReportDTO.getTestName() != null) {
                existingReport.setTestName(labReportDTO.getTestName());
            }

            if (labReportDTO.getTestResults() != null) {
                existingReport.setTestResults(labReportDTO.getTestResults());
            }

            if (labReportDTO.getTestDate() != null) {
                existingReport.setTestDate(labReportDTO.getTestDate());
            }

            if (labReportDTO.getReportDate() != null) {
                existingReport.setReportDate(labReportDTO.getReportDate());
            }

            // Save updated report
            LabReport updatedReport = labReportRepository.save(existingReport);
            return LabReportDTO.fromLabReport(updatedReport);

        } catch (IOException e) {
            throw new RuntimeException("Failed to update file", e);
        }
    }

    public ResponseEntity<byte[]> downloadLabReport(Long id) {
    LabReport labReport = labReportRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Lab report not found with id: " + id));

    if (labReport.getFileUrl() == null || labReport.getFileName() == null || labReport.getFileType() == null) {
        // Log error for missing file info
        System.err.println("[LabReportService] No file associated with lab report id: " + id);
        return ResponseEntity.status(404)
            .header("Content-Type", "application/json")
            .body(("{\"error\":\"No file associated with this lab report\"}").getBytes());
    }

    try {
        return fileStorageService.createFileResponse(
            labReport.getFileUrl(),
            labReport.getFileName(),
            labReport.getFileType()
        );
    } catch (IOException e) {
        // Log error for missing/unreadable file
        System.err.println("[LabReportService] Failed to download file for lab report id: " + id);
        e.printStackTrace();
        return ResponseEntity.status(500)
            .header("Content-Type", "application/json")
            .body(("{\"error\":\"Failed to download file: " + e.getMessage() + "\"}").getBytes());
    }
    }

    @Transactional
    public void deleteLabReport(Long id) {
        LabReport labReport = labReportRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Lab report not found with id: " + id));

        // Delete file from disk if exists
        if (labReport.getFileUrl() != null) {
            try {
                fileStorageService.deleteFile(labReport.getFileUrl());
            } catch (IOException e) {
                // Log error but continue with deletion
                System.err.println("Failed to delete file: " + e.getMessage());
            }
        }

        labReportRepository.deleteById(id);
    }
}
