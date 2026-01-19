# 🔧 FIX BUILD ERROR - .user.ini

## ❌ Lỗi

```
ENOTDIR: not a directory, scandir '/www/wwwroot/afl-tracker/frontend/dist/.user.ini'
```

**Nguyên nhân:** File `.user.ini` trong thư mục `dist/` (file bảo vệ của aaPanel) khiến Vite không thể xóa thư mục trước khi build.

---

## ✅ GIẢI PHÁP

### Cách 1: Xóa file .user.ini (Khuyên dùng)

```bash
cd /www/wwwroot/afl-tracker/frontend

# Xóa file .user.ini trong dist
rm -f dist/.user.ini

# Build lại
npm run build
```

### Cách 2: Xóa toàn bộ thư mục dist và build lại

```bash
cd /www/wwwroot/afl-tracker/frontend

# Xóa thư mục dist
rm -rf dist

# Build lại
npm run build
```

### Cách 3: Đổi output directory (Nếu vẫn lỗi)

Sửa `vite.config.js`:
```javascript
build: {
  outDir: 'build', // Đổi từ 'dist' thành 'build'
  // ...
}
```

Sau đó update Nginx config để trỏ đến `build/` thay vì `dist/`.

---

## 🚀 BUILD LẠI

Sau khi xóa `.user.ini`:

```bash
cd /www/wwwroot/afl-tracker/frontend
npm run build
```

**Expected output:**
```
✓ 1454 modules transformed.
✓ built in X.XXs
```

---

## 📝 Lưu Ý

- File `.user.ini` là file bảo vệ của aaPanel
- Nginx config có rule để block `.user.ini` (đã có trong config)
- Có thể xóa an toàn trong thư mục `dist/`
- Sau khi build, file này sẽ không được tạo lại (vì là static files)

---

*Fix Build Error Guide v1.0*
