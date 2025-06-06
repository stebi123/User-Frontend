package org.example.dobroz.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    // CORS configuration has been moved to SecurityConfig
    // to avoid conflicts between Spring Security and Spring MVC
}