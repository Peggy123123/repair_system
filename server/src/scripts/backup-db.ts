import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { config } from '../config';

const BACKUP_DIR = path.join(__dirname, '../../backups');

async function backupDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Connected to MongoDB');

    // Ensure backup directory exists
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);

    // Create backup directory for this specific backup
    fs.mkdirSync(backupPath, { recursive: true });

    // Backup repairrequests collection
    console.log('📦 Backing up repairrequests collection...');
    const repairRequests = await mongoose.connection.db!
      .collection('repairrequests')
      .find({})
      .toArray();

    fs.writeFileSync(
      path.join(backupPath, 'repairrequests.json'),
      JSON.stringify(repairRequests, null, 2)
    );
    console.log(`✅ Backed up ${repairRequests.length} repair requests`);

    // Backup replies collection
    console.log('📦 Backing up replies collection...');
    const replies = await mongoose.connection.db!
      .collection('replies')
      .find({})
      .toArray();

    fs.writeFileSync(
      path.join(backupPath, 'replies.json'),
      JSON.stringify(replies, null, 2)
    );
    console.log(`✅ Backed up ${replies.length} replies`);

    // Save backup metadata
    const metadata = {
      timestamp,
      collections: {
        repairrequests: repairRequests.length,
        replies: replies.length
      }
    };
    fs.writeFileSync(
      path.join(backupPath, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    console.log(`\n✅ Backup completed successfully!`);
    console.log(`📁 Backup location: ${backupPath}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

backupDatabase();
