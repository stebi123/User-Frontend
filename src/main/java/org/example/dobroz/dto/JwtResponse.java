package org.example.dobroz.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.http.ResponseCookie;

// Updated to remove roles from response
public class JwtResponse {
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;

    // Removed roles field as it will be extracted from JWT token

    @JsonIgnore // This annotation prevents the cookie from being included in JSON responses
    private ResponseCookie cookie;

    public JwtResponse(Long id, String username, String email, ResponseCookie cookie) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.cookie = cookie;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @JsonIgnore
    public ResponseCookie getCookie() {
        return cookie;
    }

    public void setCookie(ResponseCookie cookie) {
        this.cookie = cookie;
    }
}