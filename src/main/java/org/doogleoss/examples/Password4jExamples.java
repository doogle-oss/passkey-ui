package org.doogleoss.examples;

import org.doogleoss.entity.LuxeUser;
import com.password4j.Argon2Function;
import com.password4j.Password;
import com.password4j.types.Argon2;

/**
 * Practical examples of using Password4j with Argon2 in LuxeUser
 */
public class Password4jExamples {

    public static void main(String[] args) {
        System.out.println("=== Password4j with Argon2 Examples ===\n");

        example1_BasicUsage();
        example2_PasswordValidation();
        example3_DifferentSecurityLevels();
        example4_PerformanceBenchmark();
        example5_HashInspection();
    }

    /**
     * Example 1: Basic user creation and password hashing
     */
    private static void example1_BasicUsage() {
        System.out.println("--- Example 1: Basic Usage ---");

        LuxeUser user = LuxeUser.create(
            "johndoe",
            "John",
            "Doe",
            "john@example.com",
            "mySecurePassword123!"
        );

        System.out.println("Username: " + user.username());
        System.out.println("Email: " + user.email());
        System.out.println("Hashed Password: " + user.password());
        System.out.println("Full Name: " + user.getFullName());
        System.out.println();
    }

    /**
     * Example 2: Password validation (login simulation)
     */
    private static void example2_PasswordValidation() {
        System.out.println("--- Example 2: Password Validation ---");

        LuxeUser user = LuxeUser.create(
            "janedoe",
            "Jane",
            "Doe",
            "jane@example.com",
            "correctPassword123"
        );

        // Correct password
        boolean validLogin = user.validatePassword("correctPassword123");
        System.out.println("Login with correct password: " + (validLogin ? "SUCCESS ✓" : "FAILED ✗"));

        // Wrong password
        boolean invalidLogin = user.validatePassword("wrongPassword");
        System.out.println("Login with wrong password: " + (invalidLogin ? "SUCCESS ✓" : "FAILED ✗"));

        // Edge cases
        System.out.println("Login with null password: " + (user.validatePassword(null) ? "SUCCESS ✓" : "FAILED ✗"));
        System.out.println("Login with empty password: " + (user.validatePassword("") ? "SUCCESS ✓" : "FAILED ✗"));
        System.out.println();
    }

    /**
     * Example 3: Different security levels
     */
    private static void example3_DifferentSecurityLevels() {
        System.out.println("--- Example 3: Different Security Levels ---");

        String password = "testPassword123";

        // Standard security (OWASP recommended - already in LuxeUser)
        Argon2Function standard = Argon2Function.getInstance(65536, 3, 4, 32, Argon2.ID);

        // High security (for sensitive data)
        Argon2Function highSecurity = Argon2Function.getInstance(131072, 5, 4, 64, Argon2.ID);

        // Fast (for testing/development only)
        Argon2Function fast = Argon2Function.getInstance(16384, 2, 1, 32, Argon2.ID);

        String standardHash = Password.hash(password).with(standard).getResult();
        String highSecHash = Password.hash(password).with(highSecurity).getResult();
        String fastHash = Password.hash(password).with(fast).getResult();

        System.out.println("Standard Security Hash: " + standardHash);
        System.out.println("High Security Hash: " + highSecHash);
        System.out.println("Fast Hash: " + fastHash);
        System.out.println();
    }

    /**
     * Example 4: Performance benchmarking
     */
    private static void example4_PerformanceBenchmark() {
        System.out.println("--- Example 4: Performance Benchmark ---");

        String password = "benchmarkPassword123";

        // Hash timing
        long startHash = System.currentTimeMillis();
        String hash = LuxeUser.hashPassword(password);
        long hashDuration = System.currentTimeMillis() - startHash;

        // Verify timing
        long startVerify = System.currentTimeMillis();
        LuxeUser tempUser = new LuxeUser(1L, "test", "Test", "User",
            "test@test.com", hash, null, null);
        boolean valid = tempUser.validatePassword(password);
        long verifyDuration = System.currentTimeMillis() - startVerify;

        System.out.println("Hash generation time: " + hashDuration + "ms");
        System.out.println("Verification time: " + verifyDuration + "ms");
        System.out.println("Verification result: " + (valid ? "PASS ✓" : "FAIL ✗"));
        System.out.println("Total authentication time: " + (hashDuration + verifyDuration) + "ms");

        // Recommended: 200-500ms is a good target
        if (hashDuration >= 200 && hashDuration <= 500) {
            System.out.println("✓ Hash time is within recommended range (200-500ms)");
        } else if (hashDuration < 200) {
            System.out.println("⚠ Hash time is too fast - consider increasing security parameters");
        } else {
            System.out.println("⚠ Hash time is slow - might impact user experience");
        }
        System.out.println();
    }

