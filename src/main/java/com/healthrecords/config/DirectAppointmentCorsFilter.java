package com.healthrecords.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * CORS filter specifically for the direct-appointment endpoint
 * This filter adds CORS headers to all responses from the direct-appointment endpoint
 * DISABLED: Using WebConfig CORS instead
 */
// @Component
// @Order(Ordered.HIGHEST_PRECEDENCE)
public class DirectAppointmentCorsFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;
        
        // Check if this is the direct-appointment endpoint
        if (request.getRequestURI().startsWith("/direct-appointment")) {
            System.out.println("DirectAppointmentCorsFilter: Processing request for " + request.getRequestURI());
            
            // Add CORS headers
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            response.setHeader("Access-Control-Allow-Headers", "*");
            response.setHeader("Access-Control-Max-Age", "3600");
            
            // Handle preflight requests
            if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
                response.setStatus(HttpServletResponse.SC_OK);
                System.out.println("DirectAppointmentCorsFilter: Handled OPTIONS request with 200 OK");
                return;
            }
            
            System.out.println("DirectAppointmentCorsFilter: Added CORS headers to response");
        }
        
        chain.doFilter(req, res);
    }

    @Override
    public void init(FilterConfig filterConfig) {
        System.out.println("DirectAppointmentCorsFilter initialized");
    }

    @Override
    public void destroy() {
        System.out.println("DirectAppointmentCorsFilter destroyed");
    }
}
