import { pool } from "../database/connection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const sessionCookie = (token, maxAge) => {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `calistech_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
};

export const getCurrentUser = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, role FROM users WHERE id = $1",
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "La sesión ya no es válida" });
    }

    return res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Error al consultar el usuario autenticado:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const logoutUser = (_req, res) => {
  res.setHeader("Set-Cookie", sessionCookie("", 0));
  res.status(204).end();
};

const ensureRoleColumn = async () => {
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user'
  `);
};

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    await ensureRoleColumn();

    const UserExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (UserExists.rows.length > 0) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, 'user') RETURNING id, username, email, role",
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

    await ensureRoleColumn();

    const result = await pool.query(
      "SELECT id, username, email, password, role FROM users WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        error: "Contraseña incorrecta",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || "user",
      },
      process.env.CALISTECH_SECRET_KEY || process.env.JWT_SECRET || "dev-secret",
      {
        expiresIn: "1h",
      },
    );

    res.setHeader("Set-Cookie", sessionCookie(token, 3600));
    res.json({
      message: "Login exitoso",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || "user",
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error del servidor",
    });
  }
};

