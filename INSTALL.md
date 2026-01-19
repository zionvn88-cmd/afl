# 📦 HƯỚNG DẪN CÀI ĐẶT AFL TRACKER TRÊN aaPanel

## 🎯 Yêu Cầu Hệ Thống

- **VPS**: Tối thiểu 2GB RAM, 2 CPU cores, 20GB SSD
- **OS**: Ubuntu 20.04+ hoặc CentOS 7+
- **aaPanel**: Đã cài đặt và cấu hình
- **Domain**: 3 subdomain (tracker, api, dashboard)

---

## 📋 BƯỚC 1: CÀI ĐẶT aaPanel

### 1.1. Cài aaPanel (nếu chưa có)

```bash
# Ubuntu/Debian
wget -O install.sh http://www.aapanel.com/script/install-ubuntu_6.0_en.sh && bash install.sh aapanel

# CentOS
wget -O install.sh http://www.aapanel.com/script/install_6.0_en.sh && bash install.sh aapanel
```

### 1.2. Truy cập aaPanel
- Mở trình duyệt: `http://YOUR_SERVER_IP:7800`
- Đăng nhập với thông tin được hiển thị sau khi cài đặt

---

## 📋 BƯỚC 2: CÀI ĐẶT PHẦN MỀM CẦN THIẾT

Trong aaPanel, vào **App Store** và cài đặt:

### 2.1. Nginx
- Version: 1.22+
- Click **Install** → Chọn **Compile Install** (nhanh hơn)

### 2.2. MySQL
- Version: 5.7+ hoặc MariaDB 10.3+
- Click **Install** → Đợi hoàn tất
- **Quan trọng**: Lưu lại root password

### 2.3. Redis
- Version: 6.x+
- Click **Install**

### 2.4. Node.js (qua PM2 Manager)
- Vào **App Store** → Tìm **PM2 Manager**
- Click **Install** → Tự động cài Node.js 18+

---

## 📋 BƯỚC 3: TẠO DATABASE

### 3.1. Tạo Database trong aaPanel

1. Vào **Database** → Click **Add Database**
2. Điền thông tin:
   - **Database Name**: `afl_tracker`
   - **Username**: `afl_user`
   - **Password**: Tạo password mạnh (lưu lại)
   - **Access Permission**: `localhost`
3. Click **Submit**

### 3.2. Import Schema

1. Click vào database `afl_tracker` → **phpMyAdmin**
2. Chọn tab **Import**
3. Upload file `database/schema.sql`
4. Click **Go**
5. Sau đó import `database/seed.sql` (dữ liệu mẫu)

---

## 📋 BƯỚC 4: UPLOAD CODE LÊN SERVER

### 4.1. Tạo thư mục dự án

```bash
# SSH vào server
cd /www/wwwroot
mkdir afl-tracker
cd afl-tracker
```

### 4.2. Upload code

**Cách 1: Dùng Git (khuyên dùng)**
```bash
git clone https://github.com/your-repo/afl-tracker-selfhosting.git .
```

**Cách 2: Upload qua aaPanel File Manager**
- Nén toàn bộ folder `self-hosting` thành `afl-tracker.zip`
- Vào **Files** → Upload lên `/www/wwwroot/afl-tracker`
- Click chuột phải → **Extract**

### 4.3. Cài đặt dependencies

```bash
cd /www/wwwroot/afl-tracker
npm install --production
```

---

## 📋 BƯỚC 5: CÀU HÌNH ENVIRONMENT

### 5.1. Tạo file .env

```bash
cd /www/wwwroot/afl-tracker
cp env.example .env
nano .env
```

### 5.2. Chỉnh sửa .env

