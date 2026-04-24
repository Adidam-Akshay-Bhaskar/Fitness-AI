const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

app.use(cors());
app.use(bodyParser.json());
// Database connection - Flexible for TiDB Cloud / Cloud Deployment
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER || process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || process.env.DB_DATABASE,
    port: process.env.DB_PORT || 4000,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Unauthorized' });
        req.userId = decoded.id;
        next();
    });
};

// Global request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Health check
app.get('/ping', (req, res) => res.send('PONG'));
console.log("-----------------------------------------");
console.log("GENESIS_PROTOCOL_ARNOLD_V4.1_INITIALIZING");
console.log("-----------------------------------------");

app.get('/api/exercises', verifyToken, (req, res) => {
    const exercises = [
        // CHEST
        { id: 1, name: "Neural Overdrive", type: "Strength", muscle: "Chest", equipment: "Dumbbells", difficulty: "High", xp: 500, detail: "High-intensity neural activation sequence for pectoral hypertrophy.", img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800", steps: ["Position dumbbells at chest level.", "Press upward with explosive force.", "Control the descent for 3 seconds.", "Maintain constant tension."] },
        { id: 21, name: "Titan Flyes", type: "Strength", muscle: "Chest", equipment: "Cables", difficulty: "Medium", xp: 350, detail: "Isolating the pectoral fibers for maximum stretch and contraction.", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800", steps: ["Stand between cable towers.", "Bring hands together in a wide arc.", "Squeeze at the center.", "Slowly return to start."] },
        { id: 22, name: "Push-up Prime", type: "Functional", muscle: "Chest", equipment: "None", difficulty: "Easy", xp: 150, detail: "Fundamental pressing pattern for core and chest stability.", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800", steps: ["Hands slightly wider than shoulders.", "Keep body in a straight line.", "Lower until chest nearly touches floor.", "Push back to start."] },
        
        // BACK
        { id: 4, name: "Kinetic Deadlift", type: "Strength", muscle: "Back", equipment: "Barbell", difficulty: "High", xp: 600, detail: "Full-posterior chain recruitment and spinal stabilization.", img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800", steps: ["Feet shoulder-width apart.", "Grip bar outside legs.", "Lift by driving through heels.", "Lock hips at top."] },
        { id: 23, name: "Vortex Rows", type: "Strength", muscle: "Back", equipment: "Barbell", difficulty: "Medium", xp: 400, detail: "Explosive horizontal pulling for mid-back thickness.", img: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=800", steps: ["Bend knees slightly, hinge at hips.", "Pull bar to lower stomach.", "Squeeze shoulder blades.", "Control the descent."] },
        { id: 24, name: "Lat Pulldown", type: "Strength", muscle: "Back", equipment: "Machine", difficulty: "Easy", xp: 200, detail: "Targeted vertical pull for width and V-taper.", img: "https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?auto=format&fit=crop&q=80&w=800", steps: ["Grip bar wider than shoulders.", "Pull down to upper chest.", "Focus on elbow drive.", "Slowly release."] },

        // LEGS
        { id: 3, name: "Apex Squat", type: "Strength", muscle: "Legs", equipment: "Barbell", difficulty: "High", xp: 550, detail: "Lower-chassis force generation and structural integrity.", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800", steps: ["Bar across upper traps.", "Squat until thighs are parallel.", "Keep chest up and core tight.", "Drive upward from mid-foot."] },
        { id: 25, name: "Lunar Lunge", type: "Functional", muscle: "Legs", equipment: "Dumbbells", difficulty: "Medium", xp: 300, detail: "Unilateral stability and quad/glute activation.", img: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&q=80&w=800", steps: ["Step forward with one leg.", "Drop back knee toward floor.", "Push back to starting position.", "Switch legs."] },
        { id: 26, name: "Glute Bridge", type: "Mobility", muscle: "Legs", equipment: "None", difficulty: "Easy", xp: 100, detail: "Activation sequence for posterior power.", img: "https://images.unsplash.com/photo-1552196564-97c5ad44575e?auto=format&fit=crop&q=80&w=800", steps: ["Lie on back, knees bent.", "Lift hips toward ceiling.", "Squeeze glutes at top.", "Lower slowly."] },

        // ARMS (BICEPS / TRICEPS)
        { id: 19, name: "Static Curl", type: "Strength", muscle: "Biceps", equipment: "Dumbbells", difficulty: "Medium", xp: 250, detail: "Isometric contraction for maximum blood flow and hypertrophy.", img: "https://images.unsplash.com/photo-1581009146145-b5ef03a7403f?auto=format&fit=crop&q=80&w=800", steps: ["Hold dumbbells at sides.", "Curl upward toward shoulders.", "Do not swing the weight.", "Squeeze at the top."] },
        { id: 27, name: "Skull Crushers", type: "Strength", muscle: "Triceps", equipment: "EZ Bar", difficulty: "High", xp: 450, detail: "Heavy tricep extension for maximum arm mass.", img: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=800", steps: ["Lie on bench, bar overhead.", "Lower bar to forehead.", "Extend arms upward.", "Keep elbows tucked."] },
        { id: 28, name: "Cable Pressdown", type: "Strength", muscle: "Triceps", equipment: "Cable", difficulty: "Easy", xp: 150, detail: "Isolation of the tricep long head.", img: "https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?auto=format&fit=crop&q=80&w=800", steps: ["Grip cable attachment.", "Push down until arms lock.", "Keep upper arms still.", "Squeeze triceps."] }
    ];
    res.json(exercises);
});

app.get('/api/nutrition/stats', verifyToken, (req, res) => {
    const query = `
        SELECT SUM(total_calories) as todayCalories, 
               SUM(total_protein) as todayProtein, 
               SUM(total_carbs) as todayCarbs 
        FROM nutrition_log 
        WHERE user_id = ? AND DATE(log_date) = CURDATE()
    `;
    db.query(query, [req.userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Nutrition Stats Error' });
        res.json(results[0] || { todayCalories: 0, todayProtein: 0, todayCarbs: 0 });
    });
});

app.get('/api/ai/protocols', verifyToken, (req, res) => {
    const protocols = {
        hypertrophy: {
            title: "HYPERTROPHY<br>ELITE_A",
            detail: "75 Minutes • Structural Hypertrophy • 550 kcal Est.",
            intensity: "SEVERE",
            recovery: "48 HRS",
            img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1200",
            bgPos: "center"
        },
        metabolic: {
            title: "METABOLIC<br>OVERDRIVE",
            detail: "45 Minutes • Glycogen Depletion • 650 kcal Est.",
            intensity: "CRITICAL",
            recovery: "24 HRS",
            img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1200",
            bgPos: "center"
        },
        neural: {
            title: "NEURAL<br>REWIRE",
            detail: "35 Minutes • Synaptic Activation • 180 kcal Est.",
            intensity: "TECHNICAL",
            recovery: "12 HRS",
            img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200",
            bgPos: "center"
        },
        titan: {
            title: "TITAN<br>FORCE",
            detail: "90 Minutes • Central Nervous Loading • 600 kcal Est.",
            intensity: "MAXIMUM",
            recovery: "72 HRS",
            img: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=1200",
            bgPos: "center"
        },
        vortex: {
            title: "VORTEX<br>AEROBIC",
            detail: "60 Minutes • VO2 Max Calibration • 800 kcal Est.",
            intensity: "HIGH",
            recovery: "24 HRS",
            img: "https://images.unsplash.com/photo-1441924196484-95889447ba3b?auto=format&fit=crop&q=80&w=1200",
            bgPos: "center"
        },
        apex: {
            title: "APEX<br>ALIGNMENT",
            detail: "30 Minutes • Kinetic Correction • 120 kcal Est.",
            intensity: "FLUID",
            recovery: "8 HRS",
            img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=1200",
            bgPos: "center"
        },
        quantum: {
            title: "QUANTUM<br>HIIT",
            detail: "25 Minutes • Anaerobic Burst • 400 kcal Est.",
            intensity: "CRITICAL",
            recovery: "24 HRS",
            img: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&q=80&w=1200",
            bgPos: "center"
        },
        iron_core: {
            title: "IRON<br>CORE",
            detail: "40 Minutes • Mid-Section Stability • 250 kcal Est.",
            intensity: "STABLE",
            recovery: "24 HRS",
            img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=1200",
            bgPos: "center"
        },
        zenith: {
            title: "ZENITH<br>YOGA",
            detail: "50 Minutes • Parasympathetic Reset • 200 kcal Est.",
            intensity: "LOW",
            recovery: "0 HRS",
            img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200",
            bgPos: "center"
        },
        kinetic: {
            title: "KINETIC<br>CALISTHENICS",
            detail: "55 Minutes • Relative Strength • 450 kcal Est.",
            intensity: "TECHNICAL",
            recovery: "48 HRS",
            img: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=1200",
            bgPos: "center"
        },
        omega: {
            title: "OMEGA<br>SWIM",
            detail: "45 Minutes • Full-Body Fluidity • 500 kcal Est.",
            intensity: "MEDIUM",
            recovery: "24 HRS",
            img: "https://images.unsplash.com/photo-1530549387074-d5626048c897?auto=format&fit=crop&q=80&w=1200",
            bgPos: "center"
        },
        phantom: {
            title: "PHANTOM<br>BOXING",
            detail: "40 Minutes • Reactive Striking • 600 kcal Est.",
            intensity: "SEVERE",
            recovery: "24 HRS",
            img: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=1200",
            bgPos: "center"
        }
    };
    res.json(protocols);
});

app.use(express.static(path.join(__dirname, '../frontend')));

// Test connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to TiDB Cloud / MySQL database via Pool');
    connection.release();
});

// Stats Trends endpoint - Returns historical data for charts
app.get('/api/stats/trends', verifyToken, (req, res) => {
    const query = `
        SELECT DATE(workout_date) as date, SUM(calories_burned) as calories, SUM(duration) as duration
        FROM workouts 
        WHERE user_id = ? AND workout_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(workout_date)
        ORDER BY DATE(workout_date) ASC
    `;
    
    db.query(query, [req.userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Trend Data Error' });
        res.json(results);
    });
});
app.post('/api/register', async (req, res) => {
    const { email, password, firstName, lastName, gender, age, height, weight, goalWeight, activityLevel, fitnessGoal } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (email, password, first_name, last_name, gender, age, height, current_weight, goal_weight, activity_level, fitness_goal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        
        db.query(query, [email, hashedPassword, firstName, lastName, gender, age, height, weight, goalWeight, activityLevel, fitnessGoal], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: 'Email already exists' });
                }
                return res.status(500).json({ message: 'Registration failed' });
            }
            
            const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, { expiresIn: '7d' });
            res.status(201).json({ message: 'User registered successfully', token, userId: result.insertId });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
        
        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });
        
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ message: 'Login successful', token, userId: user.id });
    });
});

