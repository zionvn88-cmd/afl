# 🔧 HƯỚNG DẪN RESTART BACKEND API

## ❌ VẤN ĐỀ

1. Thư mục `/www/wwwroot/afl-tracker/backend` không tồn tại
2. PM2 không tìm thấy process "api"

## ✅ GIẢI PHÁP

### 1. Xác định đường dẫn backend

Backend **KHÔNG** nằm trong thư mục `backend` riêng, mà nằm trong `/www/wwwroot/afl-tracker/` (cùng cấp với frontend).

Cấu trúc thực tế:
```
/www/wwwroot/afl-tracker/
├── frontend/          # Frontend code
├── src/              # Backend code
│   └── services/
│       └── api/      # API service
├── package.json      # Backend package.json
└── ecosystem.config.cjs  # PM2 config
```

### 2. Tên PM2 process

PM2 process name là **`afl-api`** chứ KHÔNG phải `api`.

### 3. Cách restart đúng

```bash
# Di chuyển đến thư mục gốc của project
cd /www/wwwroot/afl-tracker

# Kiểm tra PM2 processes
pm2 list

# Restart API service (tên đúng là afl-api)
pm2 restart afl-api

# Hoặc restart tất cả services
pm2 restart all
```

### 4. Nếu chưa có PM2 process

Nếu `pm2 list` không hiển thị `afl-api`, bạn cần start lại:

```bash
cd /www/wwwroot/afl-tracker

# Start tất cả services với PM2
npm run pm2:start

# Hoặc start trực tiếp với ecosystem config
pm2 start ecosystem.config.cjs

# Lưu cấu hình để tự động start khi reboot
pm2 save
pm2 startup
```

### 5. Kiểm tra logs

```bash
# Xem logs của API service
pm2 logs afl-api --lines 50

# Xem logs tất cả services
pm2 logs --lines 50

# Xem status chi tiết
pm2 describe afl-api
```

### 6. Upload backend files

Backend files cần upload vào:
```
/www/wwwroot/afl-tracker/src/services/api/routes/
├── landingPages.js      (MỚI)
├── customDomains.js     (MỚI)
├── alerts.js            (MỚI)
├── conversions.js       (MỚI)
└── settings.js          (MỚI)

/www/wwwroot/afl-tracker/src/services/api/
└── index.js             (CẬP NHẬT)
```

## 📋 CHECKLIST

- [ ] Đã upload các file routes mới vào `/www/wwwroot/afl-tracker/src/services/api/routes/`
- [ ] Đã upload file `index.js` đã cập nhật vào `/www/wwwroot/afl-tracker/src/services/api/`
- [ ] Đã chạy `pm2 restart afl-api` hoặc `pm2 restart all`
- [ ] Đã kiểm tra logs: `pm2 logs afl-api`
- [ ] Đã test API endpoints: `curl https://api.j189home.shop/api/landing-pages`

## 🚀 LỆNH NHANH

```bash
# Tất cả trong một
cd /www/wwwroot/afl-tracker && pm2 restart afl-api && pm2 logs afl-api --lines 20
```
