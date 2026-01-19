# 🔧 FIX LỖI SYNTAX "Unclosed regular expression"

## ❌ Lỗi

```
Unclosed regular expression.
Unrecoverable syntax error. (47% scanned).
```

**Nguyên nhân:** File `App.jsx` trên server thiếu imports hoặc có lỗi syntax.

---

## ✅ GIẢI PHÁP

### Bước 1: Xóa file cũ và tạo lại

```bash
cd /www/wwwroot/afl-tracker/frontend/src

# Backup file cũ
cp App.jsx App.jsx.backup

# Xóa file cũ
rm App.jsx

# Tạo file mới
nano App.jsx
```

### Bước 2: Copy toàn bộ nội dung sau (KHÔNG thiếu dòng nào)

```javascript
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import CampaignForm from './pages/CampaignForm';
import CampaignDetail from './pages/CampaignDetail';
import Offers from './pages/Offers';
import OfferForm from './pages/OfferForm';
import TrafficSources from './pages/TrafficSources';
import Reports from './pages/Reports';
import Conversions from './pages/Conversions';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/campaigns/new" element={<CampaignForm />} />
        <Route path="/campaigns/:id" element={<CampaignDetail />} />
        <Route path="/campaigns/:id/edit" element={<CampaignForm />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/offers/new" element={<OfferForm />} />
        <Route path="/offers/:id/edit" element={<OfferForm />} />
        <Route path="/traffic-sources" element={<TrafficSources />} />
        <Route path="/traffic-sources/new" element={<div className="text-center py-12 text-gray-500">Tạo nguồn traffic - Đang phát triển</div>} />
        <Route path="/traffic-sources/:id/edit" element={<div className="text-center py-12 text-gray-500">Sửa nguồn traffic - Đang phát triển</div>} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/conversions" element={<Conversions />} />
        <Route path="/settings" element={<div className="text-center py-12 text-gray-500">Cài đặt - Đang phát triển</div>} />
        <Route path="*" element={<div className="text-center py-12 text-gray-500">404 - Không tìm thấy trang</div>} />
      </Routes>
    </Layout>
  );
}

export default App;
```

**Lưu:** `Ctrl + X` → `Y` → `Enter`

---

### Bước 3: Kiểm tra syntax

```bash
# Kiểm tra syntax
node -c src/App.jsx

# Nếu không có lỗi, sẽ không có output
```

---

### Bước 4: Kiểm tra các file pages có tồn tại

```bash
cd /www/wwwroot/afl-tracker/frontend/src/pages
ls -la | grep -E "(CampaignDetail|Offers|OfferForm|TrafficSources|Reports|Conversions)"
```

**Phải có:**
- CampaignDetail.jsx
- Offers.jsx
- OfferForm.jsx
- TrafficSources.jsx
- Reports.jsx
- Conversions.jsx

**Nếu thiếu, copy từ local lên server.**

---

### Bước 5: Rebuild

```bash
cd /www/wwwroot/afl-tracker/frontend
npm run build
```

---

## 🔍 NẾU VẪN LỖI

### Kiểm tra từng import

```bash
cd /www/wwwroot/afl-tracker/frontend/src/pages

# Kiểm tra từng file có tồn tại không
ls -la CampaignDetail.jsx
ls -la Offers.jsx
ls -la OfferForm.jsx
ls -la TrafficSources.jsx
ls -la Reports.jsx
ls -la Conversions.jsx
```

### Kiểm tra file có lỗi syntax không

```bash
# Kiểm tra từng file
node -c src/pages/CampaignDetail.jsx
node -c src/pages/Offers.jsx
# ... các files khác
```

---

## 📝 LƯU Ý QUAN TRỌNG

1. **Đảm bảo tất cả imports đều có**
2. **Đảm bảo tất cả files pages đã tồn tại**
3. **Không được thiếu dấu ngoặc kép/quotes**
4. **Không được thiếu dấu chấm phẩy**

---

*Fix Syntax Error Guide v1.0*
