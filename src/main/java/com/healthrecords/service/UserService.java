package com.healthrecords.service;

import com.healthrecords.model.User;
import com.healthrecords.model.UserRole;
import com.healthrecords.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        try {
            System.out.println("UserService: Getting all users");
            List<User> users = userRepository.findAll();
            System.out.println("UserService: Found " + users.size() + " users");
            return users;
        } catch (Exception e) {
            System.out.println("UserService: Error getting all users: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Get all doctors - accessible to all authenticated users
     */
    public List<User> getAllDoctors() {
        System.out.println("UserService: Getting all doctors");
        List<User> doctors = userRepository.findByRole(UserRole.ROLE_DOCTOR);
        System.out.println("UserService: Found " + doctors.size() + " doctors");
        return doctors;
    }

    /**
     * Get all patients - accessible to admins and doctors
     */
    public List<User> getAllPatients() {
        System.out.println("UserService: Getting all patients");
        List<User> patients = userRepository.findByRole(UserRole.ROLE_PATIENT);
        System.out.println("UserService: Found " + patients.size() + " patients");
        return patients;
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    @Transactional
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);

        // Don't allow email change if it's already in use
        if (!user.getEmail().equals(userDetails.getEmail()) &&
            userRepository.existsByEmail(userDetails.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setEmail(userDetails.getEmail());
        user.setRole(userDetails.getRole());
        user.setPhoneNumber(userDetails.getPhoneNumber());
        user.setAddress(userDetails.getAddress());
        user.setSpecialization(userDetails.getSpecialization());

        // Only update password if a new one is provided
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }
}