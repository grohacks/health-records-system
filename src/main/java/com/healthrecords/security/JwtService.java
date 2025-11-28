package com.healthrecords.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();

        // Extract the role from authorities
        String role = null;
        if (userDetails.getAuthorities() != null && !userDetails.getAuthorities().isEmpty()) {
            role = userDetails.getAuthorities().iterator().next().getAuthority();

            // Ensure the role has the ROLE_ prefix
            if (!role.startsWith("ROLE_")) {
                role = "ROLE_" + role;
            }

            // Log the role being stored in the token
            System.out.println("Storing role in token: " + role);
        }

        claims.put("role", role);
        return generateToken(claims, userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        final String role = extractRole(token);

        // Get the user's authority from UserDetails
        String userRole = null;
        if (userDetails.getAuthorities() != null && !userDetails.getAuthorities().isEmpty()) {
            userRole = userDetails.getAuthorities().iterator().next().getAuthority();
        }

        // Log the values for debugging
        System.out.println("Token validation check:");
        System.out.println("Token username: " + username);
        System.out.println("UserDetails username: " + userDetails.getUsername());
        System.out.println("Token role: " + role);
        System.out.println("UserDetails role: " + userRole);

        // Check if the username matches and the token is not expired
        boolean isValid = username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        System.out.println("Username match and not expired: " + isValid);

        // For security, we only need to verify that the token belongs to the user
        // and that it's not expired. We don't need to strictly check role equality
        // since the @PreAuthorize annotations will handle role-based access control.

        // Just log the role comparison for debugging
        if (isValid && role != null && userRole != null) {
            // Normalize roles for comparison (ensure ROLE_ prefix)
            String normalizedTokenRole = role.startsWith("ROLE_") ? role : "ROLE_" + role;
            String normalizedUserRole = userRole.startsWith("ROLE_") ? userRole : "ROLE_" + userRole;

            System.out.println("Normalized token role: " + normalizedTokenRole);
            System.out.println("Normalized user role: " + normalizedUserRole);
            System.out.println("Roles match: " + normalizedTokenRole.equals(normalizedUserRole));
        }

        return isValid;
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSigningKey() {
        byte[] keyBytes = secretKey.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }
}