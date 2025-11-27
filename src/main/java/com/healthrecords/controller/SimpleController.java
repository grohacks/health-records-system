package com.healthrecords.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Simple controller for testing
 * This controller has no security or validation
 */
@RestController
public class SimpleController {

    /**
     * Simple test endpoint
     */
    @GetMapping("/simple/test")
    @CrossOrigin(originPatterns = {"http://localhost:*"}, allowCredentials = "false")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(Map.of(
            "message", "Simple test endpoint is working",
            "timestamp", LocalDateTime.now().toString(),
            "status", "success"
        ));
    }
    
    /**
     * Simple echo endpoint
     */
    @PostMapping("/simple/echo")
    @CrossOrigin(originPatterns = {"http://localhost:*"}, allowCredentials = "false")
    public ResponseEntity<?> echo(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(Map.of(
            "message", "Echo endpoint is working",
            "received", request,
            "timestamp", LocalDateTime.now().toString(),
            "status", "success"
        ));
    }
}
