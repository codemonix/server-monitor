import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: String,
    role: {
        type: String,
        enum: ["viewer", "admin"],
        default: "viewer"
    }
}, { timestamps: true })

userSchema.methods.setPassword = async function (password) {
    this.passwordHash = await bcrypt.hash(password, 10);
}

userSchema.methods.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.passwordHash);
}

export default mongoose.model("User", userSchema);
