import type { AdminUser, User, Admin } from '@/types'

export const mockUsers: AdminUser[] = [
  {
    id: 'user1',
    lineUserId: 'U1234567890',
    displayName: '測試使用者',
    avatarUrl: 'https://via.placeholder.com/100x100',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'user2',
    lineUserId: 'U0987654321',
    displayName: '張小明',
    avatarUrl: 'https://via.placeholder.com/100x100',
    status: 'active',
    createdAt: '2024-01-02T00:00:00Z',
    lastLoginAt: '2024-01-14T16:45:00Z'
  },
  {
    id: 'user3',
    lineUserId: null,
    displayName: '李美華',
    avatarUrl: '',
    status: 'inactive',
    createdAt: '2024-01-03T00:00:00Z',
    lastLoginAt: '2024-01-13T09:15:00Z'
  }
]

// 登入用的 mock 使用者 (與 mockUsers 保持一致)
export const mockLoginUsers: User[] = [
  {
    id: 'user1',
    lineUserId: 'U1234567890',
    displayName: '測試使用者',
    avatarUrl: 'https://via.placeholder.com/100x100'
  },
  {
    id: 'user2',
    lineUserId: 'U0987654321',
    displayName: '張小明',
    avatarUrl: 'https://via.placeholder.com/100x100'
  }
]

// Mock 管理員資料
export const mockAdmins: Admin[] = [
  {
    id: 'admin1',
    username: 'admin',
    displayName: '系統管理員',
    avatarUrl: 'https://via.placeholder.com/100x100',
    role: 'super_admin',
    status: 'active',
    lastLoginAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'admin2',
    username: 'manager',
    displayName: '維修經理',
    avatarUrl: 'https://via.placeholder.com/100x100',
    role: 'admin',
    status: 'active',
    lastLoginAt: '2024-01-14T09:00:00Z'
  }
]

