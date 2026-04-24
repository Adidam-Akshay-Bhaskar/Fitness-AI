-- Add new profile fields to users table
-- Check and add columns one by one

-- Add phone column
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'fitness_tracker' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'phone';
SET @query = IF(@col_exists = 0, 'ALTER TABLE users ADD COLUMN phone VARCHAR(20)', 'SELECT "phone column already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add date_of_birth column
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'fitness_tracker' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'date_of_birth';
SET @query = IF(@col_exists = 0, 'ALTER TABLE users ADD COLUMN date_of_birth DATE', 'SELECT "date_of_birth column already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add location column
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'fitness_tracker' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'location';
SET @query = IF(@col_exists = 0, 'ALTER TABLE users ADD COLUMN location VARCHAR(255)', 'SELECT "location column already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add body_fat column
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'fitness_tracker' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'body_fat';
SET @query = IF(@col_exists = 0, 'ALTER TABLE users ADD COLUMN body_fat DECIMAL(5,2)', 'SELECT "body_fat column already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add muscle_mass column
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'fitness_tracker' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'muscle_mass';
SET @query = IF(@col_exists = 0, 'ALTER TABLE users ADD COLUMN muscle_mass DECIMAL(5,2)', 'SELECT "muscle_mass column already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add avatar column
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'fitness_tracker' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'avatar';
SET @query = IF(@col_exists = 0, 'ALTER TABLE users ADD COLUMN avatar VARCHAR(500)', 'SELECT "avatar column already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
