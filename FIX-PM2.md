# 🔧 FIX PM2 - Cannot Find Module server.js

## ❌ VẤN ĐỀ

PM2 đang tìm file `server.js` không tồn tại → Tracker service không start được.

---

## ✅ GIẢI PHÁP

### Bước 1: Stop và Delete Tất Cả Processes

```bash
cd /www/wwwroot/afl-tracker

# Stop tất cả
pm2 stop all

# Delete tất cả processes
pm2 delete all

# Verify
pm2 list
# Phải thấy: "No process found"
```

### Bước 2: Start Lại Từ Đầu

```bash
# Start lại với ecosystem config
npm run pm2:start

# Hoặc
pm2 start ecosystem.config.cjs
```

### Bước 3: Verify

```bash
# Check status
pm2 list

# Check logs
pm2 logs --lines 20
```

---

## 🔍 NẾU VẪN LỖI

### Kiểm Tra Ecosystem Config

```bash
# Verify file tồn tại
cat ecosystem.config.cjs | grep tracker

# Phải thấy:
# script: './src/services/tracker/index.js'
```

### Kiểm Tra File Tracker Có Tồn Tại

```bash
ls -la src/services/tracker/index.js
```

### Test Manual Start

```bash
# Stop PM2
pm2 stop all

# Test manual
cd /www/wwwroot/afl-tracker
node src/services/tracker/index.js
```

Nếu manual start OK → Vấn đề ở PM2 config.
Nếu manual start lỗi → Vấn đề ở code.

---

## 🎯 QUICK FIX

```bash
cd /www/wwwroot/afl-tracker

# 1. Clean PM2
pm2 delete all
pm2 kill

# 2. Start lại
pm2 start ecosystem.config.cjs

# 3. Save
pm2 save

# 4. Check
pm2 list
pm2 logs --lines 10
```

---

*Fix PM2 Guide v1.0*
