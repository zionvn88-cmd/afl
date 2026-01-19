# 📋 NGINX CONFIG FILES

Các file cấu hình Nginx cho AFL Tracker Self-Hosting.

---

## 📁 Files

1. **track.jl89home.shop.conf** - Tracker service (Port 3001)
2. **api.jl89home.shop.conf** - API service (Port 3002)
3. **postback.jl89home.shop.conf** - Postback service (Port 3003)

---

## 🚀 Cách Sử Dụng

### Trong aaPanel:

1. Vào **Website** → Click vào website cần config
2. Click tab **Config** (Cấu hình)
3. Copy toàn bộ nội dung file config tương ứng
4. Paste vào và thay thế toàn bộ nội dung hiện tại
5. Click **Save** (Lưu)
6. Reload Nginx:
```bash
nginx -t
nginx -s reload
```

---

## ✅ Test Sau Khi Config

```bash
# Test Tracker
curl http://track.jl89home.shop/health

# Test API
curl http://api.jl89home.shop/health
curl http://api.jl89home.shop/api/campaigns

# Test Postback
curl http://postback.jl89home.shop/health
```

---

## 🔒 SSL (Sau Khi Config Xong)

1. Click vào website → Tab **SSL**
2. Chọn **Let's Encrypt**
3. Apply SSL
4. Enable **Force HTTPS**

---

## 📝 Lưu Ý

- Tất cả config đều dùng reverse proxy
- Không cần PHP runtime
- Root directory có thể để `/www/wwwroot/afl-tracker` cho tất cả
- Đảm bảo services đang chạy trên ports 3001, 3002, 3003

---

*Nginx Config Files v1.0*
