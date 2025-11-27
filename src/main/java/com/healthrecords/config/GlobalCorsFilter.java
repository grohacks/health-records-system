package com.healthrecords.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Global CORS filter to allow cross-origin requests
 * DISABLED: Conflicts with other CORS configurations
 */
// @Component
// @Order(Ordered.HIGHEST_PRECEDENCE)
public class GlobalCorsFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;
        
        // Log the request for debugging
        System.out.println("==== Global CORS Filter ====");
        System.out.println("Request method: " + request.getMethod());
        System.out.println("Request path: " + request.getRequestURI());
        
        // Add CORS headers to all responses
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "*");
        response.setHeader("Access-Control-Max-Age", "3600");
        
        // Handle preflight requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            System.out.println("Handled OPTIONS request with 200 OK");
            return;
        }
        
        // Continue with the filter chain
        chain.doFilter(req, res);
    }

    @Override
    public void init(FilterConfig filterConfig) {
        System.out.println("GlobalCorsFilter initialized");
    }

    @Override
    public void destroy() {
        System.out.println("GlobalCorsFilter destroyed");
    }
}