// Get user profile
app.get('/api/user/profile', verifyToken, (req, res) => {
    db.query('SELECT * FROM users WHERE id = ?', [req.userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (results.length === 0) return res.status(404).json({ message: 'User not found' });
        
        const user = results[0];
        // Return both formats for compatibility with dashboard and profile page
        const profile = {
            // Original database fields (for dashboard)
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            gender: user.gender,
            age: user.age,
            height: user.height,
            current_weight: user.current_weight,
            goal_weight: user.goal_weight,
            activity_level: user.activity_level,
            fitness_goal: user.fitness_goal,
            created_at: user.created_at,
            
            // Transformed fields (for profile page)
            name: `${user.first_name} ${user.last_name}`,
            phone: user.phone || '',
            dateOfBirth: user.date_of_birth || '',
            location: user.location || '',
            currentWeight: user.current_weight || 0,
            targetWeight: user.goal_weight || 0,
            bodyFat: user.body_fat || 0,
            muscleMass: user.muscle_mass || 0,
            avatar: user.avatar || null,
            xp: user.xp || 0,
            level: Math.floor((user.xp || 0) / 1000) + 1
        };
        
        res.json(profile);
    });
});

// Update user profile
app.put('/api/user/profile', verifyToken, (req, res) => {
    console.log('Profile update request:', req.body);
    
    // Support both formats: dashboard (firstName/lastName/weight/goalWeight) and profile page (name/currentWeight/targetWeight)
    let firstName, lastName, currentWeight, targetWeight;
    
    // Check which format is being used
    if (req.body.firstName && req.body.lastName) {
        // Dashboard format
        firstName = req.body.firstName;
        lastName = req.body.lastName;
        currentWeight = req.body.weight;
        targetWeight = req.body.goalWeight;
    } else if (req.body.name) {
        // Profile page format
        const nameParts = (req.body.name || '').split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
        currentWeight = req.body.currentWeight;
        targetWeight = req.body.targetWeight;
    } else {
        return res.status(400).json({ message: 'Invalid request format' });
    }
    
    const { phone, dateOfBirth, gender, age, height, activityLevel, fitnessGoal, location, bodyFat, muscleMass } = req.body;
    
    // Validate required fields
    if (!height || !currentWeight || !targetWeight) {
        return res.status(400).json({ 
            message: 'Height, current weight, and target weight are required fields' 
        });
    }
    
    // Build update query - only update fields that are provided
    const updates = [];
    const values = [];
    
    if (firstName) { updates.push('first_name = ?'); values.push(firstName); }
    if (lastName) { updates.push('last_name = ?'); values.push(lastName); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone || null); }
    if (dateOfBirth !== undefined) { updates.push('date_of_birth = ?'); values.push(dateOfBirth || null); }
    if (gender) { updates.push('gender = ?'); values.push(gender); }
    if (age) { updates.push('age = ?'); values.push(parseInt(age)); }
    if (location !== undefined) { updates.push('location = ?'); values.push(location || null); }
    if (height) { updates.push('height = ?'); values.push(parseFloat(height)); }
    if (currentWeight) { updates.push('current_weight = ?'); values.push(parseFloat(currentWeight)); }
    if (targetWeight) { updates.push('goal_weight = ?'); values.push(parseFloat(targetWeight)); }
    if (activityLevel) { updates.push('activity_level = ?'); values.push(activityLevel); }
    if (fitnessGoal) { updates.push('fitness_goal = ?'); values.push(fitnessGoal); }
    if (bodyFat !== undefined) { updates.push('body_fat = ?'); values.push(bodyFat ? parseFloat(bodyFat) : null); }
    if (muscleMass !== undefined) { updates.push('muscle_mass = ?'); values.push(muscleMass ? parseFloat(muscleMass) : null); }
    if (req.body.avatar_url !== undefined) { updates.push('avatar = ?'); values.push(req.body.avatar_url || null); }
    
    if (updates.length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
    }
    
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    values.push(req.userId);
    
    console.log('Update query:', query);
    console.log('Update values:', values);
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Profile update error:', err);
            return res.status(500).json({ message: 'Update failed', error: err.message });
        }
        res.json({ message: 'Profile updated successfully', affectedRows: result.affectedRows });
    });
});

