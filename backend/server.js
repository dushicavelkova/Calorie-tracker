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
    console.log("Database initialized successfully.");
  } catch (err) {
    console.error("DB connection error. Retrying in 5s...", err);
    setTimeout(initDB, 5000);
  }
}
initDB();

// Endpoints
app.get('/api/meals', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM meals ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/meals', async (req, res) => {
  const { name, calories, protein, carbs, fat, meal_type } = req.body;

  try {
    const existingMeal = await pool.query(
      'SELECT * FROM meals WHERE name = $1',
      [name]
    );

    if (existingMeal.rows.length > 0) {
      return res.status(400).json({ error: 'Оваа храна веќе постои.' });
    }

    const result = await pool.query(
      `INSERT INTO meals (name, calories, protein, carbs, fat, meal_type)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [name, calories, protein, carbs, fat, meal_type]
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