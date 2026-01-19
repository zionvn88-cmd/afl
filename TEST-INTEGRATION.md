# 🧪 TEST TÍCH HỢP FRONTEND-BACKEND

## 📋 Hướng Dẫn Test

Sau khi deploy, làm theo các bước sau để test tích hợp:

---

## 🚀 BƯỚC 1: Khởi Động Services

### 1.1. Start Backend

```bash
cd /www/wwwroot/afl-tracker

# Start all services
npm run pm2:start

# Check status
pm2 list

# Expected output:
# ┌─────┬──────────────┬─────────┬─────────┐
# │ id  │ name         │ status  │ port    │
# ├─────┼──────────────┼─────────┼─────────┤
# │ 0   │ afl-tracker  │ online  │ 3001    │
# │ 1   │ afl-api      │ online  │ 3002    │
# │ 2   │ afl-postback │ online  │ 3003    │
# │ 3   │ afl-worker   │ online  │ -       │
# │ 4   │ afl-monitor  │ online  │ -       │
# └─────┴──────────────┴─────────┴─────────┘
```

### 1.2. Test Backend Health

```bash
# Test Tracker
curl http://localhost:3001/health
# Expected: {"status":"ok","service":"tracker",...}

# Test API
curl http://localhost:3002/health
# Expected: {"status":"ok","service":"api",...}

# Test Postback
curl http://localhost:3003/health
# Expected: {"status":"ok",...}
```

---

## 🌐 BƯỚC 2: Test API Endpoints

### 2.1. Test Traffic Sources

```bash
curl http://localhost:3002/api/traffic-sources
```

**Expected Response:**
```json
{
  "success": true,
  "traffic_sources": [
    {
      "id": "ts_facebook",
      "name": "Facebook Ads",
      "slug": "facebook",
      "icon": "📘",
      "color": "#1877f2"
    },
    ...
  ]
}
```

### 2.2. Test Campaigns List

```bash
curl http://localhost:3002/api/campaigns
```

**Expected Response:**
```json
{
  "success": true,
  "campaigns": [
    {
      "id": "camp_demo_001",
      "name": "Demo Campaign - Facebook",
      "status": "active",
      "clicks": 0,
      "conversions": 0,
      "cost": 0,
      "revenue": 0,
      "profit": 0,
      "roi": 0,
      "traffic_source_name": "Facebook Ads",
      "traffic_source_icon": "📘"
    }
  ]
}
```

### 2.3. Test Dashboard Stats

```bash
curl "http://localhost:3002/api/reports/dashboard?preset=today"
```

**Expected Response:**
```json
{
  "success": true,
  "overall": {
    "total_clicks": 0,
    "unique_clicks": 0,
    "conversions": 0,
    "total_cost": 0,
    "total_revenue": 0,
    "profit": 0,
    "cr": 0,
    "roi": 0,
    "epc": 0
  },
  "campaigns": [],
  "chartData": [],
  "topPerformers": [],
  "worstPerformers": [],
  "alerts": []
}
```

---

## 🎯 BƯỚC 3: Test Click Tracking

### 3.1. Generate Test Click

```bash
# Test tracking link
curl -L "http://localhost:3001/c/camp_demo_001?external_id=test_123"
```

**Expected:**
- Redirect to offer URL
- Click recorded in database

### 3.2. Verify Click in Database

```bash
# Query database
mysql -u afl_user -p afl_tracker -e "SELECT click_id, campaign_id, ip, country, device FROM clicks ORDER BY timestamp DESC LIMIT 5;"
```

**Expected Output:**
```
+------------------+---------------+-------------+---------+----------+
| click_id         | campaign_id   | ip          | country | device   |
+------------------+---------------+-------------+---------+----------+
| afl_abc123...    | camp_demo_001 | 127.0.0.1   | XX      | desktop  |
+------------------+---------------+-------------+---------+----------+
```

### 3.3. Check Stats Updated

```bash
curl "http://localhost:3002/api/reports/dashboard?preset=today"
```

**Expected:** `total_clicks` should be > 0

---

## 💰 BƯỚC 4: Test Conversion Tracking

### 4.1. Get Click ID

```bash
# From previous test or query database
CLICK_ID="afl_abc123..."
```

### 4.2. Send Test Postback

```bash
curl "http://localhost:3003/api/postback?click_id=${CLICK_ID}&payout=10&status=approved"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Conversion recorded",
  "click_id": "afl_abc123...",
  "payout": "10"
}
```

### 4.3. Verify Conversion

```bash
mysql -u afl_user -p afl_tracker -e "SELECT click_id, is_converted, payout FROM clicks WHERE click_id='${CLICK_ID}';"
```

**Expected:**
```
+------------------+--------------+--------+
| click_id         | is_converted | payout |
+------------------+--------------+--------+
| afl_abc123...    | 1            | 10.00  |
+------------------+--------------+--------+
```

---

## 🖥️ BƯỚC 5: Test Frontend

### 5.1. Access Dashboard

```bash
# Open browser
open http://localhost:5173
# Or production: https://dashboard.yourdomain.com
```

**Check:**
- ✅ Page loads without errors
- ✅ 4 stat cards display
- ✅ Stats show correct numbers
- ✅ Campaigns table displays

### 5.2. Check Browser Console

Press `F12` → Console tab

**Expected:**
- ✅ No errors
- ✅ API calls succeed (200 status)
- ✅ Data loads correctly

### 5.3. Test Date Range Selector

1. Change date range to "Hôm qua"
2. Click Refresh button

**Expected:**
- ✅ Stats update
- ✅ No errors
- ✅ Loading indicator shows

