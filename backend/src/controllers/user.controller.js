import * as userServices from '../services/user.service.js';
import logger from '../utils/logger.js';

export async function listUsers(req,res) {
    try {
        const users = await userServices.getAllUsers();
        res.json(users);
    } catch (error) {
        logger("user.service.js -> listUsers -> error:", error.message);
        res.status(500).json({ error: 'Failed to list users' });  
    }
}

export async function createUser(req,res) {
    try {
        const user = await userServices.createNewUser(req.body, req.user.email);
        res.status(201).json(user);
    } catch (error) {
        logger("user.service.js -> createUser -> error:", error.message);
        const status = error.message === 'User (email) already exists' ? 400 : 500;
        res.status(status).json({ error: error.message });  
    }
}

export async function deleteUser(req,res) {
    try {
        await userServices.deleteUserById(req.params.id, req.user.sub);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        logger("user.service.js -> deleteUser -> error:", error.message);
        const status = error.message.includes("cannot") ? 403 : 500;
        res.status(status).json({ error: error.message });  
    }
}

export async function updateUserRole(req,res) {
    try {
        const { role } = req.body;
        if (!['admin', 'viewer'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        await userServices.updateUserRole(req.params.id, role, req.user.sub);
        res.json({ message: 'User role updated successfully' });
    } catch (error)  {
        logger("user.service.js -> updateUserRole -> error:", error.message);
        const status = error.message.includes("cannot") ? 403 : 500;
        res.status(status).json({ error: error.message });  
    }
    
}