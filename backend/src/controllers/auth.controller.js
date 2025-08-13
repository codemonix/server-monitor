import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import generateToken from '../utils/generateToken.js';
import logger from '../utils/logger.js';


export async function register(req, res, next) {
    try {
        const {username, password, email } = req.body;
        if ( !username || !password || !email ) return res.json({ message: 'username, password and email required'});
        const exist = await User.findOne({ username });
        if ( exist ) return res.status(400).json({ message: 'Username taken'});

        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);
        const user = new User({ username, passwordHash: hash, email});
        await user.save();
        res.status(201).json({ message: 'user created successfully' });
    } catch (error) {
        console.log("error creating user:", error.message);
        next(error);
    }
}

export async function login(req, res, next) {
    try {
        const { username, password } = req.body;
        if ( !username || !password ) return res.status(400).json({ message: 'username and password required'});
        const user = await User.findOne({ username });
        if ( !user ) res.status(401).json({ message: 'invalid credentials' });
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ message: 'invalid credentials'});
        const token = generateToken( user._id.toString(), user.role );
        res.json({ token, username: user.username, role: user.role });
    } catch (error) {
        logger.error(error.message);
        next(error);

    }
}