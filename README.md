# 鈦客星電腦診所 - 維修申請系統

基於 Vue 3 + TypeScript + Tailwind CSS 的電腦維修申請 Web App MVP。

## 功能特色

### 前台系統
- 🔐 雙重登入方式（帳號密碼 / LINE 登入整合）
- 📝 多步驟維修申請表單（設備選擇 → 分類選擇 → 詳情填寫）
- 📋 個人維修記錄查看與管理
- 🖼️ 多圖片上傳支援
- ✏️ 使用者可補充描述
- ❌ 使用者可取消待處理/處理中的申請
- 📱 響應式設計

### 後台系統
- 📊 儀表板統計概覽
- 📋 訂單管理（列表 / 詳情）
- 👥 使用者管理
- 🛠️ 管理員回覆系統
- 🔄 狀態管理（待處理 / 處理中 / 維修中 / 已完成 / 已取消）
- 🖨️ PDF 工單生成與列印
- 👤 管理者設定

## 技術棧

### 前端
| 類別 | 技術 | 版本 |
|------|------|------|
| **前端框架** | Vue 3 (Composition API) | 3.4.0 |
| **建置工具** | Vite | 5.0.10 |
| **程式語言** | TypeScript | ~5.3.0 |
| **狀態管理** | Pinia | 2.1.7 |
| **路由** | Vue Router | 4.2.5 |
| **CSS 框架** | Tailwind CSS | 3.4.0 |
| **圖標庫** | FontAwesome | 6.5.1 |
| **PDF 生成** | jsPDF + jspdf-autotable | 3.0.3 |
| **工具庫** | @vueuse/core | 10.7.0 |

### 後端 (規劃中)
| 類別 | 技術 | 版本 |
|------|------|------|
| **執行環境** | Node.js | 20.x LTS |
| **後端框架** | Express.js | 4.x |
| **資料庫** | MongoDB | 7.x |
| **ODM** | Mongoose | 8.x |
| **認證** | JWT / LINE LIFF | - |

### 部署
| 環境 | 平台 |
|------|------|
| **前端** | GitHub Pages |
| **後端** | (規劃中) |
| **資料庫** | MongoDB Atlas |

## 專案結構

```
src/
├── assets/                    # 靜態資源
│   ├── css/                  # 全域樣式
│   └── images/               # 圖片資源
│
├── components/                # Vue 組件
│   ├── admin/                # 後台組件
│   │   ├── shared/           # 共用組件 (StatusEditModal, RepairOrderCard)
│   │   ├── AdminDashboard.vue
│   │   ├── AdminOrders.vue
│   │   ├── AdminOrderDetail.vue
│   │   ├── AdminUsers.vue
│   │   ├── AdminUserRequests.vue
│   │   └── AdminAdmins.vue
│   │
│   ├── form/                 # 維修申請表單組件
│   │   ├── Step1DeviceSelection.vue
│   │   ├── Step2CategorySelection.vue
│   │   ├── Step3FormDetails.vue
│   │   └── Completion.vue
│   │
│   ├── records/              # 維修記錄組件
│   │   ├── RecordsOverview.vue
│   │   └── RecordsList.vue
│   │
│   └── common/               # 通用組件
│       ├── Button.vue
│       ├── OptionButton.vue
│       └── StatusCard.vue
│
├── views/                     # 頁面組件
│   ├── frontend/
│   │   ├── LoginView.vue
│   │   ├── FormView.vue
│   │   ├── MyRequestsView.vue
│   │   └── RequestDetailView.vue
│   │
│   └── admin/
│       ├── AdminLoginView.vue
│       └── AdminLayout.vue
│
├── router/                    # 路由配置
│   └── index.ts
│
├── stores/                    # Pinia 狀態管理
│   ├── frontendUser.ts       # 前台使用者狀態
│   ├── admin.ts              # 後台管理者狀態
│   └── repairRequests.ts     # 維修申請狀態
│
├── types/                     # TypeScript 類型定義
│   ├── index.ts              # 類型導出
│   ├── frontend/index.ts     # 前台類型
│   └── admin/index.ts        # 後台類型
│
├── utils/                     # 工具函數
│   ├── pdfGenerator.ts       # PDF 工單生成
│   └── repairRequestUtils.ts # 維修申請操作工具
│
├── mock/                      # Mock 資料
│   ├── repairRequests.ts
│   └── users.ts
│
├── App.vue                    # 根組件
└── main.ts                    # 應用入口
```

