# 🔧 FIX App.jsx trên Server

## ❌ Vấn Đề

File `App.jsx` trên server chưa có các routes mới cho:
- CampaignDetail
- Offers
- OfferForm
- TrafficSources
- Reports
- Conversions

---

## ✅ GIẢI PHÁP

### Copy file App.jsx đầy đủ lên server

```bash
cd /www/wwwroot/afl-tracker/frontend/src
nano App.jsx
```

**Copy toàn bộ nội dung sau:**

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

## ✅ KIỂM TRA CÁC FILES PAGES CÓ TỒN TẠI

```bash
cd /www/wwwroot/afl-tracker/frontend/src/pages
ls -la
```

**Phải có các files:**
- CampaignDetail.jsx
- Offers.jsx
- OfferForm.jsx
- TrafficSources.jsx
- Reports.jsx
- Conversions.jsx

**Nếu thiếu, copy từ local lên server.**

---

## ✅ REBUILD FRONTEND

```bash
cd /www/wwwroot/afl-tracker/frontend
npm run build
```

---

## 🔍 KIỂM TRA LỖI

Nếu có lỗi khi build, kiểm tra:

1. **Lỗi import:**
```bash
# Kiểm tra file có tồn tại không
ls -la src/pages/CampaignDetail.jsx
ls -la src/pages/Offers.jsx
# ... các files khác
```

2. **Lỗi syntax:**
```bash
# Kiểm tra syntax
node -c src/App.jsx
```

3. **Xem log build:**
```bash
npm run build 2>&1 | tee build.log
```

---

## 📝 LƯU Ý

- Đảm bảo tất cả các file pages đã được copy lên server
- Đảm bảo Layout.jsx đã được cập nhật với menu mới
- Đảm bảo api.js đã có `reportsAPI.getDashboard()`

---

*Fix Guide v1.0*
