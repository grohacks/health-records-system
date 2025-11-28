package com.healthrecords.dto;

import com.healthrecords.model.User;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class AuthenticationResponse {
    private String token;
    private User user;
} 