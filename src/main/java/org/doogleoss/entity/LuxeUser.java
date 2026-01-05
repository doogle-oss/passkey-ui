package org.doogleoss.entity;

import java.time.LocalDateTime;
import com.password4j.Argon2Function;
import com.password4j.Hash;
import com.password4j.Password;
import com.password4j.types.Argon2;

/**
 * LuxeUser record for use with Vert.x
 * Immutable data structure representing a user in the luxe_user table
 * Uses Password4j with Argon2id for secure password hashing
 */
public record LuxeUser(
    Long id,
    String username,
    String firstName,
    String lastName,
    String email,
    String password,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {

    // Argon2id configuration - OWASP recommended parameters
    private static final Argon2Function ARGON2_FUNCTION = Argon2Function.getInstance(
        65536,      // Memory cost: 64 MB
        3,          // Iterations
        4,          // Parallelism
        32,         // Hash length in bytes
        Argon2.ID   // Argon2id variant (hybrid of Argon2i and Argon2d)
    );

    /**
     * Create a new user without ID (for insertion)
     */
    public static LuxeUser create(String username, String firstName, String lastName, String email, String plainPassword) {
        return new LuxeUser(
            null,
            username,
            firstName,
            lastName,
            email,
            hashPassword(plainPassword),
            LocalDateTime.now(),
            LocalDateTime.now()
        );
    }

    /**
     * Create a new user without password (for passkey-only authentication)
     */
    public static LuxeUser createWithoutPassword(String username, String firstName, String lastName, String email) {
        return new LuxeUser(
            null,
            username,
            firstName,
            lastName,
            email,
            null,
            LocalDateTime.now(),
            LocalDateTime.now()
        );
    }

    /**
     * Get full name
     */
    public String getFullName() {
        return firstName + " " + lastName;
    }

    /**
     * Hash a plain text password using Password4j with Argon2id
     *
     * @param plainPassword the plain text password to hash
     * @return the Argon2id hashed password string
     */
    public static String hashPassword(String plainPassword) {
        if (plainPassword == null || plainPassword.isEmpty()) {
            return null;
        }
        Hash hash = Password.hash(plainPassword).with(ARGON2_FUNCTION);
        return hash.getResult();
    }

    /**
     * Validate a plain text password against the hashed password using Password4j
     *
     * @param plainPassword the plain text password to validate
     * @return true if password matches, false otherwise
     */
    public boolean validatePassword(String plainPassword) {
        if (plainPassword == null || plainPassword.isEmpty() || password == null) {
            return false;
        }
        try {
            return Password.check(plainPassword, password).with(ARGON2_FUNCTION);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Create a copy with updated timestamp
     */
    public LuxeUser withUpdatedTimestamp() {
        return new LuxeUser(id, username, firstName, lastName, email, password, createdAt, LocalDateTime.now());
    }

    /**
     * Create a copy with a new password
     */
    public LuxeUser withPassword(String plainPassword) {
        return new LuxeUser(id, username, firstName, lastName, email, hashPassword(plainPassword), createdAt, LocalDateTime.now());
    }
}