## 路由結構

### 前台路由
| 路徑 | 名稱 | 說明 |
|------|------|------|
| `/` | login | 登入頁面 |
| `/form` | form | 維修申請表單（父容器） |
| `/form/step1` | form-step1 | 選擇設備類型 |
| `/form/step2` | form-step2 | 選擇維修分類 |
| `/form/step3` | form-step3 | 填寫詳情 / 完成頁 |
| `/my-requests` | my-requests | 我的維修記錄 |
| `/my-requests/:status` | records-list | 依狀態篩選記錄 |
| `/my-requests/detail/:id` | request-detail | 申請詳情頁 |

### 後台路由
| 路徑 | 名稱 | 說明 |
|------|------|------|
| `/admin/login` | admin-login | 後台登入頁 |
| `/admin` | admin-dashboard | 儀表板 |
| `/admin/orders` | admin-orders | 訂單列表 |
| `/admin/orders/:id` | admin-order-detail | 訂單詳情 |
| `/admin/users` | admin-users | 使用者管理 |
| `/admin/users/:userId/requests` | admin-user-requests | 使用者維修記錄 |
| `/admin/admins` | admin-admins | 管理者設定 |

## 環境變數設定

在專案根目錄建立 `.env` 檔案：

```bash
# 前端環境變數
VITE_API_BASE_URL=http://localhost:3000/api
VITE_LINE_LIFF_ID=your-liff-id

# 後端環境變數 (server/.env)
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/repair_system
JWT_SECRET=your-jwt-secret-key
LINE_CHANNEL_ID=your-line-channel-id
LINE_CHANNEL_SECRET=your-line-channel-secret
```

## MongoDB 設定

### 本地開發環境

#### 方式一：使用 Docker (推薦)
```bash
# 啟動 MongoDB 容器
docker run -d \
  --name repair-system-mongo \
  -p 27017:27017 \
  -v repair-system-data:/data/db \
  mongo:7

# 查看容器狀態
docker ps

# 停止容器
docker stop repair-system-mongo

# 重新啟動容器
docker start repair-system-mongo
```

#### 方式二：使用 Docker Compose
在專案根目錄建立 `docker-compose.yml`：
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    container_name: repair-system-mongo
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=repair_system

volumes:
  mongodb_data:
```

```bash
# 啟動服務
docker-compose up -d

# 停止服務
docker-compose down

# 查看 logs
docker-compose logs -f mongodb
```

#### 方式三：本地安裝 MongoDB
```bash
# macOS (使用 Homebrew)
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# 驗證安裝
mongosh
```

### MongoDB Atlas (雲端)

1. 前往 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 註冊帳號
2. 建立免費 M0 Cluster
3. 設定 Database Access (建立使用者)
4. 設定 Network Access (允許 IP)
5. 取得連線字串，更新 `.env`：

```bash
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/repair_system?retryWrites=true&w=majority
```

### 資料庫管理工具

推薦使用以下工具管理 MongoDB：
- [MongoDB Compass](https://www.mongodb.com/products/compass) - 官方 GUI 工具
- [mongosh](https://www.mongodb.com/docs/mongodb-shell/) - 命令列工具

## 開發環境設定

### 前置需求
- Node.js 20.x LTS
- npm 10.x 或 pnpm
- MongoDB 7.x (本地或 Atlas)
- Docker (選用，用於本地 MongoDB)

### 安裝依賴
```bash
npm install
```

### 啟動開發伺服器
```bash
# 前端開發伺服器
npm run dev

