import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, Target, Activity, TrendingUp, DollarSign } from 'lucide-react';
import { campaignsAPI } from '../services/api';

export default function Campaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadCampaigns();
  }, []);
  
  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const result = await campaignsAPI.getAll();
      setCampaigns(result.campaigns || []);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === 'active').length,
    totalClicks: campaigns.reduce((sum, c) => sum + (c.clicks || c.total_clicks || 0), 0),
    totalProfit: campaigns.reduce((sum, c) => sum + (c.profit || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-ios bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {campaigns.length} chiến dịch
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadCampaigns} className="btn-ios-secondary">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => navigate('/campaigns/new')} className="btn-ios-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tạo Chiến Dịch
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-ios p-4">
          <Target className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-2" />
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Tổng Số</p>
        </div>
        <div className="card-ios p-4">
          <Activity className="w-5 h-5 text-green-600 dark:text-green-400 mb-2" />
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.active}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Đang Chạy</p>
        </div>
        <div className="card-ios p-4">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalClicks.toLocaleString()}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Lượt Click</p>
        </div>
        <div className="card-ios p-4">
          <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400 mb-2" />
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">${stats.totalProfit.toFixed(0)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Lợi Nhuận</p>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="card-ios p-5">
        {campaigns.length === 0 ? (
          <div className="text-center py-20">
            <Target className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Chưa có chiến dịch
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Tạo chiến dịch đầu tiên để bắt đầu tracking
            </p>
            <button onClick={() => navigate('/campaigns/new')} className="btn-ios-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Tạo Chiến Dịch
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-5 text-sm font-medium text-gray-600 dark:text-gray-400">Chiến Dịch</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Nguồn</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Click</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">CV</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Lợi Nhuận</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr
                    key={campaign.id}
                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                    className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-ios bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                          <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900 dark:text-white">{campaign.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {campaign.id?.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                        {campaign.traffic_source_name || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                      {(campaign.clicks || campaign.total_clicks || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        {campaign.conversions || 0}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right text-sm font-semibold ${
                      (campaign.profit || 0) >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      ${(campaign.profit || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                      }`}>
                        {campaign.status === 'active' ? 'Đang Chạy' : 'Tạm Dừng'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
