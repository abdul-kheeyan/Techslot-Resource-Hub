import mongoose from "mongoose";
import Category from "../models/Category.js";
import Resource from "../models/Resource.js";
import SiteSettings from "../models/SiteSettings.js";
import { deleteFile, downloadFile, findFile, uploadFile } from "../utils/gridfs.js";
import slugify from "../utils/slugify.js";

const resourceTypes = new Set(["PDF", "File", "Prompt", "Component", "External Link", "Tool"]);

function booleanValue(value) {
  return value === true || value === "true";
}

function validateResource(body, { hasExistingFile = false } = {}) {
  const title = String(body.title || "").trim();
  const shortDescription = String(body.shortDescription || "").trim();
  if (!title || !shortDescription || !body.category || !resourceTypes.has(body.type)) {
    const error = new Error("Title, short description, category, and a valid resource type are required.");
    error.status = 400;
    throw error;
  }
  if (["PDF", "File"].includes(body.type) && !body.file && !hasExistingFile) {
    const error = new Error("Upload a file for PDF and File resources.");
    error.status = 400;
    throw error;
  }
  if (["External Link", "Tool"].includes(body.type) && !body.externalUrl) {
    const error = new Error("An external URL is required for this resource type.");
    error.status = 400;
    throw error;
  }
  if (body.externalUrl && !/^https?:\/\//i.test(body.externalUrl)) {
    const error = new Error("External URLs must use HTTP or HTTPS.");
    error.status = 400;
    throw error;
  }
  if (body.type === "Prompt" && !body.promptContent?.trim()) {
    const error = new Error("Prompt content is required.");
    error.status = 400;
    throw error;
  }
  if (body.type === "Component" && !body.componentCode?.trim()) {
    const error = new Error("Component code is required.");
    error.status = 400;
    throw error;
  }
}

async function uploadedAssets(files = {}) {
  const result = {};
  if (files.thumbnail?.[0]) {
    const asset = await uploadFile(files.thumbnail[0], "thumbnail");
    result.thumbnailFileId = asset.id;
  }
  if (files.file?.[0]) {
    const asset = await uploadFile(files.file[0], "resource");
    result.fileId = asset.id;
  }
  return result;
}

