import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { Admin } from '../models/Admin.js';
import { User } from '../models/User.js';

const seed = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB');

    // Create default super admin
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (!existingAdmin) {
      await Admin.create({
        username: 'admin',
        password: 'admin123', // Will be hashed by pre-save hook
        displayName: '系統管理員',
        avatarUrl: '',
        role: 'super_admin',
        status: 'active',
      });
      console.log('Created default admin: admin/admin123');
    } else {
      console.log('Default admin already exists');
    }

    // Create demo user
    const existingUser = await User.findOne({ displayName: 'Demo User' });
    if (!existingUser) {
      await User.create({
        displayName: 'Demo User',
        avatarUrl: 'https://via.placeholder.com/100',
        lineUserId: null,
        status: 'active',
      });
      console.log('Created demo user');
    } else {
      console.log('Demo user already exists');
    }

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
