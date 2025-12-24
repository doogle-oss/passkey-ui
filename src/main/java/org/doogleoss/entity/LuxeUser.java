package org.doogleoss.entity;

import java.time.LocalDateTime;

import io.quarkus.elytron.security.common.BcryptUtil;
import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "luxe_user")
public class LuxeUser extends PanacheEntity {
    
    @Column(unique = true, nullable = false)
    public String username;
    
    @Column(nullable = false)
    public String firstName;
    
    @Column(nullable = false)
    public String lastName;
    
    @Column(unique = true, nullable = false)
    public String email;
    
    @Column(nullable = true)
    public String password;
    
    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    public LocalDateTime updatedAt;
    
    public LuxeUser() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public LuxeUser(String username, String firstName, String lastName, String email) {
        this();
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
    }
    
    public LuxeUser(String username, String firstName, String lastName, String email, String password) {
        this(username, firstName, lastName, email);
        setPassword(password);
    }
    
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    /**
     * Set password with bcrypt encryption (one-way encryption)
     * @param plainPassword the plain text password to encrypt
     */
    public void setPassword(String plainPassword) {
        if (plainPassword != null && !plainPassword.isEmpty()) {
            this.password = BcryptUtil.bcryptHash(plainPassword);
        }
    }
    
    /**
     * Validate a plain text password against the encrypted password
     * @param plainPassword the plain text password to validate
     * @return true if password matches, false otherwise
     */
    public boolean validatePassword(String plainPassword) {
        if (plainPassword == null || plainPassword.isEmpty() || password == null) {
            return false;
        }
        return BcryptUtil.matches(plainPassword, password);
    }
}
