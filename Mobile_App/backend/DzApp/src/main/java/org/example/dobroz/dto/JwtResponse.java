package org.example.dobroz.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.http.ResponseCookie;

public class JwtResponse {
    private String type = "Bearer";
    private String accessToken; // ✅ store token
    private Long id;
    private String username;
    private String email;

    @JsonIgnore
    private ResponseCookie cookie;

    public JwtResponse(String accessToken, Long id, String username, String email, ResponseCookie cookie) {
        this.accessToken = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.cookie = cookie;
    }

    public String getType() {
        return type;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String token) {
        this.accessToken = token;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    @JsonIgnore
    public ResponseCookie getCookie() {
        return cookie;
    }

    public void setCookie(ResponseCookie cookie) {
        this.cookie = cookie;
    }
}
