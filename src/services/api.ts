import type {
  RepairOrder,
  Reply,
  RepairStatus,
  RepairSupplement,
  RepairOrderWithUser
} from '@/types/frontend'
import type { ApiRepairOrder, ApiReply, ApiRepairOrderWithUser, ApiUser, ApiAdmin, DashboardStats } from '@/types/api'
import { request, getAuthToken, setAuthToken, removeAuthToken } from './service'

// Re-export 供外部使用
export { ApiError, getAuthToken, setAuthToken, removeAuthToken } from './service'

// ─── Transform 函數 ───
// transformRepairOrder（前台/後台共用）- API 維修訂單 → 前端型別
export function transformRepairOrder(api: ApiRepairOrder): RepairOrder {
  return {
    id: api.id,
    userId: api.userId,
    category: api.category,
    title: api.title,
    description: api.description,
    deviceType: api.deviceType,
    attachmentUrls: api.attachmentUrls,
    supplements: api.supplements?.map((s, index) => ({
      id: `${api.id}-supplement-${index}`,
      content: s.content,
      attachmentUrls: s.attachmentUrls,
      createdAt: s.createdAt,
    })) as RepairSupplement[],
    repairContent: api.repairContent,
    notes: api.notes,
    status: api.status as RepairStatus,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  }
}

// transformReply（前台/後台共用）- API 回覆 → 前端型別
export function transformReply(api: ApiReply): Reply {
  return {
    id: api.id,
    repairOrderId: api.repairOrderId,
    adminId: api.adminId,
    content: api.content,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  }
}

// transformRepairOrderWithUser（後台）- API 維修訂單 + 使用者資訊 → 前端型別
export function transformRepairOrderWithUser(api: ApiRepairOrderWithUser): RepairOrderWithUser {
  return {
    ...transformRepairOrder(api),
    userName: api.userName,
    userAvatar: api.userAvatar,
  }
}

