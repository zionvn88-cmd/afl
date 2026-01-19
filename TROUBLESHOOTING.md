# 🔧 TROUBLESHOOTING GUIDE

## ❌ Lỗi: Connection Refused trên Port 3001

### Nguyên Nhân Có Thể:

1. **Service chưa bind đúng port**
2. **Service crash ngay sau khi start**
3. **Firewall chặn port**
4. **Code có lỗi**

---

## 🔍 CÁCH KIỂM TRA

### 1. Xem Logs của Tracker Service

```bash
# Xem logs real-time
pm2 logs afl-tracker --lines 50

# Hoặc xem file log
tail -f /www/wwwroot/afl-tracker/logs/tracker-error.log
tail -f /www/wwwroot/afl-tracker/logs/tracker-out.log
```

**Tìm lỗi:**
- Database connection error
- Redis connection error
- Port already in use
- Syntax errors

### 2. Kiểm Tra Port Có Đang Listen

```bash
# Kiểm tra port 3001
netstat -tlnp | grep 3001

# Hoặc
lsof -i :3001

# Hoặc
ss -tlnp | grep 3001
```

**Nếu không thấy port 3001** → Service chưa start đúng

### 3. Kiểm Tra Process Có Đang Chạy

```bash
# Xem chi tiết process
pm2 describe afl-tracker

# Hoặc
ps aux | grep node
```

### 4. Test Manual Start

```bash
# Stop service
pm2 stop afl-tracker

# Start manual để xem lỗi
cd /www/wwwroot/afl-tracker
node src/services/tracker/index.js
```

**Nếu có lỗi** → Sẽ hiển thị ngay trong terminal

---

## ✅ GIẢI PHÁP

### Fix 1: Kiểm Tra Database Connection

```bash
# Test database connection
cd /www/wwwroot/afl-tracker
node scripts/test-connection.js
```

**Nếu lỗi database:**
- Kiểm tra `.env` file
- Kiểm tra MySQL đang chạy: `systemctl status mysql`
- Kiểm tra credentials

### Fix 2: Kiểm Tra Redis Connection

```bash
# Test Redis
redis-cli ping
# Phải trả về: PONG
```

**Nếu lỗi Redis:**
- Start Redis: `systemctl start redis`
- Hoặc tạm thời comment Redis code nếu chưa cần

### Fix 3: Kiểm Tra Port Conflict

```bash
# Xem port nào đang dùng
netstat -tlnp | grep 3001

# Nếu có process khác dùng port 3001
# Kill process đó hoặc đổi port trong .env
```

### Fix 4: Restart Service

```bash
# Stop và start lại
pm2 stop afl-tracker
pm2 start afl-tracker

# Hoặc restart tất cả
pm2 restart all
```

### Fix 5: Xem Chi Tiết Lỗi

```bash
# Xem logs với timestamp
pm2 logs afl-tracker --timestamp

# Xem error logs
pm2 logs afl-tracker --err
```

---

## 🐛 CÁC LỖI THƯỜNG GẶP

### Lỗi 1: "Cannot find module"

**Nguyên nhân:** Chưa cài dependencies

**Giải pháp:**
```bash
cd /www/wwwroot/afl-tracker
npm install --production
```

### Lỗi 2: "ECONNREFUSED" (Database)

**Nguyên nhân:** MySQL chưa chạy hoặc credentials sai

**Giải pháp:**
```bash
# Start MySQL
systemctl start mysql

# Kiểm tra credentials trong .env
cat .env | grep DB_
```

### Lỗi 3: "ECONNREFUSED" (Redis)

**Nguyên nhân:** Redis chưa chạy

**Giải pháp:**
```bash
# Start Redis
systemctl start redis

# Hoặc tạm thời disable Redis trong code
```

### Lỗi 4: "EADDRINUSE" (Port already in use)

**Nguyên nhân:** Port đã được dùng bởi process khác

**Giải pháp:**
```bash
# Tìm process dùng port
lsof -i :3001

# Kill process
kill -9 <PID>

# Hoặc đổi port trong .env
```

### Lỗi 5: "SyntaxError" hoặc "ReferenceError"

**Nguyên nhân:** Code có lỗi syntax

**Giải pháp:**
```bash
# Check syntax
node -c src/services/tracker/index.js

# Xem logs chi tiết
pm2 logs afl-tracker --lines 100
```

---

## 📋 CHECKLIST DEBUG

- [ ] Xem logs: `pm2 logs afl-tracker`
- [ ] Test database: `node scripts/test-connection.js`
- [ ] Test Redis: `redis-cli ping`
- [ ] Check port: `netstat -tlnp | grep 3001`
- [ ] Check process: `pm2 describe afl-tracker`
- [ ] Test manual: `node src/services/tracker/index.js`
- [ ] Check .env file: `cat .env`
- [ ] Check dependencies: `npm list`

---

## 🆘 NẾU VẪN LỖI

1. **Copy toàn bộ log output** và gửi cho tôi
2. **Chạy lệnh debug:**
```bash
cd /www/wwwroot/afl-tracker
pm2 logs --lines 200 > debug.log 2>&1
cat debug.log
```

3. **Kiểm tra file .env:**
```bash
cat .env | grep -v PASSWORD
```

---

## 💡 TIPS

- Luôn check logs trước khi hỏi
- Test từng service một
- Đảm bảo dependencies đã cài
- Check .env file đúng format
- Verify MySQL và Redis đang chạy

---

*Troubleshooting Guide v1.0*
