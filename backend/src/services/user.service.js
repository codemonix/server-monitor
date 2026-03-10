import User from "../models/User.model.js";
import RefreshToken from "../models/RefreshToken.model.js";
import logger from "../utils/logger.js";


const SUPPER_ADMIN_EMAIL = process.env.SUPPER_ADMIN_EMAIL || 'admin@srm.com';

export async function checkAdminExist() {
    try {
        const count = await User.countDocuments({ role: 'admin' });
        return count > 0;
    } catch (error) {
        logger.error("user.service.js -> checkAdminExist ->", {error: error.message});
        throw error;
    }
}


export async function createInitialAdmin({ email, password }) {
    if (await checkAdminExist()) {
        throw new Error('Admin already exists');
    }

    const user = new User({ email, role: 'admin' });
    await user.setPassword(password);
    await user.save();
    logger.info("user.service.js -> Initial admin created:", {email});
    const { passwordHash, ...safeUser } = user.toObject();
    return safeUser;

}

export async function getAllUsers() {
    try {
        const users = await User.find({}, {passwordHash: 0}).sort({ createdAt: -1 });
        return users;
    } catch (error) {
        logger.error("user.service.js -> getAllUsers ->", {error: error.message});
        throw error;
    }
}

export async function createNewUser({email, password, role}, creatorEmail) {
    const existing = await User.findOne({ email });
    if (existing) {
        logger.warn("user.service.js -> createNewUser -> User (email) already exists:", {email});
        throw new Error('User (email) already exists');
    }

    const user = new User({ email, role: role || 'viewer' });
    await user.setPassword(password);
    await user.save();
    
    logger.info('user.service.js -> User created:', {email: email, by: creatorEmail});

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

    await RefreshToken.deleteMany({ user: userId });

    await User.findByIdAndDelete(userId);
    logger.info('user.service.js -> User deleted:', {user: userToDelete.email, by: requestorId});
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
    
    logger.info('user.service.js -> User role updated:', {user: userToUdate.email, to: newRole, by: requestorId});

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

    // remove all current sessions
    await RefreshToken.deleteMany({ user: userId });

    logger.info('user.service.js -> User password updated for:', {user: user.email});
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
    logger.info('user.service.js -> User password reset for:', {user: user.email, by: requestorId});
    return true;
}