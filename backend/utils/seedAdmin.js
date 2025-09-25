import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.model.js';

dotenv.config();
const MONGO_URI =  process.env.MONGO_URI || 'mongodb://localhost:27017/server_monitor';

(async () => {
    await mongoose.connect(MONGO_URI);
    const email = 'admin@srm.com';
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);

    let user = await User.findOne({ email });
    if (!user) {
        user = new User({ email, passwordHash, role: 'admin' });
        await user.save();
        console.log(`Admin created: ${email}`);
    } else if ( user.role !== 'admin' ) {
        user.role = 'admin';
        await user.save();
        console.log('Admin role set for existing user:', email );
    } else {
        console.log( 'Admin already exist:', email );
    }
    await mongoose.disconnect()
})().catch( err => console.error("Error seeding admin user:", err) );