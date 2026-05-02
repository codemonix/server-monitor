import 'dotenv/config';
import mongoose from 'mongoose';
import MetricPoints from '../models/MetricPoint.model.js';
import connectDB from '../config/db.config.js';


const BATCH_SIZE = parseInt(process.env.BACKFILL_BATCH_SIZE || '5000', 10);


async function run() {
    await connectDB();

    const query = {
        ts: { $exists: false },
        createdAt: { $exists: true }
    }

    const totalCount = await MetricPoints.countDocuments(query);
    console.log(`Total documents to update: ${totalCount}`);

    if ( totalCount === 0 ) {
        console.log("No documents need updating. Exiting.");
        await mongoose.disconnect();
        process.exit(0);
    }

    const result = await MetricPoints.updateMany(
        query,
        [
            { $set: { ts: "$createdAt" } }
        ]
    );

    console.log(`ts Backfilling completed, Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}.`);




    await mongoose.disconnect();
    console.log(" Migration done")
    console.log("Disconnected from DB");
    process.exit(0);
}

run().catch(err => {
    console.error("Migration failed:", err);
    process.exit(1);
})


