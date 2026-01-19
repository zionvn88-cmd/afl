# 📤 HƯỚNG DẪN UPLOAD FILES LÊN HOSTING

## 🎯 Tổng Quan

Cần upload **21 files** lên hosting:
- **11 files mới** (tạo mới)
- **10 files cập nhật** (thay thế file cũ)

---

## 📋 DANH SÁCH CHI TIẾT

### ✅ Bước 1: Tạo thư mục mới

Trên server, tạo thư mục:
```
/www/wwwroot/afl-tracker/frontend/src/contexts/
```

---

### ✅ Bước 2: Upload CONTEXTS (1 file mới)

```
📁 src/contexts/ThemeContext.jsx
   → Upload lên: /www/wwwroot/afl-tracker/frontend/src/contexts/ThemeContext.jsx
```

---

### ✅ Bước 3: Upload COMPONENTS (4 files mới)

```
📁 src/components/EnhancedStatCard.jsx
   → Upload lên: /www/wwwroot/afl-tracker/frontend/src/components/EnhancedStatCard.jsx

📁 src/components/PerformanceChart.jsx
   → Upload lên: /www/wwwroot/afl-tracker/frontend/src/components/PerformanceChart.jsx

📁 src/components/Modal.jsx
   → Upload lên: /www/wwwroot/afl-tracker/frontend/src/components/Modal.jsx

📁 src/components/ThemeToggle.jsx
   → Upload lên: /www/wwwroot/afl-tracker/frontend/src/components/ThemeToggle.jsx
```

---

### ✅ Bước 4: Upload PAGES (6 files mới)

```
📁 src/pages/CampaignDetail.jsx
   → Upload lên: /www/wwwroot/afl-tracker/frontend/src/pages/CampaignDetail.jsx

📁 src/pages/Offers.jsx
   → Upload lên: /www/wwwroot/afl-tracker/frontend/src/pages/Offers.jsx

📁 src/pages/OfferForm.jsx
   → Upload lên: /www/wwwroot/afl-tracker/frontend/src/pages/OfferForm.jsx

📁 src/pages/TrafficSources.jsx
   → Upload lên: /www/wwwroot/afl-tracker/frontend/src/pages/TrafficSources.jsx

📁 src/pages/Reports.jsx
   → Upload lên: /www/wwwroot/afl-tracker/frontend/src/pages/Reports.jsx

📁 src/pages/Conversions.jsx
   → Upload lên: /www/wwwroot/afl-tracker/frontend/src/pages/Conversions.jsx
```

---

### ✅ Bước 5: Upload FILES ĐÃ CẬP NHẬT (10 files)

**Config Files:**
```
📁 tailwind.config.js
   → Upload lên: /www/wwwroot/afl-tracker/frontend/tailwind.config.js

📁 package.json
   → Upload lên: /www/wwwroot/afl-tracker/frontend/package.json
```

**Core Files:**
```
📁 src/index.css
   → Upload lên: /www/wwwroot/afl-tracker/frontend/src/index.css

📁 src/main.jsx
   → Upload lên: /www/wwwroot/afl-tracker/frontend/src/main.jsx

📁 src/App.jsx
   → Upload lên: /www/wwwroot/afl-tracker/frontend/src/App.jsx
```

**Components:**
```
📁 src/components/Layout.jsx
   → Upload lên: /www/wwwroot/afl-tracker/frontend/src/components/Layout.jsx
```

**Pages:**
```
📁 src/pages/Dashboard.jsx
   → Upload lên: /www/wwwroot/afl-tracker/frontend/src/pages/Dashboard.jsx

📁 src/pages/Campaigns.jsx
   → Upload lên: /www/wwwroot/afl-tracker/frontend/src/pages/Campaigns.jsx

📁 src/pages/CampaignForm.jsx
   → Upload lên: /www/wwwroot/afl-tracker/frontend/src/pages/CampaignForm.jsx
```

**Services:**
```
📁 src/services/api.js
   → Upload lên: /www/wwwroot/afl-tracker/frontend/src/services/api.js
```

---

## 🚀 SAU KHI UPLOAD XONG

### 1. SSH vào server
```bash
ssh root@your-server
cd /www/wwwroot/afl-tracker/frontend
```

### 2. Tạo thư mục contexts (nếu chưa có)
```bash
mkdir -p src/contexts
```

### 3. Cài đặt framer-motion
```bash
npm install framer-motion
```

### 4. Rebuild frontend
```bash
npm run build
```

### 5. Kiểm tra
```bash
# Kiểm tra files mới có tồn tại không
ls -la src/contexts/ThemeContext.jsx
ls -la src/components/EnhancedStatCard.jsx
ls -la src/components/PerformanceChart.jsx
ls -la src/components/Modal.jsx
ls -la src/components/ThemeToggle.jsx

# Kiểm tra syntax
node -c src/App.jsx
node -c src/main.jsx
```

---

## 📝 LƯU Ý QUAN TRỌNG

1. **Tạo thư mục contexts trước** khi upload ThemeContext.jsx
2. **Backup files cũ** trước khi thay thế (nếu cần)
3. **Kiểm tra đường dẫn** - Đảm bảo đúng `/www/wwwroot/afl-tracker/frontend/`
4. **Permissions** - Files phải có quyền đọc/ghi
5. **Sau khi upload** - Phải chạy `npm install framer-motion` và `npm run build`

---

## ✅ CHECKLIST

- [ ] Tạo thư mục `src/contexts/`
- [ ] Upload ThemeContext.jsx
- [ ] Upload 4 component files mới
- [ ] Upload 6 page files mới
- [ ] Upload 10 files đã cập nhật
- [ ] Cài đặt framer-motion
- [ ] Rebuild frontend
- [ ] Test dashboard
- [ ] Test dark mode
- [ ] Test các pages mới

---

*Upload Guide v1.0*
