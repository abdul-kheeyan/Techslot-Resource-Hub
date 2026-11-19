import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema({
  key: { type: String, default: "site", unique: true, required: true },
  requireLoginForDownloads: { type: Boolean, default: false },
  siteName: { type: String, default: "TECHSLOT" },
  socialLinks: {
    instagram: { type: String, default: "" },
  },
}, { timestamps: true });

export default mongoose.model("SiteSettings", siteSettingsSchema);
