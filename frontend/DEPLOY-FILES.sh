#!/bin/bash

# Script để copy files lên server qua FTP hoặc SCP
# Sử dụng: ./DEPLOY-FILES.sh

SERVER_PATH="/www/wwwroot/afl-tracker/frontend"
LOCAL_PATH="."

echo "🚀 Bắt đầu deploy files lên server..."

# 1. Tạo thư mục contexts nếu chưa có
echo "📁 Tạo thư mục contexts..."
ssh root@your-server "mkdir -p $SERVER_PATH/src/contexts"

# 2. Copy contexts
echo "📦 Copy ThemeContext..."
scp src/contexts/ThemeContext.jsx root@your-server:$SERVER_PATH/src/contexts/

# 3. Copy components mới
echo "📦 Copy components..."
scp src/components/EnhancedStatCard.jsx root@your-server:$SERVER_PATH/src/components/
scp src/components/PerformanceChart.jsx root@your-server:$SERVER_PATH/src/components/
scp src/components/Modal.jsx root@your-server:$SERVER_PATH/src/components/
scp src/components/ThemeToggle.jsx root@your-server:$SERVER_PATH/src/components/

# 4. Copy config files
echo "📦 Copy config files..."
scp tailwind.config.js root@your-server:$SERVER_PATH/
scp src/index.css root@your-server:$SERVER_PATH/src/
scp src/main.jsx root@your-server:$SERVER_PATH/src/
scp src/App.jsx root@your-server:$SERVER_PATH/src/
scp src/components/Layout.jsx root@your-server:$SERVER_PATH/src/components/

# 5. Copy package.json
echo "📦 Copy package.json..."
scp package.json root@your-server:$SERVER_PATH/

echo "✅ Hoàn thành copy files!"
echo ""
echo "📝 Tiếp theo trên server:"
echo "   cd $SERVER_PATH"
echo "   npm install"
echo "   npm run build"
