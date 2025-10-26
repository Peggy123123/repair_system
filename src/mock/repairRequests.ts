import type { RepairRequest, Reply } from '@/types'

export const mockRequests: RepairRequest[] = [
  {
    id: '1',
    userId: 'user1',
    category: '硬體故障',
    title: '電腦無法開機',
    description: '按下電源鍵沒有反應，風扇也不轉動',
    attachmentUrl: 'https://via.placeholder.com/300x200',
    status: 'pending',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    userId: 'user1',
    category: '軟體問題',
    title: 'Windows 藍屏錯誤',
    description: 'Windows 更新後出現藍屏錯誤，錯誤代碼 0x0000007B',
    status: 'in_progress',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-14T16:45:00Z'
  },
  {
    id: '3',
    userId: 'user1',
    category: '系統重灌',
    title: 'Windows 11 重灌',
    description: '需要重灌 Windows 11，保留重要資料，包括文件、照片等',
    status: 'completed',
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T15:30:00Z'
  },
  {
    id: '4',
    userId: 'user1',
    category: '網路問題',
    title: '網路連線不穩定',
    description: '網路連線不穩定，經常斷線，影響工作',
    status: 'cancelled',
    createdAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-12T14:20:00Z'
  },
  {
    id: '5',
    userId: 'user1',
    category: '資料救援',
    title: '硬碟資料救援',
    description: '硬碟損壞，需要救援重要檔案，包括工作文件和個人照片',
    status: 'pending',
    createdAt: '2024-01-11T16:45:00Z',
    updatedAt: '2024-01-11T16:45:00Z'
  }
]

export const mockReplies: Reply[] = [
  {
    id: '1',
    repairRequestId: '2',
    adminId: 'admin1',
    content: '建議您先嘗試進入安全模式，如果問題持續，我們可以安排現場檢測。',
    createdAt: '2024-01-14T16:45:00Z'
  },
  {
    id: '2',
    repairRequestId: '3',
    adminId: 'admin1',
    content: '系統重灌已完成，所有重要資料已備份並恢復。請測試系統功能是否正常。',
    createdAt: '2024-01-13T15:30:00Z'
  }
]
