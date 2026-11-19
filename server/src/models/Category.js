import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, trim: true, maxlength: 80, unique: true, required: true },
  slug: { type: String, unique: true, required: true },
  description: { type: String, trim: true, maxlength: 300, default: "" },
}, { timestamps: true });

export default mongoose.model("Category", categorySchema);
