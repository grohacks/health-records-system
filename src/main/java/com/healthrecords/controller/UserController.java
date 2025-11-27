package com.healthrecords.controller;

import com.healthrecords.dto.UserDTO;
import com.healthrecords.model.User;
import com.healthrecords.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        System.out.println("==== Received request to get all users from UserController ====");
        try {
            List<User> users = userService.getAllUsers();
            System.out.println("Found " + users.size() + " users");

            // Convert to DTOs
            List<UserDTO> userDTOs = users.stream()
                .map(UserDTO::fromUser)
                .toList();

            return ResponseEntity.ok(userDTOs);
        } catch (Exception e) {
            System.out.println("Error in getAllUsers: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/doctors")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_PATIENT')")
    public ResponseEntity<List<UserDTO>> getAllDoctors() {
        System.out.println("==== Received request to get all doctors from UserController ====");

        try {
            // Log the authentication details
            org.springframework.security.core.Authentication auth =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();

            if (auth != null) {
                System.out.println("Authenticated user: " + auth.getName());
                // Print authorities in a safe way that doesn't cause serialization issues
                System.out.println("User authorities: " +
                    auth.getAuthorities().stream()
                        .map(authority -> authority.getAuthority())
                        .collect(java.util.stream.Collectors.joining(", ")));
                System.out.println("Is authenticated: " + auth.isAuthenticated());
            } else {
                System.out.println("No authentication found in SecurityContext");
            }

            List<User> doctors = userService.getAllDoctors();
            System.out.println("Found " + doctors.size() + " doctors");

            // Convert to DTOs
            List<UserDTO> doctorDTOs = doctors.stream()
                .map(UserDTO::fromUser)
                .toList();

            return ResponseEntity.ok(doctorDTOs);
        } catch (Exception e) {
            System.out.println("Error in getAllDoctors: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/patients")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_DOCTOR')")
    public ResponseEntity<List<UserDTO>> getAllPatients() {
        System.out.println("==== Received request to get all patients from UserController ====");

        try {
            // Log the authentication details
            org.springframework.security.core.Authentication auth =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();

            if (auth != null) {
                System.out.println("Authenticated user: " + auth.getName());
                System.out.println("User authorities: " +
                    auth.getAuthorities().stream()
                        .map(authority -> authority.getAuthority())
                        .collect(java.util.stream.Collectors.joining(", ")));
            }

            List<User> patients = userService.getAllPatients();
            System.out.println("Found " + patients.size() + " patients");

            // Convert to DTOs
            List<UserDTO> patientDTOs = patients.stream()
                .map(UserDTO::fromUser)
                .toList();

            return ResponseEntity.ok(patientDTOs);
        } catch (Exception e) {
            System.out.println("Error in getAllPatients: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        UserDTO userDTO = UserDTO.fromUser(user);
        return ResponseEntity.ok(userDTO);
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<UserDTO> createUser(@RequestBody User user) {
        User createdUser = userService.createUser(user);
        UserDTO userDTO = UserDTO.fromUser(createdUser);
        return ResponseEntity.ok(userDTO);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody User user) {
        User updatedUser = userService.updateUser(id, user);
        UserDTO userDTO = UserDTO.fromUser(updatedUser);
        return ResponseEntity.ok(userDTO);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
}