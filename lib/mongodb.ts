import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("❌ MONGO_URI is not defined in environment variables");
}

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) return mongoose; // ✅ return mongoose if already connected

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("✅ MongoDB Connected Successfully:", mongoose.connection.host);
    return mongoose; // ✅ return mongoose connection
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
    throw error;
  }
}
