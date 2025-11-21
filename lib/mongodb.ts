import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
let isConnected = false;

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (isConnected) {
    return mongoose;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    return mongoose;
  } catch (error) {
    console.error("Database connection failed", error);
    throw new Error("Database connection failed");
  }
}