// Upload avatar (placeholder - in production use multer for file uploads)
app.post('/api/user/avatar', verifyToken, (req, res) => {
    // For now, just return success
    // In production, implement proper file upload with multer
    res.json({ message: 'Avatar upload endpoint ready' });
});

// Log workout
app.post('/api/workouts', verifyToken, (req, res) => {
    const { exerciseName, duration, calories, sets, reps, notes } = req.body;
    
    db.query('INSERT INTO workouts (user_id, exercise_name, duration, calories_burned, sets, reps, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.userId, exerciseName, duration, calories, sets, reps, notes], (err, result) => {
            if (err) return res.status(500).json({ message: 'Failed to log workout' });
            
            // Reward XP: 10 XP per minute of workout
            const xpReward = duration * 10;
            db.query('UPDATE users SET xp = xp + ? WHERE id = ?', [xpReward, req.userId], (err) => {
                if (err) console.error("XP update failed", err);
                res.status(201).json({ 
                    message: 'Workout logged successfully', 
                    workoutId: result.insertId,
                    xpGained: xpReward 
                });
            });
        });
});

// Get user workouts
app.get('/api/workouts', verifyToken, (req, res) => {
    db.query('SELECT * FROM workouts WHERE user_id = ? ORDER BY workout_date DESC LIMIT 50', [req.userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.json(results);
    });
});

