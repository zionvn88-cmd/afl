# FIX 404 ERRORS - HƯỚNG DẪN KHẮC PHỤC

## 🔴 CÁC LỖI 404 ĐÃ ĐƯỢC KHẮC PHỤC

### 1. API Endpoints (Backend)
✅ Đã tạo các route handlers:
- `/api/landing-pages` → `src/services/api/routes/landingPages.js`
- `/api/custom-domains` → `src/services/api/routes/customDomains.js`
- `/api/alerts` → `src/services/api/routes/alerts.js`
- `/api/conversions` → `src/services/api/routes/conversions.js`
- `/api/settings` → `src/services/api/routes/settings.js`

### 2. Logo Files (Frontend)
✅ Đã sửa `TrafficSourceIcon.jsx`:
- Không cần file logo nữa
- Sử dụng emoji icons thay vì image files
- Không còn lỗi 404 cho `/logos/facebook.png`, `/logos/google.png`, `/logos/tiktok.png`

## 📋 CÁC FILE CẦN CẬP NHẬT

### Backend Files (5 files mới):
```
src/services/api/routes/landingPages.js
src/services/api/routes/customDomains.js
src/services/api/routes/alerts.js
src/services/api/routes/conversions.js
src/services/api/routes/settings.js
```

### Backend Files (1 file cập nhật):
```
src/services/api/index.js
```

### Frontend Files (1 file cập nhật):
```
src/components/TrafficSourceIcon.jsx
```

## 🚀 CÁCH TRIỂN KHAI

### 1. Backend:
```bash
# Upload các file routes mới
scp src/services/api/routes/landingPages.js user@server:/path/to/api/routes/
scp src/services/api/routes/customDomains.js user@server:/path/to/api/routes/
scp src/services/api/routes/alerts.js user@server:/path/to/api/routes/
scp src/services/api/routes/conversions.js user@server:/path/to/api/routes/
scp src/services/api/routes/settings.js user@server:/path/to/api/routes/

# Upload file index.js đã cập nhật
scp src/services/api/index.js user@server:/path/to/api/

# Restart API service
pm2 restart api
# hoặc
systemctl restart afl-api
```

### 2. Frontend:
```bash
# Upload file TrafficSourceIcon.jsx đã cập nhật
scp src/components/TrafficSourceIcon.jsx user@server:/path/to/frontend/src/components/

# Rebuild frontend
cd /path/to/frontend
npm run build
```

## ✅ KIỂM TRA SAU KHI TRIỂN KHAI

1. **Kiểm tra API endpoints:**
```bash
curl https://api.j189home.shop/api/landing-pages
curl https://api.j189home.shop/api/custom-domains
curl https://api.j189home.shop/api/alerts
curl https://api.j189home.shop/api/conversions
curl https://api.j189home.shop/api/settings
```

2. **Kiểm tra frontend:**
- Mở DevTools Console
- Không còn lỗi 404 cho API endpoints
- Không còn lỗi 404 cho logo files

## 📝 LƯU Ý

- Các route handlers hiện tại là **placeholder** (trả về empty data)
- Cần implement đầy đủ logic sau khi kiểm tra mọi thứ hoạt động
- Conversions route đã có logic cơ bản (query từ database)
- Các routes khác sẽ trả về empty array cho đến khi được implement đầy đủ

## 🎯 KẾT QUẢ MONG ĐỢI

Sau khi triển khai:
- ✅ Không còn lỗi 404 trong console
- ✅ Frontend load được các pages mới (Alerts, Settings, LandingPages, CustomDomains)
- ✅ Conversions page hiển thị dữ liệu từ database
- ✅ TrafficSourceIcon hiển thị emoji thay vì image
