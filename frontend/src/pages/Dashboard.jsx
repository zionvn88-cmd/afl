import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  RefreshCw, AlertCircle, MousePointer, DollarSign, Target, Zap,
  Award, TrendingUp, TrendingDown
} from 'lucide-react';
import EnhancedStatCard from '../components/EnhancedStatCard';
import PerformanceChart from '../components/PerformanceChart';
import { dashboardAPI } from '../services/api';

export default function Dashboard() {
  const [lastUpdate, setLastUpdate] = useState(null);
  const [dateRange, setDateRange] = useState('today');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [compareData, setCompareData] = useState(null);

  // Load current data
  useEffect(() => {
    loadData();
  }, [dateRange]);

  // Load compare data (yesterday) for trends
  useEffect(() => {
    if (dateRange === 'today') {
      loadCompareData();
    }
  }, [dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await dashboardAPI.getStats(dateRange);
      setData(result);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompareData = async () => {
    try {
      const result = await dashboardAPI.getStats('yesterday');
      setCompareData(result);
    } catch (error) {
      console.error('Failed to load compare data:', error);
    }
  };

  const handleRefresh = () => {
    loadData();
    if (dateRange === 'today') {
      loadCompareData();
    }
  };

  // Calculate trends
  const stats = useMemo(() => {
    if (!data) return null;

    const today = data.overall || {};
    const yesterday = compareData?.overall || {};
    
    const calculateTrend = (current, previous) => {
      if (!previous || previous === 0) return undefined;
      return ((current - previous) / previous * 100);
    };
    
    return {
      ...today,
      trends: {
        clicks: calculateTrend(today.total_clicks || 0, yesterday.total_clicks || 0),
        conversions: calculateTrend(today.conversions || 0, yesterday.conversions || 0),
        profit: calculateTrend(today.profit || 0, yesterday.profit || 0),
        epc: calculateTrend(today.epc || 0, yesterday.epc || 0),
        cost: calculateTrend(today.total_cost || 0, yesterday.total_cost || 0),
        revenue: calculateTrend(today.total_revenue || 0, yesterday.total_revenue || 0)
      }
    };
  }, [data, compareData]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const campaigns = data?.campaigns || [];
  const alerts = data?.alerts || [];
  const topPerformers = data?.topPerformers || [];
  const worstPerformers = data?.worstPerformers || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tổng Quan</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
          >
            <option value="today">Hôm nay</option>
            <option value="yesterday">Hôm qua</option>
            <option value="last7days">7 ngày qua</option>
            <option value="last30days">30 ngày qua</option>
          </select>
          {lastUpdate && (
            <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400">
              {formatTimeAgo(lastUpdate)}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn-ios-secondary"
            title="Cập nhật dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <EnhancedStatCard 
          title="Lượt Click"
          value={stats?.total_clicks?.toLocaleString() || '0'}
          subtitle={`${stats?.unique_clicks || 0} duy nhất`}
          icon={MousePointer}
          color="blue"
          trend={stats?.trends?.clicks ? parseFloat(stats.trends.clicks.toFixed(1)) : undefined}
          delay={0}
        />
        <EnhancedStatCard 
          title="Chuyển Đổi"
          value={stats?.conversions?.toLocaleString() || '0'}
          subtitle={`CR: ${stats?.cr || 0}%`}
          icon={Target}
          color="green"
          trend={stats?.trends?.conversions ? parseFloat(stats.trends.conversions.toFixed(1)) : undefined}
          delay={0.05}
        />
        <EnhancedStatCard 
          title="Chi Tiêu"
          value={`$${(stats?.total_cost || 0).toFixed(2)}`}
          subtitle={`CPC: $${stats?.total_clicks > 0 ? ((stats?.total_cost || 0) / stats.total_clicks).toFixed(4) : '0.00'}`}
          icon={DollarSign}
          color="red"
          trend={stats?.trends?.cost ? parseFloat(stats.trends.cost.toFixed(1)) : undefined}
          delay={0.1}
        />
        <EnhancedStatCard 
          title="Doanh Thu"
          value={`$${(stats?.total_revenue || 0).toFixed(2)}`}
          subtitle={`EPC: $${(stats?.epc || 0).toFixed(4)}`}
          icon={Zap}
          color="orange"
          trend={stats?.trends?.revenue ? parseFloat(stats.trends.revenue.toFixed(1)) : undefined}
          delay={0.15}
        />
        <EnhancedStatCard 
          title="Lợi Nhuận"
          value={`$${(stats?.profit || 0).toFixed(2)}`}
          subtitle={`ROI: ${stats?.roi || 0}%`}
          icon={Award}
          color="purple"
          trend={stats?.trends?.profit ? parseFloat(stats.trends.profit.toFixed(1)) : undefined}
          delay={0.2}
        />
      </div>

      {/* Performance Chart */}
      <PerformanceChart 
        title="Hiệu Suất 24h" 
        data={data?.chartData || []}
      />

      {/* Alerts */}
      {alerts.length > 0 && (
        <section className="card-ios p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              Cảnh Báo ({alerts.length})
            </h2>
            <Link to="/alerts" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Xem tất cả
            </Link>
          </div>
          
          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert, index) => (
              <div
                key={alert.id || index}
                className={`p-3.5 rounded-ios-sm text-sm ${
                  alert.severity === 'high' 
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
                    : alert.severity === 'medium'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                    : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white">{alert.title}</p>
                    <p className="text-gray-600 dark:text-gray-400 mt-0.5">
                      {alert.campaign_name}: {alert.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {formatTimeAgo(new Date(alert.created_at))}
                    </p>
                  </div>
                  {alert.campaign_id && (
                    <Link
                      to={`/campaigns/${alert.campaign_id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium whitespace-nowrap"
                    >
                      Chi tiết
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top & Worst Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <section className="card-ios p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
            Hiệu Quả Cao
          </h2>
          <div className="space-y-2.5">
            {topPerformers.length === 0 ? (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">Chưa có dữ liệu</p>
            ) : (
              topPerformers.map((campaign, index) => (
                <Link
                  key={campaign.id}
                  to={`/campaigns/${campaign.id}`}
                  className="flex items-center justify-between p-3 rounded-ios bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-ios-sm bg-green-500 flex items-center justify-center text-white text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900 dark:text-white">{campaign.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{campaign.clicks} lượt nhấp</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600 dark:text-green-400">${campaign.profit?.toFixed(2) || '0.00'}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">ROI: {campaign.roi}%</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Worst Performers */}
        <section className="card-ios p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            Cần Chú Ý
          </h2>
          <div className="space-y-2.5">
            {worstPerformers.length === 0 ? (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">Chưa có dữ liệu</p>
            ) : (
              worstPerformers.map((campaign, index) => (
                <Link
                  key={campaign.id}
                  to={`/campaigns/${campaign.id}`}
                  className="flex items-center justify-between p-3 rounded-ios bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-ios-sm bg-red-500 flex items-center justify-center text-white text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900 dark:text-white">{campaign.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{campaign.clicks} lượt nhấp</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600 dark:text-red-400">${campaign.profit?.toFixed(2) || '0.00'}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">ROI: {campaign.roi}%</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Campaigns Table */}
      <section className="card-ios p-5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Chiến Dịch
        </h2>
        
        <div className="overflow-x-auto -mx-5">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-5 text-sm font-medium text-gray-600 dark:text-gray-400">Tên</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Lượt Click</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Chuyển Đổi</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Lợi Nhuận</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">ROI</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-sm text-gray-500 dark:text-gray-400">
                    Chưa có chiến dịch
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => {
                  const roi = campaign.roi || 0;
                  return (
                    <tr
                      key={campaign.id}
                      className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-3 px-5">
                        <Link 
                          to={`/campaigns/${campaign.id}`}
                          className="font-medium text-sm text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {campaign.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">
                        {campaign.clicks?.toLocaleString() || 0}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">
                        {campaign.conversions || 0}
                      </td>
                      <td className={`py-3 px-4 text-right text-sm font-medium ${
                        roi > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        ${(campaign.profit || 0).toFixed(2)}
                      </td>
                      <td className={`py-3 px-4 text-right text-sm font-medium ${
                        roi > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {roi.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          roi > 50 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          roi > 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {roi > 50 ? <TrendingUp className="w-3 h-3" /> : roi > 0 ? '−' : <TrendingDown className="w-3 h-3" />}
                          {roi > 50 ? 'Tốt' : roi > 0 ? 'Ổn' : 'Kém'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function formatTimeAgo(date) {
  if (!date) return 'Chưa bao giờ';
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return `${seconds}s trước`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h trước`;
  const days = Math.floor(hours / 24);
  return `${days}d trước`;
}
