-- Migration: Add nutrition_log table
-- Run this if you already have the database set up

USE fitness_tracker;

-- Create nutrition_log table
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

-- Create index for better query performance
CREATE INDEX idx_user_nutrition ON nutrition_log(user_id, log_date);

-- Verify table was created
SELECT 'Nutrition table created successfully!' as message;
