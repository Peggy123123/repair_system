開發順序（前端優先 + 後端同步驗證）
🥇 Step 1：先從前端原型開始（Low Code MVP）

目的：

先明確「畫面流程」與「資料格式」。

驗證使用者體驗是否順、頁面之間的邏輯是否合理。

具體作法：

用 Vue 3 + Tailwind 建立基本頁面：

/login：顯示「用 LINE 登入」按鈕（先假資料模擬登入成功）

/form：維修申請表單（分類、說明、圖片上傳）

/my-requests：列表顯示已送出申請（用假資料 mock）

/admin：後台列表頁，模擬回覆操作

這階段資料全部用 local JSON / mock data 模擬，讓 UI 和流程先完整跑通。

同時規劃好前端需要呼叫的 API 結構，例如：

POST /api/repair-requests
GET /api/repair-requests?userId=xxx
POST /api/replies


👉 好處：你會很快確認整個產品流程與欄位定義，避免後端多做或漏做。

🥈 Step 2：後端 API 開發（以前端需求為準）

目的：

後端只做「前端實際需要」的部分，避免過度設計。

作法：

使用 Node.js + Express / NestJS 開 API：

POST /repair-requests → 新增維修單

GET /repair-requests → 查詢使用者的單

POST /reply → 管理者回覆

加入資料庫（如 Supabase / MySQL）並測試 CRUD 功能。

加入 LINE Messaging API 推播 功能。

讓前端改為呼叫實際 API（移除假資料）。

🥉 Step 3：整合 LINE 登入（LIFF）

目的：

改掉 mock 登入，取得真實 userId，讓資料綁定 LINE 帳號。

作法：

在 LINE Developer Console 建立 LIFF App。

在前端用 @line/liff 初始化登入，取得 userId。

登入後把 userId 傳給後端，作為維修單的使用者識別。

🧩 Step 4：整合通知機制

目的：

當管理者回覆時自動通知用戶。

作法：

在後端 reply API 中加入：

lineClient.pushMessage(userId, {
  type: 'text',
  text: `您的維修單已回覆：「${replyContent}」`,
});


確保 Messaging API token、userId 都已在 DB 綁定。

🧱 Step 5：正式串接、測試與上線

前後端串起來、測流程、部署（Vercel + Render 或 Supabase Edge）。

測試一整條：
LINE 點開 → 登入 → 填單 → 管理回覆 → 收通知。