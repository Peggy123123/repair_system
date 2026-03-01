import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export interface WorkOrderData {
  userName: string;
  deviceType: string;
  category: string;
  createdAt: string;
  description: string;
  repairContent?: string;
}

function getSignatureBase64(): string {
  const imgPath = path.resolve(__dirname, '../assets/images/sign_image.png');
  const imgBuffer = fs.readFileSync(imgPath);
  return `data:image/png;base64,${imgBuffer.toString('base64')}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildWorkOrderHTML(data: WorkOrderData): string {
  const signatureBase64 = getSignatureBase64();
  const now = new Date();
  const printDate = `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700&display=swap">
  <style>
    body {
      font-family: 'Noto Sans TC', 'Microsoft JhengHei', 'PingFang TC', sans-serif;
      padding: 40px 30px;
      color: #222;
      margin: 0;
    }
    h1 {
      text-align: center;
      font-size: 26px;
      margin-bottom: 4px;
      letter-spacing: 4px;
    }
    hr {
      border: none;
      border-top: 2px solid #333;
      margin: 12px 0 28px 0;
    }
    table.info {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
      margin-bottom: 24px;
    }
    table.info td {
      padding: 10px 12px;
      border: 1px solid #ccc;
    }
    table.info td.label {
      background: #f7f7f7;
      font-weight: bold;
      width: 100px;
    }
    .section-title {
      font-size: 15px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .description-box {
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 14px;
      min-height: 80px;
      font-size: 14px;
      white-space: pre-wrap;
      line-height: 1.6;
    }
    .repair-content-box {
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 14px;
      min-height: 160px;
      font-size: 14px;
      white-space: pre-wrap;
      line-height: 1.6;
    }
    table.signature {
      width: 100%;
      border-collapse: collapse;
      margin-top: 40px;
    }
    table.signature td {
      width: 50%;
      vertical-align: bottom;
    }
    .sig-label {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .sig-box {
      border: 1px solid #ccc;
      border-radius: 4px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sig-box img {
      max-height: 60px;
      max-width: 150px;
    }
    .footer {
      font-size: 11px;
      color: #999;
      margin-top: 40px;
      border-top: 1px solid #ddd;
      padding-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  </style>
</head>
<body>
  <h1>維修工單</h1>
  <hr />

  <table class="info">
    <tr>
      <td class="label">申請人</td>
      <td>${escapeHtml(data.userName)}</td>
      <td class="label">機型</td>
      <td>${escapeHtml(data.deviceType)}</td>
    </tr>
    <tr>
      <td class="label">類別</td>
      <td>${escapeHtml(data.category)}</td>
      <td class="label">申請時間</td>
      <td>${formatDate(data.createdAt)}</td>
    </tr>
  </table>

  <div style="margin-bottom: 28px;">
    <div class="section-title">問題描述</div>
    <div class="description-box">${escapeHtml(data.description)}</div>
  </div>

  <div style="margin-bottom: 28px;">
    <div class="section-title">維修內容</div>
    <div class="repair-content-box">${data.repairContent ? escapeHtml(data.repairContent) : ''}</div>
  </div>

  <table class="signature">
    <tr>
      <td style="padding-right: 20px;">
        <div class="sig-label">使用者簽名</div>
        <div class="sig-box"></div>
      </td>
      <td style="padding-left: 20px;">
        <div class="sig-label">經手人</div>
        <div class="sig-box">
          <img src="${signatureBase64}" alt="經手人簽名" />
        </div>
      </td>
    </tr>
  </table>

  <div class="footer">
    <span>此工單由鈦客星電腦診所維修系統自動生成</span>
    <span>列印日期：${printDate}</span>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getLocalChromePath(): string | undefined {
  // 本機開發：使用系統安裝的 Chrome
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // macOS
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ];
  return candidates.find((p) => fs.existsSync(p));
}

export async function generateWorkOrderPDF(data: WorkOrderData): Promise<Buffer> {
  const html = buildWorkOrderHTML(data);
  const localChrome = getLocalChromePath();

  const browser = await puppeteer.launch({
    headless: true,
    ...(localChrome ? { executablePath: localChrome } : {}),
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.evaluate('return document.fonts.ready');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
      printBackground: true,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
