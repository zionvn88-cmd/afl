# 🚀 HƯỚNG DẪN UPLOAD LOGO LÊN SERVER

## ❌ Lỗi hiện tại:
```
GET https://dashboard.ji89home.shop/logos/facebook.png 404 (Not Found)
GET https://dashboard.ji89home.shop/logos/google.png 404 (Not Found)
GET https://dashboard.ji89home.shop/logos/tiktok.png 404 (Not Found)
```

## ✅ Giải pháp:

### CÁCH 1: Upload toàn bộ thư mục dist mới (KHUYẾN NGHỊ)

Bạn đã build xong ở local, bây giờ cần upload lên server.

#### Bước 1: Compress thư mục dist
```bash
# Trên Windows (PowerShell)
cd C:\Users\zion\Documents\GitHub\afl\frontend
Compress-Archive -Path dist\* -DestinationPath dist.zip -Force
```

#### Bước 2: Upload dist.zip lên server
1. Mở aaPanel File Manager
2. Navigate đến: `/www/wwwroot/afl-tracker/frontend/`
3. Upload file `dist.zip`
4. Extract (giải nén) file `dist.zip`
5. Chọn "Overwrite all" nếu có file trùng

#### Bước 3: Kiểm tra quyền file
```bash
# SSH vào server, chạy:
cd /www/wwwroot/afl-tracker/frontend
chmod -R 755 dist/
chown -R www:www dist/
```

#### Bước 4: Xóa cache và test
1. Clear browser cache (Ctrl + Shift + R)
2. Truy cập: https://dashboard.ji89home.shop
3. Kiểm tra Console - không còn lỗi 404

---

### CÁCH 2: Chỉ upload 3 file logo (NHANH HƠN)

Nếu không muốn upload toàn bộ dist:

#### Bước 1: Tạo thư mục logos trên server
```bash
# SSH vào server
mkdir -p /www/wwwroot/afl-tracker/frontend/dist/logos
chmod 755 /www/wwwroot/afl-tracker/frontend/dist/logos
```

#### Bước 2: Upload 3 file logo
1. Mở aaPanel File Manager
2. Navigate đến: `/www/wwwroot/afl-tracker/frontend/dist/`
3. Tạo folder `logos` (nếu chưa có)
4. Vào folder `logos`
5. Upload 3 file:
   - `facebook.png`
   - `google.png`
   - `tiktok.png`

Hoặc dùng SCP:
```bash
# Trên local (PowerShell)
cd C:\Users\zion\Documents\GitHub\afl\frontend\dist
scp -r logos/ root@your-server-ip:/www/wwwroot/afl-tracker/frontend/dist/
```

#### Bước 3: Set quyền
```bash
# SSH vào server
chmod 644 /www/wwwroot/afl-tracker/frontend/dist/logos/*.png
chown www:www /www/wwwroot/afl-tracker/frontend/dist/logos/*.png
```

---

### CÁCH 3: Build trực tiếp trên server (TỐT NHẤT cho lần sau)

```bash
# SSH vào server
cd /www/wwwroot/afl-tracker/frontend

# Pull code mới (nếu dùng git)
git pull

# Copy logo vào public (nếu chưa có)
mkdir -p public/logos
# Upload 3 file logo vào public/logos/

# Build lại
npm install
npm run build

# Logos sẽ tự động được copy vào dist/logos/
```

---

## 🔍 Kiểm tra sau khi upload

### 1. Kiểm tra file có tồn tại không:
```bash
# SSH vào server
ls -lh /www/wwwroot/afl-tracker/frontend/dist/logos/
```

Kết quả mong đợi:
```
-rw-r--r-- 1 www www 158K facebook.png
-rw-r--r-- 1 www www 833K google.png
-rw-r--r-- 1 www www 101K tiktok.png
```

### 2. Kiểm tra qua URL:
Mở trình duyệt, truy cập trực tiếp:
- https://dashboard.ji89home.shop/logos/facebook.png
- https://dashboard.ji89home.shop/logos/google.png
- https://dashboard.ji89home.shop/logos/tiktok.png

Nếu thấy ảnh hiện ra → ✅ Thành công!

### 3. Reload trang Settings:
- Mở: https://dashboard.ji89home.shop/settings
- Nhấn Ctrl + Shift + R (hard reload)
- Kiểm tra Console - không còn lỗi 404

---

## 📝 Lưu ý

1. **Quyền file quan trọng:**
   - Folder: `755` (rwxr-xr-x)
   - File: `644` (rw-r--r--)
   - Owner: `www:www`

2. **Nginx phải serve static files:**
   - Đã được cấu hình đúng trong `/www/server/panel/vhost/nginx/dashboard.ji89home.shop.conf`
   - Location `/` có `try_files $uri $uri/ /index.html;`

3. **Cache:**
   - Sau khi upload, luôn hard reload (Ctrl + Shift + R)
   - Hoặc clear browser cache

---

## 🆘 Nếu vẫn lỗi

Kiểm tra Nginx error log:
```bash
tail -f /www/wwwlogs/dashboard.ji89home.shop.error.log
```

Restart Nginx:
```bash
nginx -t
nginx -s reload
```
