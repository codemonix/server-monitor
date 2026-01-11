import 'dotenv/config';
import mongoose from 'mongoose';
import MetricPoints from '../models/MetricPoint.model.js';
import connectDB from '../config/db.config.js';


const BATCH_SIZE = parseInt(process.env.BACKFILL_BATCH_SIZE || '5000', 10);

function calculatePercentiles(used, total) {
    if ( used == null || total == null ) return null;
    const t = Number(total);
    if ( t === 0 ) return 0;
    return Number(((Number(used) / t ) * 100).toFixed(2));
} 


async function run() {
    await connectDB();

    const query = {
        $or: [
            { memPercent: { $exists: false}},
            { memPercent: null },
            { diskPercent: { $exists: false }},
            { diskPercent: null }
        ]
    };

    const totalCount = await MetricPoints.countDocuments(query);
    console.log(`Total documents to update: ${totalCount}`);

    if ( totalCount === 0 ) {
        console.log("No documents need updating. Exiting.");
        await mongoose.disconnect();
        process.exit(0);
    }

    const cursor = MetricPoints.find(query).lean().cursor();
    let updates = [];
    let processed = 0;

    for await ( const doc of cursor ) {
        const memPercent = calculatePercentiles(doc.memUsed, doc.memTotal);
        const diskPercent = calculatePercentiles(doc.diskUsed, doc.diskTotal);

        updates.push({
            updateOne: {
                filter: { _id: doc._id },
                update: { $set: { memPercent, diskPercent }}
            }
        });

        if ( updates.length >= BATCH_SIZE ) {
            await MetricPoints.bulkWrite(updates, { ordered: false });
            processed += updates.length;
            console.log(`Processed ${processed} / ${totalCount}`);
            updates = [];
        }
    }

    if ( updates.length > 0 ) {
        await MetricPoints.bulkWrite(updates, { ordered: false });
        processed += updates.length;
        console.log(`Processed ${processed} / ${totalCount}`);
    }
    console.log("Backfilling completed.");




    await mongoose.disconnect();
    console.log(" Migration done")
    console.log("Disconnected from DB");
    process.exit(0);
}

run().catch(err => {
    console.error("Migration failed:", err);
    process.exit(1);
})