// Delete workout
app.delete('/api/workouts/:id', verifyToken, (req, res) => {
    const workoutId = req.params.id;
    
    // First verify the workout belongs to the user
    db.query('SELECT user_id FROM workouts WHERE id = ?', [workoutId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (results.length === 0) return res.status(404).json({ message: 'Workout not found' });
        if (results[0].user_id !== req.userId) return res.status(403).json({ message: 'Unauthorized' });
        
        // Delete the workout
        db.query('DELETE FROM workouts WHERE id = ?', [workoutId], (err, result) => {
            if (err) return res.status(500).json({ message: 'Failed to delete workout' });
            res.json({ message: 'Workout deleted successfully' });
        });
    });
});

// Get workout statistics
app.get('/api/stats', verifyToken, (req, res) => {
    const queries = {
        totalWorkouts: 'SELECT COUNT(*) as count FROM workouts WHERE user_id = ?',
        totalCalories: 'SELECT SUM(calories_burned) as total FROM workouts WHERE user_id = ?',
        todayCaloriesBurned: 'SELECT SUM(calories_burned) as total FROM workouts WHERE user_id = ? AND DATE(workout_date) = CURDATE()',
        todayActiveMinutes: 'SELECT SUM(duration) as total FROM workouts WHERE user_id = ? AND DATE(workout_date) = CURDATE()',
        weeklyWorkouts: 'SELECT COUNT(DISTINCT DATE(workout_date)) as count FROM workouts WHERE user_id = ? AND workout_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)',
        recentProgress: 'SELECT workout_date, SUM(calories_burned) as calories FROM workouts WHERE user_id = ? AND workout_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY DATE(workout_date) ORDER BY workout_date'
    };
    
    const stats = {};
    
    db.query(queries.totalWorkouts, [req.userId], (err, results) => {
        stats.totalWorkouts = results[0].count;
        
        db.query(queries.totalCalories, [req.userId], (err, results) => {
            stats.totalCalories = results[0].total || 0;
            
            db.query(queries.todayCaloriesBurned, [req.userId], (err, results) => {
                stats.todayCaloriesBurned = results[0].total || 0;
                
                db.query(queries.todayActiveMinutes, [req.userId], (err, results) => {
                    stats.todayActiveMinutes = results[0].total || 0;

                    db.query(queries.weeklyWorkouts, [req.userId], (err, results) => {
                        stats.weeklyWorkouts = results[0].count;
                        
                        db.query(queries.recentProgress, [req.userId], (err, results) => {
                            stats.recentProgress = results;
                            res.json(stats);
                        });
                    });
                });
            });
        });
    });
});


