import { pool } from "../database/connection.js";

export const getExercises = async (req, res) => {
  try {
    const { musculos, dificultad } = req.query;

    let query = `SELECT * FROM skills WHERE 1=1`;
    const values = [];

    if (musculos) {
      values.push(musculos);
      query += ` AND musculos = $${values.length}`;
    }

    if (dificultad) {
      values.push(dificultad);
      query += ` AND dificultad = $${values.length}`;
    }

    query += ` ORDER BY nombre ASC`;

    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error obteniendo ejercicios",
    });
  }
};

export const createTask = async (req, res) => {
  const { nombre, musculos, dificultad, url_img } = req.body;
  try {
    const newTask = await pool.query(
      "INSERT INTO skills (nombre, musculos, dificultad, url_img) VALUES ($1, $2, $3, $4) RETURNING *",
      [nombre, musculos, dificultad, url_img],
    );
    res.json(newTask.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
