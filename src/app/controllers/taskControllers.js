import { pool } from "../database/connection.js";

const parseCommaSeparatedList = (value) => {
  if (value === undefined || value === null || value === "") return [];

  const items = typeof value === "string" ? value.split(",") : value;
  if (!Array.isArray(items) || !items.every((item) => typeof item === "string")) {
    return null;
  }

  return items.map((item) => item.trim()).filter(Boolean);
};

export const getExercises = async (req, res) => {
  try {
    const { musculos, dificultad, texto, pasos } = req.query;

    let query = `SELECT * FROM skills WHERE 1=1`;
    const values = [];

    if (texto) {
      values.push(`%${texto}%`);
      query += ` AND nombre ILIKE $${values.length}`;
    }

    if (musculos) {
      values.push(musculos);
      query += ` AND $${values.length} = ANY(musculos)`;
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
  const {
    nombre,
    musculos,
    dificultad,
    url_img,
    categorias,
    pasos,
    descripcion,
    materiales
  } = req.body;

  // Convertir los textos recibidos en listas
  const parsedLists = {
    musculos: parseCommaSeparatedList(musculos),
    categorias: parseCommaSeparatedList(categorias),
    pasos: parseCommaSeparatedList(pasos),
    materiales: parseCommaSeparatedList(materiales),
  };

  // Validar las listas
  if (Object.values(parsedLists).some((value) => value === null)) {
    return res.status(400).json({
      message: "Músculos, categorías, pasos y materiales deben ser texto o listas de texto.",
    });
  }

  console.log("Parsed lists:", parsedLists);

  // Convertir las listas a formato JSON
  const jsonLists = {
    musculos: JSON.stringify(parsedLists.musculos),
    categorias: JSON.stringify(parsedLists.categorias),
    pasos: JSON.stringify(parsedLists.pasos),
    materiales: JSON.stringify(parsedLists.materiales),
  };

  try {
    const newTask = await pool.query(
      `INSERT INTO skills
      (nombre, musculos, dificultad, url_img, categorias, pasos, descripcion, materiales)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        nombre,
        jsonLists.musculos,
        dificultad,
        url_img,
        jsonLists.categorias,
        jsonLists.pasos,
        descripcion,
        jsonLists.materiales,
      ]
    );

    res.json(newTask.rows[0]);

  } catch (error) {
    console.error("Error creando ejercicio:", error);

    res.status(500).json({
      message: "Error creando ejercicio."
    });
  }
};
