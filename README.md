# 電腦維修申請系統

基於 Vue 3 + TypeScript + Tailwind CSS 的電腦維修申請 Web App MVP。

## 功能特色

- 🔐 LINE LIFF 登入整合
- 📝 維修申請表單
- 📋 個人申請記錄查看
- 🛠️ 管理後台回覆系統
- 📱 響應式設計

## 技術棧

- **前端**: Vue 3 + TypeScript + Vite
- **樣式**: Tailwind CSS
- **狀態管理**: Pinia
- **路由**: Vue Router
- **部署**: Vercel

## 開發環境設定

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建置專案
npm run build

# 預覽建置結果
npm run preview
```

## 專案結構

```
src/
├── components/     # 可重用組件
├── views/         # 頁面組件
├── stores/        # Pinia 狀態管理
├── types/         # TypeScript 類型定義
├── router/        # 路由設定
└── utils/         # 工具函數
```

## 開發階段

目前處於 **Step 1: 前端原型** 階段，使用 mock 資料進行 UI 和流程驗證。

### 已完成的頁面

- `/` - LINE 登入頁面
- `/form` - 維修申請表單
- `/my-requests` - 個人申請記錄
- `/admin` - 管理後台

### 下一步

- Step 2: 後端 API 開發
- Step 3: LINE LIFF 整合
- Step 4: 通知機制
- Step 5: 正式部署
