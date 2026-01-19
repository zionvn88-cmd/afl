# 🔧 FIX CORS ERROR

## ❌ Lỗi

```
Access to XMLHttpRequest at 'https://api.jl89home.shop/api/...' from origin 'https://dashboard.jl89home.shop' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Nguyên nhân:** Backend API không cho phép requests từ domain `dashboard.jl89home.shop`.

---

## ✅ GIẢI PHÁP

### Bước 1: Thêm DASHBOARD_DOMAIN vào file .env

```bash
cd /www/wwwroot/afl-tracker

# Mở file .env
nano .env
```

Thêm dòng này vào file `.env`:

```bash
DASHBOARD_DOMAIN=dashboard.jl89home.shop
```

**File .env đầy đủ phải có:**

```bash
NODE_ENV=production
DASHBOARD_DOMAIN=dashboard.jl89home.shop
TRACKER_DOMAIN=track.jl89home.shop
API_DOMAIN=api.jl89home.shop
POSTBACK_DOMAIN=postback.jl89home.shop
# ... các config khác
```

Lưu file: `Ctrl + X` → `Y` → `Enter`

---

### Bước 2: Restart API Service

```bash
# Restart API service để load config mới
pm2 restart afl-api

# Kiểm tra logs
pm2 logs afl-api --lines 20
```

---

### Bước 3: Test CORS

```bash
# Test từ dashboard domain
curl -H "Origin: https://dashboard.jl89home.shop" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://api.jl89home.shop/api/health \
     -v
```

**Expected output:** Phải thấy header `Access-Control-Allow-Origin: https://dashboard.jl89home.shop`

---

### Bước 4: Test trong Browser

1. Mở `https://dashboard.jl89home.shop`
2. Mở Developer Tools (F12) → Console
3. Refresh trang (F5)
4. Kiểm tra:
   - ✅ Không còn lỗi CORS
   - ✅ API calls thành công (Network tab)
   - ✅ Dashboard load data

---

## 🔍 Debug nếu vẫn lỗi

### Kiểm tra .env có đúng không:

```bash
cd /www/wwwroot/afl-tracker
grep DASHBOARD_DOMAIN .env
```

### Kiểm tra API service có load đúng config:

```bash
pm2 logs afl-api --lines 50 | grep -i cors
```

### Test trực tiếp API:

```bash
curl https://api.jl89home.shop/api/health
```

---

## 📝 Lưu ý

- **Phải restart PM2** sau khi sửa `.env`
- Domain phải match chính xác (bao gồm `https://`)
- Nếu dùng Cloudflare, đảm bảo SSL mode là **Full** hoặc **Full (strict)**

---

*Fix CORS Guide v1.0*
