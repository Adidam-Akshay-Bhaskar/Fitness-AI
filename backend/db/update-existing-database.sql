-- ============================================
-- UPDATE EXISTING DATABASE WITH PROFILE FIELDS
-- Run this if you already have the database
-- ============================================

USE fitness_tracker;

-- Add profile fields to existing users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS date_of_birth DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS body_fat DECIMAL(5,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS muscle_mass DECIMAL(5,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS avatar VARCHAR(500) DEFAULT NULL;

-- Verify the changes
DESCRIBE users;

-- Show success message
SELECT 'Profile fields added successfully!' AS Status;
