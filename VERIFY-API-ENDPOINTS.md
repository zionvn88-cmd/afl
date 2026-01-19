# ✅ KIỂM TRA API ENDPOINTS SAU KHI RESTART

## 🎉 TRẠNG THÁI HIỆN TẠI

Tất cả PM2 processes đã được restart thành công:
- ✅ `afl-api` (id: 1) - **ONLINE**
- ✅ `afl-tracker` (id: 0, 2) - **ONLINE**
- ✅ `afl-postback` (id: 3) - **ONLINE**
- ✅ `afl-worker` (id: 4) - **ONLINE**
- ✅ `afl-monitor` (id: 5) - **ONLINE**

## 🔍 KIỂM TRA API ENDPOINTS MỚI

### 1. Kiểm tra từ terminal (curl)

```bash
# Landing Pages
curl https://api.j189home.shop/api/landing-pages

# Custom Domains
curl https://api.j189home.shop/api/custom-domains

# Alerts
curl https://api.j189home.shop/api/alerts

# Conversions
curl https://api.j189home.shop/api/conversions?dateRange=today

# Settings
curl https://api.j189home.shop/api/settings

# Custom Postbacks
curl https://api.j189home.shop/api/settings/custom-postbacks
```

### 2. Kiểm tra từ browser

Mở browser và truy cập:
- `https://api.j189home.shop/api/landing-pages`
- `https://api.j189home.shop/api/custom-domains`
- `https://api.j189home.shop/api/alerts`
- `https://api.j189home.shop/api/conversions?dateRange=today`
- `https://api.j189home.shop/api/settings`

### 3. Kiểm tra logs nếu có lỗi

```bash
# Xem logs của API service
pm2 logs afl-api --lines 50

# Xem logs tất cả services
pm2 logs --lines 50

# Xem chỉ errors
pm2 logs --err --lines 50
```

## ✅ KẾT QUẢ MONG ĐỢI

Tất cả endpoints nên trả về JSON response:

```json
// Landing Pages
{
  "success": true,
  "landing_pages": []
}

// Custom Domains
{
  "success": true,
  "domains": []
}

// Alerts
{
  "success": true,
  "alerts": []
}

// Conversions
{
  "success": true,
  "conversions": [],
  "total": 0
}

// Settings
{
  "success": true,
  "settings": {
    "general": {},
    "api_keys": {},
    "notifications": {},
    "anti_fraud": {}
  }
}
```

## 🐛 NẾU CÓ LỖI

### Lỗi 404 Not Found
- Kiểm tra file `index.js` đã được upload chưa
- Kiểm tra các file routes đã được upload vào `src/services/api/routes/`
- Restart lại: `pm2 restart afl-api`

### Lỗi 500 Internal Server Error
- Xem logs: `pm2 logs afl-api --lines 50`
- Kiểm tra database connection
- Kiểm tra Redis connection

### Lỗi CORS
- Kiểm tra CORS config trong `src/middleware/cors.js`
- Kiểm tra Nginx config

## 📋 CHECKLIST

- [ ] Tất cả PM2 processes đang chạy (status: online)
- [ ] API endpoints mới trả về JSON (không còn 404)
- [ ] Frontend không còn lỗi 404 trong console
- [ ] Logs không có errors

## 🎯 BƯỚC TIẾP THEO

1. **Kiểm tra frontend:**
   - Mở browser DevTools Console
   - Không còn lỗi 404
   - Các pages mới load được (Alerts, Settings, LandingPages, CustomDomains)

2. **Test các tính năng:**
   - Tạo campaign mới
   - Xem dashboard
   - Xem conversions
   - Xem alerts (nếu có)

3. **Monitor logs:**
   - Theo dõi logs trong vài phút
   - Đảm bảo không có errors

## 🚀 LỆNH NHANH

```bash
# Kiểm tra tất cả endpoints một lúc
curl -s https://api.j189home.shop/api/landing-pages && echo " ✓ Landing Pages"
curl -s https://api.j189home.shop/api/custom-domains && echo " ✓ Custom Domains"
curl -s https://api.j189home.shop/api/alerts && echo " ✓ Alerts"
curl -s https://api.j189home.shop/api/conversions?dateRange=today && echo " ✓ Conversions"
curl -s https://api.j189home.shop/api/settings && echo " ✓ Settings"
```
