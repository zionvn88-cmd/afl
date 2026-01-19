# ⚠️ VẤN ĐỀ TÍCH HỢP FRONTEND-BACKEND

## 🔍 Phân Tích

Sau khi kiểm tra kỹ, tôi phát hiện **một số vấn đề** về liên kết giữa Frontend và Backend:

---

## ❌ VẤN ĐỀ PHÁT HIỆN

### 1. ❌ Response Format Không Khớp

**Backend trả về:**
```javascript
// campaigns.js line 32
res.json({ success: true, campaigns });
```

**Frontend expect:**
```javascript
// Dashboard.jsx line 23
const result = await dashboardAPI.getStats(dateRange);
setData(result);  // Expect: { overall, campaigns, chartData }
```

**Vấn đề**: Frontend gọi `/reports/dashboard` nhưng expect cấu trúc khác với `/campaigns`

---

### 2. ⚠️ Field Names Không Khớp

**Backend trả về (campaigns.js):**
- `total_clicks` ✅
- `conversions` ✅
- `total_cost` ❌ (Frontend expect: `cost`)
- `total_revenue` ❌ (Frontend expect: `revenue`)
- `profit` ✅

**Frontend expect (Campaigns.jsx):**
- `clicks` ❌ (Backend trả: `total_clicks`)
- `cost` ❌ (Backend trả: `total_cost`)
- `revenue` ❌ (Backend trả: `total_revenue`)

---

### 3. ❌ Missing ROI Calculation

**Backend (campaigns.js):**
- Không tính ROI trong query
- Frontend expect field `roi`

**Frontend (Campaigns.jsx line 327):**
```javascript
{
  key: 'roi',
  header: 'ROI',
  render: (value) => ...
}
```

---

### 4. ⚠️ Postback Route Missing

**Frontend gọi:**
```javascript
// api.js không có postback API
```

**Backend có:**
```javascript
// routes/postback.js
router.get('/', ...)  // Postback handler
```

Nhưng Frontend không có method để gọi!

---

## ✅ GIẢI PHÁP

### Fix 1: Chuẩn hóa Response Format

Sửa `campaigns.js`:

```javascript
router.get('/', async (req, res) => {
  try {
    const [campaigns] = await db.query(`
      SELECT 
        c.*,
        ts.name as traffic_source_name,
        ts.icon as traffic_source_icon,
        COUNT(DISTINCT cl.click_id) as clicks,  // ✅ Đổi từ total_clicks
        SUM(CASE WHEN cl.is_converted = 1 THEN 1 ELSE 0 END) as conversions,
        SUM(cl.cost) as cost,  // ✅ Đổi từ total_cost
        SUM(cl.payout) as revenue,  // ✅ Đổi từ total_revenue
        (SUM(cl.payout) - SUM(cl.cost)) as profit,
        ROUND((SUM(cl.payout) - SUM(cl.cost)) / NULLIF(SUM(cl.cost), 0) * 100, 2) as roi  // ✅ Thêm ROI
      FROM campaigns c
      LEFT JOIN traffic_sources ts ON c.traffic_source_id = ts.id
      LEFT JOIN clicks cl ON c.id = cl.campaign_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    
    res.json({ success: true, campaigns });
  } catch (error) {
    logger.error('Get campaigns error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

---

### Fix 2: Chuẩn hóa Dashboard Response

Sửa `reports.js` để khớp với Frontend:

```javascript
// Line 31-34: Đã OK, nhưng cần thêm trends
const stats = overall[0];
stats.cr = calculateCR(stats.conversions, stats.total_clicks);
stats.roi = calculateROI(stats.total_revenue, stats.total_cost);
stats.epc = calculateEPC(stats.total_revenue, stats.total_clicks);
stats.trends = {};  // ✅ Thêm trends (Frontend expect)
```

---

### Fix 3: Thêm Postback API vào Frontend

Sửa `frontend/src/services/api.js`:

```javascript
export const postbackAPI = {
  // Test postback
  test: (clickId, payout = 10) => 
    api.get(`/postback?click_id=${clickId}&payout=${payout}&status=approved`),
};
```

---

### Fix 4: Sửa Field Names trong Frontend

**Option A: Sửa Frontend** (Dễ hơn)

Sửa `Campaigns.jsx`:
```javascript
const campaignColumns = [
  // ...
  {
    key: 'clicks',  // ✅ Giữ nguyên (Backend đã sửa)
    header: 'Lượt Click',
    align: 'right',
    render: (value) => value?.toLocaleString() || 0
  },
  // ...
];
```

**Option B: Sửa Backend** (Chuẩn hơn)

Đã sửa ở Fix 1 ✅

---

## 📝 CHECKLIST SỬA LỖI

### Backend Fixes:
- [ ] Sửa field names trong `campaigns.js` (total_clicks → clicks, etc)
- [ ] Thêm ROI calculation trong campaigns query
- [ ] Thêm trends object trong dashboard response
- [ ] Đảm bảo tất cả responses có `success: true`

### Frontend Fixes:
- [ ] Thêm postbackAPI vào `api.js`
- [ ] Kiểm tra field names trong tất cả components
- [ ] Thêm error handling cho missing fields
- [ ] Thêm default values cho undefined fields

### Testing:
- [ ] Test `/api/campaigns` endpoint
- [ ] Test `/api/reports/dashboard` endpoint
- [ ] Test Frontend Dashboard page
- [ ] Test Frontend Campaigns page
- [ ] Test API error handling

---

## 🔧 HÀNH ĐỘNG TIẾP THEO

Tôi sẽ tạo các file fix ngay bây giờ!