```env
NODE_ENV=production
APP_URL=https://dashboard.yourdomain.com
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=afl_tracker
DB_USER=afl_user
DB_PASSWORD=YOUR_DB_PASSWORD_HERE
DB_CONNECTION_LIMIT=10

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Security
JWT_SECRET=CHANGE_THIS_TO_RANDOM_STRING
API_KEY=CHANGE_THIS_TO_RANDOM_STRING

# Tracker
TRACKER_PORT=3001
TRACKER_DOMAIN=track.yourdomain.com

# API
API_PORT=3002
API_DOMAIN=api.yourdomain.com

# Postback
POSTBACK_PORT=3003
POSTBACK_DOMAIN=postback.yourdomain.com

# Anti-Fraud
FRAUD_DETECTION_ENABLED=true
FRAUD_PRESET=medium

# Telegram (optional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

**Lưu file**: `Ctrl + X` → `Y` → `Enter`

---

## 📋 BƯỚC 6: CẤU HÌNH PM2 (Process Manager)

### 6.1. Khởi động services với PM2

```bash
cd /www/wwwroot/afl-tracker
npm run pm2:start
```

### 6.2. Kiểm tra services đang chạy

```bash
pm2 list
```

Bạn sẽ thấy 5 services:
- ✅ afl-tracker (Port 3001)
- ✅ afl-api (Port 3002)
- ✅ afl-postback (Port 3003)
- ✅ afl-worker
- ✅ afl-monitor

### 6.3. Cấu hình PM2 tự động khởi động

```bash
pm2 startup
pm2 save
```

### 6.4. Xem logs

```bash
pm2 logs afl-tracker
pm2 logs afl-api
```

---

## 📋 BƯỚC 7: CẤU HÌNH NGINX (Reverse Proxy)

### 7.1. Tạo Website cho Tracker

1. Trong aaPanel, vào **Website** → **Add Site**
2. Điền thông tin:
   - **Domain**: `track.yourdomain.com`
   - **Root Directory**: `/www/wwwroot/afl-tracker`
   - **PHP Version**: Pure Static
3. Click **Submit**

### 7.2. Cấu hình Reverse Proxy cho Tracker

1. Click vào site `track.yourdomain.com` → **Config**
2. Thay thế nội dung bằng:

```nginx
server {
    listen 80;
    server_name track.yourdomain.com;
    
    # Redirect to HTTPS (sau khi có SSL)
    # return 301 https://$server_name$request_uri;
    
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. Click **Save**

### 7.3. Tạo Website cho API

Lặp lại bước 7.1 và 7.2 với:
- **Domain**: `api.yourdomain.com`
- **Proxy Pass**: `http://127.0.0.1:3002`

### 7.4. Tạo Website cho Postback

Lặp lại với:
- **Domain**: `postback.yourdomain.com`
- **Proxy Pass**: `http://127.0.0.1:3003`

### 7.5. Reload Nginx

```bash
nginx -t
nginx -s reload
```

---

## 📋 BƯỚC 8: CÀI ĐẶT SSL (HTTPS)

### 8.1. Cài SSL cho từng domain

1. Trong aaPanel, click vào site → **SSL**
2. Chọn **Let's Encrypt**
3. Tick chọn domain và www
4. Click **Apply**
5. Lặp lại cho 3 domains: tracker, api, postback

### 8.2. Bật Force HTTPS

Sau khi có SSL, uncomment dòng redirect trong Nginx config:
```nginx
return 301 https://$server_name$request_uri;
```

---

## 📋 BƯỚC 9: DEPLOY FRONTEND (Dashboard)

### 9.1. Build Frontend

```bash
cd /www/wwwroot/afl-tracker/frontend
npm install
npm run build
```

### 9.2. Tạo Website cho Dashboard

1. Trong aaPanel, vào **Website** → **Add Site**
2. Điền:
   - **Domain**: `dashboard.yourdomain.com`
   - **Root Directory**: `/www/wwwroot/afl-tracker/frontend/dist`
   - **PHP Version**: Pure Static
3. Click **Submit**

### 9.3. Cấu hình Nginx cho SPA

Click vào site → **Config** → Thêm vào trong `location /`:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 9.4. Cấu hình API URL

Chỉnh sửa file frontend config:
```bash
nano /www/wwwroot/afl-tracker/frontend/src/config/api.js
```

Đổi API URL:
```javascript
export const API_URL = 'https://api.yourdomain.com/api';
```

Rebuild:
```bash
cd /www/wwwroot/afl-tracker/frontend
npm run build
```

---

## 📋 BƯỚC 10: KIỂM TRA HỆ THỐNG

### 10.1. Test Tracker

```bash
curl https://track.yourdomain.com/health
# Kết quả: {"status":"ok","service":"tracker",...}
```

### 10.2. Test API

```bash
curl https://api.yourdomain.com/health
# Kết quả: {"status":"ok","service":"api",...}
```

### 10.3. Test Dashboard

Mở trình duyệt: `https://dashboard.yourdomain.com`

### 10.4. Test Click Tracking

```
https://track.yourdomain.com/c/camp_demo_001?external_id=test123
```

Kiểm tra trong database:
```sql
SELECT * FROM clicks ORDER BY timestamp DESC LIMIT 1;
```

---

## 📋 BƯỚC 11: BẢO MẬT & TỐI ƯU

### 11.1. Cấu hình Firewall

```bash
# Chỉ mở port cần thiết
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 7800/tcp  # aaPanel
ufw allow 22/tcp    # SSH
ufw enable
```

### 11.2. Tối ưu MySQL

Trong aaPanel → **Database** → **Performance Tuning**

### 11.3. Cấu hình Redis persistence

```bash
nano /etc/redis/redis.conf
```

Thêm:
```
save 900 1
save 300 10
save 60 10000
```

### 11.4. Setup Log Rotation

```bash
nano /etc/logrotate.d/afl-tracker
```

```
/www/wwwroot/afl-tracker/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

---

## 🎉 HOÀN TẤT!

Hệ thống AFL Tracker đã được cài đặt thành công!

### 📊 URLs của bạn:

- **Dashboard**: https://dashboard.yourdomain.com
- **Tracker**: https://track.yourdomain.com
- **API**: https://api.yourdomain.com
- **Postback**: https://postback.yourdomain.com

### 🔗 Tracking Link mẫu:

```
https://track.yourdomain.com/c/{campaign_id}?external_id={{clickid}}
```

### 🔔 Postback URL mẫu:

```
https://postback.yourdomain.com/api/postback?click_id={afl_click_id}&payout={payout}&status=approved
```

---

## 🆘 Troubleshooting

### Lỗi: Cannot connect to database
```bash
# Kiểm tra MySQL đang chạy
systemctl status mysql

# Kiểm tra credentials trong .env
cat /www/wwwroot/afl-tracker/.env | grep DB_
```

### Lỗi: Redis connection failed
```bash
# Kiểm tra Redis
systemctl status redis
redis-cli ping  # Phải trả về PONG
```

### Lỗi: PM2 services không chạy
```bash
cd /www/wwwroot/afl-tracker
pm2 restart all
pm2 logs --err
```

### Lỗi: 502 Bad Gateway
```bash
# Kiểm tra service có chạy không
pm2 list
netstat -tlnp | grep 3001
netstat -tlnp | grep 3002

# Reload Nginx
nginx -s reload
```

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs: `pm2 logs`
2. Kiểm tra Nginx error log: `/www/wwwlogs/error.log`
3. Tạo issue trên GitHub

---

**🚀 Chúc bạn tracking thành công!**
