# 🎨 HƯỚNG DẪN DEPLOY FRONTEND

## 📋 Tổng Quan

Frontend của AFL Tracker được xây dựng bằng **React + Vite**, build thành **static files** (HTML/CSS/JS) và deploy trên **Nginx** qua aaPanel.

**Không cần PHP** - Chỉ cần serve static files!

---

## 🚀 BƯỚC 1: Build Frontend

### 1.1. Cài Dependencies

```bash
cd /www/wwwroot/afl-tracker/frontend
npm install
```

### 1.2. Configure Environment

Tạo file `.env`:
```bash
cp env.example .env
nano .env
```

Chỉnh sửa:
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_TRACKER_URL=https://track.yourdomain.com
VITE_POSTBACK_URL=https://postback.yourdomain.com
```

### 1.3. Build

```bash
npm run build
```

Output sẽ ở folder `dist/`:
```
dist/
├── index.html
├── assets/
│   ├── index-abc123.js
│   └── index-def456.css
└── ...
```

---

## 🌐 BƯỚC 2: Tạo Website trong aaPanel

### 2.1. Add Site

1. Trong aaPanel, vào **Website** → **Add Site**
2. Điền thông tin:
   - **Domain**: `dashboard.yourdomain.com`
   - **Root Directory**: `/www/wwwroot/afl-tracker/frontend/dist`
   - **PHP Version**: **Pure Static** (QUAN TRỌNG!)
   - **Database**: None
3. Click **Submit**

### 2.2. Cấu hình Nginx cho SPA

React Router cần cấu hình Nginx để handle client-side routing.

1. Click vào site `dashboard.yourdomain.com`
2. Click tab **Config**
3. Tìm block `location /` và sửa thành:

```nginx
location / {
    root /www/wwwroot/afl-tracker/frontend/dist;
    index index.html;
    try_files $uri $uri/ /index.html;
}
```

4. Click **Save**
5. Reload Nginx:
```bash
nginx -t
nginx -s reload
```

---

## 🔒 BƯỚC 3: Setup SSL

### 3.1. Cài SSL Certificate

1. Click vào site `dashboard.yourdomain.com`
2. Click tab **SSL**
3. Chọn **Let's Encrypt**
4. Tick chọn domain
5. Click **Apply**

### 3.2. Force HTTPS

Sau khi có SSL, thêm vào đầu server block:

```nginx
server {
    listen 80;
    server_name dashboard.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dashboard.yourdomain.com;
    
    # ... SSL config ...
    
    location / {
        root /www/wwwroot/afl-tracker/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## ✅ BƯỚC 4: Kiểm Tra

### 4.1. Test Website

Mở trình duyệt: `https://dashboard.yourdomain.com`

Bạn sẽ thấy dashboard AFL Tracker.

### 4.2. Test API Connection

1. Mở Dashboard
2. Mở Browser Console (F12)
3. Kiểm tra Network tab
4. Xem các API calls đến `https://api.yourdomain.com`

Nếu thấy CORS error, kiểm tra API service config.

---

## 🔄 BƯỚC 5: Update Frontend

Khi có thay đổi code:

```bash
cd /www/wwwroot/afl-tracker/frontend

# Pull latest code (nếu dùng Git)
git pull

# Rebuild
npm run build

# Nginx sẽ tự động serve files mới
```

**Không cần restart Nginx** - Chỉ cần rebuild là xong!

---

## 🎨 BƯỚC 6: Tùy Chỉnh (Optional)

### 6.1. Custom Logo

Thay file logo trong `frontend/public/`:
```bash
cp your-logo.png /www/wwwroot/afl-tracker/frontend/public/logo.png
npm run build
```

### 6.2. Custom Colors

Chỉnh sửa `frontend/tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#YOUR_COLOR',
        600: '#YOUR_COLOR',
      }
    }
  }
}
```

Rebuild:
```bash
npm run build
```

### 6.3. Custom Title

Chỉnh sửa `frontend/index.html`:
```html
<title>Your Custom Title</title>
```

---

## 🐛 Troubleshooting

### Lỗi: 404 Not Found khi refresh page

**Nguyên nhân**: Nginx chưa cấu hình `try_files`

**Giải pháp**: Thêm vào Nginx config:
```nginx
try_files $uri $uri/ /index.html;
```

### Lỗi: API CORS Error

**Nguyên nhân**: API service chưa cho phép domain frontend

**Giải pháp**: Chỉnh `self-hosting/src/middleware/cors.js`:
```javascript
const corsOptions = {
  origin: [
    'https://dashboard.yourdomain.com',
    'https://api.yourdomain.com'
  ],
  credentials: true
};
```

Restart API service:
```bash
pm2 restart afl-api
```

### Lỗi: Blank page sau khi deploy

**Kiểm tra**:
1. Browser Console (F12) - Xem error
2. Nginx error log: `tail -f /www/wwwlogs/dashboard.yourdomain.com.error.log`
3. Đảm bảo đã build: `ls -la /www/wwwroot/afl-tracker/frontend/dist`

### Lỗi: CSS không load

**Nguyên nhân**: Base path không đúng

**Giải pháp**: Chỉnh `vite.config.js`:
```javascript
export default defineConfig({
  base: '/',  // Đảm bảo là '/'
  // ...
});
```

Rebuild:
```bash
npm run build
```

---

## 📊 Performance Tips

### 1. Enable Gzip Compression

Trong aaPanel → Website → Site → **Config**:

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
```

### 2. Browser Caching

Thêm vào Nginx config:

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. CDN (Optional)

Nếu muốn tăng tốc toàn cầu, dùng Cloudflare:
1. Add domain vào Cloudflare
2. Enable Proxy (orange cloud)
3. Enable Auto Minify (JS, CSS, HTML)
4. Enable Brotli compression

---

## 📁 File Structure Sau Deploy

```
/www/wwwroot/afl-tracker/frontend/
├── dist/                    # Build output (serve bởi Nginx)
│   ├── index.html
│   ├── assets/
│   │   ├── index-[hash].js
│   │   └── index-[hash].css
│   └── ...
├── src/                     # Source code (không serve)
├── node_modules/            # Dependencies (không serve)
├── package.json
├── vite.config.js
└── .env                     # Environment config
```

**Nginx chỉ serve folder `dist/`** - Các folder khác không public.

---

## 🎉 Hoàn Tất!

Frontend đã được deploy thành công!

### 🔗 URLs của bạn:
- **Dashboard**: https://dashboard.yourdomain.com
- **API**: https://api.yourdomain.com
- **Tracker**: https://track.yourdomain.com

### 📱 Responsive
Dashboard tự động responsive cho:
- ✅ Desktop
- ✅ Tablet
- ✅ Mobile

### 🌙 Dark Mode
Hỗ trợ dark mode tự động theo system preference.

---

## 🔮 Next Steps

1. Customize logo và colors
2. Thêm Google Analytics (optional)
3. Setup monitoring (optional)
4. Tạo backup script cho `dist/`

---

**🚀 Chúc bạn sử dụng dashboard thành công!**
