import express from "express";
import cors from "cors";
import { pool } from "./app/database/connection.js";
import authRoutes from "./app/routes/auth.routes.js";
import taskRoutes from "./app/routes/task.routes.js";
import statsRoutes from "./app/routes/stats.routes.js";
import workoutRoutes from "./app/routes/workout.routes.js";

const app = express();
const port = Number(process.env.PORT) || 3000;
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/auth", authRoutes);
app.use("/exercises", taskRoutes);
app.use("/stats", statsRoutes);
app.use("/workouts", workoutRoutes);

const startServer = async () => {
  const client = await pool.connect();
  client.release();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS workouts (
      id UUID PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      date TIMESTAMPTZ NOT NULL,
      duration_seconds INTEGER NOT NULL CHECK (duration_seconds >= 0),
      exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(
    "CREATE INDEX IF NOT EXISTS workouts_user_date_idx ON workouts (user_id, date DESC)",
  );
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error("No se pudo iniciar el servidor o preparar la base de datos:", error);
  process.exit(1);
});
