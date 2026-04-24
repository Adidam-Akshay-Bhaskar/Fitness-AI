-- ============================================
-- FITNESS TRACKER DATABASE - COMPLETE SCHEMA
-- Updated with Profile Page Fields
-- ============================================

CREATE DATABASE IF NOT EXISTS fitness_tracker;
USE fitness_tracker;

-- ============================================
-- USERS TABLE (Updated with Profile Fields)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    age INT NOT NULL,
    height DECIMAL(5,2) NOT NULL,
    current_weight DECIMAL(5,2) NOT NULL,
    goal_weight DECIMAL(5,2) NOT NULL,
    activity_level ENUM('sedentary', 'light', 'moderate', 'active', 'very_active') NOT NULL,
    fitness_goal ENUM('lose_weight', 'gain_muscle', 'maintain', 'improve_endurance') NOT NULL,
    
    -- NEW PROFILE FIELDS
    phone VARCHAR(20) DEFAULT NULL,
    date_of_birth DATE DEFAULT NULL,
    location VARCHAR(255) DEFAULT NULL,
    body_fat DECIMAL(5,2) DEFAULT NULL,
    muscle_mass DECIMAL(5,2) DEFAULT NULL,
    avatar VARCHAR(500) DEFAULT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- WORKOUTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS workouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exercise_name VARCHAR(255) NOT NULL,
    duration INT NOT NULL,
    calories_burned INT NOT NULL,
    sets INT DEFAULT NULL,
    reps INT DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    workout_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- WEIGHT LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS weight_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- NUTRITION LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS nutrition_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    meal_type ENUM('breakfast', 'pre-lunch', 'lunch', 'snack', 'pre-dinner', 'dinner') NOT NULL,
    food_items JSON NOT NULL,
    total_calories INT NOT NULL,
    total_protein DECIMAL(6,2) NOT NULL,
    total_carbs DECIMAL(6,2) NOT NULL,
    total_fats DECIMAL(6,2) NOT NULL,
    log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- ADMINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================
-- ADMIN ACTIVITY LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    target_type VARCHAR(50) DEFAULT NULL,
    target_id INT DEFAULT NULL,
    details TEXT DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_user_workouts ON workouts(user_id, workout_date);
CREATE INDEX idx_user_weight ON weight_log(user_id, log_date);
CREATE INDEX idx_user_nutrition ON nutrition_log(user_id, log_date);
CREATE INDEX idx_admin_logs ON admin_logs(admin_id, created_at);

-- ============================================
-- INSERT DEFAULT ADMIN
-- ============================================
-- Password: abhinav123 (hashed with bcrypt)
INSERT INTO admins (username, password, full_name, email, role) 
VALUES ('admin', '$2a$10$YourHashedPasswordHere', 'Administrator', 'admin@fitfuture.com', 'super_admin')
ON DUPLICATE KEY UPDATE username=username;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Sample User
INSERT INTO users (email, password, first_name, last_name, gender, age, height, current_weight, goal_weight, activity_level, fitness_goal, phone, location, body_fat, muscle_mass)
VALUES 
('john.doe@example.com', '$2a$10$SampleHashedPassword', 'John', 'Doe', 'male', 28, 175.00, 80.00, 75.00, 'moderate', 'lose_weight', '+1234567890', 'New York, USA', 18.5, 42.0)
ON DUPLICATE KEY UPDATE email=email;

-- Sample Workouts
INSERT INTO workouts (user_id, exercise_name, duration, calories_burned, sets, reps, notes)
VALUES 
(1, 'Running', 30, 300, NULL, NULL, 'Morning run in the park'),
(1, 'Bench Press', 45, 250, 4, 10, 'Chest day workout'),
(1, 'Squats', 40, 280, 4, 12, 'Leg day')
ON DUPLICATE KEY UPDATE id=id;

-- Sample Weight Log
INSERT INTO weight_log (user_id, weight)
VALUES 
(1, 80.5),
(1, 79.8),
(1, 79.2)
ON DUPLICATE KEY UPDATE id=id;

-- Sample Nutrition Log
INSERT INTO nutrition_log (user_id, meal_type, food_items, total_calories, total_protein, total_carbs, total_fats)
VALUES 
(1, 'breakfast', '[{"name":"Oatmeal","calories":150,"protein":5,"carbs":27,"fats":3}]', 150, 5.0, 27.0, 3.0),
(1, 'lunch', '[{"name":"Chicken Salad","calories":350,"protein":30,"carbs":20,"fats":15}]', 350, 30.0, 20.0, 15.0),
(1, 'dinner', '[{"name":"Grilled Salmon","calories":400,"protein":35,"carbs":10,"fats":20}]', 400, 35.0, 10.0, 20.0)
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if all tables exist
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'fitness_tracker'
ORDER BY TABLE_NAME;

-- Check users table structure
DESCRIBE users;

-- ============================================
-- NOTES
-- ============================================
-- 1. All profile fields are now included in users table
-- 2. Indexes are created for better query performance
-- 3. Foreign keys ensure data integrity
-- 4. Sample data is included for testing
-- 5. Use ON DUPLICATE KEY UPDATE to avoid errors on re-run
-- 
-- To use this file:
-- mysql -u root -p < database-complete-updated.sql
-- 
-- Or from MySQL command line:
-- source database-complete-updated.sql
-- ============================================
