#!/usr/bin/env bash
set -e

# ============================================
#  鈦客星電腦診所維修申請系統 - 本地開發啟動腳本
# ============================================

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# 顏色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

MONGO_CONTAINER="repair-system-mongo"
PIDS=()

# ------------------------------------------
# 清理：Ctrl+C 時終止所有子程序
# ------------------------------------------
cleanup() {
  echo ""
  echo -e "${YELLOW}正在關閉服務...${NC}"
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  echo -e "${GREEN}所有服務已關閉${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM

# ------------------------------------------
# 工具函數
# ------------------------------------------
log_step() {
  echo -e "\n${CYAN}[$1/$TOTAL_STEPS]${NC} $2"
}

log_ok() {
  echo -e "    ${GREEN}✔${NC} $1"
}

log_warn() {
  echo -e "    ${YELLOW}!${NC} $1"
}

log_err() {
  echo -e "    ${RED}✘${NC} $1"
}

TOTAL_STEPS=5

echo -e "${CYAN}"
echo "============================================"
echo "  鈦客星電腦診所 - 啟動本地開發環境"
echo "============================================"
echo -e "${NC}"

# ------------------------------------------
# Step 1: 檢查前置工具
# ------------------------------------------
log_step 1 "檢查前置工具"

if ! command -v node &>/dev/null; then
  log_err "找不到 Node.js，請先安裝 Node.js 20.x"
  exit 1
fi
log_ok "Node.js $(node -v)"

if ! command -v docker &>/dev/null; then
  log_err "找不到 Docker，請先安裝 Docker"
  exit 1
fi

# 檢查 Docker daemon 是否正在運行
if ! docker info &>/dev/null; then
  log_warn "Docker daemon 未運行，嘗試啟動 Docker Desktop..."
  open -a Docker
  echo -ne "    等待 Docker 啟動"
  for i in $(seq 1 30); do
    if docker info &>/dev/null; then
      echo ""
      log_ok "Docker 已就緒"
      break
    fi
    echo -n "."
    sleep 2
    if [ "$i" -eq 30 ]; then
      echo ""
      log_err "Docker 啟動逾時，請手動開啟 Docker Desktop 後重試"
      exit 1
    fi
  done
else
  log_ok "Docker $(docker --version | awk '{print $3}' | tr -d ',')"
fi

# ------------------------------------------
# Step 2: 安裝依賴（如有缺少）
# ------------------------------------------
log_step 2 "檢查並安裝依賴"

if [ ! -d "$ROOT_DIR/node_modules" ]; then
  log_warn "前端依賴未安裝，執行 npm install..."
  npm install --prefix "$ROOT_DIR"
else
  log_ok "前端依賴已安裝"
fi

if [ ! -d "$ROOT_DIR/server/node_modules" ]; then
  log_warn "後端依賴未安裝，執行 npm install..."
  npm install --prefix "$ROOT_DIR/server"
else
  log_ok "後端依賴已安裝"
fi

# ------------------------------------------
# Step 3: 啟動 MongoDB
# ------------------------------------------
log_step 3 "啟動 MongoDB"

# 檢查容器是否存在
if docker ps -a --format '{{.Names}}' | grep -q "^${MONGO_CONTAINER}$"; then
  # 容器存在，檢查是否正在運行
  if docker ps --format '{{.Names}}' | grep -q "^${MONGO_CONTAINER}$"; then
    log_ok "MongoDB 容器已在運行中"
  else
    docker start "$MONGO_CONTAINER" >/dev/null
    log_ok "MongoDB 容器已啟動"
  fi
else
  # 容器不存在，建立新容器
  log_warn "建立 MongoDB 容器..."
  docker run -d \
    --name "$MONGO_CONTAINER" \
    -p 27017:27017 \
    -v repair-system-data:/data/db \
    mongo:7 >/dev/null
  log_ok "MongoDB 容器已建立並啟動"
fi

# ------------------------------------------
# Step 4: 檢查環境變數
# ------------------------------------------
log_step 4 "檢查環境變數"

if [ ! -f "$ROOT_DIR/.env" ]; then
  log_warn "前端 .env 不存在，從範例建立..."
  cat > "$ROOT_DIR/.env" <<EOF
# API
VITE_API_BASE_URL=http://localhost:3000/api

# LINE LIFF (optional)
VITE_LINE_LIFF_ID=
EOF
  log_ok "已建立 .env"
else
  log_ok "前端 .env 已存在"
fi

if [ ! -f "$ROOT_DIR/server/.env" ]; then
  if [ -f "$ROOT_DIR/server/.env.example" ]; then
    cp "$ROOT_DIR/server/.env.example" "$ROOT_DIR/server/.env"
    log_warn "後端 .env 從 .env.example 複製建立"
  else
    cat > "$ROOT_DIR/server/.env" <<EOF
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/repair_system
JWT_SECRET=repair-system-jwt-secret-dev
JWT_ADMIN_SECRET=repair-system-admin-jwt-secret-dev
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
LINE_CHANNEL_ID=
LINE_CHANNEL_SECRET=
EOF
    log_warn "已建立 server/.env"
  fi
else
  log_ok "後端 server/.env 已存在"
fi

# ------------------------------------------
# Step 5: 啟動前後端服務
# ------------------------------------------
log_step 5 "啟動前後端服務"

# 啟動後端
npm run server:dev > /tmp/repair-server.log 2>&1 &
SERVER_PID=$!
PIDS+=($SERVER_PID)
log_ok "後端啟動中 (PID: $SERVER_PID)"

# 等後端 port 就緒
echo -ne "    等待後端就緒"
for i in $(seq 1 30); do
  if lsof -i :3000 -sTCP:LISTEN &>/dev/null; then
    echo ""
    log_ok "後端已就緒 → http://localhost:3000"
    break
  fi
  echo -n "."
  sleep 1
  if [ "$i" -eq 30 ]; then
    echo ""
    log_warn "後端啟動較慢，繼續啟動前端（後端可能仍在載入中）"
  fi
done

# 啟動前端
npm run dev > /tmp/repair-frontend.log 2>&1 &
FRONTEND_PID=$!
PIDS+=($FRONTEND_PID)
log_ok "前端啟動中 (PID: $FRONTEND_PID)"

# 等前端 port 就緒
echo -ne "    等待前端就緒"
for i in $(seq 1 15); do
  if lsof -i :5173 -sTCP:LISTEN &>/dev/null; then
    echo ""
    log_ok "前端已就緒 → http://localhost:5173/repair_system/"
    break
  fi
  echo -n "."
  sleep 1
  if [ "$i" -eq 15 ]; then
    echo ""
    log_warn "前端啟動較慢，請稍等"
  fi
done

# ------------------------------------------
# 完成
# ------------------------------------------
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  開發環境啟動完成！${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "  前台：${CYAN}http://localhost:5173/repair_system/${NC}"
echo -e "  後台：${CYAN}http://localhost:5173/repair_system/admin/login${NC}"
echo -e "  API ：${CYAN}http://localhost:3000/api${NC}"
echo ""
echo -e "  前台帳號：user / 123456"
echo -e "  後台帳號：admin / admin123"
echo ""
echo -e "  ${YELLOW}按 Ctrl+C 關閉所有服務${NC}"
echo ""

# 保持腳本運行，等待子程序
wait