// Log weight entry
app.post('/api/weight', verifyToken, (req, res) => {
    const { weight } = req.body;
    
    db.query('INSERT INTO weight_log (user_id, weight) VALUES (?, ?)', [req.userId, weight], (err, result) => {
        if (err) return res.status(500).json({ message: 'Failed to log weight' });
        
        db.query('UPDATE users SET current_weight = ? WHERE id = ?', [weight, req.userId], (err) => {
            res.status(201).json({ message: 'Weight logged successfully' });
        });
    });
});

// Get weight history
app.get('/api/weight', verifyToken, (req, res) => {
    db.query('SELECT * FROM weight_log WHERE user_id = ? ORDER BY log_date DESC LIMIT 100', [req.userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.json(results);
    });
});

// ============================================
// NUTRITION ENDPOINTS
// ============================================

// Log nutrition meal
app.post('/api/nutrition', verifyToken, (req, res) => {
    const { mealType, foodItems, totalCalories, totalProtein, totalCarbs, totalFats } = req.body;
    
    // Validate required fields
    if (!mealType || !foodItems || totalCalories === undefined) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    
    db.query(
        'INSERT INTO nutrition_log (user_id, meal_type, food_items, total_calories, total_protein, total_carbs, total_fats) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.userId, mealType, JSON.stringify(foodItems), totalCalories, totalProtein, totalCarbs, totalFats],
        (err, result) => {
            if (err) {
                console.error('Nutrition log error:', err);
                
                // Check if table doesn't exist
                if (err.code === 'ER_NO_SUCH_TABLE') {
                    return res.status(500).json({ 
                        message: 'Database table not found. Please run: mysql -u root -p < add-nutrition-table.sql' 
                    });
                }
                
                return res.status(500).json({ 
                    message: 'Failed to log nutrition: ' + err.message 
                });
            }
            res.status(201).json({ 
                message: 'Nutrition logged successfully', 
                nutritionId: result.insertId 
            });
        }
    );
});

// Get user nutrition log
app.get('/api/nutrition', verifyToken, (req, res) => {
    db.query(
        'SELECT * FROM nutrition_log WHERE user_id = ? ORDER BY log_date DESC LIMIT 100',
        [req.userId],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Server error' });
            
            // Parse JSON food_items for each result (only if it's a string)
            const parsedResults = results.map(item => ({
                ...item,
                food_items: typeof item.food_items === 'string' ? JSON.parse(item.food_items) : item.food_items
            }));
            
            res.json(parsedResults);
        }
    );
});

// Get nutrition by date
app.get('/api/nutrition/date/:date', verifyToken, (req, res) => {
    const date = req.params.date;
    
    db.query(
        'SELECT * FROM nutrition_log WHERE user_id = ? AND DATE(log_date) = ? ORDER BY log_date',
        [req.userId, date],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Server error' });
            
            const parsedResults = results.map(item => ({
                ...item,
                food_items: typeof item.food_items === 'string' ? JSON.parse(item.food_items) : item.food_items
            }));
            
            res.json(parsedResults);
        }
    );
});

