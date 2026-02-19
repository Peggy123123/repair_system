#!/usr/bin/env node
/**
 * 建立 demo_user 測試訂單腳本
 * 用途：為無限滾動功能建立測試資料（10 筆訂單）
 * 執行：npm run create-demo-orders
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { User } from '../models/User'
import { RepairOrder } from '../models/RepairOrder'

// 載入環境變數
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/repair_system'

// 測試訂單資料模板
const orderTemplates = [
  {
    category: '螢幕問題',
    title: '螢幕出現白線',
    description: '最近螢幕右側出現了一條白色的直線，開機後就一直存在，不會消失。',
    deviceType: 'laptop' as const,
    status: 'completed' as const,
    attachmentUrls: [],
    repairContent: '更換螢幕排線，測試正常。'
  },
  {
    category: '電池問題',
    title: 'MacBook 電池膨脹',
    description: '電池膨脹導致觸控板凸起，無法正常點擊，需要更換電池。',
    deviceType: 'mac' as const,
    status: 'completed' as const,
    attachmentUrls: [],
    repairContent: '更換原廠電池，已恢復正常。'
  },
  {
    category: '鍵盤問題',
    title: '鍵盤部分按鍵失靈',
    description: '筆電鍵盤的 E、R、T 三個按鍵無法正常輸入，需要用力按壓才有反應。',
    deviceType: 'laptop' as const,
    status: 'repairing' as const,
    attachmentUrls: []
  },
  {
    category: '系統問題',
    title: '電腦開機卡在 BIOS 畫面',
    description: '開機後一直停留在主機板 LOGO，無法進入 Windows 系統。按 F2 可以進入 BIOS。',
    deviceType: 'computer' as const,
    status: 'in_progress' as const,
    attachmentUrls: [],
    supplements: [
      {
        content: '補充：重新開機後可以進入系統，但過一段時間又會當機。',
        attachmentUrls: [],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ]
  },
  {
    category: '硬體問題',
    title: '風扇異常噪音',
    description: '電腦風扇運轉時發出很大的噪音，像是有東西卡住的聲音。',
    deviceType: 'computer' as const,
    status: 'pending' as const,
    attachmentUrls: []
  },
  {
    category: '系統問題',
    title: 'Windows 無法啟動',
    description: '開機後出現藍屏錯誤代碼 0x0000007B，無法進入 Windows。',
    deviceType: 'laptop' as const,
    status: 'cancelled' as const,
    attachmentUrls: [],
    notes: '客戶決定自行重灌系統'
  },
  {
    category: '螢幕問題',
    title: 'iMac 螢幕閃爍',
    description: 'iMac 螢幕會間歇性閃爍，尤其是顯示白色畫面時特別明顯。',
    deviceType: 'mac' as const,
    status: 'pending' as const,
    attachmentUrls: []
  },
  {
    category: '電池問題',
    title: '筆電無法充電',
    description: '筆電插電後無法充電，電池圖示顯示「未充電」，但可以用電池電力運作。',
    deviceType: 'laptop' as const,
    status: 'in_progress' as const,
    attachmentUrls: []
  },
  {
    category: '硬體問題',
    title: '記憶體升級需求',
    description: '希望將記憶體從 8GB 升級到 16GB，請協助評估與報價。',
    deviceType: 'laptop' as const,
    status: 'completed' as const,
    attachmentUrls: [],
    repairContent: '安裝 Kingston 8GB DDR4 記憶體模組，系統識別正常。'
  },
  {
    category: '其他問題',
    title: '外接裝置無法識別',
    description: 'USB 裝置插入後電腦無法識別，裝置管理員中顯示黃色驚嘆號。',
    deviceType: 'other' as const,
    status: 'pending' as const,
    attachmentUrls: [],
    supplements: [
      {
        content: '補充：試過其他 USB 孔也是一樣的狀況，但手機可以正常充電。',
        attachmentUrls: [],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ]
  }
]

async function createDemoOrders() {
  try {
    console.log('🔌 連接資料庫...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ 資料庫連接成功')

    // 1. 查找或建立 demo_user
    console.log('\n👤 查找/建立測試使用者...')
    let demoUser = await User.findOne({ displayName: 'demo_user' })

    if (!demoUser) {
      demoUser = await User.create({
        lineUserId: 'DEMO_USER_LINE_ID',
        displayName: 'demo_user',
        avatarUrl: 'https://via.placeholder.com/150',
        points: 0
      })
      console.log('✅ 建立測試使用者: demo_user')
    } else {
      console.log('✅ 找到測試使用者: demo_user')
    }

    // 2. 檢查現有訂單數量（冪等性）
    const existingOrdersCount = await RepairOrder.countDocuments({
      userId: demoUser._id
    })

    console.log(`\n📋 現有訂單數量: ${existingOrdersCount}`)

    if (existingOrdersCount >= 10) {
      console.log('⚠️  已有 10 筆以上訂單，跳過建立')
      await mongoose.connection.close()
      console.log('\n✅ 完成')
      process.exit(0)
    }

    // 3. 建立訂單（時間間隔 1-3 天）
    console.log('\n📝 建立測試訂單...')
    const ordersToCreate = orderTemplates.map((template, index) => {
      // 計算建立時間（從 30 天前開始，每筆間隔 1-3 天）
      const daysAgo = 30 - index * 3
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)

      return {
        userId: demoUser._id,
        ...template,
        createdAt,
        updatedAt: createdAt
      }
    })

    const createdOrders = await RepairOrder.insertMany(ordersToCreate)
    console.log(`✅ 成功建立 ${createdOrders.length} 筆測試訂單`)

    // 4. 顯示統計
    console.log('\n📊 訂單統計:')
    const statusCounts = await RepairOrder.aggregate([
      { $match: { userId: demoUser._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])

    statusCounts.forEach(({ _id, count }) => {
      console.log(`   ${_id}: ${count} 筆`)
    })

    await mongoose.connection.close()
    console.log('\n✅ 完成')
    process.exit(0)
  } catch (error) {
    console.error('❌ 錯誤:', error)
    await mongoose.connection.close()
    process.exit(1)
  }
}

createDemoOrders()
