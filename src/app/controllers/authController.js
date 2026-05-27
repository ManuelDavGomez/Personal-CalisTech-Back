import { pool } from "../database/connection.js";
import bcrypt from "bcrypt";
import express from "express";

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
