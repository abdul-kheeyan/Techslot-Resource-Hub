import jwt from "jsonwebtoken";

function tokenPayload(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(header.slice(7), process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function requireUser(req, res, next) {
  const payload = tokenPayload(req);
  if (!payload || payload.role !== "user") {
    return res.status(401).json({ message: "A valid user session is required." });
  }
  req.auth = payload;
  next();
}

export function requireAdmin(req, res, next) {
  const payload = tokenPayload(req);
  if (!payload || payload.role !== "admin") {
    return res.status(401).json({ message: "Admin authentication is required." });
  }
  req.auth = payload;
  next();
}

export function optionalAuth(req, _res, next) {
  req.auth = tokenPayload(req);
  next();
}
