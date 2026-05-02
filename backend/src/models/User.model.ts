import mongoose, { Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
    email: string;
    passwordHash?: string | null;
    role: "viewer" | "admin";
}

export interface IUserMethods {
    setPassword(password: string): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
}

type UserModel = Model<IUser, object, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        passwordHash: String,
        role: {
            type: String,
            enum: ["viewer", "admin"],
            default: "viewer",
        },
    },
    { timestamps: true }
);

userSchema.methods.setPassword = async function (password: string) {
    this.passwordHash = await bcrypt.hash(password, 10);
};

userSchema.methods.validatePassword = async function (password: string) {
    if (!this.passwordHash) {
        throw new Error("PasswordHash is missing for this user!!");
    }
    return await bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model<IUser, UserModel>("User", userSchema);
