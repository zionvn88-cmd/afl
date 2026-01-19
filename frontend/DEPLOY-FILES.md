# 📤 HƯỚNG DẪN DEPLOY FILES LÊN SERVER

## 🎯 Các Files Cần Copy

### 1. Components Mới
```
src/components/EnhancedStatCard.jsx
src/components/PerformanceChart.jsx
src/components/Modal.jsx
src/components/ThemeToggle.jsx
```

### 2. Contexts
```
src/contexts/ThemeContext.jsx
```

### 3. Files Đã Cập Nhật
```
tailwind.config.js
src/index.css
src/main.jsx
src/App.jsx
src/components/Layout.jsx
package.json
```

---

## 📋 CÁCH 1: Copy Thủ Công Qua FTP

### Bước 1: Kết nối FTP
- Host: IP server của bạn
- Port: 21 (hoặc port FTP bạn đã mở)
- Username: root (hoặc user FTP)
- Password: password của bạn

### Bước 2: Copy Files

**Tạo thư mục contexts:**
```
/www/wwwroot/afl-tracker/frontend/src/contexts/
```

**Copy các files:**
1. `src/contexts/ThemeContext.jsx` → `/www/wwwroot/afl-tracker/frontend/src/contexts/ThemeContext.jsx`
2. `src/components/EnhancedStatCard.jsx` → `/www/wwwroot/afl-tracker/frontend/src/components/EnhancedStatCard.jsx`
3. `src/components/PerformanceChart.jsx` → `/www/wwwroot/afl-tracker/frontend/src/components/PerformanceChart.jsx`
4. `src/components/Modal.jsx` → `/www/wwwroot/afl-tracker/frontend/src/components/Modal.jsx`
5. `src/components/ThemeToggle.jsx` → `/www/wwwroot/afl-tracker/frontend/src/components/ThemeToggle.jsx`
6. `tailwind.config.js` → `/www/wwwroot/afl-tracker/frontend/tailwind.config.js`
7. `src/index.css` → `/www/wwwroot/afl-tracker/frontend/src/index.css`
8. `src/main.jsx` → `/www/wwwroot/afl-tracker/frontend/src/main.jsx`
9. `src/App.jsx` → `/www/wwwroot/afl-tracker/frontend/src/App.jsx`
10. `src/components/Layout.jsx` → `/www/wwwroot/afl-tracker/frontend/src/components/Layout.jsx`
11. `package.json` → `/www/wwwroot/afl-tracker/frontend/package.json`

---

## 📋 CÁCH 2: Copy Qua Terminal (SCP)

### Nếu bạn có SSH access:

```bash
# Tạo thư mục contexts
ssh root@your-server "mkdir -p /www/wwwroot/afl-tracker/frontend/src/contexts"

# Copy contexts
scp src/contexts/ThemeContext.jsx root@your-server:/www/wwwroot/afl-tracker/frontend/src/contexts/

# Copy components
scp src/components/EnhancedStatCard.jsx root@your-server:/www/wwwroot/afl-tracker/frontend/src/components/
scp src/components/PerformanceChart.jsx root@your-server:/www/wwwroot/afl-tracker/frontend/src/components/
scp src/components/Modal.jsx root@your-server:/www/wwwroot/afl-tracker/frontend/src/components/
scp src/components/ThemeToggle.jsx root@your-server:/www/wwwroot/afl-tracker/frontend/src/components/

# Copy config files
scp tailwind.config.js root@your-server:/www/wwwroot/afl-tracker/frontend/
scp src/index.css root@your-server:/www/wwwroot/afl-tracker/frontend/src/
scp src/main.jsx root@your-server:/www/wwwroot/afl-tracker/frontend/src/
scp src/App.jsx root@your-server:/www/wwwroot/afl-tracker/frontend/src/
scp src/components/Layout.jsx root@your-server:/www/wwwroot/afl-tracker/frontend/src/components/
scp package.json root@your-server:/www/wwwroot/afl-tracker/frontend/
```

---

## 📋 CÁCH 3: Copy Qua aaPanel File Manager

1. Đăng nhập aaPanel
2. Vào **File** → Navigate đến `/www/wwwroot/afl-tracker/frontend`
3. Tạo thư mục `src/contexts` nếu chưa có
4. Upload từng file:
   - Tạo file mới hoặc edit file cũ
   - Copy nội dung từ local
   - Paste vào file trên server
   - Save

---

## ✅ SAU KHI COPY FILES

### 1. Cài đặt framer-motion

```bash
cd /www/wwwroot/afl-tracker/frontend
npm install framer-motion
```

### 2. Rebuild Frontend

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

## 🔍 CHECKLIST

- [ ] Tạo thư mục `src/contexts/`
- [ ] Copy ThemeContext.jsx
- [ ] Copy EnhancedStatCard.jsx
- [ ] Copy PerformanceChart.jsx
- [ ] Copy Modal.jsx
- [ ] Copy ThemeToggle.jsx
- [ ] Copy tailwind.config.js
- [ ] Copy index.css
- [ ] Copy main.jsx
- [ ] Copy App.jsx
- [ ] Copy Layout.jsx
- [ ] Copy package.json
- [ ] Cài đặt framer-motion
- [ ] Rebuild frontend
- [ ] Test dark mode
- [ ] Test animations

---

## 📝 LƯU Ý

1. **Đảm bảo đường dẫn đúng**: `/www/wwwroot/afl-tracker/frontend/`
2. **Kiểm tra permissions**: Files phải có quyền đọc/ghi
3. **Backup trước**: Nên backup files cũ trước khi copy
4. **Kiểm tra syntax**: Sau khi copy, kiểm tra syntax không có lỗi

---

*Deploy Guide v1.0*
