//Run: npm run seed

import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import { config } from "../config/index.js";
import User from "../models/user.model.js";
import logger from "./logger.js";

async function run() {
    await mongoose.connect(config.mongoUri);
    const username = process.env.SEED_ADMIN_USER || 'admin';
    const password = process.env.SEED_ADMIN_PASS || 'admin123';
    const existing = await User.findOne({ username });
    if ( existing ) {
        logger.info('Admin user already exist');
        process.exit(0);
    }
    const hashedPass = await bcrypt.hash( password, 10 );
    const usr = new User({ username, passwordHash: hashedPass, role: 'admin' });
    await usr.save();
    logger.info('Created admin user:', username );
    process.exit(0);
}

run().catch((error) => { logger.error(error); process.exit(1); });