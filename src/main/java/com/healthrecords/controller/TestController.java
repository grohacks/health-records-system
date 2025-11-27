package com.healthrecords.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for testing CORS and security
 */
@RestController
@RequestMapping("/api/test")
@CrossOrigin(originPatterns = {"http://localhost:*"}, allowCredentials = "false")
public class TestController {

    /**
     * Simple test endpoint
     */
    @GetMapping
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(Map.of(
            "message", "Test endpoint is working",
            "status", "success"
        ));
    }
    
    /**
     * Test POST endpoint
     */
    @PostMapping
    public ResponseEntity<?> testPost(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(Map.of(
            "message", "Test POST endpoint is working",
            "received", request,
            "status", "success"
        ));
    }
}
