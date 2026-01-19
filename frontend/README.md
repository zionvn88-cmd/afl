# AFL Tracker - Frontend Dashboard

Dashboard quản lý cho AFL Tracker Self-Hosting.

## 🚀 Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

Mở trình duyệt: `http://localhost:5173`

### Configure API
Tạo file `.env`:
```bash
cp env.example .env
```

Chỉnh sửa `.env`:
```env
VITE_API_URL=http://localhost:3002/api
VITE_TRACKER_URL=http://localhost:3001
VITE_POSTBACK_URL=http://localhost:3003
```

## 📦 Build for Production

### Build
```bash
npm run build
```

Output sẽ ở folder `dist/`

### Preview Build
```bash
npm run preview
```

## 🌐 Deploy lên aaPanel

### 1. Build Frontend
```bash
cd /www/wwwroot/afl-tracker/frontend
npm install
npm run build
```

### 2. Tạo Website trong aaPanel
- Domain: `dashboard.yourdomain.com`
- Root Directory: `/www/wwwroot/afl-tracker/frontend/dist`
- PHP Version: **Pure Static** (không cần PHP)

### 3. Cấu hình Nginx
Click vào site → **Config** → Thêm vào `location /`:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 4. Setup SSL
- Click vào site → **SSL**
- Chọn **Let's Encrypt**
- Apply SSL

### 5. Configure Environment
Trước khi build, chỉnh sửa `.env`:
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_TRACKER_URL=https://track.yourdomain.com
VITE_POSTBACK_URL=https://postback.yourdomain.com
```

Sau đó rebuild:
```bash
npm run build
```

## 🎨 Tech Stack

- **React 18** - UI Framework
- **React Router** - Routing
- **Axios** - HTTP Client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Recharts** - Charts
- **Vite** - Build Tool

## 📁 Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   │   ├── Layout.jsx
│   │   ├── StatCard.jsx
│   │   └── Table.jsx
│   ├── pages/           # Page components
│   │   ├── Dashboard.jsx
│   │   └── Campaigns.jsx
│   ├── services/        # API services
│   │   └── api.js
│   ├── config.js        # App configuration
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── dist/                # Build output
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🔧 Troubleshooting

### API CORS Error
Đảm bảo API service đã cấu hình CORS đúng trong `src/middleware/cors.js`

### Build Error
```bash
# Clear cache và reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Nginx 404 Error
Đảm bảo đã thêm `try_files $uri $uri/ /index.html;` vào Nginx config

## 📞 Support

Nếu gặp vấn đề, check:
1. Browser console (F12)
2. Network tab để xem API calls
3. Đảm bảo API service đang chạy

---

**Made with ❤️ for AFL Tracker**
