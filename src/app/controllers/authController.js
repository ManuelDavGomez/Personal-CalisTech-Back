import { pool } from "../database/connection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    //verificar si existe email
    const UserExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (UserExists.rows.length > 0) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    //encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    //insertar usuario
    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id",
      [username, email, hashedPassword],
    );

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // buscar usuario
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    // verificar si existe
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    const user = result.rows[0];

    // comparar password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        error: "Contraseña incorrecta",
      });
    }

    // crear token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.CALISTECH_SECRET_KEY,
      {
        expiresIn: "1h",
      },
    );

    // responder
    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error del servidor",
    });
  }
};
