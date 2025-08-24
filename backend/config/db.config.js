import mongoose from "mongoose";
import logger from "../utils/logger.js";

export default async function connectDB() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not defined");
    await mongoose.connect(uri);
    console.log("MongoDB connected");

}