# Claude AI 開發指南

此文件提供 Claude AI 協助開發此專案時所需的上下文資訊。

## 專案概述

**鈦客星電腦診所維修申請系統** - 一個前後台分離的電腦維修申請 Web App，目前處於前端原型階段，使用 Mock 資料。

## 技術棧

### 前端
- **框架**: Vue 3.4 + TypeScript 5.3 + Vite 5.0
- **狀態管理**: Pinia 2.1
- **路由**: Vue Router 4.2
- **樣式**: Tailwind CSS 3.4
- **圖標**: FontAwesome 6.5
- **PDF**: jsPDF 3.0

### 後端 (規劃中)
- **執行環境**: Node.js 20.x LTS
- **框架**: Express.js 4.x
- **資料庫**: MongoDB 7.x
- **ODM**: Mongoose 8.x
- **認證**: JWT / LINE LIFF

## 專案架構

```
src/
├── components/           # Vue 組件
│   ├── admin/           # 後台組件
│   │   └── shared/      # 後台共用組件
│   ├── form/            # 維修申請表單組件 (Step1-3, Completion)
│   ├── records/         # 維修記錄組件
│   └── common/          # 通用組件 (Button, OptionButton, StatusCard)
├── views/               # 頁面組件
│   ├── frontend/        # 前台頁面
│   └── admin/           # 後台頁面
├── stores/              # Pinia Store
│   ├── frontendUser.ts  # 前台使用者狀態
│   ├── admin.ts         # 後台管理者狀態
│   └── repairRequests.ts # 維修申請狀態
├── types/               # TypeScript 類型
│   ├── frontend/        # 前台類型
│   └── admin/           # 後台類型
├── utils/               # 工具函數
├── mock/                # Mock 資料
└── router/              # 路由配置
```

## 核心類型定義

```typescript
// 維修狀態
type RepairStatus = 'pending' | 'in_progress' | 'repairing' | 'completed' | 'cancelled'

// 維修申請
interface RepairRequest {
  id: string
  userId: string
  category: string
  title: string
  description: string
  deviceType: string          // 'mac' | 'laptop' | 'computer' | 'other'
  attachmentUrl?: string      // 向後相容
  attachmentUrls?: string[]   // 多圖片支援
  status: RepairStatus
  createdAt: string
  updatedAt: string
}

// 回覆
interface Reply {
  id: string
  repairRequestId: string
  adminId: string
  content: string
  createdAt: string
}

// 前台使用者
interface User {
  id: string
  lineUserId: string | null
  displayName: string
  avatarUrl: string
}

// 後台管理者
interface Admin {
  id: string
  username: string
  displayName: string
  avatarUrl: string
  role: 'super_admin' | 'admin' | 'moderator'
  status: 'active' | 'inactive'
  lastLoginAt: string
}
```

## 路由結構

### 前台 (需要 `requiresAuth`)
- `/` - 登入頁
- `/form/step1` - 選擇設備
- `/form/step2` - 選擇分類
- `/form/step3` - 填寫詳情 / 完成頁
- `/my-requests` - 維修記錄概覽
- `/my-requests/:status` - 依狀態篩選
- `/my-requests/detail/:id` - 申請詳情

### 後台 (需要 `requiresAdmin`)
- `/admin/login` - 後台登入
- `/admin` - 儀表板
- `/admin/orders` - 訂單列表
- `/admin/orders/:id` - 訂單詳情
- `/admin/users` - 使用者管理
- `/admin/users/:userId/requests` - 使用者維修記錄
- `/admin/admins` - 管理者設定

## 測試帳號

### 前台
- 帳號: `user` / 密碼: `123456`
- LINE 登入按鈕 (模擬登入)

### 後台
- 帳號: `admin` / 密碼: `admin`

## 開發規範

### 組件命名
- 頁面組件: `*View.vue` (在 `views/` 目錄)
- 功能組件: `Admin*.vue`, `Step*.vue` 等
- 通用組件: `Button.vue`, `StatusCard.vue` 等

### 狀態管理
- 使用 Pinia Composition API 風格
- Store 檔案命名: `camelCase.ts`
- 使用 `use*Store` 命名 hook

### 樣式
- 使用 Tailwind CSS utility classes
- 主色: `primary` (#c42140)
- 次色: `secondary` (#2d2e30)
- 避免內聯樣式

### 工具函數
- 維修申請操作: `src/utils/repairRequestUtils.ts`
- PDF 生成: `src/utils/pdfGenerator.ts`

## 已知問題

### 已修復 ✅
1. ~~`RequestDetailView.vue:27` - 重複的 `v-else-if="!request"` 條件~~
2. ~~`AdminOrderDetail.vue:63-68` - 未支援多圖片 `attachmentUrls`~~
3. ~~`Step3FormDetails.vue:194-202` - 創建申請時缺少 `deviceType` 欄位~~
4. ~~`AdminOrderDetail.vue:257-264` - 硬編碼使用者名稱映射~~
5. ~~`AdminLoginView.vue` - 登入驗證邏輯被註釋掉~~
6. ~~`RecordsList.vue` - 缺少 status 參數驗證~~
7. ~~`AdminUserRequests.vue` - statusClasses 缺少 repairing 狀態~~
8. ~~登入狀態持久化 (localStorage)~~
9. ~~Mock 資料不一致問題~~
10. ~~ID 生成改用 UUID~~
11. ~~Store 缺少 actions~~

### 功能缺失 (待處理)
- 前台/後台登出按鈕 UI
- 列表分頁功能
- 搜尋/篩選功能
- 統一的使用者資料 Store
- PDF 中文字體支援

## 常用指令

```bash
# 前端
npm run dev      # 開發伺服器
npm run build    # 建置
npm run preview  # 預覽建置結果
npm run lint     # ESLint 檢查

# 後端 (規劃中)
npm run server:dev    # 後端開發伺服器
npm run server:build  # 後端建置

# MongoDB (Docker)
docker start repair-system-mongo   # 啟動 MongoDB
docker stop repair-system-mongo    # 停止 MongoDB
```

## 環境變數

```bash
# .env (前端)
VITE_API_BASE_URL=http://localhost:3000/api
VITE_LINE_LIFF_ID=your-liff-id

# server/.env (後端)
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/repair_system
JWT_SECRET=your-jwt-secret-key
```

## MongoDB 設定

### 本地開發 (Docker)
```bash
docker run -d --name repair-system-mongo -p 27017:27017 -v repair-system-data:/data/db mongo:7
```

### MongoDB Atlas (雲端)
```bash
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/repair_system
```

## 部署

- 平台: GitHub Pages
- Base URL: `/repair_system/`
- 自動部署: 推送到 `main` 分支觸發 GitHub Actions

## 開發注意事項

1. **路由 Base URL**: 所有路由都基於 `/repair_system/`
2. **圖片上傳**: 目前使用 FileReader 轉 base64，未來需改用 Cloudinary
3. **API**: 目前使用 Mock 資料和 `setTimeout` 模擬 API 延遲
4. **認證**: 目前是假認證，登入後直接設定 store 狀態
5. **PDF**: 使用 jsPDF 生成，支援中文字體

## 未來規劃

1. 後端 API 開發
2. LINE LIFF 整合
3. 通知機制 (LINE Notify / Email)
4. 正式部署環境
