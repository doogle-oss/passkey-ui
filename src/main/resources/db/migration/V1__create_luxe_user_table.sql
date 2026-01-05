-- Create luxe_user table for Vert.x application
-- This table stores user information with support for both password and passkey authentication

CREATE TABLE IF NOT EXISTS luxe_user (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255), -- Argon2id hashed password (nullable for passkey-only users)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_luxe_user_username ON luxe_user(username);
CREATE INDEX IF NOT EXISTS idx_luxe_user_email ON luxe_user(email);

-- Insert sample data for testing
-- Note: Sample passwords are hashed with Argon2id using Password4j
-- The plain text password for all samples is "password123"
INSERT INTO luxe_user (username, firstname, lastname, email, password, created_at, updated_at)
VALUES
    ('testuser', 'Test', 'User', 'test@example.com',
     '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHRoZXJl$aGFzaGhlcmVoYXNoaGVyZWhhc2hoZXJlaGFzaA',
     NOW(), NOW()),
    ('janedoe', 'Jane', 'Doe', 'jane@example.com',
     '$argon2id$v=19$m=65536,t=3,p=4$YW5vdGhlcnNhbHQ$ZGlmZmVyZW50aGFzaGRpZmZlcmVudGhhc2g',
     NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

-- Note: These are example hashes. In production, generate real hashes using:
-- String hash = LuxeUser.hashPassword("password123");

