import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

let isConnected = false;

export async function connectToDB() {
  if (isConnected) return;



  
  try {
    await mongoose.connect(process.env.DATABASE_CONNECTION);

    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw new Error("MongoDB connection failed");
  }
}
