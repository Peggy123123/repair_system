# Claude AI 開發指南

此文件提供 Claude AI 協助開發此專案時所需的上下文資訊。

## 專案概述

**鈦客星電腦診所維修訂單系統** - 一個前後台分離的電腦維修訂單管理 Web App，已完成後端 API 開發。

## 技術棧

### 前端
- **框架**: Vue 3.4 + TypeScript 5.3 + Vite 5.0
- **狀態管理**: Pinia 2.1
- **路由**: Vue Router 4.2
- **樣式**: Tailwind CSS 3.4
- **圖標**: FontAwesome 6.5
- **PDF**: jsPDF 3.0

### 後端
- **執行環境**: Node.js 20.x LTS
- **框架**: Express.js 4.x + TypeScript
- **資料庫**: MongoDB 7.x (Docker)
- **ODM**: Mongoose 8.x
- **認證**: JWT (jsonwebtoken + bcryptjs)
- **驗證**: express-validator
- **其他**: cors, helmet, axios

## 專案架構

```
src/                          # 前端
├── components/               # Vue 組件
│   ├── admin/               # 後台組件
│   │   └── shared/          # 後台共用組件
│   ├── form/                # 維修訂單表單組件 (Step1-3, Completion)
│   ├── records/             # 維修記錄組件
│   └── common/              # 通用組件 (Button, OptionButton, StatusCard)
├── views/                   # 頁面組件
│   ├── frontend/            # 前台頁面
│   └── admin/               # 後台頁面
├── stores/                  # Pinia Store
│   ├── frontendUser.ts      # 前台使用者狀態
│   └── admin.ts             # 後台管理者狀態
├── services/                # API 服務層
│   └── api.ts               # API 請求封裝
├── types/                   # TypeScript 類型
├── utils/                   # 工具函數
├── mock/                    # Mock 資料 (備用)
└── router/                  # 路由配置

server/                       # 後端
├── src/
│   ├── index.ts             # 入口點
│   ├── app.ts               # Express 設定
│   ├── config/              # 配置 (環境變數, 資料庫)
│   ├── models/              # Mongoose Models (User, Admin, RepairOrder, Reply)
│   ├── routes/              # 路由定義
│   ├── controllers/         # 控制器
│   ├── middleware/          # 中介層 (auth, role, error)
│   ├── validators/          # 輸入驗證
│   ├── types/               # TypeScript 類型擴展
│   ├── utils/               # 工具函數 (jwt, response)
│   └── scripts/             # 腳本 (seed)
└── package.json
```

## API 端點

### 認證
- `POST /api/auth/login` - 前台登入
- `POST /api/auth/logout` - 前台登出
- `GET /api/auth/me` - 取得當前使用者
- `POST /api/auth/line/callback` - LINE 登入

### 管理者認證
- `POST /api/admin/auth/login` - 後台登入
- `POST /api/admin/auth/logout` - 後台登出
- `GET /api/admin/auth/me` - 取得當前管理者

### 維修訂單
- `GET /api/repairs` - 使用者的維修訂單列表
- `GET /api/repairs/:id` - 單一維修訂單詳情
- `POST /api/repairs` - 建立維修訂單
- `POST /api/repairs/:id/supplements` - 新增補充描述
- `GET /api/repairs/:id/replies` - 取得回覆
- `POST /api/repairs/:id/replies` - 新增回覆 (Admin)
- `GET /api/repairs/admin/all` - 所有維修訂單 (Admin)
- `PATCH /api/repairs/:id` - 更新維修訂單 (Admin)
- `DELETE /api/repairs/:id` - 刪除維修訂單 (Admin)

### 使用者管理
- `GET /api/users` - 使用者列表 (Admin)
- `GET /api/users/:id` - 使用者詳情 (Admin)
- `GET /api/users/:id/orders` - 使用者維修訂單記錄 (Admin)
- `PATCH /api/users/:id` - 更新使用者 (Admin)

### 管理者管理
- `GET /api/admin/users` - 管理者列表 (SuperAdmin)
- `POST /api/admin/users` - 建立管理者 (SuperAdmin)
- `PATCH /api/admin/users/:id` - 更新管理者 (SuperAdmin)
- `DELETE /api/admin/users/:id` - 刪除管理者 (SuperAdmin)

### 統計
- `GET /api/stats/summary` - 儀表板統計 (Admin)

## 核心類型定義

