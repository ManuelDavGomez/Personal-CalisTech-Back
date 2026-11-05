import express from "express";
import cors from "cors";
import { pool } from "./app/database/connection.js";
import authRoutes from "./app/routes/auth.routes.js";
import taskRoutes from "./app/routes/task.routes.js";
import statsRoutes from "./app/routes/stats.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/auth", authRoutes);
app.use("/exercises", taskRoutes);
app.use("/stats", statsRoutes);

pool.connect().then(() => {
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
});