// ─── 前台認證 ───
// loginUser（前台）- 使用者帳號密碼登入
export async function loginUser(username: string, password: string) {
  const result = await request<{
    token: string
    user: {
      id: string
      displayName: string
      avatarUrl: string
      lineUserId: string | null
    }
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  setAuthToken(result.token, false)
  return result
}

// loginUserByLine（前台）- 使用者 LINE 登入
export async function loginUserByLine(accessToken: string) {
  const result = await request<{
    token: string
    user: {
      id: string
      displayName: string
      avatarUrl: string
      lineUserId: string | null
    }
  }>('/auth/line/callback', {
    method: 'POST',
    body: JSON.stringify({ accessToken }),
  })
  setAuthToken(result.token, false)
  return result
}

// logoutUser（前台）- 前台使用者登出
export async function logoutUser() {
  try {
    await request('/auth/logout', { method: 'POST' })
  } finally {
    removeAuthToken(false)
  }
}

// getCurrentUser（前台）- 取得目前登入的前台使用者
export async function getCurrentUser() {
  return request<{
    id: string
    displayName: string
    avatarUrl: string
    lineUserId: string | null
  }>('/auth/me')
}

// ─── 後台認證 ───
// loginAdmin（後台）- 管理者帳號密碼登入
export async function loginAdmin(username: string, password: string) {
  const result = await request<{
    token: string
    admin: {
      id: string
      username: string
      displayName: string
      avatarUrl: string
      role: string
    }
  }>(
    '/admin/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    },
    true
  )
  setAuthToken(result.token, true)
  return result
}

// logoutAdmin（後台）- 管理者登出
export async function logoutAdmin() {
  try {
    await request('/admin/auth/logout', { method: 'POST' }, true)
  } finally {
    removeAuthToken(true)
  }
}

// getCurrentAdmin（後台）- 取得目前登入的管理者
export async function getCurrentAdmin() {
  return request<{
    id: string
    username: string
    displayName: string
    avatarUrl: string
    role: string
  }>('/admin/auth/me', {}, true)
}

// changeAdminPassword（後台）- 管理者修改密碼
export async function changeAdminPassword(currentPassword: string, newPassword: string) {
  return request<null>(
    '/admin/auth/password',
    {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    },
    true
  )
}

// ─── 維修訂單 ───
// getMyOrders（前台）- 取得目前使用者的維修訂單列表
export async function getMyOrders(status?: string): Promise<RepairOrder[]> {
  const query = status ? `?status=${status}` : ''
  const result = await request<ApiRepairOrder[]>(`/repairs${query}`)
  return result.map(transformRepairOrder)
}

// getOrderById（前台）- 依 ID 取得單筆維修訂單
export async function getOrderById(id: string, isAdmin?: false): Promise<RepairOrder>
// getOrderById（後台）- 依 ID 取得單筆維修訂單（含使用者資訊）
export async function getOrderById(id: string, isAdmin: true): Promise<RepairOrderWithUser>
export async function getOrderById(id: string, isAdmin = false): Promise<RepairOrder | RepairOrderWithUser> {
  if (isAdmin) {
    const result = await request<ApiRepairOrderWithUser>(`/repairs/${id}`, {}, true)
    return transformRepairOrderWithUser(result)
  }
  const result = await request<ApiRepairOrder>(`/repairs/${id}`, {})
  return transformRepairOrder(result)
}

// createOrder（前台）- 建立新的維修訂單
export async function createOrder(data: {
  category: string
  title: string
  description: string
  deviceType: string
  attachmentUrls?: string[]
}): Promise<RepairOrder> {
  const result = await request<ApiRepairOrder>('/repairs', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return transformRepairOrder(result)
}

// addSupplementToOrder（前台）- 新增維修訂單補充描述
export async function addSupplementToOrder(
  id: string,
  data: { content: string; attachmentUrls?: string[] }
): Promise<RepairOrder> {
  const result = await request<ApiRepairOrder>(`/repairs/${id}/supplements`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return transformRepairOrder(result)
}

// getOrderReplies（前台/後台共用）- 取得指定維修訂單的所有回覆
export async function getOrderReplies(id: string, isAdmin = false): Promise<Reply[]> {
  const result = await request<ApiReply[]>(`/repairs/${id}/replies`, {}, isAdmin)
  return result.map(transformReply)
}

// getAllOrders（後台）- 取得全部維修訂單（可依狀態、使用者篩選）
export async function getAllOrders(params?: { status?: string; userId?: string }): Promise<RepairOrderWithUser[]> {
  const query = new URLSearchParams()
  if (params?.status) query.append('status', params.status)
  if (params?.userId) query.append('userId', params.userId)
  const queryString = query.toString() ? `?${query.toString()}` : ''
  const result = await request<ApiRepairOrderWithUser[]>(
    `/repairs/admin/all${queryString}`,
    {},
    true
  )
  return result.map(transformRepairOrderWithUser)
}

// updateOrder（後台）- 更新維修訂單（狀態或內容）
export async function updateOrder(
  id: string,
  data: { status?: string; category?: string; title?: string; description?: string; deviceType?: string; repairContent?: string; notes?: string }
): Promise<RepairOrder> {
  const result = await request<ApiRepairOrder>(
    `/repairs/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
    true
  )
  return transformRepairOrder(result)
}

// deleteOrder（後台）- 刪除維修訂單
export async function deleteOrder(id: string): Promise<null> {
  return request<null>(`/repairs/${id}`, { method: 'DELETE' }, true)
}

// createOrderReply（後台）- 管理者新增回覆
export async function createOrderReply(orderId: string, content: string): Promise<Reply> {
  const result = await request<ApiReply>(
    `/repairs/${orderId}/replies`,
    {
      method: 'POST',
      body: JSON.stringify({ content }),
    },
    true
  )
  return transformReply(result)
}

// updateOrderReply（後台）- 管理者更新回覆
export async function updateOrderReply(orderId: string, replyId: string, content: string): Promise<Reply> {
  const result = await request<ApiReply>(
    `/repairs/${orderId}/replies/${replyId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    },
    true
  )
  return transformReply(result)
}

// deleteOrderReply（後台）- 管理者刪除回覆
export async function deleteOrderReply(orderId: string, replyId: string): Promise<null> {
  return request<null>(
    `/repairs/${orderId}/replies/${replyId}`,
    {
      method: 'DELETE',
    },
    true
  )
}

// getUsers（後台）- 取得前台使用者列表
export async function getUsers() {
  return request<ApiUser[]>('/users', {}, true)
}

// getUserById（後台）- 取得單一前台使用者資料
export async function getUserById(id: string) {
  return request<ApiUser>(`/users/${id}`, {}, true)
}

// getUserOrders（後台）- 取得指定使用者及其維修訂單列表
export async function getUserOrders(id: string) {
  const result = await request<{
    user: ApiUser
    orders: ApiRepairOrder[]
  }>(`/users/${id}/orders`, {}, true)
  return {
    user: result.user,
    orders: result.orders.map(transformRepairOrder),
  }
}

// updateUser（後台）- 更新前台使用者資料
export async function updateUser(id: string, data: { displayName?: string; status?: string }) {
  return request<ApiUser>(
    `/users/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
    true
  )
}

// getAdmins（後台）- 取得管理者列表
export async function getAdmins() {
  return request<ApiAdmin[]>('/admin/users', {}, true)
}

// createAdmin（後台）- 新增管理者帳號
export async function createAdmin(data: {
  username: string
  password: string
  displayName: string
  role?: string
}) {
  return request<ApiAdmin>(
    '/admin/users',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    true
  )
}

// updateAdmin（後台）- 更新管理者帳號資料
export async function updateAdmin(
  id: string,
  data: { displayName?: string; password?: string; role?: string; status?: string }
) {
  return request<ApiAdmin>(
    `/admin/users/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
    true
  )
}

// deleteAdmin（後台）- 刪除管理者帳號
export async function deleteAdmin(id: string) {
  return request<null>(`/admin/users/${id}`, { method: 'DELETE' }, true)
}

// getStatsSummary（後台）- 取得儀表板統計摘要
export async function getStatsSummary() {
  return request<DashboardStats>('/stats/summary', {}, true)
}

// generateOrderPDF（後台）- 下載維修工單 PDF
export async function generateOrderPDF(id: string, userName?: string): Promise<void> {
  const token = getAuthToken(true)
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
  const res = await fetch(`${baseUrl}/repairs/${id}/pdf`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  })

  if (!res.ok) {
    throw new Error('PDF 下載失敗')
  }

  // 生成檔名：維修工單_使用者名稱_列印日期
  const now = new Date()
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const fileName = userName ? `維修工單_${userName}_${dateStr}.pdf` : `維修工單_${dateStr}.pdf`

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}
