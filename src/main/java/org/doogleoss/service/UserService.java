package org.doogleoss.service;

import io.smallrye.mutiny.Uni;
import java.time.LocalDateTime;
import org.doogleoss.dto.LoginRequest;
import org.doogleoss.dto.UserRegistrationRequest;
import org.doogleoss.dto.UserResponse;
import org.doogleoss.entity.LuxeUser;
import org.doogleoss.repository.UserRepository;

public class UserService {

  private final UserRepository userRepository;

  public UserService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  /** Registers a user, enforcing unique username/email and hashing password when provided. */
  public Uni<UserResponse> registerUser(UserRegistrationRequest request) {
    return userRepository
        .existsByUsername(request.username)
        .flatMap(
            usernameExists -> {
              if (usernameExists) {
                return Uni.createFrom().failure(new IllegalArgumentException("Username already exists"));
              }
              return userRepository.existsByEmail(request.email);
            })
        .flatMap(
            emailExists -> {
              if (emailExists) {
                return Uni.createFrom().failure(new IllegalArgumentException("Email already exists"));
              }
              LuxeUser toSave =
                  request.password != null && !request.password.isEmpty()
                      ? LuxeUser.create(
                          request.username,
                          request.firstName,
                          request.lastName,
                          request.email,
                          request.password)
                      : LuxeUser.createWithoutPassword(
                          request.username, request.firstName, request.lastName, request.email);
              return userRepository.create(toSave).map(this::toUserResponse);
            });
  }

  public Uni<UserResponse> loginUser(LoginRequest request) {
    return userRepository
        .findByUsername(request.username)
        .flatMap(
            user -> {
              if (user == null || !user.validatePassword(request.password)) {
                return Uni.createFrom().failure(new IllegalArgumentException("Invalid username or password"));
              }
              return Uni.createFrom().item(toUserResponse(user));
            });
  }

  public Uni<UserResponse> getUserByUsername(String username) {
    return userRepository
        .findByUsername(username)
        .flatMap(
            user -> {
              if (user == null) {
                return Uni.createFrom().failure(new IllegalArgumentException("User not found"));
              }
              return Uni.createFrom().item(toUserResponse(user));
            });
  }

  public Uni<UserResponse> getUserById(Long id) {
    return userRepository
        .findById(id)
        .flatMap(
            user -> {
              if (user == null) {
                return Uni.createFrom().failure(new IllegalArgumentException("User not found"));
              }
              return Uni.createFrom().item(toUserResponse(user));
            });
  }

  public Uni<UserResponse> updateUser(Long id, UserRegistrationRequest request) {
    return userRepository
        .findById(id)
        .flatMap(
            existing -> {
              if (existing == null) {
                return Uni.createFrom().failure(new IllegalArgumentException("User not found"));
              }
              LuxeUser updated =
                  request.password != null && !request.password.isEmpty()
                      ? existing.withPassword(request.password)
                      : existing;
              updated =
                  new LuxeUser(
                      updated.id(),
                      updated.username(),
                      request.firstName != null ? request.firstName : updated.firstName(),
                      request.lastName != null ? request.lastName : updated.lastName(),
                      request.email != null ? request.email : updated.email(),
                      updated.password(),
                      updated.createdAt(),
                      LocalDateTime.now());
              return userRepository.update(updated).map(this::toUserResponse);
            });
  }

  private UserResponse toUserResponse(LuxeUser user) {
    return new UserResponse(
        user.id(), user.username(), user.firstName(), user.lastName(), user.email(), user.createdAt());
  }
}
