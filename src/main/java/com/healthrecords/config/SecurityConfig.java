package com.healthrecords.config;

import com.healthrecords.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Enable CORS
            .cors(cors -> cors.configure(http))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll() // All public endpoints are accessible without authentication
                .requestMatchers("/api/appointments/simple").permitAll() // Allow access to the simple appointment creation endpoint
                .requestMatchers("/api/open/**").permitAll() // Allow access to all open endpoints
                .requestMatchers("/api/test/**").permitAll() // Allow access to test endpoints
                .requestMatchers("/simple/**").permitAll() // Allow access to simple endpoints
                .requestMatchers("/direct/**").permitAll() // Allow access to direct endpoints
                .requestMatchers("/direct-appointment/**").permitAll() // Allow access to direct appointment endpoints
                .requestMatchers("/public-test/**").permitAll() // Allow access to public test endpoints
                .requestMatchers("/no-security/**").permitAll() // Allow access to no security endpoints
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        System.out.println("Security configuration loaded with public endpoints accessible");
        System.out.println("Public endpoints: /api/auth/**, /api/public/**, /api/appointments/simple, /api/open/**, /api/test/**, /simple/**, /direct/**");
        System.out.println("CORS enabled in SecurityConfig");
        return http.build();
    }

    // CorsConfigurationSource bean removed as we're using a custom CorsFilter
}