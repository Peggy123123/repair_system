import mongoose from 'mongoose';
import { config } from '../config/index.js';

async function migrateAddUserPoints() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db!;

    // Update all existing users to add points and memberSince fields
    console.log('🔄 Adding points and memberSince fields to existing users...');

    const updateResult = await db.collection('users').updateMany(
      {
        $or: [
          { points: { $exists: false } },
          { memberSince: { $exists: false } }
        ]
      },
      {
        $set: {
          points: 0,
          // Set memberSince to createdAt if it exists, otherwise use current date
        },
        $setOnInsert: {
          memberSince: new Date()
        }
      }
    );

    // For users with createdAt, set memberSince to createdAt
    console.log('🔄 Setting memberSince to createdAt for existing users...');
    const usersWithCreatedAt = await db.collection('users').find({
      createdAt: { $exists: true },
      memberSince: { $exists: false }
    }).toArray();

    for (const user of usersWithCreatedAt) {
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { memberSince: user.createdAt } }
      );
    }

    console.log(`✅ Updated ${updateResult.modifiedCount} users with new fields`);
    console.log(`✅ Set memberSince for ${usersWithCreatedAt.length} users based on createdAt`);

    console.log('✅ Migration completed successfully');
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

migrateAddUserPoints();
