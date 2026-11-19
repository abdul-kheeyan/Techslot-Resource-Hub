import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true, maxlength: 80, required: true },
  email: { type: String, trim: true, lowercase: true, unique: true, required: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["user", "admin"], default: "user", required: true },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