// Get single nutrition entry by ID
app.get('/api/nutrition/:id', verifyToken, (req, res) => {
    const nutritionId = req.params.id;
    
    db.query(
        'SELECT * FROM nutrition_log WHERE id = ? AND user_id = ?',
        [nutritionId, req.userId],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Server error' });
            if (results.length === 0) return res.status(404).json({ message: 'Nutrition entry not found' });
            
            const result = results[0];
            result.food_items = typeof result.food_items === 'string' ? JSON.parse(result.food_items) : result.food_items;
            
            res.json([result]);
        }
    );
});

// Update nutrition entry
app.put('/api/nutrition/:id', verifyToken, (req, res) => {
    const nutritionId = req.params.id;
    const { foodItems, totalCalories, totalProtein, totalCarbs, totalFats } = req.body;
    
    // Verify the entry belongs to the user
    db.query('SELECT user_id FROM nutrition_log WHERE id = ?', [nutritionId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (results.length === 0) return res.status(404).json({ message: 'Nutrition entry not found' });
        if (results[0].user_id !== req.userId) return res.status(403).json({ message: 'Unauthorized' });
        
        // Update the entry
        db.query(
            'UPDATE nutrition_log SET food_items = ?, total_calories = ?, total_protein = ?, total_carbs = ?, total_fats = ? WHERE id = ?',
            [JSON.stringify(foodItems), totalCalories, totalProtein, totalCarbs, totalFats, nutritionId],
            (err, result) => {
                if (err) {
                    console.error('Update error:', err);
                    return res.status(500).json({ message: 'Failed to update nutrition entry' });
                }
                res.json({ message: 'Nutrition entry updated successfully' });
            }
        );
    });
});

// Delete nutrition entry
app.delete('/api/nutrition/:id', verifyToken, (req, res) => {
    const nutritionId = req.params.id;
    
    // Verify the entry belongs to the user
    db.query('SELECT user_id FROM nutrition_log WHERE id = ?', [nutritionId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (results.length === 0) return res.status(404).json({ message: 'Nutrition entry not found' });
        if (results[0].user_id !== req.userId) return res.status(403).json({ message: 'Unauthorized' });
        
        // Delete the entry
        db.query('DELETE FROM nutrition_log WHERE id = ?', [nutritionId], (err, result) => {
            if (err) return res.status(500).json({ message: 'Failed to delete nutrition entry' });
            res.json({ message: 'Nutrition entry deleted successfully' });
        });
    });
});



// ============================================
// AI & ANALYTICS ENDPOINTS (GENESIS PROTOCOL)
// ============================================

