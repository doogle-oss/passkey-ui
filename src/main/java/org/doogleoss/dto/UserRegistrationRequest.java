package org.doogleoss.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UserRegistrationRequest {
    @JsonProperty("username")
    public String username;
    
    @JsonProperty("firstName")
    public String firstName;
    
    @JsonProperty("lastName")
    public String lastName;
    
    @JsonProperty("email")
    public String email;
    
    @JsonProperty("password")
    public String password;
    
    public UserRegistrationRequest() {}
    
    public UserRegistrationRequest(String username, String firstName, String lastName, String email) {
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
    }
    
    public UserRegistrationRequest(String username, String firstName, String lastName, String email, String password) {
        this(username, firstName, lastName, email);
        this.password = password;
    }
}
