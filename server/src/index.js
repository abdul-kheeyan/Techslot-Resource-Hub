import dotenv from "dotenv";
import { readFile } from "node:fs/promises";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Category from "./models/Category.js";
import Resource from "./models/Resource.js";
import User from "./models/User.js";
import app from "./app.js";

dotenv.config();

const port = Number(process.env.PORT) || 5000;

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  throw new Error("MONGO_URI and JWT_SECRET must be set in the server environment.");
}

await mongoose.connect(process.env.MONGO_URI);
console.log("Connected to MongoDB.");

const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;
if (!adminEmail || !adminPassword || adminPassword.length < 12) {
  throw new Error("Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters.");
}
const admin = await User.findOne({ email: adminEmail }).select("+password");
if (!admin) {
  await User.create({
    name: "TECHSLOT Admin",
    email: adminEmail,
    password: await bcrypt.hash(adminPassword, 12),
    role: "admin",
  });
} else if (admin.role !== "admin") {
  throw new Error("ADMIN_EMAIL is already registered as a standard user. Use a separate admin email.");
} else if (!await bcrypt.compare(adminPassword, admin.password)) {
  admin.password = await bcrypt.hash(adminPassword, 12);
  await admin.save();
  console.log("Admin password synchronized with the configured environment.");
}

if (await Category.countDocuments() === 0) {
  await Category.insertMany([
    { name: "PDFs & Notes", slug: "pdfs-notes" },
    { name: "DSA Resources", slug: "dsa-resources" },
    { name: "React Components", slug: "react-components" },
    { name: "UI Components", slug: "ui-components" },
    { name: "AI Prompts", slug: "ai-prompts" },
    { name: "Developer Tools", slug: "developer-tools" },
    { name: "Templates", slug: "templates" },
    { name: "Cheat Sheets", slug: "cheat-sheets" },
    { name: "Other Resources", slug: "other-resources" },
  ]);
}

const reactComponentsCategory = await Category.findOneAndUpdate(
  { slug: "react-components" },
  { $setOnInsert: { name: "React Components", slug: "react-components" } },
  { upsert: true, new: true },
);
const glassFolderCode = await readFile(
  new URL("../../client/src/components/ui/glass-folder-cards.tsx", import.meta.url),
  "utf8",
);
await Resource.updateOne(
  { slug: "glass-folder-cards" },
  {
    $setOnInsert: {
      title: "Glass Folder Cards",
      slug: "glass-folder-cards",
      shortDescription: "Interactive frosted-glass folders with animated file stacks and generated artwork.",
      description: "A self-contained React and TypeScript component. Hover to tilt the glass, click to open the folder, use + to add a file, or use the menu button for folder actions. The artwork is generated locally, and an image prop is available for custom artwork.",
      category: reactComponentsCategory._id,
      type: "Component",
      thumbnail: "/images/glass-folder-cards.png",
      componentCode: glassFolderCode,
      featured: true,
      published: true,
    },
  },
  { upsert: true },
);

app.listen(port, () => {
  console.log(`TECHSLOT API listening on port ${port}.`);
});