// AI Coach endpoint - Integrated Arnold V4.2 Tactical Intelligence (RECOVERY_MODE_ACTIVE)
app.post('/api/ai/coach', verifyToken, async (req, res) => {
    const { message } = req.body;
    
    try {
        const [user] = await db.promise().query('SELECT * FROM users WHERE id = ?', [req.userId]);
        const [workouts] = await db.promise().query('SELECT * FROM workouts WHERE user_id = ? ORDER BY workout_date DESC LIMIT 3', [req.userId]);
        const [meals] = await db.promise().query('SELECT * FROM nutrition_log WHERE user_id = ? AND DATE(log_date) = CURDATE()', [req.userId]);

        const name = user[0]?.first_name || "RECRUIT";
        const fitnessGoal = user[0]?.fitness_goal || "GENERAL_FITNESS";
        
        // HEURISTIC ENGINE - ARNOLD V5.5 TACTICAL CALIBRATION (ULTRA-GRANULAR)
        const getTacticalFallback = (msg) => {
            const m = msg.toLowerCase();
            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Contextual Mapping
            const workoutsByTarget = {
                back: ["Weighted Pull-ups (3x8)", "Bent Over Rows (4x10)", "Lat Pulldowns (3x12)", "Face Pulls (3x15)"],
                chest: ["Incline Bench Press (4x8)", "Dumbbell Flyes (3x12)", "Weighted Dips (3x10)", "Push-ups to Failure"],
                legs: ["Barbell Squats (5x5)", "Leg Press (3x12)", "Bulgarian Split Squats (3x10)", "Leg Curls (3x15)"],
                arms: ["Barbell Curls (3x10)", "Skull Crushers (3x12)", "Hammer Curls (3x12)", "Tricep Pushdowns (3x15)"],
                shoulders: ["Overhead Press (4x8)", "Lateral Raises (4x15)", "Front Raises (3x12)", "Reverse Pec Deck (3x15)"],
                core: ["Hanging Leg Raises (3x15)", "Plank (3x2 min)", "Cable Crunches (3x20)", "Ab Wheel (3x12)"]
            };

            if (m.includes('hi') || m.includes('hello')) {
                return `[STATUS_IDENTIFIED]: Recruit ${name}, greetings are inefficient but acknowledged. Current time: ${timeStr}. Goal: ${fitnessGoal}. Select a protocol and begin immediately.`;
            }

            // Target Detection
            let response = "";
            let found = false;

            if (m.includes('back')) {
                response += `[TARGET_BACK]: Protocol initiated. 1. ${workoutsByTarget.back.join(', ')}. `;
                found = true;
            }
            if (m.includes('chest')) {
                response += `[TARGET_CHEST]: Deploying firepower. 1. ${workoutsByTarget.chest.join(', ')}. `;
                found = true;
            }
            if (m.includes('leg')) {
                response += `[TARGET_LEGS]: Structural loading required. 1. ${workoutsByTarget.legs.join(', ')}. `;
                found = true;
            }
            if (m.includes('arm') || m.includes('bicep') || m.includes('tricep')) {
                response += `[TARGET_ARMS]: Hypertrophy window open. 1. ${workoutsByTarget.arms.join(', ')}. `;
                found = true;
            }
            if (m.includes('shoulder')) {
                response += `[TARGET_SHOULDERS]: Lateral displacement active. 1. ${workoutsByTarget.shoulders.join(', ')}. `;
                found = true;
            }
            if (m.includes('core') || m.includes('abs')) {
                response += `[TARGET_CORE]: Mid-section stabilization active. 1. ${workoutsByTarget.core.join(', ')}. `;
                found = true;
            }

            if (found) {
                return response + `Execute with 90% intensity. No excuses. Proceed, ${name}.`;
            }

            if (m.includes('workout') || m.includes('plan')) {
                const lastExercise = workouts[0]?.exercise_name || 'NULL_BUFFER';
                return `[ANALYZING_HISTORY]: Previous protocol: ${lastExercise}. Neural link recommends High-Intensity Metabolic Conditioning: 5 rounds of Thrusters, Burpees, and Kettlebell Swings. Zero rest between cycles. Make it hurt, ${name}.`;
            }

            return `[GENESIS_UPLINK]: Recruit ${name}, bio-metrics stable. Query "${message}" is ambiguous. Specify target (BACK/CHEST/LEGS) for tactical deployment. Proceed to the Armory.`;
        };

        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_KEY_HERE') {
            const https = require('https');
            const prompt = `Tactical AI Arnold. User:${name}, Goal:${fitnessGoal}, Message:"${message}". Speak like a commander. Max 3 sentences. Use data terms.`;
            const dataPost = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] });
            
            const options = {
                hostname: 'generativelanguage.googleapis.com',
                path: `/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Content-Length': dataPost.length }
            };

            const aiReq = https.request(options, (aiRes) => {
                let responseData = '';
                aiRes.on('data', (d) => { responseData += d; });
                aiRes.on('end', () => {
                    try {
                        const parsedData = JSON.parse(responseData);
                        console.log(`[ARNOLD_AI_LOG]: Response received. Status: ${aiRes.statusCode}`);
                        
                        if (parsedData.candidates?.[0]?.content?.parts?.[0]?.text) {
                            res.json({ response: parsedData.candidates[0].content.parts[0].text, agent: "ARNOLD_V5.5", timestamp: new Date().toISOString() });
                        } else {
                            console.warn(`[ARNOLD_AI_LOG]: API Error or empty candidates. Falling back to Heuristics.`);
                            console.log(`[ARNOLD_AI_LOG]: API Raw Response:`, responseData);
                            res.json({ response: getTacticalFallback(message), agent: "ARNOLD_V5.5 (LOCAL_HEURISTICS)", timestamp: new Date().toISOString() });
                        }
                    } catch (e) {
                        console.error(`[ARNOLD_AI_LOG]: JSON Parse Error.`, e);
                        res.json({ response: getTacticalFallback(message), agent: "ARNOLD_V5.5 (LOCAL_HEURISTICS)", timestamp: new Date().toISOString() });
                    }
                });
            });

            aiReq.on('error', () => {
                res.json({ response: getTacticalFallback(message), agent: "ARNOLD_V4.2 (LOCAL_HEURISTICS)", timestamp: new Date().toISOString() });
            });

            aiReq.write(dataPost);
            aiReq.end();
        } else {
            res.json({ response: getTacticalFallback(message), agent: "ARNOLD_V4.2 (LOCAL_HEURISTICS)", timestamp: new Date().toISOString() });
        }
    } catch (err) {
        console.error("AI Coach Error:", err);
        res.status(500).json({ message: 'AI_UPLINK_INTERRUPTED' });
    }
});



// Exercise Library - The Armory (REDUNDANT REMOVAL)


// ============================================
// ADMIN ROUTES
// ============================================

// Admin login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    // For initial setup, use hardcoded credentials
    // In production, this should check against hashed passwords in database
    if (username === 'admin' && password === 'abhinav123') {
        const token = jwt.sign({ adminId: 1, username: 'admin', role: 'super_admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        res.json({
            token,
            admin: {
                id: 1,
                username: 'admin',
                role: 'super_admin'
            }
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.adminId) {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }
        req.adminId = decoded.adminId;
        req.adminRole = decoded.role;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Get total users count
app.get('/api/admin/users/count', verifyAdmin, (req, res) => {
    db.query('SELECT COUNT(*) as count FROM users', (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.json({ count: results[0].count });
    });
});

// Get total workouts count and calories
app.get('/api/admin/workouts/count', verifyAdmin, (req, res) => {
    db.query('SELECT COUNT(*) as count, SUM(calories_burned) as totalCalories FROM workouts', (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.json({
            count: results[0].count,
            totalCalories: results[0].totalCalories || 0
        });
    });
});

// Get total nutrition count
app.get('/api/admin/nutrition/count', verifyAdmin, (req, res) => {
    db.query('SELECT COUNT(*) as count FROM nutrition_log', (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.json({ count: results[0].count });
    });
});

// Get all users
app.get('/api/admin/users', verifyAdmin, (req, res) => {
    db.query('SELECT id, email, first_name, last_name, gender, age, fitness_goal, created_at FROM users ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.json(results);
    });
});

// Delete user
app.delete('/api/admin/users/:id', verifyAdmin, (req, res) => {
    const userId = req.params.id;
    
    db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully' });
    });
});

// Get all workouts with user info
app.get('/api/admin/workouts/all', verifyAdmin, (req, res) => {
    const query = `
        SELECT w.*, CONCAT(u.first_name, ' ', u.last_name) as user_name 
        FROM workouts w 
        LEFT JOIN users u ON w.user_id = u.id 
        ORDER BY w.workout_date DESC 
        LIMIT 100
    `;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.json(results);
    });
});

// Get all nutrition logs with user info
app.get('/api/admin/nutrition/all', verifyAdmin, (req, res) => {
    const query = `
        SELECT n.*, CONCAT(u.first_name, ' ', u.last_name) as user_name 
        FROM nutrition_log n 
        LEFT JOIN users u ON n.user_id = u.id 
        ORDER BY n.log_date DESC 
        LIMIT 100
    `;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.json(results);
    });
});

// Get recent activity
app.get('/api/admin/activity/recent', verifyAdmin, (req, res) => {
    const query = `
        (SELECT 'workout' as type, CONCAT(u.first_name, ' logged a workout: ', w.exercise_name) as description, w.workout_date as created_at
         FROM workouts w
         JOIN users u ON w.user_id = u.id
         ORDER BY w.workout_date DESC
         LIMIT 5)
        UNION ALL
        (SELECT 'nutrition' as type, CONCAT(u.first_name, ' logged ', n.meal_type) as description, n.log_date as created_at
         FROM nutrition_log n
         JOIN users u ON n.user_id = u.id
         ORDER BY n.log_date DESC
         LIMIT 5)
        ORDER BY created_at DESC
        LIMIT 10
    `;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.json(results);
    });
});

console.log('Admin routes initialized');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[GENESIS_PROTOCOL_V7.2]: Server online at port ${PORT}`);
    console.log('Tactical endpoints active: /api/ai/coach, /api/ai/protocols, /api/stats/trends, /api/nutrition/stats, /api/exercises');
});
