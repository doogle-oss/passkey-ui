package org.doogleoss.entity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;

/**
 * Test class for LuxeUser Password4j Argon2 password hashing
 */
class LuxeUserTest {

    @Test
    void testPasswordHashingAndValidation() {
        // Create a user with a password
        String plainPassword = "MySecurePassword123!";
        LuxeUser user = LuxeUser.create(
            "testuser",
            "Test",
            "User",
            "test@example.com",
            plainPassword
        );

        // Verify password was hashed
        assertNotNull(user.password());
        assertNotEquals(plainPassword, user.password());
        assertTrue(user.password().startsWith("$argon2id$"));

        // Verify correct password validates
        assertTrue(user.validatePassword(plainPassword));

        // Verify incorrect password fails
        assertFalse(user.validatePassword("WrongPassword"));
        assertFalse(user.validatePassword(""));
        assertFalse(user.validatePassword(null));
    }

    @Test
    void testHashPasswordFormat() {
        String password = "testPassword123";
        String hash = LuxeUser.hashPassword(password);

        assertNotNull(hash);

        // Check Argon2id format starts with $argon2id$
        assertTrue(hash.startsWith("$argon2id$"));

        // Hash should contain multiple parts separated by $
        String[] parts = hash.split("\\$");
        assertTrue(parts.length >= 5);
    }

    @Test
    void testSamePasswordDifferentHashes() {
        String password = "samePassword";
        String hash1 = LuxeUser.hashPassword(password);
        String hash2 = LuxeUser.hashPassword(password);

        // Hashes should be different due to different salts
        assertNotEquals(hash1, hash2);

        // But both should validate correctly
        LuxeUser user1 = new LuxeUser(1L, "user1", "First", "Last",
            "email1@test.com", hash1, LocalDateTime.now(), LocalDateTime.now());
        LuxeUser user2 = new LuxeUser(2L, "user2", "First", "Last",
            "email2@test.com", hash2, LocalDateTime.now(), LocalDateTime.now());

        assertTrue(user1.validatePassword(password));
        assertTrue(user2.validatePassword(password));
    }

    @Test
    void testCreateWithoutPassword() {
        LuxeUser user = LuxeUser.createWithoutPassword(
            "passkeyuser",
            "Passkey",
            "User",
            "passkey@example.com"
        );

        assertNull(user.password());
        assertFalse(user.validatePassword("anyPassword"));
    }

    @Test
    void testNullPasswordHashing() {
        String hash = LuxeUser.hashPassword(null);
        assertNull(hash);

        hash = LuxeUser.hashPassword("");
        assertNull(hash);
    }

    @Test
    void testWithPasswordMethod() {
        String originalPassword = "original123";
        String newPassword = "newPassword456";

        LuxeUser user = LuxeUser.create(
            "testuser",
            "Test",
            "User",
            "test@example.com",
            originalPassword
        );

        // Verify original password works
        assertTrue(user.validatePassword(originalPassword));
        assertFalse(user.validatePassword(newPassword));

        // Update password
        LuxeUser updatedUser = user.withPassword(newPassword);

        // Verify new password works
        assertTrue(updatedUser.validatePassword(newPassword));
        assertFalse(updatedUser.validatePassword(originalPassword));

        // Verify original user unchanged (immutable)
        assertTrue(user.validatePassword(originalPassword));
        assertFalse(user.validatePassword(newPassword));
    }

    @Test
    void testGetFullName() {
        LuxeUser user = LuxeUser.createWithoutPassword(
            "johndoe",
            "John",
            "Doe",
            "john@example.com"
        );

        assertEquals("John Doe", user.getFullName());
    }

    @Test
    void testInvalidHashFormat() {
        LuxeUser user = new LuxeUser(
            1L,
            "testuser",
            "Test",
            "User",
            "test@example.com",
            "invalid-hash-format",
            LocalDateTime.now(),
            LocalDateTime.now()
        );

        // Should return false for invalid hash format (no exception should escape)
        assertFalse(user.validatePassword("anyPassword"));
    }

    @Test
    void testWrongAlgorithm() {
        LuxeUser user = new LuxeUser(
            1L,
            "testuser",
            "Test",
            "User",
            "test@example.com",
            "$pbkdf2$sha512$10000$c2FsdA$aGFzaA",
            LocalDateTime.now(),
            LocalDateTime.now()
        );

        // Should return false for wrong algorithm (not Argon2) without throwing
        assertFalse(user.validatePassword("anyPassword"));
    }

    @Test
    void testTimestampMethods() {
        LuxeUser user = LuxeUser.create(
            "testuser",
            "Test",
            "User",
            "test@example.com",
            "password123"
        );

        LocalDateTime originalCreated = user.createdAt();
        LocalDateTime originalUpdated = user.updatedAt();

        // Wait a moment to ensure timestamp changes
        try {
            Thread.sleep(10);
        } catch (InterruptedException e) {
            // Ignore
        }

        LuxeUser updated = user.withUpdatedTimestamp();

        assertEquals(originalCreated, updated.createdAt());
        assertTrue(updated.updatedAt().isAfter(originalUpdated) ||
                   updated.updatedAt().isEqual(originalUpdated));
    }
}
