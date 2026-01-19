import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Ban, CheckCircle, RefreshCw } from 'lucide-react';
import EnhancedStatCard from '../components/EnhancedStatCard';
import { getApiUrl } from '../config/api';

export default function FraudDashboard() {
  const [fraudStats, setFraudStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('today');

  useEffect(() => {
    loadFraudStats();
  }, [timeRange]);

  const loadFraudStats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ dateRange: timeRange });
      const res = await fetch(getApiUrl(`reports/fraud?${params}`));
      if (!res.ok) throw new Error('API not available');
      const data = await res.json();
      setFraudStats(data);
    } catch (error) {
      console.error('Lỗi tải dữ liệu chống gian lận:', error);
      // Empty data when API fails - no fake data
      setFraudStats({
        overall: {
          total_clicks: 0,
          bot_clicks: 0,
          bot_rate: 0,
          blocked_clicks: 0,
          duplicate_clicks: 0,
          vpn_clicks: 0,
          datacenter_clicks: 0,
          tor_clicks: 0,
          suspicious_clicks: 0
        },
        topFraudSources: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !fraudStats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const overall = fraudStats.overall || {};
  const botRate = parseFloat(overall.bot_rate || 0);
  const duplicateRate = overall.total_clicks > 0 
    ? (overall.duplicate_clicks / overall.total_clicks * 100).toFixed(2)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-ios bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Bảng Điều Khiển Chống Gian Lận</p>
          </div>
        </div>
        <select
          id="fraud-time-range"
          name="timeRange"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
        >
          <option value="today">Hôm nay</option>
          <option value="yesterday">Hôm qua</option>
          <option value="last7days">7 ngày qua</option>
          <option value="last30days">30 ngày qua</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <EnhancedStatCard 
          title="Tổng Click"
          value={overall.total_clicks?.toLocaleString() || '0'}
          subtitle="Tất cả lưu lượng"
          icon={Shield}
          color="blue"
        />
        <EnhancedStatCard 
          title="Bot Phát Hiện"
          value={overall.bot_clicks?.toLocaleString() || '0'}
          subtitle={`${botRate.toFixed(2)}% lưu lượng`}
          icon={AlertTriangle}
          color="orange"
        />
        <EnhancedStatCard 
          title="Đã Chặn"
          value={overall.blocked_clicks?.toLocaleString() || '0'}
          subtitle="Gian lận ngăn chặn"
          icon={Ban}
          color="red"
        />
        <EnhancedStatCard 
          title="Lưu Lượng Sạch"
          value={`${(100 - botRate - parseFloat(duplicateRate)).toFixed(1)}%`}
          subtitle="Click hợp lệ"
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Detection Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bot Types */}
        <section className="card-ios p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Chi Tiết Phát Hiện Bot
          </h3>
          <div className="space-y-3">
            {[
              { label: 'VPN/Proxy', value: overall.vpn_clicks || 0, color: 'orange' },
              { label: 'IP Datacenter', value: overall.datacenter_clicks || 0, color: 'red' },
              { label: 'Mạng Tor', value: overall.tor_clicks || 0, color: 'purple' },
              { label: 'Nghi Ngờ', value: overall.suspicious_clicks || 0, color: 'yellow' }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-ios bg-gray-50 dark:bg-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Quality Score Distribution */}
        <section className="card-ios p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Điểm Chất Lượng IP
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Chất Lượng Cao (90-100)', value: overall.high_quality || 0, color: 'green' },
              { label: 'Chất Lượng Trung Bình (50-89)', value: overall.medium_quality || 0, color: 'yellow' },
              { label: 'Chất Lượng Thấp (0-49)', value: overall.low_quality || 0, color: 'red' }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-ios bg-gray-50 dark:bg-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Top Fraud Sources */}
      {fraudStats.topFraudSources && fraudStats.topFraudSources.length > 0 && (
        <section className="card-ios p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Nguồn Gian Lận Hàng Đầu
          </h3>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-5 text-sm font-medium text-gray-600 dark:text-gray-400">Nguồn</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Tổng</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Bot</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Tỷ Lệ</th>
                </tr>
              </thead>
              <tbody>
                {fraudStats.topFraudSources.map((source, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <td className="py-3 px-5 text-sm font-medium text-gray-900 dark:text-white">{source.ip || source.country || 'Không rõ'}</td>
                    <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">{source.total_clicks}</td>
                    <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">{source.bot_clicks}</td>
                    <td className="py-3 px-4 text-right text-sm font-semibold text-red-600 dark:text-red-400">
                      {((source.bot_clicks / source.total_clicks) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
