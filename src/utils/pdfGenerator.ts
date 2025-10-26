import jsPDF from 'jspdf'
import type { RepairRequest } from '@/types'

export interface WorkOrderData {
  request: RepairRequest
  userInfo: {
    displayName: string
    avatarUrl?: string
  }
  deviceInfo: {
    deviceName: string
    categoryName: string
  }
}

export class PDFGenerator {
  private doc: jsPDF

  constructor() {
    this.doc = new jsPDF()
  }

  generateWorkOrder(data: WorkOrderData): void {
    const { request, userInfo, deviceInfo } = data
    
    // 設定字體
    this.doc.setFont('helvetica')
    
    // 標題
    this.doc.setFontSize(20)
    this.doc.text('維修工單', 105, 20, { align: 'center' })
    
    // 分隔線
    this.doc.setLineWidth(0.5)
    this.doc.line(20, 25, 190, 25)
    
    // 工單編號
    this.doc.setFontSize(12)
    this.doc.text(`工單編號: ${request.id}`, 20, 35)
    
    // 建立日期
    const createDate = new Date(request.createdAt).toLocaleDateString('zh-TW')
    this.doc.text(`建立日期: ${createDate}`, 20, 45)
    
    // 狀態
    const statusMap = {
      pending: '待處理',
      in_progress: '處理中', 
      repairing: '維修中',
      completed: '已完成',
      cancelled: '已取消'
    }
    this.doc.text(`狀態: ${statusMap[request.status]}`, 20, 55)
    
    // 分隔線
    this.doc.line(20, 60, 190, 60)
    
    // 客戶資訊
    this.doc.setFontSize(14)
    this.doc.text('客戶資訊', 20, 70)
    
    this.doc.setFontSize(12)
    this.doc.text(`姓名: ${userInfo.displayName}`, 20, 80)
    this.doc.text(`客戶ID: ${request.userId}`, 20, 90)
    
    // 分隔線
    this.doc.line(20, 95, 190, 95)
    
    // 設備資訊
    this.doc.setFontSize(14)
    this.doc.text('設備資訊', 20, 105)
    
    this.doc.setFontSize(12)
    this.doc.text(`設備類型: ${deviceInfo.deviceName}`, 20, 115)
    this.doc.text(`維修類別: ${deviceInfo.categoryName}`, 20, 125)
    
    // 分隔線
    this.doc.line(20, 130, 190, 130)
    
    // 報修詳情
    this.doc.setFontSize(14)
    this.doc.text('報修詳情', 20, 140)
    
    this.doc.setFontSize(12)
    this.doc.text(`主題: ${request.title}`, 20, 150)
    
    // 描述 (支援多行)
    const descriptionLines = this.doc.splitTextToSize(
      `描述: ${request.description}`, 
      160
    )
    this.doc.text(descriptionLines, 20, 160)
    
    // 如果有附件
    let currentY = 160 + (descriptionLines.length * 5) + 10
    if (request.attachmentUrls && request.attachmentUrls.length > 0) {
      this.doc.text(`附件數量: ${request.attachmentUrls.length} 張`, 20, currentY)
      currentY += 10
    }
    
    // 分隔線
    this.doc.line(20, currentY, 190, currentY)
    
    // 簽名區塊
    this.addSignatureSection(currentY + 10)
    
    // 頁尾
    this.addFooter()
    
    // 下載PDF
    this.doc.save(`工單_${request.id}.pdf`)
  }

  private addSignatureSection(startY: number): void {
    // 簽名區塊標題
    this.doc.setFontSize(14)
    this.doc.text('簽名確認', 20, startY)
    
    // 客戶簽名區
    this.doc.setFontSize(12)
    this.doc.text('客戶簽名:', 20, startY + 15)
    
    // 簽名框
    this.doc.setLineWidth(0.5)
    this.doc.rect(20, startY + 20, 80, 30)
    this.doc.text('請在此處簽名', 25, startY + 35, { align: 'center' })
    
    // 日期
    this.doc.text('日期: ___________', 25, startY + 50)
    
    // 維修人員簽名區
    this.doc.text('維修人員簽名:', 120, startY + 15)
    
    // 簽名框
    this.doc.rect(120, startY + 20, 80, 30)
    this.doc.text('維修人員簽名', 125, startY + 35, { align: 'center' })
    
    // 日期
    this.doc.text('日期: ___________', 125, startY + 50)
  }

  private addFooter(): void {
    const pageHeight = this.doc.internal.pageSize.height
    
    // 頁尾分隔線
    this.doc.setLineWidth(0.3)
    this.doc.line(20, pageHeight - 20, 190, pageHeight - 20)
    
    // 頁尾文字
    this.doc.setFontSize(10)
    this.doc.text('此工單由維修系統自動生成', 105, pageHeight - 10, { align: 'center' })
  }

  // 生成預覽版本 (不自動下載)
  generatePreview(data: WorkOrderData): string {
    this.generateWorkOrder(data)
    return this.doc.output('datauristring')
  }
}

// 便利函數
export const generateWorkOrderPDF = (data: WorkOrderData): void => {
  const generator = new PDFGenerator()
  generator.generateWorkOrder(data)
}

export const generateWorkOrderPreview = (data: WorkOrderData): string => {
  const generator = new PDFGenerator()
  return generator.generatePreview(data)
}
