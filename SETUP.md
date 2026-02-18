# 專案啟動指南

## 前置需求

| 工具 | 版本 | 說明 |
|------|------|------|
| Node.js | 20.x LTS | JavaScript 執行環境 |
| npm | 隨 Node.js 安裝 | 套件管理工具 |
| Docker | 最新版 | 用於運行 MongoDB |

## 環境變數設定

### 前端 (`/.env`)

複製範例並修改：

```bash
cp .env.example .env
```

```env
# API 後端位址
VITE_API_BASE_URL=http://localhost:3000/api

# LINE LIFF（選填，目前未啟用）
VITE_LINE_LIFF_ID=
```

### 後端 (`/server/.env`)

複製範例並修改：

```bash
cp server/.env.example server/.env
```

```env
# Server
NODE_ENV=development
PORT=3000

# MongoDB 連線字串
MONGODB_URI=mongodb://localhost:27017/repair_system

# JWT 金鑰（正式環境請更換為強密碼）
JWT_SECRET=repair-system-jwt-secret-dev
JWT_ADMIN_SECRET=repair-system-admin-jwt-secret-dev
JWT_EXPIRES_IN=7d

# CORS 允許的前端來源
CORS_ORIGIN=http://localhost:5173

# LINE LIFF（選填）
LINE_CHANNEL_ID=
LINE_CHANNEL_SECRET=
```

> **注意**：`.env` 檔案已加入 `.gitignore`，不會被提交到版本庫。

## 快速啟動（推薦）

使用一鍵啟動腳本，自動完成所有準備工作並啟動服務：

```bash
npm start
```

腳本位於 `scripts/dev.sh`，會自動依序執行以下步驟：

| 步驟 | 說明 | 自動處理內容 |
|------|------|-------------|
| 1. 檢查前置工具 | 確認 Node.js 和 Docker 已安裝 | Docker Desktop 未運行時會自動嘗試啟動，最多等待 60 秒 |
| 2. 檢查並安裝依賴 | 確認前後端 `node_modules` | 缺少時自動執行 `npm install` |
| 3. 啟動 MongoDB | 透過 Docker 啟動 MongoDB 容器 | 容器不存在時自動建立（`mongo:7`、port `27017`），已存在則直接啟動 |
| 4. 檢查環境變數 | 確認 `.env` 檔案存在 | 不存在時自動從 `.env.example` 複製或建立預設值 |
| 5. 啟動前後端服務 | 背景啟動後端 API 與前端 Vite 開發伺服器 | 等待 port 就緒後顯示存取網址 |

啟動完成後會顯示：

```
============================================
  開發環境啟動完成！
============================================

  前台：http://localhost:5173/repair_system/
  後台：http://localhost:5173/repair_system/admin/login
  API ：http://localhost:3000/api

  前台帳號：user / 123456
  後台帳號：admin / admin123

  按 Ctrl+C 關閉所有服務
```

> 按 `Ctrl+C` 會自動終止所有前後端程序。

---

## 手動啟動（逐步執行）

如果需要個別控制每個服務，可以按以下步驟手動啟動。

### 1. 安裝依賴

```bash
# 前端依賴
npm install

# 後端依賴
cd server && npm install && cd ..
```

### 2. 啟動 MongoDB（Docker）

**首次建立容器：**

```bash
docker run -d \
  --name repair-system-mongo \
  -p 27017:27017 \
  -v repair-system-data:/data/db \
  mongo:7
```

**之後啟動：**

```bash
docker start repair-system-mongo
```

**停止：**

```bash
docker stop repair-system-mongo
```

**確認 MongoDB 運行中：**

```bash
docker ps --filter name=repair-system-mongo
```

### 3. 初始化資料庫（Seed）

首次啟動時執行，建立預設帳號：

```bash
npm run server:seed
```

這會建立：
- 後台管理員：`admin` / `admin123`（super_admin 角色）
- 前台展示使用者：Demo User

### 4. 啟動後端 API

```bash
npm run server:dev
```

後端運行於 `http://localhost:3000`。

### 5. 啟動前端開發伺服器

```bash
npm run dev
```

前端運行於 `http://localhost:5173`。

## 測試帳號

| 環境 | 網址 | 帳號 | 密碼 |
|------|------|------|------|
| 前台 | http://localhost:5173/repair_system/ | `user` | `123456` |
| 後台 | http://localhost:5173/repair_system/admin/login | `admin` | `admin123` |

## 所有可用指令

### 一鍵啟動

| 指令 | 說明 |
|------|------|
| `npm start` | 執行 `scripts/dev.sh`，一鍵啟動完整開發環境（MongoDB + 後端 + 前端） |

### 前端

| 指令 | 說明 |
|------|------|
| `npm run dev` | 啟動前端開發伺服器（含 HMR） |
| `npm run build` | TypeScript 型別檢查 + 正式建置 |
| `npm run preview` | 預覽建置產出 |
| `npm run lint` | ESLint 程式碼檢查與自動修復 |

### 後端

| 指令 | 說明 |
|------|------|
| `npm run server:dev` | 啟動後端開發伺服器（含自動重載） |
| `npm run server:build` | 編譯 TypeScript 為 JavaScript |
| `npm run server:seed` | 初始化資料庫（建立預設帳號） |

> 後端指令也可在 `server/` 目錄下直接執行對應的 `npm run dev`、`npm run build`、`npm run seed`。

## 服務對應表

| 服務 | 預設位址 | 說明 |
|------|----------|------|
| 前端 | http://localhost:5173 | Vite 開發伺服器 |
| 後端 API | http://localhost:3000 | Express 伺服器 |
| MongoDB | localhost:27017 | 資料庫 |

## 常見問題

### MongoDB 連線失敗

確認 Docker 容器正在運行：

```bash
docker ps --filter name=repair-system-mongo
```

如果容器不存在，重新建立（見步驟 2）。

### 前端無法呼叫 API

1. 確認後端已啟動（`npm run server:dev`）
2. 確認前端 `.env` 中的 `VITE_API_BASE_URL` 設為 `http://localhost:3000/api`
3. 確認後端 `server/.env` 中的 `CORS_ORIGIN` 設為 `http://localhost:5173`

### Port 被佔用

```bash
# 查看佔用 3000 port 的程序
lsof -i :3000

# 查看佔用 5173 port 的程序
lsof -i :5173

# 終止指定程序
kill -9 <PID>
```

### Seed 執行失敗

確認 MongoDB 已啟動，且 `server/.env` 中的 `MONGODB_URI` 正確。

## 部署

- **前端**：GitHub Pages，推送到 `main` 分支自動觸發 GitHub Actions
- **Base URL**：`/repair_system/`（已在 `vite.config.ts` 設定）