    /**
     * Example 5: Hash inspection and format
     */
    private static void example5_HashInspection() {
        System.out.println("--- Example 5: Hash Inspection ---");

        String password = "inspectMe123";
        String hash = LuxeUser.hashPassword(password);

        System.out.println("Full hash: " + hash);
        System.out.println("Hash length: " + hash.length() + " characters");

        // Parse hash components
        String[] parts = hash.split("\\$");
        if (parts.length >= 5) {
            System.out.println("\nHash Components:");
            System.out.println("  Algorithm: " + parts[1]);
            System.out.println("  Version: " + parts[2]);
            System.out.println("  Parameters: " + parts[3]);
            System.out.println("  Salt: " + parts[4].substring(0, Math.min(20, parts[4].length())) + "...");
            if (parts.length > 5) {
                System.out.println("  Hash: " + parts[5].substring(0, Math.min(20, parts[5].length())) + "...");
            }
        }

        // Verify same password produces different hashes (due to random salt)
        String hash2 = LuxeUser.hashPassword(password);
        System.out.println("\nSame password, different hash (random salt):");
        System.out.println("  Hash 1 == Hash 2: " + hash.equals(hash2));
        System.out.println("  Both validate: " +
            (Password.check(password, hash).with(
                Argon2Function.getInstance(65536, 3, 4, 32, Argon2.ID)
            ) && Password.check(password, hash2).with(
                Argon2Function.getInstance(65536, 3, 4, 32, Argon2.ID)
            )));
        System.out.println();
    }

    /**
     * Example 6: Realistic user registration and login flow
     */
    @SuppressWarnings("unused")
    private static void example6_RealisticFlow() {
        System.out.println("--- Example 6: Realistic Registration & Login Flow ---");

        // Registration
        System.out.println("REGISTRATION:");
        String registrationPassword = "UserPassword123!";
        LuxeUser newUser = LuxeUser.create(
            "alice",
            "Alice",
            "Smith",
            "alice@example.com",
            registrationPassword
        );
        System.out.println("✓ User registered: " + newUser.username());
        System.out.println("  Password stored as: " +
            newUser.password().substring(0, 30) + "...");

        // Simulate storing to database (in real app, you'd use UserRepository)
        // ... repository.save(newUser);

        // Login attempt 1: Correct password
        System.out.println("\nLOGIN ATTEMPT 1:");
        String loginPassword1 = "UserPassword123!";
        if (newUser.validatePassword(loginPassword1)) {
            System.out.println("✓ Login successful!");
            System.out.println("  Welcome, " + newUser.getFullName());
        } else {
            System.out.println("✗ Login failed: Invalid credentials");
        }

        // Login attempt 2: Wrong password
        System.out.println("\nLOGIN ATTEMPT 2:");
        String loginPassword2 = "WrongPassword";
        if (newUser.validatePassword(loginPassword2)) {
            System.out.println("✓ Login successful!");
        } else {
            System.out.println("✗ Login failed: Invalid credentials");
        }

        // Password change
        System.out.println("\nPASSWORD CHANGE:");
        String newPassword = "NewSecurePassword456!";
        LuxeUser updatedUser = newUser.withPassword(newPassword);
        System.out.println("✓ Password changed");

        // Login with old password (should fail)
        System.out.println("\nLOGIN WITH OLD PASSWORD:");
        if (updatedUser.validatePassword(registrationPassword)) {
            System.out.println("✓ Login successful (UNEXPECTED!)");
        } else {
            System.out.println("✗ Login failed: Old password no longer valid");
        }

        // Login with new password (should succeed)
        System.out.println("\nLOGIN WITH NEW PASSWORD:");
        if (updatedUser.validatePassword(newPassword)) {
            System.out.println("✓ Login successful with new password!");
        } else {
            System.out.println("✗ Login failed (UNEXPECTED!)");
        }
        System.out.println();
    }
}

