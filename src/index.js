import express from "express";
import cors from "cors";
import { pool } from "./app/database/connection.js";
import authRoutes from "./app/routes/authRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {   
  res.send("Hello, World!");
});

app.use("/auth", authRoutes);

pool.connect().then(() => {
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
});
