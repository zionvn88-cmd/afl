# 📤 DANH SÁCH FILES CẦN UPLOAD LÊN HOSTING

## 🎯 Đường dẫn gốc trên server
```
/www/wwwroot/afl-tracker/frontend/
```

---

## 📁 1. FILES MỚI CẦN TẠO/TẠO THƯ MỤC

### Tạo thư mục contexts:
```
/www/wwwroot/afl-tracker/frontend/src/contexts/
```

---

## 📦 2. CONTEXTS (Files mới)

```
✅ src/contexts/ThemeContext.jsx
   → /www/wwwroot/afl-tracker/frontend/src/contexts/ThemeContext.jsx
```

---

## 📦 3. COMPONENTS (Files mới)

```
✅ src/components/EnhancedStatCard.jsx
   → /www/wwwroot/afl-tracker/frontend/src/components/EnhancedStatCard.jsx

✅ src/components/PerformanceChart.jsx
   → /www/wwwroot/afl-tracker/frontend/src/components/PerformanceChart.jsx

✅ src/components/Modal.jsx
   → /www/wwwroot/afl-tracker/frontend/src/components/Modal.jsx

✅ src/components/ThemeToggle.jsx
   → /www/wwwroot/afl-tracker/frontend/src/components/ThemeToggle.jsx
```

---

## 📦 4. PAGES (Files mới)

```
✅ src/pages/CampaignDetail.jsx
   → /www/wwwroot/afl-tracker/frontend/src/pages/CampaignDetail.jsx

✅ src/pages/Offers.jsx
   → /www/wwwroot/afl-tracker/frontend/src/pages/Offers.jsx

✅ src/pages/OfferForm.jsx
   → /www/wwwroot/afl-tracker/frontend/src/pages/OfferForm.jsx

✅ src/pages/TrafficSources.jsx
   → /www/wwwroot/afl-tracker/frontend/src/pages/TrafficSources.jsx

✅ src/pages/Reports.jsx
   → /www/wwwroot/afl-tracker/frontend/src/pages/Reports.jsx

✅ src/pages/Conversions.jsx
   → /www/wwwroot/afl-tracker/frontend/src/pages/Conversions.jsx
```

---

## 📦 5. FILES ĐÃ CẬP NHẬT (Thay thế file cũ)

```
✅ tailwind.config.js
   → /www/wwwroot/afl-tracker/frontend/tailwind.config.js

✅ src/index.css
   → /www/wwwroot/afl-tracker/frontend/src/index.css

✅ src/main.jsx
   → /www/wwwroot/afl-tracker/frontend/src/main.jsx

✅ src/App.jsx
   → /www/wwwroot/afl-tracker/frontend/src/App.jsx

✅ src/components/Layout.jsx
   → /www/wwwroot/afl-tracker/frontend/src/components/Layout.jsx

✅ src/pages/Dashboard.jsx
   → /www/wwwroot/afl-tracker/frontend/src/pages/Dashboard.jsx

✅ src/pages/Campaigns.jsx
   → /www/wwwroot/afl-tracker/frontend/src/pages/Campaigns.jsx

✅ src/pages/CampaignForm.jsx
   → /www/wwwroot/afl-tracker/frontend/src/pages/CampaignForm.jsx

✅ src/services/api.js
   → /www/wwwroot/afl-tracker/frontend/src/services/api.js

✅ package.json
   → /www/wwwroot/afl-tracker/frontend/package.json
```

---

## 📋 TỔNG HỢP

### Files mới: 11 files
- 1 context file
- 4 component files
- 6 page files

### Files đã cập nhật: 10 files
- Config files (tailwind, package.json)
- Core files (main.jsx, App.jsx, index.css)
- Components (Layout.jsx)
- Pages (Dashboard, Campaigns, CampaignForm)
- Services (api.js)

---

## 🚀 SAU KHI UPLOAD

### 1. Cài đặt framer-motion
```bash
cd /www/wwwroot/afl-tracker/frontend
npm install framer-motion
```

### 2. Rebuild frontend
```bash
npm run build
```

### 3. Kiểm tra
```bash
# Kiểm tra files có tồn tại không
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

## 📝 LƯU Ý

1. **Tạo thư mục contexts trước** khi upload ThemeContext.jsx
2. **Backup files cũ** trước khi thay thế (nếu cần)
3. **Kiểm tra permissions** - Files phải có quyền đọc/ghi
4. **Đảm bảo đường dẫn đúng** - `/www/wwwroot/afl-tracker/frontend/`

---

*Upload List v1.0*
