import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

const generateToken = ( id, role ) => {
    return jwt.sign( { id, role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};

export default generateToken;