function streamGridFile(file, res, { attachment = false } = {}) {
  const contentType = file.metadata?.contentType || "application/octet-stream";
  res.setHeader("Content-Type", contentType);
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (attachment) {
    res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(file.filename || "resource")}`);
  } else {
    res.setHeader("Cache-Control", "public, max-age=86400");
  }
  const stream = downloadFile(file._id);
  stream.once("error", (error) => {
    if (res.headersSent) res.destroy(error);
    else res.status(404).json({ message: "Stored file was not found." });
  });
  stream.pipe(res);
}

export async function listResources(req, res) {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(48, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));
  const filter = { published: true };
  if (req.query.category) {
    if (!mongoose.isValidObjectId(req.query.category)) return res.status(400).json({ message: "Invalid category filter." });
    filter.category = req.query.category;
  }
  if (req.query.type && resourceTypes.has(req.query.type)) filter.type = req.query.type;
  else if (req.query.type) return res.status(400).json({ message: "Invalid resource type filter." });
  if (req.query.featured === "true") filter.featured = true;
  const search = String(req.query.q || "").trim();
  if (search) filter.$text = { $search: search.slice(0, 100) };
  const [resources, total] = await Promise.all([
    Resource.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
      .populate("category", "name slug").lean(),
    Resource.countDocuments(filter),
  ]);
  res.json({ resources, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

export async function latestResources(_req, res) {
  const resources = await Resource.find({ published: true }).sort({ createdAt: -1 }).limit(6)
    .populate("category", "name slug").lean();
  res.json({ resources });
}

export async function featuredResources(_req, res) {
  const resources = await Resource.find({ published: true, featured: true }).sort({ createdAt: -1 }).limit(6)
    .populate("category", "name slug").lean();
  res.json({ resources });
}

export async function popularResources(_req, res) {
  const resources = await Resource.find({ published: true }).sort({ downloads: -1, createdAt: -1 }).limit(6)
    .populate("category", "name slug").lean();
  res.json({ resources });
}

export async function getResource(req, res) {
  const resource = await Resource.findOne({ slug: req.params.slug, published: true })
    .populate("category", "name slug").lean();
  if (!resource) return res.status(404).json({ message: "Resource was not found." });
  res.json({ resource });
}

export async function getResourceThumbnail(req, res) {
  const resource = await Resource.findOne({ _id: req.params.id, published: true }).select("thumbnailFileId").lean();
  if (!resource?.thumbnailFileId) return res.status(404).json({ message: "Thumbnail was not found." });
  const file = await findFile(resource.thumbnailFileId);
  if (!file) return res.status(404).json({ message: "Thumbnail was not found." });
  streamGridFile(file, res);
}

export async function listManagedResources(req, res) {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
  const [resources, total] = await Promise.all([
    Resource.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate("category", "name").lean(),
    Resource.countDocuments(),
  ]);
  res.json({ resources, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

export async function createResource(req, res) {
  validateResource(req.body, { hasExistingFile: Boolean(req.files?.file?.[0]) });
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).json({ message: "Select an existing category." });
  const assets = await uploadedAssets(req.files);
  const resource = await Resource.create({
    title: req.body.title.trim(),
    slug: slugify(req.body.title),
    shortDescription: req.body.shortDescription.trim(),
    description: req.body.description || "",
    category: category.id,
    type: req.body.type,
    thumbnail: req.body.thumbnail || "",
    thumbnailFileId: assets.thumbnailFileId || null,
    fileId: assets.fileId || null,
    externalUrl: req.body.externalUrl || "",
    componentCode: req.body.componentCode || "",
    promptContent: req.body.promptContent || "",
    featured: booleanValue(req.body.featured),
    published: booleanValue(req.body.published),
  });
  res.status(201).json({ resource });
}

export async function updateResource(req, res) {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return res.status(404).json({ message: "Resource was not found." });
  validateResource(req.body, {
    hasExistingFile: Boolean(req.files?.file?.[0] || resource.fileId),
  });
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).json({ message: "Select an existing category." });
  const assets = await uploadedAssets(req.files);
  const oldThumbnail = resource.thumbnailFileId;
  const oldFile = resource.fileId;
  resource.title = req.body.title.trim();
  resource.slug = slugify(req.body.title);
  resource.shortDescription = req.body.shortDescription.trim();
  resource.description = req.body.description || "";
  resource.category = category.id;
  resource.type = req.body.type;
  resource.externalUrl = req.body.externalUrl || "";
  resource.componentCode = req.body.componentCode || "";
  resource.promptContent = req.body.promptContent || "";
  resource.featured = booleanValue(req.body.featured);
  resource.published = booleanValue(req.body.published);
  if (assets.thumbnailFileId) resource.thumbnailFileId = assets.thumbnailFileId;
  if (assets.fileId) resource.fileId = assets.fileId;
  if (!["PDF", "File"].includes(resource.type)) resource.fileId = null;
  await resource.save();
  if (assets.thumbnailFileId && oldThumbnail) await deleteFile(oldThumbnail);
  if ((assets.fileId || !["PDF", "File"].includes(resource.type)) && oldFile) await deleteFile(oldFile);
  res.json({ resource });
}

export async function deleteResource(req, res) {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return res.status(404).json({ message: "Resource was not found." });
  if (resource.thumbnailFileId) await deleteFile(resource.thumbnailFileId);
  if (resource.fileId) await deleteFile(resource.fileId);
  await resource.deleteOne();
  res.status(204).end();
}

export async function downloadResource(req, res) {
  const resource = await Resource.findOne({ _id: req.params.id, published: true });
  if (!resource) return res.status(404).json({ message: "Resource was not found." });
  const settings = await SiteSettings.findOne({ key: "site" }).lean();
  const requireLogin = process.env.REQUIRE_LOGIN_FOR_DOWNLOADS === "true" || settings?.requireLoginForDownloads === true;
  if (requireLogin && req.auth?.role !== "user" && req.auth?.role !== "admin") {
    return res.status(401).json({ message: "Sign in to download this resource." });
  }
  if (["External Link", "Tool"].includes(resource.type)) {
    if (!resource.externalUrl) return res.status(404).json({ message: "No external resource URL is available." });
    await Resource.updateOne({ _id: resource.id }, { $inc: { downloads: 1 } });
    return res.redirect(302, resource.externalUrl);
  }
  if (!resource.fileId) return res.status(404).json({ message: "No downloadable file is available." });
  const file = await findFile(resource.fileId);
  if (!file) return res.status(404).json({ message: "Stored file was not found." });
  await Resource.updateOne({ _id: resource.id }, { $inc: { downloads: 1 } });
  streamGridFile(file, res, { attachment: true });
}