### 5.4. Test Campaigns Page

Click "Chiến Dịch" in sidebar

**Expected:**
- ✅ Campaigns list loads
- ✅ All columns display
- ✅ Actions buttons work
- ✅ Test link opens in new tab

---

## 🧪 BƯỚC 6: Integration Tests

### Test 1: Full Click-to-Conversion Flow

```bash
# 1. Generate click
RESPONSE=$(curl -s -L -w "\n%{url_effective}" "http://localhost:3001/c/camp_demo_001?external_id=integration_test")
echo "Click generated, redirected to: $RESPONSE"

# 2. Extract click_id from database
CLICK_ID=$(mysql -u afl_user -p -N -e "SELECT click_id FROM afl_tracker.clicks WHERE external_id='integration_test' ORDER BY timestamp DESC LIMIT 1;")
echo "Click ID: $CLICK_ID"

# 3. Send conversion
curl "http://localhost:3003/api/postback?click_id=${CLICK_ID}&payout=15"

# 4. Verify in dashboard
curl "http://localhost:3002/api/reports/dashboard?preset=today" | jq '.overall'
```

**Expected:**
- Clicks: +1
- Conversions: +1
- Revenue: +$15

### Test 2: Multiple Campaigns

```bash
# Create test campaign via API
curl -X POST http://localhost:3002/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Campaign 2",
    "traffic_source_id": "ts_google",
    "cost_model": "CPC",
    "cost_value": 0.30,
    "flow_type": "direct",
    "offer_url": "https://example.com/offer2"
  }'

# Verify in frontend
# → Open Dashboard → Should see 2 campaigns
```

### Test 3: API Error Handling

```bash
# Test invalid campaign
curl "http://localhost:3002/api/campaigns/invalid_id"
# Expected: {"error":"Campaign not found"}

# Test missing click_id in postback
curl "http://localhost:3003/api/postback?payout=10"
# Expected: {"error":"Missing click_id"}
```

---

## 📊 BƯỚC 7: Performance Test

### Test Load Time

```bash
# Test API response time
time curl -s "http://localhost:3002/api/campaigns" > /dev/null

# Expected: < 200ms
```

### Test Concurrent Requests

```bash
# Install Apache Bench (if needed)
# Ubuntu: sudo apt install apache2-utils

# Test 100 requests, 10 concurrent
ab -n 100 -c 10 http://localhost:3002/api/campaigns

# Expected:
# - Requests per second: > 100
# - Failed requests: 0
```

---

## ✅ SUCCESS CRITERIA

### Backend:
- [x] All services running (pm2 list shows "online")
- [x] Health checks return 200
- [x] API endpoints return correct data
- [x] Click tracking works
- [x] Conversions record correctly
- [x] Database queries execute < 100ms

### Frontend:
- [x] Dashboard loads without errors
- [x] Stats display correctly
- [x] Campaigns list works
- [x] API calls succeed (check Network tab)
- [x] No console errors
- [x] Responsive on mobile

### Integration:
- [x] Frontend → Backend communication works
- [x] Field names match
- [x] Data flows correctly
- [x] Click-to-conversion flow complete
- [x] Real-time stats update

---

## 🐛 Troubleshooting

### Issue: API returns 500 error

**Check:**
```bash
# View API logs
pm2 logs afl-api --lines 50

# Check database connection
node scripts/test-connection.js
```

### Issue: Frontend shows "Network Error"

**Check:**
```bash
# 1. API service running?
pm2 list | grep afl-api

# 2. CORS configured?
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS http://localhost:3002/api/campaigns

# 3. Check frontend .env
cat frontend/.env
```

### Issue: Clicks not recording

**Check:**
```bash
# 1. Worker processing queue?
pm2 logs afl-worker

# 2. Redis running?
redis-cli ping

# 3. Check clicks table
mysql -u afl_user -p -e "SELECT COUNT(*) FROM afl_tracker.clicks;"
```

---

## 📝 Test Results Template

```
=== AFL TRACKER INTEGRATION TEST RESULTS ===

Date: _______________
Tester: _______________

Backend Services:
[ ] afl-tracker (Port 3001) - Status: _______
[ ] afl-api (Port 3002) - Status: _______
[ ] afl-postback (Port 3003) - Status: _______
[ ] afl-worker - Status: _______
[ ] afl-monitor - Status: _______

API Endpoints:
[ ] GET /api/traffic-sources - Response: _______
[ ] GET /api/campaigns - Response: _______
[ ] GET /api/reports/dashboard - Response: _______
[ ] POST /api/campaigns - Response: _______
[ ] GET /api/postback - Response: _______

Click Tracking:
[ ] Test click generated - Click ID: _______
[ ] Click recorded in DB - Verified: _______
[ ] Stats updated - Clicks: _______

Conversion Tracking:
[ ] Postback sent - Response: _______
[ ] Conversion recorded - Verified: _______
[ ] Stats updated - Conversions: _______

Frontend:
[ ] Dashboard loads - Time: _______ms
[ ] Campaigns page loads - Time: _______ms
[ ] API calls succeed - Status: _______
[ ] No console errors - Verified: _______

Performance:
[ ] API response time - Average: _______ms
[ ] Page load time - Average: _______ms
[ ] Concurrent requests - RPS: _______

Overall Status: [ ] PASS  [ ] FAIL

Notes:
_________________________________
_________________________________
```

---

## 🎉 Completion

Nếu tất cả tests PASS → **Hệ thống sẵn sàng production!** 🚀

---

*Test checklist v1.0*
*Last updated: 2026-01-19*
