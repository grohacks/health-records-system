package com.healthrecords.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Skip filter for auth and public endpoints
        boolean shouldSkip = path.startsWith("/api/auth/") ||
                            path.startsWith("/api/public/") ||
                            path.startsWith("/api/open/") ||
                            path.startsWith("/api/test/") ||
                            path.startsWith("/simple/") ||
                            path.startsWith("/direct/") ||
                            path.startsWith("/direct-appointment") ||
                            path.startsWith("/public-test/") ||
                            path.startsWith("/no-security/") ||
                            path.equals("/api/appointments/simple");

        // Log the path and whether it should be skipped
        System.out.println("JwtAuthenticationFilter: Path: " + path + ", Skip: " + shouldSkip);

        // Skip filter for OPTIONS requests (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(method)) {
            shouldSkip = true;
        }

        // Log the decision for all requests to help with debugging
        System.out.println("==== JWT Filter Decision ====");
        System.out.println("Request method: " + method);
        System.out.println("Request path: " + path);
        System.out.println("Skip JWT filter: " + shouldSkip);

        return shouldSkip;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            jwt = authHeader.substring(7);
            userEmail = jwtService.extractUsername(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                try {
                    System.out.println("==== JWT Authentication Filter ====");
                    System.out.println("Processing request for path: " + request.getRequestURI());
                    System.out.println("Checking token validity for user: " + userDetails.getUsername());

                    boolean isValid = jwtService.isTokenValid(jwt, userDetails);
                    System.out.println("Token validity result: " + isValid);

                    if (isValid) {
                        // Create authentication token with user details and authorities
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                        authToken.setDetails(
                                new WebAuthenticationDetailsSource().buildDetails(request)
                        );

                        // Set authentication in security context
                        SecurityContextHolder.getContext().setAuthentication(authToken);

                        // Log successful authentication
                        System.out.println("Successfully authenticated user: " + userDetails.getUsername() +
                                          " with roles: " + userDetails.getAuthorities());
                        System.out.println("Authentication set in SecurityContext");
                    } else {
                        // Log validation failure
                        System.out.println("Token validation failed for user: " + userDetails.getUsername());
                        handleError(response, "Invalid token or insufficient permissions");
                        return;
                    }
                } catch (Exception e) {
                    System.out.println("Exception during token validation: " + e.getMessage());
                    e.printStackTrace();
                    handleError(response, "Error validating token: " + e.getMessage());
                    return;
                }
            }
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            handleError(response, e.getMessage());
        }
    }

    private void handleError(HttpServletResponse response, String message) throws IOException {
        // We can't access the request here, so we'll skip the request logging
        // Log the error for debugging
        System.out.println("==== Authentication Error ====");
        System.out.println("Error message: " + message);

        // Log the current authentication context
        org.springframework.security.core.Authentication auth =
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();

        if (auth != null) {
            System.out.println("Current authentication: " + auth.getName());
            System.out.println("Current authorities: " + auth.getAuthorities());
        } else {
            System.out.println("No authentication in SecurityContext");
        }

        // We can't access the request here directly

        // Set CORS headers to ensure the error response can be read by the frontend
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With");
        response.setHeader("Access-Control-Allow-Credentials", "true");

        // Set response status and write error message
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"message\":\"" + message + "\", \"status\":\"error\", \"code\":403}");

        System.out.println("Sent 403 Forbidden response with message: " + message);
    }
}