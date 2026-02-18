import mongoose from 'mongoose';
import { config } from '../config';

async function rollbackOrderToRequest() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db!;

    // Step 1: Check if repairorders collection exists
    const collections = await db.listCollections({ name: 'repairorders' }).toArray();
    if (collections.length === 0) {
      console.log('⚠️  Collection "repairorders" does not exist. Nothing to rollback.');
      await mongoose.connection.close();
      return;
    }

    // Step 2: Rename collection back
    console.log('🔄 Renaming collection: repairorders → repairrequests...');
    await db.collection('repairorders').rename('repairrequests');
    console.log('✅ Collection renamed back successfully');

    // Step 3: Update replies collection - rename field back
    console.log('🔄 Updating replies collection: repairOrderId → repairRequestId...');
    const repliesUpdateResult = await db.collection('replies').updateMany(
      { repairOrderId: { $exists: true } },
      { $rename: { repairOrderId: 'repairRequestId' } }
    );
    console.log(`✅ Updated ${repliesUpdateResult.modifiedCount} replies`);

    // Step 4: Rebuild indexes on repairrequests collection
    console.log('🔄 Rebuilding indexes on repairrequests collection...');
    await db.collection('repairrequests').createIndex({ userId: 1 });
    await db.collection('repairrequests').createIndex({ status: 1 });
    await db.collection('repairrequests').createIndex({ createdAt: -1 });
    console.log('✅ Indexes rebuilt');

    // Step 5: Rebuild indexes on replies collection
    console.log('🔄 Rebuilding indexes on replies collection...');
    await db.collection('replies').createIndex({ repairRequestId: 1 });
    await db.collection('replies').createIndex({ createdAt: -1 });
    console.log('✅ Indexes rebuilt');

    // Verification
    console.log('\n📊 Verification:');
    const requestCount = await db.collection('repairrequests').countDocuments();
    const replyCount = await db.collection('replies').countDocuments();
    const newFieldCount = await db.collection('replies').countDocuments({ repairOrderId: { $exists: true } });

    console.log(`  - repairrequests: ${requestCount} documents`);
    console.log(`  - replies: ${replyCount} documents`);
    console.log(`  - replies with new field (repairOrderId): ${newFieldCount}`);

    if (newFieldCount === 0) {
      console.log('\n✅ Rollback completed successfully!');
    } else {
      console.log('\n⚠️  Warning: Some replies still have the new field name');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    process.exit(1);
  }
}

rollbackOrderToRequest();
