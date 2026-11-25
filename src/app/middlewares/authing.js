import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const cookie = req.headers.cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("calistech_session="));
  const cookieToken = cookie ? cookie.slice("calistech_session=".length) : null;
  const token = cookieToken || req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const secret = process.env.CALISTECH_SECRET_KEY || process.env.JWT_SECRET || "dev-secret";
    const verified = jwt.verify(token, secret);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  if ((req.user.role || "").toString().toLowerCase() !== "admin") {
    return res
      .status(403)
      .json({ message: "Acceso restringido: requiere ser administrador" });
  }

  next(); // Si es admin, continúa al controlador
};
