package com.healthrecords;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@EnableJpaAuditing
@EnableConfigurationProperties
@EnableMethodSecurity
public class HealthRecordsApplication {
    public static void main(String[] args) {
        SpringApplication.run(HealthRecordsApplication.class, args);
    }
}