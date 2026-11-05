import { pool } from "../database/connection.js";

export const getStats = async (req, res) => {
  try {
    // 1. El query SQL para contar todos los registros de la tabla users
    const query = "SELECT COUNT(*) AS total FROM users";

    // 2. Ejecutamos la consulta en PostgreSQL
    const result = await pool.query(query);

    // 3. PostgreSQL devuelve el COUNT como texto (ej: "2"), lo pasamos a número entero
    const totalUsers = parseInt(result.rows[0].total, 10);

    // 4. Enviamos la respuesta en formato JSON lista para tus estadísticas
    return res.status(200).json({
      success: true,
      metric: "total_users",
      value: totalUsers,
    });
  } catch (error) {
    console.error("Error al consultar la base de datos:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener el total de usuarios",
    });
  }
};

export const getExcerciseStats = async (req, res) => {
  try {
    // 1. El query SQL para contar todos los registros de la tabla skills
    const query = "SELECT COUNT(*) AS total FROM skills";

    // 2. Ejecutamos la consulta en PostgreSQL
    const result = await pool.query(query);

    // 3. PostgreSQL devuelve el COUNT como texto (ej: "2"), lo pasamos a número entero
    const totalExcercises = parseInt(result.rows[0].total, 10);

    // 4. Enviamos la respuesta en formato JSON lista para tus estadísticas
    return res.status(200).json({
      success: true,
      metric: "total_excercises",
      value: totalExcercises,
    });
  } catch (error) {
    console.error("Error al consultar la base de datos:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener el total de ejercicios",
    });
  }
};
