import mongoose from 'mongoose';
import { config } from '../config';

async function migrateRequestToOrder() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db!;

    // Step 1: Check if repairrequests collection exists
    const collections = await db.listCollections({ name: 'repairrequests' }).toArray();
    if (collections.length === 0) {
      console.log('⚠️  Collection "repairrequests" does not exist. Nothing to migrate.');
      await mongoose.connection.close();
      return;
    }

    // Step 2: Drop target collection if it exists
    const targetCollections = await db.listCollections({ name: 'repairorders' }).toArray();
    if (targetCollections.length > 0) {
      console.log('🗑️  Dropping existing "repairorders" collection...');
      await db.collection('repairorders').drop();
      console.log('✅ Dropped successfully');
    }

    // Step 3: Rename collection
    console.log('🔄 Renaming collection: repairrequests → repairorders...');
    await db.collection('repairrequests').rename('repairorders');
    console.log('✅ Collection renamed successfully');

    // Step 4: Update replies collection - rename field
    console.log('🔄 Updating replies collection: repairRequestId → repairOrderId...');
    const repliesUpdateResult = await db.collection('replies').updateMany(
      { repairRequestId: { $exists: true } },
      { $rename: { repairRequestId: 'repairOrderId' } }
    );
    console.log(`✅ Updated ${repliesUpdateResult.modifiedCount} replies`);

    // Step 5: Rebuild indexes on repairorders collection
    console.log('🔄 Rebuilding indexes on repairorders collection...');
    await db.collection('repairorders').createIndex({ userId: 1 });
    await db.collection('repairorders').createIndex({ status: 1 });
    await db.collection('repairorders').createIndex({ createdAt: -1 });
    console.log('✅ Indexes rebuilt');

    // Step 6: Rebuild indexes on replies collection
    console.log('🔄 Rebuilding indexes on replies collection...');
    await db.collection('replies').createIndex({ repairOrderId: 1 });
    await db.collection('replies').createIndex({ createdAt: -1 });
    console.log('✅ Indexes rebuilt');

    // Verification
    console.log('\n📊 Verification:');
    const orderCount = await db.collection('repairorders').countDocuments();
    const replyCount = await db.collection('replies').countDocuments();
    const oldFieldCount = await db.collection('replies').countDocuments({ repairRequestId: { $exists: true } });

    console.log(`  - repairorders: ${orderCount} documents`);
    console.log(`  - replies: ${replyCount} documents`);
    console.log(`  - replies with old field (repairRequestId): ${oldFieldCount}`);

    if (oldFieldCount === 0) {
      console.log('\n✅ Migration completed successfully!');
    } else {
      console.log('\n⚠️  Warning: Some replies still have the old field name');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateRequestToOrder();
