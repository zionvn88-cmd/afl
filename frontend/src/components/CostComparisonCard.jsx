import { useState, useEffect } from 'react';

/**
 * Component hiển thị so sánh chi phí ước tính vs thực tế
 */
export default function CostComparisonCard({ campaignId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!campaignId) return;
    
    fetchCostComparison();
    
    // Refresh mỗi 5 phút
    const interval = setInterval(fetchCostComparison, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [campaignId]);

  const fetchCostComparison = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/cost-comparison`);
      const result = await response.json();
      
      if (result.success) {
        setData(result);
        setError(null);
      } else {
        setError('Failed to fetch cost comparison');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !data || data.sync_status === 'disabled') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Đồng Bộ Chi Phí Chưa Được Bật
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Để theo dõi chi phí thực tế từ {data?.campaign_name}, bạn cần:</p>
              <ol className="list-decimal ml-5 mt-2 space-y-1">
                <li>Setup API credentials cho platform quảng cáo</li>
                <li>Update campaign với platform_account_id</li>
                <li>Chạy cost sync worker</li>
              </ol>
              <a 
                href="/docs/COST-SYNC-GUIDE.md" 
                target="_blank"
                className="mt-3 inline-block text-yellow-800 underline font-medium"
              >
                Xem hướng dẫn chi tiết →
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { today, last_sync } = data;
  const isVarianceHigh = Math.abs(today.variance_percentage) > 10;
  const lastSyncDate = last_sync ? new Date(last_sync) : null;
  const isSyncStale = lastSyncDate && (Date.now() - lastSyncDate.getTime() > 6 * 60 * 60 * 1000); // > 6 hours

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            💰 Chi Phí Hôm Nay
          </h3>
          {lastSyncDate && (
            <span className={`text-xs px-2 py-1 rounded ${
              isSyncStale ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              Sync: {lastSyncDate.toLocaleTimeString('vi-VN')}
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Estimated Cost */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">Chi Phí Ước Tính</span>
              <span className="text-xs text-blue-600">Từ Tracker</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-blue-900">
                ${today.estimated_cost.toFixed(2)}
              </span>
              <span className="text-sm text-blue-600 ml-2">
                {today.tracked_clicks} clicks
              </span>
            </div>
          </div>

          {/* Actual Cost */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700">Chi Phí Thực Tế</span>
              <span className="text-xs text-green-600">Từ Platform API</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-green-900">
                ${today.actual_cost.toFixed(2)}
              </span>
              <span className="text-sm text-green-600 ml-2">
                {today.platform_clicks} clicks
              </span>
            </div>
          </div>

          {/* Variance */}
          <div className={`rounded-lg p-4 ${
            isVarianceHigh 
              ? 'bg-red-50' 
              : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${
                isVarianceHigh ? 'text-red-700' : 'text-gray-700'
              }`}>
                Chênh Lệch Chi Phí
              </span>
              {isVarianceHigh && (
                <span className="text-xs text-red-600 font-medium">⚠️ Cao</span>
              )}
            </div>
            <div className="mt-2 flex items-baseline">
              <span className={`text-2xl font-bold ${
                isVarianceHigh ? 'text-red-900' : 'text-gray-900'
              }`}>
                ${Math.abs(today.cost_variance).toFixed(2)}
              </span>
              <span className={`text-lg ml-2 ${
                isVarianceHigh ? 'text-red-600' : 'text-gray-600'
              }`}>
                ({today.variance_percentage > 0 ? '+' : ''}{today.variance_percentage}%)
              </span>
            </div>
          </div>

          {/* Click Variance */}
          <div className="bg-purple-50 rounded-lg p-4">
            <span className="text-sm font-medium text-purple-700">Chênh Lệch Clicks</span>
            <div className="mt-2 flex items-baseline">
              <span className="text-2xl font-bold text-purple-900">
                {Math.abs(today.click_variance)}
              </span>
              <span className="text-sm text-purple-600 ml-2">
                clicks {today.click_variance > 0 ? 'thiếu track' : 'track dư'}
              </span>
            </div>
          </div>

        </div>

        {/* Performance Metrics */}
        {today.revenue > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600">Revenue</div>
                <div className="text-lg font-bold text-gray-900">
                  ${today.revenue.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">ROI (Ước tính)</div>
                <div className={`text-lg font-bold ${
                  ((today.revenue - today.estimated_cost) / today.estimated_cost * 100) > 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {((today.revenue - today.estimated_cost) / today.estimated_cost * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">ROI (Thực tế)</div>
                <div className={`text-lg font-bold ${
                  ((today.revenue - today.actual_cost) / today.actual_cost * 100) > 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {((today.revenue - today.actual_cost) / today.actual_cost * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Warning if variance is high */}
        {isVarianceHigh && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Chênh lệch chi phí cao
                </h3>
                <div className="mt-1 text-sm text-yellow-700">
                  Chi phí thực tế {today.cost_variance > 0 ? 'cao hơn' : 'thấp hơn'} ước tính {Math.abs(today.variance_percentage)}%. 
                  Kiểm tra lại cost model hoặc có thể platform đang tính thêm phí.
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
