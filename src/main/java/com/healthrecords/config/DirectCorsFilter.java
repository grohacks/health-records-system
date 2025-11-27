package com.healthrecords.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * CORS filter for direct endpoints
 * This filter adds CORS headers to all responses from direct endpoints
 * DISABLED: Using WebConfig CORS instead
 */
// @Component
// @Order(Ordered.HIGHEST_PRECEDENCE)
public class DirectCorsFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        // Check if this is a direct endpoint
        if (request.getRequestURI().startsWith("/direct") || request.getRequestURI().startsWith("/direct-appointment")) {
            System.out.println("DirectCorsFilter: Processing request for " + request.getRequestURI());

            // Add CORS headers
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            response.setHeader("Access-Control-Allow-Headers", "*");
            response.setHeader("Access-Control-Max-Age", "3600");

            // Handle preflight requests
            if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
                response.setStatus(HttpServletResponse.SC_OK);
                return;
            }
        }

        chain.doFilter(req, res);
    }

    @Override
    public void init(FilterConfig filterConfig) {
        System.out.println("DirectCorsFilter initialized");
    }

    @Override
    public void destroy() {
        System.out.println("DirectCorsFilter destroyed");
    }
}
