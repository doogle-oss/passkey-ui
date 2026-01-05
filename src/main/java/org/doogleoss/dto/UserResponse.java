package org.doogleoss.dto;

import java.time.LocalDateTime;

public class UserResponse {
  public Long id;

  public String username;

  public String firstName;

  public String lastName;

  public String email;

  public LocalDateTime createdAt;

  public UserResponse() {}

  public UserResponse(
      Long id,
      String username,
      String firstName,
      String lastName,
      String email,
      LocalDateTime createdAt) {
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
