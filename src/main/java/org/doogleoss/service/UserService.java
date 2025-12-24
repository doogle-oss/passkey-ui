package org.doogleoss.service;

import java.time.LocalDateTime;

import org.doogleoss.dto.LoginRequest;
import org.doogleoss.dto.UserRegistrationRequest;
import org.doogleoss.dto.UserResponse;
import org.doogleoss.entity.LuxeUser;
import org.doogleoss.repository.UserRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class UserService {
    
    @Inject
    UserRepository userRepository;
    
    @Transactional
    public UserResponse registerUser(UserRegistrationRequest request) {
        // Check if user already exists
        if (userRepository.existsByUsername(request.username)) {
            throw new IllegalArgumentException("Username already exists");
        }
        
        if (userRepository.existsByEmail(request.email)) {
            throw new IllegalArgumentException("Email already exists");
        }
        
        // Create and persist new user
        LuxeUser user = new LuxeUser(
            request.username,
            request.firstName,
            request.lastName,
            request.email
        );
        
        // Set password if provided (optional for passkey-only users)
        if (request.password != null && !request.password.isEmpty()) {
            user.setPassword(request.password);
        }
        
        userRepository.persist(user);
        return toUserResponse(user);
    }
    
    public UserResponse loginUser(LoginRequest request) {
        LuxeUser user = userRepository.findByUsername(request.username);
        
        if (user == null) {
            throw new IllegalArgumentException("Invalid username or password");
        }
        
        // Validate password
        if (!user.validatePassword(request.password)) {
            throw new IllegalArgumentException("Invalid username or password");
        }
        
        return toUserResponse(user);
    }
    
    public UserResponse getUserByUsername(String username) {
        LuxeUser user = userRepository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }
        return toUserResponse(user);
    }
    
    public UserResponse getUserById(Long id) {
        LuxeUser user = userRepository.findById(id);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }
        return toUserResponse(user);
    }
    
    @Transactional
    public UserResponse updateUser(Long id, UserRegistrationRequest request) {
        LuxeUser user = userRepository.findById(id);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }
        
        user.firstName = request.firstName;
        user.lastName = request.lastName;
        user.updatedAt = LocalDateTime.now();
        
        // Update password if provided
        if (request.password != null && !request.password.isEmpty()) {
            user.setPassword(request.password);
        }
        
        userRepository.persist(user);
        return toUserResponse(user);
    }
    
    public UserResponse toUserResponse(LuxeUser user) {
        return new UserResponse(
            user.id,
            user.username,
            user.firstName,
            user.lastName,
            user.email,
            user.createdAt
        );
    }
}
