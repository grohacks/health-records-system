package com.healthrecords.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * Configuration for open endpoints
 * This configuration allows CORS for open endpoints
 * DISABLED: Using WebConfig CORS instead to avoid conflicts
 */
@Configuration
public class OpenEndpointConfig {

    /**
     * CORS filter for open endpoints - DISABLED
     */
    // @Bean
    public CorsFilter openEndpointCorsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Use allowedOriginPatterns instead of allowedOrigin to support wildcards
        config.addAllowedOriginPattern("http://localhost:*");
        config.addAllowedOriginPattern("https://*.vercel.app");
        config.addAllowedOriginPattern("https://*.netlify.app");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setAllowCredentials(false); // Disable credentials for open endpoints
        
        // Apply this configuration to open endpoints
        source.registerCorsConfiguration("/api/open/**", config);
        
        return new CorsFilter(source);
    }
}
