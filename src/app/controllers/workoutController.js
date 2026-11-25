import { randomUUID } from "node:crypto";
import { pool } from "../database/connection.js";

const isValidWorkout = (workout) =>
  workout &&
  typeof workout.name === "string" &&
  workout.name.trim().length > 0 &&
  typeof workout.date === "string" &&
  Number.isFinite(Date.parse(workout.date)) &&
  Number.isInteger(workout.durationSeconds) &&
  workout.durationSeconds >= 0 &&
  Array.isArray(workout.exercises) &&
  workout.exercises.every(
    (exercise) =>
      typeof exercise === "object" &&
      exercise !== null &&
      typeof exercise.id === "string" &&
      typeof exercise.name === "string" &&
      typeof exercise.difficulty === "string" &&
      typeof exercise.image === "string" &&
      Array.isArray(exercise.sets) &&
      exercise.sets.every(
        (set) =>
          typeof set === "object" &&
          set !== null &&
          typeof set.reps === "number" &&
          Number.isFinite(set.reps) &&
          set.reps >= 0 &&
          typeof set.weight === "number" &&
          Number.isFinite(set.weight) &&
          set.weight >= 0,
      ) &&
      (exercise.muscles === undefined ||
        (Array.isArray(exercise.muscles) &&
          exercise.muscles.every((muscle) => typeof muscle === "string"))) &&
      (exercise.setsCompleted === undefined ||
        (Number.isInteger(exercise.setsCompleted) && exercise.setsCompleted >= 0)),
  );

export const getWorkouts = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, date, duration_seconds, exercises
       FROM workouts
       WHERE user_id = $1
       ORDER BY date DESC`,
      [req.user.id],
    );

    res.json(
      rows.map((row) => ({
        id: row.id,
        userId: String(req.user.id),
        name: row.name,
        date: row.date.toISOString(),
        durationSeconds: row.duration_seconds,
        exercises: row.exercises,
      })),
    );
  } catch (error) {
    console.error("Error al consultar entrenamientos:", error);
    res.status(500).json({ message: "No se pudieron cargar los entrenamientos" });
  }
};

export const createWorkout = async (req, res) => {
  const workout = req.body;

  if (!isValidWorkout(workout)) {
    return res.status(400).json({ message: "Los datos del entrenamiento no son válidos" });
  }

  try {
    const id = randomUUID();
    const { rows } = await pool.query(
      `INSERT INTO workouts (id, user_id, name, date, duration_seconds, exercises)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, date, duration_seconds, exercises`,
      [
        id,
        req.user.id,
        workout.name.trim(),
        workout.date,
        workout.durationSeconds,
        JSON.stringify(workout.exercises),
      ],
    );
    const row = rows[0];

    res.status(201).json({
      id: row.id,
      userId: String(req.user.id),
      name: row.name,
      date: row.date.toISOString(),
      durationSeconds: row.duration_seconds,
      exercises: row.exercises,
    });
  } catch (error) {
    console.error("Error al guardar entrenamiento:", error);
    res.status(500).json({ message: "No se pudo guardar el entrenamiento" });
  }
};
