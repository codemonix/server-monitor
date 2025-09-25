import mongoose from "mongoose"; 
import User from "../models/User.model.js";
import dotenv from 'dotenv';
dotenv.config();
const MONGO_URI =  process.env.MONGO_URI || 'mongodb://localhost:27017/server_monitor';

await mongoose.connect(MONGO_URI);
const user = await User.findOne({ email: 'admin@srm.com' });
if (!user) {
    console.log("User not found");
    process.exit(1);
}
await user.setPassword('admin123');
await user.save();
mongoose.disconnect();

console.log("Password updated for email:", user.email);