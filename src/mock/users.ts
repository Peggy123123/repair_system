import type { AdminUser, User } from '@/types'

export const mockUsers: AdminUser[] = [
  {
    id: 'user1',
    lineUserId: 'U1234567890',
    displayName: '測試使用者',
    avatarUrl: 'https://via.placeholder.com/40x40',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'user2',
    lineUserId: 'U0987654321',
    displayName: '張小明',
    avatarUrl: 'https://via.placeholder.com/40x40',
    status: 'active',
    createdAt: '2024-01-02T00:00:00Z',
    lastLoginAt: '2024-01-14T16:45:00Z'
  },
  {
    id: 'user3',
    lineUserId: null,
    displayName: '李美華',
    avatarUrl: 'https://via.placeholder.com/40x40',
    status: 'inactive',
    createdAt: '2024-01-03T00:00:00Z',
    lastLoginAt: '2024-01-13T09:15:00Z'
  }
]
// 登入用的 mock 使用者
export const mockLoginUsers: User[] = [
  {
    id: 'user1',
    lineUserId: null,
    displayName: '一般使用者',
    avatarUrl: 'https://via.placeholder.com/100x100'
  },
  {
    id: 'user2',
    lineUserId: 'U1234567890abcdef',
    displayName: 'LINE 使用者',
    avatarUrl: 'https://via.placeholder.com/100x100'
  }
]

