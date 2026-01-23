import User from "../models/User.model.js";
import logger from "../utils/logger.js";

const SUPPER_ADMIN_EMAIL = process.env.SUPPER_ADMIN_EMAIL || 'admin@srm.com';

export async function getAllUsers() {
    return await User.find({}, {passwordHash: 0}).sort({ createdAt: -1 });
}

export async function createNewUser({email, password, role}, creatorEmail) {
    const existing = await User.findOne({ email });
    if (existing) {
        throw new Error('User (email) already exists');
    }

    const user = new User({ email, role: role || 'viewer' });
    await user.setPassword(password);
    await user.save();
    
    logger(`user.service.js -> User created: ${email} by ${creatorEmail}`);

    const { passwordHash, ...safeUser } = user.toObject();
    return safeUser;
}

export async function deleteUserById(userId, requestorId) {
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
        throw new Error('User not found');
    }

    if (userToDelete._id.toString() === requestorId) {
        throw new Error("You cannot delete your own account.");
    }

    if (userToDelete.email === SUPPER_ADMIN_EMAIL) {
        throw new Error("You cannot delete the super admin account.");
    }

    await User.findByIdAndDelete(userId);
    logger(`user.service.js -> User deleted: ${userToDelete.email} by ${requestorId}`);
    return true;
    
}

export async function updateUserRole(userId, newRole, requestorId) {
    const userToUdate = await User.findById(userId);
    if (!userToUdate) throw new Error('User not found');

    if (userToUdate.email === SUPPER_ADMIN_EMAIL) {
        throw new Error("You cannot change the super admin's role.");
    }

    if (userToUdate._id.toString() === requestorId) {
        throw new Error("You cannot change your own role.");
    }

    userToUdate.role = newRole;
    await userToUdate.save();
    
    logger(`user.service.js -> User role updated: ${userToUdate.email} to ${newRole} by ${requestorId}`);

    const { passwordHash, ...safeUser } = userToUdate.toObject();
    return safeUser;
}

export async function changeUserPassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const isValid = await user.validatePassword(currentPassword);
    if (!isValid) throw new Error('Current password is incorrect');

    await user.setPassword(newPassword);
    await user.save();
    logger(`user.service.js -> User password updated for: ${user.email}`);
    return true;
}

export async function resetUserPassword(userId, newPassword, requestorId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (user.email === SUPPER_ADMIN_EMAIL) {
        throw new Error("You cannot reset the super admin's password.");
    }

    await user.setPassword(newPassword);
    await user.save();
    logger(`user.service.js -> User password reset for: ${user.email} by ${requestorId}`);
    return true;
}