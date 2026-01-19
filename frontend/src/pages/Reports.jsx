import { useState, useEffect } from 'react';
import { 
  BarChart3, Download, RefreshCw, Globe, Smartphone, Monitor, 
  Tablet, AlertTriangle, Shield, Users, MousePointer, TrendingUp
} from 'lucide-react';
import { getApiUrl } from '../config/api';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({
    overview: null,
    countries: [],
    devices: [],
    browsers: [],
    hourly: [],
    fraud: null
  });

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ dateRange });
      
      const [overviewRes, fraudRes] = await Promise.all([
        fetch(getApiUrl(`reports/breakdown?${params}`)),
        fetch(getApiUrl(`reports/fraud?${params}`))
      ]);

      const overviewData = overviewRes.ok ? await overviewRes.json() : null;
      const fraudData = fraudRes.ok ? await fraudRes.json() : null;

      setData({
        overview: overviewData,
        countries: overviewData?.byCountry || [],
        devices: overviewData?.byDevice || [],
        browsers: overviewData?.byBrowser || [],
        hourly: overviewData?.hourly || [],
        fraud: fraudData
      });
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const params = new URLSearchParams({ 
        format: 'csv', 
        type: 'clicks',
        dateRange 
      });
      const res = await fetch(getApiUrl(`reports/export?${params}`));
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bao-cao-traffic-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const fraud = data.fraud?.overall || {};
  const botRate = parseFloat(fraud.bot_rate || 0);

  const tabs = [
    { id: 'overview', label: 'Tổng Quan', icon: BarChart3 },
    { id: 'geo', label: 'Địa Lý', icon: Globe },
    { id: 'device', label: 'Thiết Bị', icon: Smartphone },
    { id: 'quality', label: 'Chất Lượng', icon: Shield }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-ios bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Phân Tích Traffic</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Theo dõi nguồn traffic và chất lượng</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            id="report-date-range"
            name="dateRange"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-sm"
          >
            <option value="today">Hôm nay</option>
            <option value="yesterday">Hôm qua</option>
            <option value="last7days">7 ngày qua</option>
            <option value="last30days">30 ngày qua</option>
          </select>
          <button onClick={loadData} className="btn-ios-secondary p-2.5" disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={exportData} className="btn-ios-secondary p-2.5" title="Xuất CSV">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-ios p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-ios bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <MousePointer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tổng Click</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {(fraud.total_clicks || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card-ios p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-ios bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Click Sạch</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {(fraud.clean_clicks || fraud.total_clicks - fraud.bot_clicks || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card-ios p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-ios bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Bot/Nghi Ngờ</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {(fraud.bot_clicks || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card-ios p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-ios flex items-center justify-center ${
              botRate < 5 ? 'bg-green-100 dark:bg-green-900/30' :
              botRate < 20 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
              'bg-red-100 dark:bg-red-900/30'
            }`}>
              <TrendingUp className={`w-5 h-5 ${
                botRate < 5 ? 'text-green-600 dark:text-green-400' :
                botRate < 20 ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tỷ Lệ Bot</p>
              <p className={`text-xl font-semibold ${
                botRate < 5 ? 'text-green-600 dark:text-green-400' :
                botRate < 20 ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {botRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="card-ios p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Lưu ý về phân tích traffic
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Dữ liệu này giúp bạn nắm tình hình traffic. Nếu phát hiện bot/nguồn xấu, 
              hãy điều chỉnh targeting trên nền tảng quảng cáo (Facebook, Google...). 
              Traffic đã đến = đã tính tiền, chỉ có thể tối ưu cho tương lai.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-ios text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Countries */}
              <div className="card-ios p-5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  Top Quốc Gia
                </h3>
                <div className="space-y-3">
                  {data.countries.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Chưa có dữ liệu</p>
                  ) : (
                    data.countries.slice(0, 10).map((item, index) => (
                      <div key={item.country || index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getCountryFlag(item.country)}</span>
                          <span className="text-sm text-gray-900 dark:text-white">{item.country || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {(item.clicks || 0).toLocaleString()}
                          </span>
                          {item.bot_rate > 10 && (
                            <span className="text-xs text-red-500">⚠️ {item.bot_rate}% bot</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Top Devices */}
              <div className="card-ios p-5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-green-500" />
                  Thiết Bị
                </h3>
                <div className="space-y-3">
                  {data.devices.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Chưa có dữ liệu</p>
                  ) : (
                    data.devices.map((item, index) => {
                      const Icon = item.device === 'mobile' ? Smartphone : 
                                   item.device === 'tablet' ? Tablet : Monitor;
                      return (
                        <div key={item.device || index} className="flex items-center justify-between p-3 rounded-ios bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-gray-500" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                              {item.device === 'mobile' ? 'Di động' : 
                               item.device === 'tablet' ? 'Máy tính bảng' : 
                               item.device === 'desktop' ? 'Máy tính' : item.device || 'Khác'}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {(item.clicks || 0).toLocaleString()}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Geo Tab */}
          {activeTab === 'geo' && (
            <div className="card-ios p-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Phân Tích Theo Quốc Gia
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Quốc Gia</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Click</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Chuyển Đổi</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Tỷ Lệ Bot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.countries.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                          Chưa có dữ liệu
                        </td>
                      </tr>
                    ) : (
                      data.countries.map((item, index) => (
                        <tr key={item.country || index} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                          <td className="py-3 px-4">
                            <span className="text-lg mr-2">{getCountryFlag(item.country)}</span>
                            <span className="text-sm text-gray-900 dark:text-white">{item.country || 'Unknown'}</span>
                          </td>
                          <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">
                            {(item.clicks || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">
                            {item.conversions || 0}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`text-sm font-medium ${
                              (item.bot_rate || 0) > 20 ? 'text-red-500' :
                              (item.bot_rate || 0) > 10 ? 'text-yellow-500' :
                              'text-green-500'
                            }`}>
                              {(item.bot_rate || 0).toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Device Tab */}
          {activeTab === 'device' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Devices */}
              <div className="card-ios p-5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Loại Thiết Bị</h3>
                <div className="space-y-4">
                  {data.devices.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Chưa có dữ liệu</p>
                  ) : (
                    data.devices.map((item, index) => {
                      const total = data.devices.reduce((sum, d) => sum + (d.clicks || 0), 0);
                      const percent = total > 0 ? ((item.clicks || 0) / total * 100) : 0;
                      return (
                        <div key={item.device || index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-900 dark:text-white capitalize">
                              {item.device === 'mobile' ? 'Di động' : 
                               item.device === 'tablet' ? 'Máy tính bảng' : 
                               item.device === 'desktop' ? 'Máy tính' : item.device || 'Khác'}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {(item.clicks || 0).toLocaleString()} ({percent.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Browsers */}
              <div className="card-ios p-5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Trình Duyệt</h3>
                <div className="space-y-4">
                  {data.browsers.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Chưa có dữ liệu</p>
                  ) : (
                    data.browsers.slice(0, 8).map((item, index) => {
                      const total = data.browsers.reduce((sum, b) => sum + (b.clicks || 0), 0);
                      const percent = total > 0 ? ((item.clicks || 0) / total * 100) : 0;
                      return (
                        <div key={item.browser || index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-900 dark:text-white">{item.browser || 'Unknown'}</span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {(item.clicks || 0).toLocaleString()} ({percent.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quality Tab */}
          {activeTab === 'quality' && (
            <div className="space-y-6">
              {/* Quality Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card-ios p-5 text-center">
                  <div className="text-4xl font-bold text-green-500 mb-2">
                    {(100 - botRate).toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Traffic Sạch</p>
                </div>
                <div className="card-ios p-5 text-center">
                  <div className="text-4xl font-bold text-orange-500 mb-2">
                    {(fraud.duplicate_clicks || 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Click Trùng</p>
                </div>
                <div className="card-ios p-5 text-center">
                  <div className="text-4xl font-bold text-red-500 mb-2">
                    {(fraud.bot_clicks || 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Bot Phát Hiện</p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="card-ios p-5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  💡 Gợi Ý Tối Ưu
                </h3>
                <div className="space-y-3">
                  {botRate > 20 && (
                    <div className="p-3 rounded-ios bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        <strong>⚠️ Tỷ lệ bot cao ({botRate.toFixed(1)}%):</strong> Kiểm tra lại targeting, 
                        loại trừ các placement/audience có chất lượng thấp trên nền tảng quảng cáo.
                      </p>
                    </div>
                  )}
                  {data.countries.some(c => (c.bot_rate || 0) > 30) && (
                    <div className="p-3 rounded-ios bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        <strong>🌍 Một số quốc gia có tỷ lệ bot cao:</strong> Cân nhắc loại trừ hoặc 
                        giảm bid cho các quốc gia này trong campaign settings.
                      </p>
                    </div>
                  )}
                  {botRate < 10 && (
                    <div className="p-3 rounded-ios bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        <strong>✅ Traffic chất lượng tốt!</strong> Tỷ lệ bot thấp, 
                        nguồn traffic đang hoạt động hiệu quả.
                      </p>
                    </div>
                  )}
                  <div className="p-3 rounded-ios bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>💡 Mẹo:</strong> Theo dõi dữ liệu hàng ngày để phát hiện sớm 
                      các vấn đề về chất lượng traffic và điều chỉnh kịp thời.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Helper: Get country flag emoji
function getCountryFlag(countryCode) {
  if (!countryCode || countryCode === 'XX' || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
