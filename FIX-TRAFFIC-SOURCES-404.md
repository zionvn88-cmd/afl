# 🔧 FIX LỖI 404 - TRAFFIC SOURCES POST

## ❌ VẤN ĐỀ

POST request đến `/api/traffic-sources` trả về 404 Not Found khi tạo traffic source mới.

## ✅ NGUYÊN NHÂN

File `trafficSources.js` chỉ có GET route, thiếu POST, PUT, DELETE routes.

## 🔧 GIẢI PHÁP

Đã thêm đầy đủ các routes vào `src/services/api/routes/trafficSources.js`:

- ✅ **GET** `/api/traffic-sources` - List all
- ✅ **GET** `/api/traffic-sources/:id` - Get by ID
- ✅ **POST** `/api/traffic-sources` - Create new (MỚI)
- ✅ **PUT** `/api/traffic-sources/:id` - Update (MỚI)
- ✅ **DELETE** `/api/traffic-sources/:id` - Delete (MỚI)

## 📋 FILE CẦN UPLOAD

```
src/services/api/routes/trafficSources.js
→ /www/wwwroot/afl-tracker/src/services/api/routes/trafficSources.js
```

## 🚀 CÁCH TRIỂN KHAI

```bash
# 1. Upload file đã cập nhật
scp src/services/api/routes/trafficSources.js user@server:/www/wwwroot/afl-tracker/src/services/api/routes/

# 2. Restart API service
cd /www/wwwroot/afl-tracker
pm2 restart afl-api

# 3. Kiểm tra logs
pm2 logs afl-api --lines 20
```

## ✅ KIỂM TRA SAU KHI TRIỂN KHAI

### 1. Test POST request
```bash
curl -X POST https://api.j189home.shop/api/traffic-sources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Source",
    "slug": "test-source",
    "click_id_param": "click_id"
  }'
```

Kết quả mong đợi:
```json
{
  "success": true,
  "message": "Traffic source created successfully",
  "traffic_source": {
    "id": "ts_xxxxx"
  }
}
```

### 2. Test từ frontend
- Mở form "Tạo Nguồn Lưu Lượng Mới"
- Điền thông tin và click "Tạo Mới"
- Không còn lỗi 404
- Traffic source được tạo thành công

## 📝 LƯU Ý

- File đã được cập nhật với đầy đủ CRUD operations
- Sử dụng `nanoid` để generate ID (giống các routes khác)
- Có validation cho slug trùng lặp
- Có kiểm tra campaigns đang sử dụng trước khi xóa
