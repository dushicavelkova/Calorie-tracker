const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/calories_db'
});

// Self-healing database table startup check
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meals (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        calories INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      ALTER TABLE meals
      ADD COLUMN IF NOT EXISTS meal_type VARCHAR(50);
    `);
    await pool.query(`
      ALTER TABLE meals
      ADD COLUMN IF NOT EXISTS protein INTEGER DEFAULT 0;
 
      ALTER TABLE meals
      ADD COLUMN IF NOT EXISTS carbs INTEGER DEFAULT 0;

      ALTER TABLE meals
      ADD COLUMN IF NOT EXISTS fat INTEGER DEFAULT 0;
    `);
    await pool.query(`
      ALTER TABLE meals
      ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;

      ALTER TABLE meals
      ADD COLUMN IF NOT EXISTS unit VARCHAR(20) DEFAULT 'pieces';
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS foods (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        calories_per_100g INTEGER,
        protein_per_100g INTEGER,
        carbs_per_100g INTEGER,
        fat_per_100g INTEGER,
        calories_per_piece INTEGER,
        protein_per_piece INTEGER,
        carbs_per_piece INTEGER,
        fat_per_piece INTEGER
      );
    `);
    await pool.query(`
      INSERT INTO foods
      (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
      calories_per_piece, protein_per_piece, carbs_per_piece, fat_per_piece)
      VALUES

      -- Fruits
      ('banana', 89, 1, 23, 0, 105, 1, 27, 0),
      ('apple', 52, 0, 14, 0, 95, 0, 25, 0),
      ('orange', 47, 1, 12, 0, 62, 1, 15, 0),
      ('peach', 39, 1, 10, 0, 58, 1, 15, 0),
      ('strawberries', 32, 1, 8, 0, NULL, NULL, NULL, NULL),
      ('raspberries', 52, 1, 12, 1, NULL, NULL, NULL, NULL),
      ('blueberries', 57, 1, 14, 0, NULL, NULL, NULL, NULL),
      ('grapes', 69, 1, 18, 0, NULL, NULL, NULL, NULL),

      -- Vegetables
      ('potato', 77, 2, 17, 0, NULL, NULL, NULL, NULL),
      ('sweet potato', 86, 2, 20, 0, NULL, NULL, NULL, NULL),
      ('tomato', 18, 1, 4, 0, NULL, NULL, NULL, NULL),
      ('cucumber', 15, 1, 4, 0, NULL, NULL, NULL, NULL),
      ('carrot', 41, 1, 10, 0, NULL, NULL, NULL, NULL),
      ('broccoli', 35, 2, 7, 0, NULL, NULL, NULL, NULL),
      ('bell pepper', 31, 1, 6, 0, NULL, NULL, NULL, NULL),
      ('lettuce', 15, 1, 3, 0, NULL, NULL, NULL, NULL),

      -- Meat and fish
      ('chicken breast', 165, 31, 0, 4, NULL, NULL, NULL, NULL),
      ('turkey breast', 135, 29, 0, 2, NULL, NULL, NULL, NULL),
      ('salmon', 208, 20, 0, 13, NULL, NULL, NULL, NULL),
      ('tuna', 116, 26, 0, 1, NULL, NULL, NULL, NULL),
      ('white fish', 100, 22, 0, 2, NULL, NULL, NULL, NULL),

      -- Eggs and dairy
      ('egg', 143, 13, 1, 10, 68, 7, 0, 1),
      ('milk', 47, 3, 5, 2, NULL, NULL, NULL, NULL),
      ('greek yogurt', 59, 10, 4, 0, NULL, NULL, NULL, NULL),
      ('feta cheese', 264, 14, 4, 21, NULL, NULL, NULL, NULL),
      ('mozzarella', 280, 28, 3, 17, NULL, NULL, NULL, NULL),

      -- Grains and carbohydrates
      ('rice', 130, 3, 28, 0, NULL, NULL, NULL, NULL),
      ('pasta', 157, 6, 31, 1, NULL, NULL, NULL, NULL),
      ('oats', 389, 17, 66, 7, NULL, NULL, NULL, NULL),
      ('whole wheat bread', 247, 13, 41, 4, NULL, NULL, NULL, NULL),
      ('rice cakes', 387, 8, 81, 3, NULL, NULL, NULL, NULL),

      -- Nuts and spreads
      ('peanut butter', 588, 25, 20, 50, NULL, NULL, NULL, NULL),
      ('almonds', 579, 21, 22, 50, NULL, NULL, NULL, NULL),
      ('walnuts', 654, 15, 14, 65, NULL, NULL, NULL, NULL),

      -- Other
      ('honey', 304, 0, 82, 0, NULL, NULL, NULL, NULL),
      ('dark chocolate', 598, 8, 46, 43, NULL, NULL, NULL, NULL)

      ON CONFLICT (name) DO NOTHING;
    `);
    console.log("Database initialized successfully.");
  } catch (err) {
    console.error("DB connection error. Retrying in 5s...", err);
    setTimeout(initDB, 5000);
  }
}
initDB();

// Endpoints
app.get('/api/foods', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM foods ORDER BY name ASC'
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
app.get('/api/meals', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM meals ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/meals', async (req, res) => {
const { name, quantity, unit, calories, protein, carbs, fat, meal_type } = req.body;

  try {
    const existingMeal = await pool.query(
      'SELECT * FROM meals WHERE name = $1',
      [name]
    );

    if (existingMeal.rows.length > 0) {
      return res.status(400).json({ error: 'Оваа храна веќе постои.' });
    }

    const result = await pool.query(
            `INSERT INTO meals (name, quantity, unit, calories, protein, carbs, fat, meal_type)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [name, quantity, unit, calories, protein, carbs, fat, meal_type]
        );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/meals/:id', async (req, res) => {
    const { id } = req.params;
    const { name, calories } = req.body;

    try {
        const result = await pool.query(
            'UPDATE meals SET name = $1, calories = $2 WHERE id = $3 RETURNING *',
            [name, calories, id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/meals/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      'DELETE FROM meals WHERE id = $1',
      [id]
    );

    res.json({ message: 'Храната е избришана.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));