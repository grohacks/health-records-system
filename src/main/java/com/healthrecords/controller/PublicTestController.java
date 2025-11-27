package com.healthrecords.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Public test controller with no security
 */
@RestController
@RequestMapping("/public-test")
@CrossOrigin(originPatterns = {"http://localhost:*"}, allowCredentials = "false")
public class PublicTestController {

    /**
     * Test endpoint
     */
    @GetMapping("/ping")
    public ResponseEntity<?> ping() {
        System.out.println("==== Public Test Controller: Ping ====");
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Ping successful");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("status", "success");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Echo endpoint
     */
    @PostMapping("/echo")
    public ResponseEntity<?> echo(@RequestBody Map<String, Object> request) {
        System.out.println("==== Public Test Controller: Echo ====");
        System.out.println("Received request: " + request);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Echo successful");
        response.put("received", request);
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("status", "success");
        
        return ResponseEntity.ok(response);
    }
}
