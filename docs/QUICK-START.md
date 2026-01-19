# ⚡ QUICK START - AFL TRACKER

Hướng dẫn nhanh để chạy AFL Tracker trên aaPanel.

---

## 📋 Checklist Trước Khi Bắt Đầu

- [ ] VPS đã cài aaPanel
- [ ] Đã cài Nginx, MySQL, Redis, PM2 Manager
- [ ] Có 3 subdomain trỏ về server
- [ ] Đã tạo database MySQL

---

## 🚀 5 Bước Cài Đặt Nhanh

### 1️⃣ Upload Code

```bash
cd /www/wwwroot
git clone YOUR_REPO afl-tracker
cd afl-tracker
npm install --production
```

### 2️⃣ Cấu Hình Database

```bash
# Tạo database trong aaPanel
# Database: afl_tracker
# User: afl_user

# Import schema
node scripts/init-database.js
```

### 3️⃣ Cấu Hình Environment

```bash
cp env.example .env
nano .env
# Sửa DB_PASSWORD, domain, etc
```

### 4️⃣ Khởi Động Services

```bash
npm run pm2:start
pm2 save
```

### 5️⃣ Cấu Hình Nginx

Trong aaPanel, tạo 3 websites với Reverse Proxy:

**track.yourdomain.com** → `http://127.0.0.1:3001`  
**api.yourdomain.com** → `http://127.0.0.1:3002`  
**postback.yourdomain.com** → `http://127.0.0.1:3003`

---

## ✅ Kiểm Tra

```bash
# Test services
curl http://localhost:3001/health
curl http://localhost:3002/health

# Test tracking
curl https://track.yourdomain.com/c/camp_demo_001
```

---

## 🎯 Sử Dụng

### Tracking Link:
```
https://track.yourdomain.com/c/{campaign_id}?external_id={{clickid}}
```

### Postback URL:
```
https://postback.yourdomain.com/api/postback?click_id={afl_click_id}&payout={payout}
```

---

## 📚 Tài Liệu Đầy Đủ

Xem [INSTALL.md](../INSTALL.md) để biết chi tiết.

---

**🚀 Happy Tracking!**
