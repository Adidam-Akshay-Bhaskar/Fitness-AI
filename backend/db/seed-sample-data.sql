-- Sample data for testing (optional)
-- This creates a demo user and some sample workouts

USE fitness_tracker;

-- Demo user (password: demo123)
-- Password hash for 'demo123'
INSERT INTO users (email, password, first_name, last_name, gender, age, height, current_weight, goal_weight, activity_level, fitness_goal)
VALUES (
    'demo@fitfuture.com',
    '$2a$10$rKvVPZqGhf5L5h5L5h5L5uO5L5h5L5h5L5h5L5h5L5h5L5h5L5h5L',
    'Demo',
    'User',
    'male',
    28,
    175.0,
    80.0,
    75.0,
    'moderate',
    'lose_weight'
);

-- Get the user ID
SET @user_id = LAST_INSERT_ID();

-- Sample workouts
INSERT INTO workouts (user_id, exercise_name, duration, calories_burned, sets, reps, notes, workout_date)
VALUES
    (@user_id, 'Running', 30, 350, NULL, NULL, 'Morning run in the park', DATE_SUB(NOW(), INTERVAL 1 DAY)),
    (@user_id, 'Bench Press', 45, 280, 4, 10, 'Felt strong today', DATE_SUB(NOW(), INTERVAL 2 DAY)),
    (@user_id, 'Squats', 40, 320, 4, 12, 'Legs are sore', DATE_SUB(NOW(), INTERVAL 3 DAY)),
    (@user_id, 'Pull-ups', 25, 180, 3, 8, 'Getting better', DATE_SUB(NOW(), INTERVAL 4 DAY)),
    (@user_id, 'Cycling', 60, 450, NULL, NULL, 'Long ride', DATE_SUB(NOW(), INTERVAL 5 DAY)),
    (@user_id, 'Deadlift', 35, 300, 3, 8, 'New PR!', DATE_SUB(NOW(), INTERVAL 6 DAY)),
    (@user_id, 'Plank', 15, 100, 3, 60, 'Core workout', DATE_SUB(NOW(), INTERVAL 7 DAY));

-- Sample weight logs
INSERT INTO weight_log (user_id, weight, log_date)
VALUES
    (@user_id, 82.0, DATE_SUB(NOW(), INTERVAL 30 DAY)),
    (@user_id, 81.5, DATE_SUB(NOW(), INTERVAL 23 DAY)),
    (@user_id, 81.0, DATE_SUB(NOW(), INTERVAL 16 DAY)),
    (@user_id, 80.5, DATE_SUB(NOW(), INTERVAL 9 DAY)),
    (@user_id, 80.0, DATE_SUB(NOW(), INTERVAL 2 DAY));

SELECT 'Sample data inserted successfully!' as message;
SELECT 'Demo login: demo@fitfuture.com / demo123' as credentials;
