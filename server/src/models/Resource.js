import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  title: { type: String, trim: true, maxlength: 160, required: true },
  slug: { type: String, unique: true, required: true, index: true },
  shortDescription: { type: String, trim: true, maxlength: 300, required: true },
  description: { type: String, trim: true, maxlength: 10000, default: "" },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
  type: { type: String, enum: ["PDF", "File", "Prompt", "Component", "External Link", "Tool"], required: true, index: true },
  thumbnail: { type: String, default: "" },
  thumbnailFileId: { type: mongoose.Schema.Types.ObjectId, default: null },
  fileUrl: { type: String, default: "" },
  fileId: { type: mongoose.Schema.Types.ObjectId, default: null },
  externalUrl: { type: String, default: "" },
  componentCode: { type: String, default: "" },
  promptContent: { type: String, default: "" },
  downloads: { type: Number, default: 0, min: 0 },
  featured: { type: Boolean, default: false, index: true },
  published: { type: Boolean, default: false, index: true },
}, { timestamps: true });

resourceSchema.index({ title: "text", shortDescription: "text", description: "text" });

export default mongoose.model("Resource", resourceSchema);
