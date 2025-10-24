電腦維修申請 Web App MVP 開發文件
1. 專案概覽

專案名稱：電腦維修申請 Web App MVP

目標：

使用者可透過 LINE LIFF 登入，填寫維修申請表單。

管理者可在後台查看維修單、回覆，並透過 LINE Messaging API 通知使用者。

建立個人頁面供使用者查看維修單紀錄與回覆。

主要使用者角色：

使用者：提交維修單、查看維修單進度與回覆

管理者：查看維修單、回覆、推播通知給使用者

2. 技術架構
前端

框架：Vue 3 + Vite

樣式：Tailwind CSS

LINE 整合：LIFF SDK

部署平台：Vercel

功能：

LIFF 登入與 userId 取得

維修單表單頁面

個人頁面（維修單列表）

後台頁面（管理者查看與回覆維修單）

後端

框架：Node.js + Express / NestJS

資料庫：PostgreSQL / Supabase

雲端儲存：Cloudinary / Supabase Storage（圖片附件）

部署平台：Vercel Serverless Function（MVP）

功能：

CRUD 維修單 API

CRUD 回覆 API

LINE Messaging API 推播通知

3. 資料庫設計
tables
users
欄位	類型	說明
id	UUID	主鍵
lineUserId	string	LINE userId
displayName	string	使用者名稱
avatarUrl	string	LINE 頭像
repair_requests
欄位	類型	說明
id	UUID	主鍵
userId	UUID	外鍵 → users.id
category	string	維修類別
description	text	維修詳細描述
attachmentUrl	string	圖片或附件
status	string	狀態（待處理 / 已回覆）
createdAt	timestamp	建立時間
updatedAt	timestamp	更新時間
replies
欄位	類型	說明
id	UUID	主鍵
repairRequestId	UUID	外鍵 → repair_requests.id
adminId	UUID	管理者 ID
content	text	回覆內容
createdAt	timestamp	建立時間
4. API 設計
4.1 使用者相關

POST /api/users/login

描述：使用 LINE 登入取得 userId

輸入：LIFF accessToken

回傳：user 資料

4.2 維修單相關

POST /api/repair-requests

描述：新增維修單

輸入：category、description、attachmentUrl、userId

回傳：維修單資料

GET /api/repair-requests?userId=xxx

描述：取得該使用者的維修單列表

4.3 回覆相關

POST /api/replies

描述：管理者新增回覆

輸入：repairRequestId、content、adminId

回傳：回覆資料

額外操作：呼叫 LINE Messaging API 通知 userId

GET /api/replies?repairRequestId=xxx

描述：取得維修單的回覆列表

5. LIFF 整合流程

使用者點擊 LINE 內連結 → 開啟 LIFF Web App

初始化 LIFF SDK → 取得 accessToken → 取得 userId

前端傳 userId 給後端，建立或更新使用者資料

使用者填寫表單 → 送出 → 後端儲存維修單

後台管理者回覆 → 後端呼叫 LINE Messaging API 發送通知

6. 部署方案

前端：Vercel

靜態頁面 + LIFF SDK

後端：Vercel Serverless Function

API + LINE Messaging API

資料庫：Supabase / PostgreSQL

Storage：Cloudinary / Supabase Storage

開發流程：

GitHub Push → Vercel 自動部署

前端呼叫後端 API，連資料庫與 Storage

管理者回覆觸發 LINE 通知

7. MVP 開發流程建議

前端原型 + mock data（表單、列表、後台頁面）

後端 API 開發（CRUD）

LIFF 登入整合

LINE Messaging API 推播功能

部署測試（Vercel + Supabase）

收集回饋 → 迭代優化