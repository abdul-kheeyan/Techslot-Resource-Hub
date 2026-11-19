import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Category from "../models/Category.js";
import Resource from "../models/Resource.js";
import SiteSettings from "../models/SiteSettings.js";
import User from "../models/User.js";

export async function login(req, res) {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const user = await User.findOne({ email }).select("+password");
  if (!user || user.role !== "admin" || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ message: "Email or password is incorrect." });
  }
  const token = jwt.sign({ sub: user.id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "8h" });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
}

export async function dashboard(_req, res) {
  const [resources, categories, downloads, users, recentResources] = await Promise.all([
    Resource.countDocuments(),
    Category.countDocuments(),
    Resource.aggregate([{ $group: { _id: null, total: { $sum: "$downloads" } } }]),
    User.countDocuments({ role: "user" }),
    Resource.find().sort({ createdAt: -1 }).limit(5).populate("category", "name").lean(),
  ]);
  res.json({
    totals: { resources, categories, downloads: downloads[0]?.total || 0, users },
    recentResources,
  });
}

export async function getSettings(_req, res) {
  const settings = await SiteSettings.findOneAndUpdate(
    { key: "site" },
    { $setOnInsert: { key: "site" } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  res.json({ settings });
}

export async function updateSettings(req, res) {
  const settings = await SiteSettings.findOneAndUpdate(
    { key: "site" },
    { $set: { requireLoginForDownloads: req.body.requireLoginForDownloads === true } },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
  );
  res.json({ settings });
}
