# 🔧 FIX BUILD ERROR - terser not found

## ❌ Lỗi

```
[vite:terser] terser not found. Since Vite v3, terser has become an optional dependency. You need to install it.
```

---

## ✅ GIẢI PHÁP

### Cách 1: Đổi sang esbuild (Đơn giản nhất - Đã sửa)

Đã đổi `minify: 'terser'` → `minify: 'esbuild'` trong `vite.config.js`

**esbuild** là built-in của Vite, không cần cài thêm.

### Cách 2: Cài terser (Nếu muốn dùng terser)

```bash
cd /www/wwwroot/afl-tracker/frontend
npm install -D terser
```

Sau đó build lại:
```bash
npm run build
```

---

## 🚀 BUILD LẠI

Sau khi sửa, chạy:

```bash
cd /www/wwwroot/afl-tracker/frontend
npm run build
```

**Expected output:**
```
✓ 1454 modules transformed.
✓ built in X.XXs
```

Output sẽ ở folder `dist/`

---

## 📝 Lưu Ý

- **esbuild**: Nhanh hơn, built-in, đủ dùng cho production
- **terser**: Chậm hơn nhưng minify tốt hơn một chút

Với project này, **esbuild là đủ** và không cần cài thêm dependency.

---

*Fix Build Guide v1.0*
