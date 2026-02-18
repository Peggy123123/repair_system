// ─── 基礎設定 ───

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// ─── 錯誤類別 ───

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: { field: string; message: string }[]
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ─── Token 管理 ───

export const getAuthToken = (isAdmin = false): string | null => {
  const key = isAdmin ? 'admin_token' : 'user_token'
  return localStorage.getItem(key)
}

export const setAuthToken = (token: string, isAdmin = false): void => {
  const key = isAdmin ? 'admin_token' : 'user_token'
  localStorage.setItem(key, token)
}

export const removeAuthToken = (isAdmin = false): void => {
  const key = isAdmin ? 'admin_token' : 'user_token'
  localStorage.removeItem(key)
}

// ─── HTTP 請求 ───

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  details?: { field: string; message: string }[]
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  isAdmin = false
): Promise<T> {
  const token = getAuthToken(isAdmin)

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data: ApiResponse<T> = await response.json()

  if (!response.ok || !data.success) {
    throw new ApiError(
      data.error || 'API 請求失敗',
      response.status,
      data.details
    )
  }

  return data.data as T
}
