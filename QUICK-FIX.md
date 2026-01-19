# ⚡ QUICK FIX - Connection Refused

## 🔍 VẤN ĐỀ

Service không listen trên port 3001 → Có thể đang crash hoặc không start được.

---

## ✅ GIẢI PHÁP NHANH

### Bước 1: Xem Logs Chi Tiết

```bash
# Xem logs của tracker
pm2 logs afl-tracker --lines 100 --timestamp

# Hoặc xem file log trực tiếp
tail -50 /www/wwwroot/afl-tracker/logs/tracker-error.log
tail -50 /www/wwwroot/afl-tracker/logs/tracker-out.log
```

**Tìm các lỗi:**
- `Error: Cannot find module`
- `ECONNREFUSED` (Database/Redis)
- `EADDRINUSE` (Port đã dùng)
- `SyntaxError`

### Bước 2: Test Manual Start

```bash
cd /www/wwwroot/afl-tracker

# Stop PM2
pm2 stop afl-tracker

# Start manual để xem lỗi
NODE_ENV=production node src/services/tracker/index.js
```

**Nếu có lỗi** → Sẽ hiển thị ngay!

### Bước 3: Kiểm Tra Database & Redis

```bash
# Test database
node scripts/test-connection.js

# Test Redis
redis-cli ping
# Phải trả về: PONG
```

### Bước 4: Kiểm Tra Dependencies

```bash
# Đảm bảo đã cài đủ
cd /www/wwwroot/afl-tracker
npm install --production

# Kiểm tra file có tồn tại không
ls -la src/services/tracker/index.js
ls -la src/config/database.js
ls -la src/config/redis.js
```

---

## 🐛 CÁC LỖI THƯỜNG GẶP

### Lỗi 1: "Cannot find module 'mysql2'"

**Fix:**
```bash
npm install mysql2 --save
```

### Lỗi 2: "ECONNREFUSED" - Database

**Fix:**
```bash
# Start MySQL
systemctl start mysql

# Kiểm tra .env
cat .env | grep DB_
```

### Lỗi 3: "ECONNREFUSED" - Redis

**Fix:**
```bash
# Start Redis
systemctl start redis

# Hoặc tạm thời comment Redis code
```

### Lỗi 4: "EADDRINUSE" - Port đã dùng

**Fix:**
```bash
# Tìm process dùng port 3001
lsof -i :3001

# Kill process
kill -9 <PID>

# Hoặc đổi port trong .env
TRACKER_PORT=3004
```

---

## 🔧 FIX NGAY: Tạm Thời Disable Redis

Nếu Redis chưa cài, tạm thời sửa code:

```bash
# Edit tracker file
nano src/services/tracker/clickHandler.js
```

Tìm dòng:
```javascript
const cached = await redis.get(cacheKey);
```

Comment tạm thời:
```javascript
// const cached = await redis.get(cacheKey);
const cached = null; // Tạm thời disable Redis
```

Làm tương tự với các dòng Redis khác.

---

## 📋 CHECKLIST

- [ ] Xem logs: `pm2 logs afl-tracker`
- [ ] Test manual: `node src/services/tracker/index.js`
- [ ] Test database: `node scripts/test-connection.js`
- [ ] Test Redis: `redis-cli ping`
- [ ] Check dependencies: `npm install`
- [ ] Check .env file: `cat .env`

---

## 🆘 NẾU VẪN LỖI

Chạy lệnh này và gửi output cho tôi:

```bash
cd /www/wwwroot/afl-tracker

# Collect debug info
echo "=== PM2 STATUS ===" > debug.txt
pm2 list >> debug.txt

echo "=== PM2 LOGS ===" >> debug.txt
pm2 logs afl-tracker --lines 50 --nostream >> debug.txt

echo "=== DATABASE TEST ===" >> debug.txt
node scripts/test-connection.js >> debug.txt 2>&1

echo "=== ENV CHECK ===" >> debug.txt
cat .env | grep -v PASSWORD >> debug.txt

echo "=== PORT CHECK ===" >> debug.txt
netstat -tlnp | grep 3001 >> debug.txt

cat debug.txt
```

---

*Quick Fix Guide v1.0*