```typescript
// 維修狀態
type RepairStatus = 'pending' | 'in_progress' | 'repairing' | 'completed' | 'cancelled'

// 維修訂單
interface RepairOrder {
  id: string
  userId: string
  category: string
  title: string
  description: string
  deviceType: string          // 'mac' | 'laptop' | 'computer' | 'other'
  attachmentUrl?: string      // 向後相容
  attachmentUrls?: string[]   // 多圖片支援
  supplements?: RepairSupplement[]
  status: RepairStatus
  createdAt: string
  updatedAt: string
}

// 回覆
interface Reply {
  id: string
  repairOrderId: string
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
- `/my-orders` - 維修訂單概覽
- `/my-orders/:status` - 依狀態篩選
- `/my-orders/detail/:id` - 訂單詳情

### 後台 (需要 `requiresAdmin`)
- `/admin/login` - 後台登入
- `/admin` - 儀表板
- `/admin/orders` - 訂單列表
- `/admin/orders/:id` - 訂單詳情
- `/admin/users` - 使用者管理
- `/admin/users/:userId/orders` - 使用者維修訂單記錄
- `/admin/admins` - 管理者設定

## 測試帳號

### 前台
- 帳號: `user` / 密碼: `123456`
- LINE 登入按鈕 (模擬登入)

### 後台
- 帳號: `admin` / 密碼: `admin123`

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
- API 請求: `src/services/api.ts`
- 維修訂單操作: `src/utils/repairOrderUtils.ts`
- PDF 生成: `src/utils/pdfGenerator.ts`

## 已知問題

### 已修復 ✅
1. ~~`OrderDetailView.vue:27` - 重複的 `v-else-if="!order"` 條件~~
2. ~~`AdminOrderDetail.vue:63-68` - 未支援多圖片 `attachmentUrls`~~
3. ~~`Step3FormDetails.vue:194-202` - 創建訂單時缺少 `deviceType` 欄位~~
4. ~~`AdminOrderDetail.vue:257-264` - 硬編碼使用者名稱映射~~
5. ~~`AdminLoginView.vue` - 登入驗證邏輯被註釋掉~~
6. ~~`RecordsList.vue` - 缺少 status 參數驗證~~
7. ~~`AdminUserOrders.vue` - statusClasses 缺少 repairing 狀態~~
8. ~~登入狀態持久化 (localStorage)~~
9. ~~Mock 資料不一致問題~~
10. ~~ID 生成改用 UUID~~
11. ~~Store 缺少 actions~~
12. ~~後端 API 開發~~ (已完成)
13. ~~Request → Order 命名重構~~ (已完成)

### 功能缺失 (待處理)
- 前台/後台登出按鈕 UI
- 列表分頁功能
- 搜尋/篩選功能
- PDF 中文字體支援

## 常用指令

```bash
# 前端
npm run dev      # 開發伺服器 (http://localhost:5173)
npm run build    # 建置
npm run preview  # 預覽建置結果
npm run lint     # ESLint 檢查

# 後端
npm run server:dev    # 後端開發伺服器 (http://localhost:3000)
npm run server:build  # 後端建置
npm run server:seed   # 初始化資料庫 (建立預設帳號)

# 資料庫管理
npm run backup                    # 備份資料庫
npm run migrate:request-to-order  # 執行資料庫遷移 (已完成，僅供參考)
npm run rollback:order-to-request # 回滾資料庫 (緊急用)

# MongoDB (Docker)
docker run -d --name repair-system-mongo -p 27017:27017 -v repair-system-data:/data/db mongo:7  # 首次建立
docker start repair-system-mongo   # 啟動 MongoDB
docker stop repair-system-mongo    # 停止 MongoDB
```

## 環境變數

```bash
# .env (前端，可選)
VITE_API_BASE_URL=http://localhost:3000/api
VITE_LINE_LIFF_ID=your-liff-id

# server/.env (後端)
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/repair_system
JWT_SECRET=your-jwt-secret-key
JWT_ADMIN_SECRET=your-admin-jwt-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
LINE_CHANNEL_ID=your-line-channel-id
LINE_CHANNEL_SECRET=your-line-channel-secret
```

## 快速開始

### 1. 啟動 MongoDB
```bash
docker start repair-system-mongo
# 或首次建立:
docker run -d --name repair-system-mongo -p 27017:27017 -v repair-system-data:/data/db mongo:7
```

### 2. 初始化資料庫
```bash
npm run server:seed
```

### 3. 啟動後端
```bash
npm run server:dev
```

### 4. 啟動前端
```bash
npm run dev
```

### 5. 測試登入
- 前台: http://localhost:5173 (user / 123456)
- 後台: http://localhost:5173/admin/login (admin / admin)

## 部署

- 平台: GitHub Pages (前端)
- Base URL: `/repair_system/`
- 自動部署: 推送到 `main` 分支觸發 GitHub Actions

## 開發注意事項

1. **路由 Base URL**: 所有路由都基於 `/repair_system/`
2. **圖片上傳**: 使用 FileReader 轉 base64 存入資料庫
3. **API**: 前端透過 `src/services/api.ts` 與後端通訊
4. **認證**: JWT Token 存在 localStorage (`user_token` / `admin_token`)
5. **PDF**: 使用 jsPDF 生成，支援中文字體

## 未來規劃

1. ~~後端 API 開發~~ ✅
2. LINE LIFF 整合
3. 通知機制 (LINE Notify / Email)
4. 正式部署環境 (後端)
5. 圖片上傳改用 Cloudinary
