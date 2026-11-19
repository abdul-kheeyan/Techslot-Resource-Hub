import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function createToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name?.trim() || !email?.trim() || typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ message: "Name, email, and a password of at least 8 characters are required." });
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) {
    return res.status(409).json({ message: "An account with that email already exists." });
  }
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: await bcrypt.hash(password, 12),
    role: "user",
  });
  res.status(201).json({ token: createToken(user), user: { id: user.id, name: user.name, email: user.email } });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || "").trim().toLowerCase() }).select("+password");
  if (!user || user.role !== "user" || !await bcrypt.compare(String(password || ""), user.password)) {
    return res.status(401).json({ message: "Email or password is incorrect." });
  }
  res.json({ token: createToken(user), user: { id: user.id, name: user.name, email: user.email } });
}

export async function me(req, res) {
  const user = await User.findById(req.auth.sub);
  if (!user) return res.status(404).json({ message: "User account was not found." });
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
}
