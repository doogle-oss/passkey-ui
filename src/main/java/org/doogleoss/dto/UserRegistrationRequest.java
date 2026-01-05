package org.doogleoss.dto;


public class UserRegistrationRequest {
  public String username;

  public String firstName;

  public String lastName;

  public String email;

  public String password;

  public UserRegistrationRequest() {}

  public UserRegistrationRequest(String username, String firstName, String lastName, String email) {
    this.username = username;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
  }

  public UserRegistrationRequest(
      String username, String firstName, String lastName, String email, String password) {
    this(username, firstName, lastName, email);
    this.password = password;
  }
}
