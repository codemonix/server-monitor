import mongoose from "mongoose";
import logger from "../utils/logger.js";


export default async function connectDB() {

    const uri = process.env.MONGODB_URI;
    console.log("Connecting to MongoDB...");
    console.log("MONGODB_URI:", uri);
    logger.debug("Connecting to MongoDB...");
    logger.debug("MONGODB_URI:", uri);
    if (!uri) throw new Error("MONGODB_URI is not defined");
    await mongoose.connect(uri);
    logger.info("MongoDB connected");

}