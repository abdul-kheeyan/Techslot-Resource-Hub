import Category from "../models/Category.js";
import Resource from "../models/Resource.js";
import slugify from "../utils/slugify.js";

export async function listCategories(_req, res) {
  const categories = await Category.find().sort({ name: 1 }).lean();
  res.json({ categories });
}

export async function createCategory(req, res) {
  const name = String(req.body.name || "").trim();
  if (!name) return res.status(400).json({ message: "Category name is required." });
  const category = await Category.create({ name, slug: slugify(name), description: req.body.description || "" });
  res.status(201).json({ category });
}

export async function updateCategory(req, res) {
  const name = String(req.body.name || "").trim();
  if (!name) return res.status(400).json({ message: "Category name is required." });
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name, slug: slugify(name), description: req.body.description || "" },
    { new: true, runValidators: true },
  );
  if (!category) return res.status(404).json({ message: "Category was not found." });
  res.json({ category });
}

export async function deleteCategory(req, res) {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: "Category was not found." });
  if (await Resource.exists({ category: category.id })) {
    return res.status(409).json({ message: "Move or delete this category's resources before removing it." });
  }
  await category.deleteOne();
  res.status(204).end();
}
