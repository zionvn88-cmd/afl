import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash2, Play, Pause, RefreshCw, MousePointer, Target, DollarSign,
  Globe, Smartphone, Monitor, Tablet, Chrome, ChevronLeft, ChevronRight
} from 'lucide-react';
import EnhancedStatCard from '../components/EnhancedStatCard';
import PerformanceChart from '../components/PerformanceChart';
import { useBatchAPI, useAPI, clearCacheFor } from '../hooks/useAPI';
import { getApiUrl } from '../config/api';

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('today');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Click history pagination
  const [clickPage, setClickPage] = useState(1);

  // Batch load campaign data (campaign + chart + breakdown)
  const { data: batchData, loading, refetch } = useBatchAPI([
    `campaigns/${id}?preset=${dateRange}`,
    `campaigns/${id}/chart?preset=${dateRange}`,
    `campaigns/${id}/breakdown?preset=${dateRange}`
  ], { dependencies: [id, dateRange] });

  // Load click history separately (only when needed)
  const { data: clickData, loading: loadingClicks } = useAPI(
    activeTab === 'clicks' ? `campaigns/${id}/clicks?page=${clickPage}&limit=20&preset=${dateRange}` : null,
    { 
      dependencies: [id, clickPage, dateRange, activeTab],
      autoFetch: activeTab === 'clicks',
      skipCache: true
    }
  );

  // Extract data from batch
  const campaign = useMemo(() => 
    batchData[`campaigns/${id}?preset=${dateRange}`]?.campaign || null,
    [batchData, id, dateRange]
  );

  const chartData = useMemo(() => 
    batchData[`campaigns/${id}/chart?preset=${dateRange}`]?.data || [],
    [batchData, id, dateRange]
  );

  const breakdown = useMemo(() => 
    batchData[`campaigns/${id}/breakdown?preset=${dateRange}`] || null,
    [batchData, id, dateRange]
  );

  const clickHistory = useMemo(() => clickData?.clicks || [], [clickData]);
  const clickTotalPages = useMemo(() => clickData?.totalPages || 1, [clickData]);
  const clickTotal = useMemo(() => clickData?.total || 0, [clickData]);

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa chiến dịch này?')) return;
    try {
      await fetch(getApiUrl(`campaigns/${id}`), { method: 'DELETE' });
      // Clear campaigns cache before navigating
      clearCacheFor('campaigns');
      navigate('/campaigns');
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  const toggleStatus = async () => {
    try {
      const newStatus = campaign.status === 'active' ? 'paused' : 'active';
      await fetch(getApiUrl(`campaigns/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      refetch(true); // Force refresh to bypass cache
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 dark:text-gray-400">Không tìm thấy chiến dịch</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Tổng Quan' },
    { id: 'geo', label: 'Quốc Gia' },
    { id: 'device', label: 'Thiết Bị' },
    { id: 'clicks', label: 'Click Gần Đây' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/campaigns')} className="btn-ios-secondary">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">{campaign.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {campaign.id?.substring(0, 8)}...</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            campaign.status === 'active' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
          }`}>
            {campaign.status === 'active' ? 'Hoạt Động' : 'Tạm Dừng'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <select
            id="campaign-date-range"
            name="dateRange"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="flex-1 lg:flex-initial px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
          >
            <option value="today">Hôm nay</option>
            <option value="yesterday">Hôm qua</option>
            <option value="last7days">7 ngày qua</option>
            <option value="last30days">30 ngày qua</option>
          </select>
          <button onClick={() => refetch(true)} className="btn-ios-secondary">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={toggleStatus} className="btn-ios-secondary">
            {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <Link to={`/campaigns/${id}/edit`} className="btn-ios-secondary">
            <Edit className="w-4 h-4" />
          </Link>
          <button onClick={handleDelete} className="btn-ios-secondary hover:bg-red-100 hover:text-red-600">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <EnhancedStatCard 
          title="Lượt Click"
          value={campaign.total_clicks?.toLocaleString() || '0'}
          subtitle={`${campaign.unique_clicks || 0} duy nhất`}
          icon={MousePointer}
          color="blue"
        />
        <EnhancedStatCard 
          title="Chuyển Đổi"
          value={campaign.conversions?.toLocaleString() || '0'}
          subtitle={`CR: ${campaign.cr || 0}%`}
          icon={Target}
          color="green"
        />
        <EnhancedStatCard 
          title="Chi Tiêu"
          value={`$${(campaign.cost || 0).toFixed(2)}`}
          subtitle={`CPC: $${campaign.total_clicks > 0 ? ((campaign.cost || 0) / campaign.total_clicks).toFixed(4) : '0.00'}`}
          icon={DollarSign}
          color="red"
        />
        <EnhancedStatCard 
          title="Lợi Nhuận"
          value={`$${(campaign.profit || 0).toFixed(2)}`}
          subtitle={`ROI: ${campaign.roi || 0}%`}
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-ios text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Performance Chart */}
          <PerformanceChart title="Hiệu Suất Chiến Dịch" data={chartData} />

          {/* Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-ios p-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Thông Tin Chiến Dịch
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Nguồn Traffic', value: campaign.traffic_source_name || 'N/A' },
                  { label: 'Mô Hình Chi Phí', value: campaign.cost_model?.toUpperCase() || 'N/A' },
                  { label: 'Giá Trị', value: `$${campaign.cost_value || 0}` },
                  { label: 'Ngày Tạo', value: new Date(campaign.created_at).toLocaleDateString('vi-VN') }
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-ios bg-gray-50 dark:bg-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-ios p-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Thống Kê Nhanh
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Thu/Click', value: `$${(campaign.epc || 0).toFixed(4)}` },
                  { label: 'Doanh Thu', value: `$${(campaign.revenue || 0).toFixed(2)}` },
                  { label: 'Chi Phí', value: `$${(campaign.cost || 0).toFixed(2)}` },
                  { label: 'Lợi Nhuận', value: `$${(campaign.profit || 0).toFixed(2)}` }
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-ios bg-gray-50 dark:bg-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Analysis - Devices & Countries in Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Top Countries */}
            <div className="card-ios p-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                Quốc Gia
              </h3>
              {!breakdown?.byCountry?.length ? (
                <p className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">Chưa có dữ liệu</p>
              ) : (
                <div className="space-y-2">
                  {breakdown.byCountry.slice(0, 5).map((item, index) => (
                    <div key={item.country || index} className="flex items-center justify-between p-2 rounded-ios bg-gray-50 dark:bg-gray-700/50">
                      <span className="text-sm text-gray-900 dark:text-white font-medium">{(item.country || 'XX').toUpperCase()}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{item.clicks}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Devices - Now shows device name like iPhone, Samsung, etc */}
            <div className="card-ios p-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-green-500" />
                Thiết Bị
              </h3>
              {!breakdown?.byDevice?.length ? (
                <p className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">Chưa có dữ liệu</p>
              ) : (
                <div className="space-y-2">
                  {breakdown.byDevice.slice(0, 5).map((item, index) => {
                    const deviceName = item.device || 'Unknown';
                    const Icon = deviceName.includes('iPhone') || deviceName.includes('Android') || 
                                 deviceName.includes('Galaxy') || deviceName.includes('Pixel') ||
                                 deviceName.includes('Xiaomi') || deviceName.includes('OPPO') ||
                                 deviceName.includes('Vivo') || deviceName.includes('Redmi') ||
                                 deviceName.includes('POCO') ? Smartphone :
                                 deviceName.includes('iPad') || deviceName.includes('Tab') ? Tablet : Monitor;
                    return (
                      <div key={deviceName + index} className="flex items-center justify-between p-2 rounded-ios bg-gray-50 dark:bg-gray-700/50">
                        <span className="flex items-center gap-2 text-sm">
                          <Icon className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-900 dark:text-white">{deviceName}</span>
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.clicks}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* OS - Operating System with version */}
            <div className="card-ios p-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-purple-500" />
                Hệ Điều Hành
              </h3>
              {!breakdown?.byOS?.length ? (
                <p className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">Chưa có dữ liệu</p>
              ) : (
                <div className="space-y-2">
                  {breakdown.byOS.slice(0, 5).map((item, index) => {
                    const osName = item.os || 'Unknown';
                    // Get OS icon/emoji
                    let osIcon = '💻';
                    if (osName.includes('iOS')) osIcon = '🍎';
                    else if (osName.includes('Android')) osIcon = '🤖';
                    else if (osName.includes('Windows')) osIcon = '🪟';
                    else if (osName.includes('macOS')) osIcon = '🍏';
                    else if (osName.includes('Linux')) osIcon = '🐧';
                    else if (osName.includes('Chrome OS')) osIcon = '💿';
                    
                    return (
                      <div key={osName + index} className="flex items-center justify-between p-2 rounded-ios bg-gray-50 dark:bg-gray-700/50">
                        <span className="flex items-center gap-2 text-sm">
                          <span>{osIcon}</span>
                          <span className="text-gray-900 dark:text-white">{osName}</span>
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.clicks}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Browsers with version */}
            <div className="card-ios p-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Chrome className="w-5 h-5 text-orange-500" />
                Trình Duyệt
              </h3>
              {!breakdown?.byBrowser?.length ? (
                <p className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">Chưa có dữ liệu</p>
              ) : (
                <div className="space-y-2">
                  {breakdown.byBrowser.slice(0, 5).map((item, index) => {
                    const browserName = item.browser || 'Unknown';
                    // Get browser icon/emoji
                    let browserIcon = '🌐';
                    if (browserName.includes('Chrome')) browserIcon = '🔵';
                    else if (browserName.includes('Safari')) browserIcon = '🧭';
                    else if (browserName.includes('Firefox')) browserIcon = '🦊';
                    else if (browserName.includes('Edge')) browserIcon = '🌀';
                    else if (browserName.includes('Opera')) browserIcon = '🔴';
                    else if (browserName.includes('Samsung')) browserIcon = '🟣';
                    
                    return (
                      <div key={browserName + index} className="flex items-center justify-between p-2 rounded-ios bg-gray-50 dark:bg-gray-700/50">
                        <span className="flex items-center gap-2 text-sm">
                          <span>{browserIcon}</span>
                          <span className="text-gray-900 dark:text-white">{browserName}</span>
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.clicks}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Bot Detection Summary */}
          {breakdown?.botSummary && (
            <div className="card-ios p-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                🔍 Chất Lượng Traffic
              </h3>
              
              {/* Bot Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-ios bg-blue-50 dark:bg-blue-900/20 text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {breakdown.botSummary.totalClicks || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Tổng Click</p>
                </div>
                <div className="p-4 rounded-ios bg-green-50 dark:bg-green-900/20 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-lg">👤</span>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {breakdown.botSummary.humanClicks || 0}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Người Thật</p>
                </div>
                <div className="p-4 rounded-ios bg-red-50 dark:bg-red-900/20 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-lg">🤖</span>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {breakdown.botSummary.botClicks || 0}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Bot/Spam</p>
                </div>
                <div className="p-4 rounded-ios bg-orange-50 dark:bg-orange-900/20 text-center">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {breakdown.botSummary.botRate || 0}%
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Tỉ Lệ Bot</p>
                </div>
              </div>
              
              {/* Bot Details */}
              {breakdown?.byBot?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Chi Tiết Nguồn Traffic</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {breakdown.byBot.map((item, index) => {
                      const isHuman = item.bot_type === 'human' || !item.bot_type;
                      
                      // Get icon based on type
                      let icon = isHuman ? '👤' : '🤖';
                      if (item.bot_type === 'ad_platform') icon = '📢';
                      else if (item.bot_type === 'search_engine') icon = '🔍';
                      else if (item.bot_type === 'social_preview') icon = '💬';
                      else if (item.bot_type === 'monitoring') icon = '📊';
                      else if (item.bot_type === 'automation') icon = '⚙️';
                      else if (item.bot_type === 'http_library') icon = '📡';
                      
                      // Get type label
                      const typeLabels = {
                        'human': 'Người Thật',
                        'ad_platform': 'Nền Tảng QC',
                        'search_engine': 'Công Cụ Tìm Kiếm',
                        'social_preview': 'Preview MXH',
                        'monitoring': 'Giám Sát',
                        'automation': 'Tự Động Hóa',
                        'http_library': 'HTTP Client',
                        'generic': 'Bot Khác',
                        'preview': 'Preview'
                      };
                      
                      return (
                        <div key={(item.bot_name || 'human') + index} className="flex items-center justify-between p-2 rounded-ios bg-gray-50 dark:bg-gray-700/50">
                          <span className="flex items-center gap-2 text-sm">
                            <span className="text-lg">{icon}</span>
                            <span className="text-gray-900 dark:text-white">{item.bot_name || 'Người Dùng Thật'}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              isHuman 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            }`}>
                              {typeLabels[item.bot_type] || (isHuman ? 'Người Thật' : 'Bot')}
                            </span>
                          </span>
                          <span className={`text-sm font-medium ${
                            isHuman 
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {item.clicks}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Tip */}
              <div className="mt-4 p-3 rounded-ios bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  💡 <strong>Lưu ý:</strong> Bot từ nền tảng quảng cáo (Google, Facebook, TikTok) kiểm tra link trước khi phê duyệt - đây là bình thường và không tính phí.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'geo' && (
        <div className="card-ios p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            Phân Tích Theo Quốc Gia
          </h3>
          {breakdown?.byCountry?.length === 0 ? (
            <p className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
              Chưa có dữ liệu. Click vào link tracking để tạo dữ liệu.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Quốc Gia</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Click</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Chuyển Đổi</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Doanh Thu</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown?.byCountry?.map((item, index) => (
                    <tr key={item.country || index} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-900 dark:text-white font-medium">{(item.country || 'XX').toUpperCase()}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                        {(item.clicks || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">
                        {item.conversions || 0}
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-medium text-green-600 dark:text-green-400">
                        ${(item.revenue || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'device' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Devices */}
          <div className="card-ios p-5">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-green-500" />
              Loại Thiết Bị
            </h3>
            {breakdown?.byDevice?.length === 0 ? (
              <p className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-4">
                {breakdown?.byDevice?.map((item, index) => {
                  const total = breakdown.byDevice.reduce((sum, d) => sum + (d.clicks || 0), 0);
                  const percent = total > 0 ? ((item.clicks || 0) / total * 100) : 0;
                  const Icon = item.device === 'mobile' ? Smartphone : 
                               item.device === 'tablet' ? Tablet : Monitor;
                  return (
                    <div key={item.device || index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <Icon className="w-4 h-4" />
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
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Browsers */}
          <div className="card-ios p-5">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Chrome className="w-5 h-5 text-blue-500" />
              Trình Duyệt
            </h3>
            {breakdown?.byBrowser?.length === 0 ? (
              <p className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-4">
                {breakdown?.byBrowser?.map((item, index) => {
                  const total = breakdown.byBrowser.reduce((sum, b) => sum + (b.clicks || 0), 0);
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
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* OS */}
          <div className="card-ios p-5 lg:col-span-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Hệ Điều Hành
            </h3>
            {breakdown?.byOS?.length === 0 ? (
              <p className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">Chưa có dữ liệu</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {breakdown?.byOS?.map((item, index) => (
                  <div key={item.os || index} className="p-4 rounded-ios bg-gray-50 dark:bg-gray-700 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {(item.clicks || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{item.os || 'Unknown'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'clicks' && (
        <div className="card-ios p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Lịch Sử Truy Cập
              {clickTotal > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({clickTotal.toLocaleString()} click)
                </span>
              )}
            </h3>
            <button 
              onClick={() => { setClickPage(1); loadClickHistory(); }}
              className="btn-ios-secondary text-sm"
              disabled={loadingClicks}
            >
              <RefreshCw className={`w-4 h-4 ${loadingClicks ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {loadingClicks && clickHistory.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : clickHistory.length === 0 ? (
            <p className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
              Chưa có click nào. Truy cập link tracking để tạo click.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-center py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Loại</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Thời Gian</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Quốc Gia</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Thiết Bị</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Trình Duyệt</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clickHistory.map((click, index) => {
                      const isBot = click.is_bot === 1 || click.is_bot === true;
                      return (
                        <tr key={click.click_id || index} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                          <td className="py-3 px-2 text-center">
                            <span className="text-xl" title={isBot ? (click.bot_name || 'Bot') : 'Người dùng thật'}>
                              {isBot ? '🤖' : '👤'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                            {new Date(click.timestamp).toLocaleString('vi-VN')}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">
                            {(click.country || 'XX').toUpperCase()}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                            {click.device || 'unknown'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                            {click.browser || 'unknown'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                            {click.ip?.substring(0, 15) || 'N/A'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {clickTotalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setClickPage(p => Math.max(1, p - 1))}
                    disabled={clickPage === 1 || loadingClicks}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Trước
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <span className="px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      {clickPage}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">/</span>
                    <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                      {clickTotalPages}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => setClickPage(p => Math.min(clickTotalPages, p + 1))}
                    disabled={clickPage === clickTotalPages || loadingClicks}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Sau
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
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
