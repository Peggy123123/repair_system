import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { Admin } from '../models/Admin.js';
import { User } from '../models/User.js';
import { RepairOrder } from '../models/RepairOrder.js';

const categories = [
  '硬體故障',
  '軟體問題',
  '系統重灌',
  '網路問題',
  '資料救援',
  '筆電 - 螢幕損壞',
  '電腦 - 當機',
  'MAC - 主機板維修',
];

const deviceTypes = ['mac', 'laptop', 'computer', 'other'];
const statuses = ['pending', 'in_progress', 'repairing', 'completed', 'cancelled'];

const sampleTitles = [
  '電腦無法開機',
  'Windows 藍屏錯誤',
  'Windows 重灌',
  '網路連線不穩定',
  '硬碟資料救援',
  '筆電螢幕破裂',
  '電腦頻繁當機',
  'MacBook 無法充電',
  '鍵盤按鍵失靈',
  '系統運作緩慢',
  '無法安裝軟體',
  '印表機連線問題',
  '記憶體不足',
  'USB 接口不能用',
  '風扇異常噪音',
];

const sampleDescriptions = [
  '按下電源鍵沒有反應，風扇也不轉動',
  'Windows 更新後出現藍屏錯誤',
  '需要重灌作業系統，保留重要資料',
  '網路連線不穩定，經常斷線，影響工作',
  '硬碟損壞，需要救援重要檔案',
  '螢幕不小心摔到，出現裂痕',
  '使用一段時間後會自動當機',
  '插上充電器沒有反應，電池無法充電',
  '部分鍵盤按鍵無法正常使用',
  '開機和執行程式都非常慢',
];

const seed = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB');

    // 1. Create admin if not exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    let admin;
    if (!existingAdmin) {
      admin = await Admin.create({
        username: 'admin',
        password: 'admin123',
        displayName: '系統管理員',
        avatarUrl: '',
        role: 'super_admin',
        status: 'active',
      });
      console.log('✓ Created admin: admin/admin123');
    } else {
      admin = existingAdmin;
      console.log('✓ Admin already exists');
    }

    // 2. Create test users (12 users to test pagination)
    console.log('\nCreating test users...');
    const users = [];
    for (let i = 1; i <= 12; i++) {
      const existingUser = await User.findOne({ displayName: `測試使用者${i}` });
      if (existingUser) {
        users.push(existingUser);
      } else {
        const user = await User.create({
          displayName: `測試使用者${i}`,
          avatarUrl: `https://i.pravatar.cc/100?img=${i}`,
          lineUserId: `U${String(i).padStart(10, '0')}test`, // Generate unique LINE ID
          status: 'active',
          points: Math.floor(Math.random() * 100),
        });
        users.push(user);
        console.log(`  ✓ Created user: 測試使用者${i}`);
      }
    }

    // 3. Create repair orders (25 orders to test pagination)
    console.log('\nCreating test repair orders...');
    const existingOrderCount = await RepairOrder.countDocuments();

    // Create orders if we have less than 25
    if (existingOrderCount < 25) {
      const ordersToCreate = 25 - existingOrderCount;
      console.log(`  Creating ${ordersToCreate} additional orders...`);

      for (let i = existingOrderCount + 1; i <= 25; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const randomDevice = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const randomTitle = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
        const randomDesc = sampleDescriptions[Math.floor(Math.random() * sampleDescriptions.length)];

        // Create order with random date in the past 30 days
        const daysAgo = Math.floor(Math.random() * 30);
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);

        await RepairOrder.create({
          userId: randomUser._id,
          category: randomCategory,
          title: `${randomTitle} #${i}`,
          description: randomDesc,
          deviceType: randomDevice,
          attachmentUrls: [],
          supplements: [],
          status: randomStatus,
          repairContent: randomStatus === 'completed' ? '已完成維修' : undefined,
          notes: undefined,
          isPrinted: false,
          replyCount: 0,
          createdAt,
          updatedAt: createdAt,
        });

        console.log(`  ✓ Created order #${i}: ${randomTitle} (${randomStatus})`);
      }
    } else {
      console.log(`  ✓ Already have ${existingOrderCount} orders`);
    }

    console.log('\n✅ Seed completed successfully!');
    console.log('\nDatabase summary:');
    console.log(`  - Users: ${await User.countDocuments()}`);
    console.log(`  - Repair Orders: ${await RepairOrder.countDocuments()}`);
    console.log(`  - Admins: ${await Admin.countDocuments()}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
