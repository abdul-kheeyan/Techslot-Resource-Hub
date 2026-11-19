import mongoose from "mongoose";

const bucketName = "techslotFiles";

function getBucket() {
  if (!mongoose.connection.db) {
    const error = new Error("MongoDB must be connected before storing files.");
    error.status = 503;
    throw error;
  }
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName });
}

export function uploadFile(file, purpose) {
  const bucket = getBucket();
  const stream = bucket.openUploadStream(file.originalname, {
    metadata: { contentType: file.mimetype, purpose },
  });
  return new Promise((resolve, reject) => {
    stream.once("error", reject);
    stream.once("finish", () => resolve({ id: stream.id }));
    stream.end(file.buffer);
  });
}

export function findFile(id) {
  return getBucket().find({ _id: new mongoose.mongo.ObjectId(id) }).next();
}

export function downloadFile(id) {
  return getBucket().openDownloadStream(new mongoose.mongo.ObjectId(id));
}

export async function deleteFile(id) {
  if (!id) return;
  await getBucket().delete(new mongoose.mongo.ObjectId(id));
}