# 後端開發伺服器 (規劃中)
npm run server:dev
```

### 建置專案
```bash
# 前端建置
npm run build

# 後端建置 (規劃中)
npm run server:build
```

### 預覽建置結果
```bash
npm run preview
```

### 程式碼檢查
```bash
npm run lint
```

## 測試帳號

### 前台使用者
| 帳號 | 密碼 | 說明 |
|------|------|------|
| `user` | `123456` | 測試使用者帳號 |
| - | - | LINE 登入按鈕 (模擬張小明) |

### 後台管理員
| 帳號 | 密碼 | 角色 |
|------|------|------|
| `admin` | `admin` | 系統管理員 (super_admin) |

## 開發階段

目前處於 **Step 1: 前端原型** 階段，使用 Mock 資料進行 UI 和流程驗證。

### 已完成功能
- ✅ 前台登入頁面（模擬登入）
- ✅ 多步驟維修申請表單
- ✅ 多圖片上傳功能
- ✅ 個人維修記錄頁面
- ✅ 維修申請詳情頁
- ✅ 使用者補充描述功能
- ✅ 使用者取消申請功能
- ✅ 後台登入頁面
- ✅ 後台儀表板
- ✅ 訂單管理（列表 / 詳情）
- ✅ 使用者管理
- ✅ 管理員回覆功能
- ✅ 狀態編輯功能
- ✅ PDF 工單生成
- ✅ 管理者設定頁面
- ✅ 響應式設計
- ✅ GitHub Pages 自動部署

### 下一步
- [ ] Step 2: 後端 API 開發
- [ ] Step 3: LINE LIFF 整合
- [ ] Step 4: 通知機制（LINE Notify / Email）
- [ ] Step 5: 正式部署

## 維修狀態說明

| 狀態 | 英文 | 說明 |
|------|------|------|
| 待處理 | pending | 等待管理員處理 |
| 處理中 | in_progress | 管理員正在處理 |
| 維修中 | repairing | 正在進行維修 |
| 已完成 | completed | 維修已完成 |
| 已取消 | cancelled | 申請已取消 |

## 設備類型

- MAC
- 筆電
- 電腦
- 其他

## 維修分類

- 當機
- 鍵盤損壞
- 螢幕損壞
- 主機板維修
- 喇叭損壞
- 其他

## 部署

### 前端部署 (GitHub Pages)

專案使用 GitHub Actions 自動部署至 GitHub Pages。

**部署流程：**
1. 推送程式碼至 `main` 分支
2. GitHub Actions 自動觸發建置
3. 建置產物部署至 `gh-pages` 分支
4. GitHub Pages 自動更新

**部署網址：**
```
https://<username>.github.io/repair_system/
```

### 後端部署 (規劃中)

**建議平台：**
- [Railway](https://railway.app/) - 支援 Node.js + MongoDB
- [Render](https://render.com/) - 免費方案可用
- [Fly.io](https://fly.io/) - 邊緣部署

**環境變數設定：**
在部署平台設定以下環境變數：
```
NODE_ENV=production
PORT=3000
MONGODB_URI=<MongoDB Atlas 連線字串>
JWT_SECRET=<安全的隨機字串>
LINE_CHANNEL_ID=<LINE Channel ID>
LINE_CHANNEL_SECRET=<LINE Channel Secret>
CORS_ORIGIN=https://<username>.github.io
```

### 資料庫部署 (MongoDB Atlas)

1. 使用 MongoDB Atlas 免費 M0 叢集
2. 設定 IP 白名單 (允許部署平台 IP 或 `0.0.0.0/0`)
3. 建立資料庫使用者並取得連線字串
4. 在後端部署平台設定 `MONGODB_URI`

## 授權

MIT License
