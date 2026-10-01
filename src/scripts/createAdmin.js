import bcrypt from "bcrypt";
import { pool } from "../app/database/connection.js";

const run = async () => {
  const email = "admin@calistech.com";
  const password = await bcrypt.hash("admin123", 10);

  await pool.query(
    `
      INSERT INTO users (username, email, password, role)
      VALUES ('admin', $1, $2, 'admin')
      ON CONFLICT (email) DO NOTHING
    `,
    [email, password],
  );

  console.log("Admin listo:", email);
  process.exit(0);
};

run().catch((error) => {
  console.error("Error creando admin:", error);
  process.exit(1);
});
