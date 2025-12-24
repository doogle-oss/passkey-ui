package org.doogleoss.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UserResponse {
    @JsonProperty("id")
    public Long id;
    
    @JsonProperty("username")
    public String username;
    
    @JsonProperty("firstName")
    public String firstName;
    
    @JsonProperty("lastName")
    public String lastName;
    
    @JsonProperty("email")
    public String email;
    
    @JsonProperty("createdAt")
    public LocalDateTime createdAt;
    
    public UserResponse() {}
    
    public UserResponse(Long id, String username, String firstName, String lastName, String email, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.createdAt = createdAt;
    }
    
    public String getFullName() {
        return firstName + " " + lastName;
    }
}
