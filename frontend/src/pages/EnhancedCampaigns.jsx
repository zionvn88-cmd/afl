import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, Target, Activity, TrendingUp, DollarSign, Save } from 'lucide-react';
import { getApiUrl } from '../config/api';
import Modal, { ModalBody, ModalFooter } from '../components/Modal';
import { useAPI } from '../hooks/useAPI';

export default function EnhancedCampaigns() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    traffic_source: '',
    cost_model: 'cpc',
    cost_value: 0,
    status: 'active'
  });

  // Load campaigns với caching
  const { data: campaignsData, loading: isLoading, refetch } = useAPI('campaigns');
  const campaigns = campaignsData?.campaigns || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const openCreateModal = () => {
    setEditingCampaign(null);
    setFormData({
      name: '',
      traffic_source: '',
      cost_model: 'cpc',
      cost_value: 0,
      status: 'active'
    });
    setShowModal(true);
  };

  const openEditModal = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      traffic_source: campaign.traffic_source || '',
      cost_model: campaign.cost_model || 'cpc',
      cost_value: campaign.cost_value || 0,
      status: campaign.status
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingCampaign 
        ? getApiUrl(`campaigns/${editingCampaign.id}`)
        : getApiUrl('campaigns');
      const method = editingCampaign ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        refetch(true); // Force refresh to bypass cache
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
    }
  };

  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === 'active').length,
    totalClicks: campaigns.reduce((sum, c) => sum + (c.total_clicks || 0), 0),
    totalProfit: campaigns.reduce((sum, c) => sum + (c.profit || 0), 0),
  };

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
          <button onClick={() => refetch(true)} className="btn-ios-secondary">
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
                      {campaign.total_clicks?.toLocaleString() || 0}
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

      {/* Modal Form */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCampaign ? 'Sửa Chiến Dịch' : 'Tạo Chiến Dịch Mới'}
      >
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div>
              <label htmlFor="campaign-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tên Chiến Dịch *
              </label>
              <input
                id="campaign-name"
                name="name"
                type="text"
                autoComplete="organization"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Chiến dịch của tôi"
              />
            </div>

            <div>
              <label htmlFor="campaign-traffic-source" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nguồn Lưu Lượng
              </label>
              <select
                id="campaign-traffic-source"
                name="traffic_source"
                value={formData.traffic_source}
                onChange={(e) => setFormData({ ...formData, traffic_source: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Chọn nguồn</option>
                <option value="facebook">Facebook Ads</option>
                <option value="google">Google Ads</option>
                <option value="tiktok">TikTok Ads</option>
                <option value="native">Native Ads</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="campaign-cost-model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mô Hình Chi Phí
                </label>
                <select
                  id="campaign-cost-model"
                  name="cost_model"
                  value={formData.cost_model}
                  onChange={(e) => setFormData({ ...formData, cost_model: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="cpc">CPC (Giá Mỗi Click)</option>
                  <option value="cpm">CPM (Giá Mỗi 1000)</option>
                  <option value="cpa">CPA (Giá Mỗi Hành Động)</option>
                </select>
              </div>

              <div>
                <label htmlFor="campaign-cost-value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Giá Trị ($)
                </label>
                <input
                  id="campaign-cost-value"
                  name="cost_value"
                  type="number"
                  step="0.01"
                  autoComplete="off"
                  value={formData.cost_value}
                  onChange={(e) => setFormData({ ...formData, cost_value: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="campaign-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trạng Thái
              </label>
              <select
                id="campaign-status"
                name="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="active">Hoạt Động</option>
                <option value="paused">Tạm Dừng</option>
              </select>
            </div>
          </ModalBody>

          <ModalFooter>
            <button type="button" onClick={() => setShowModal(false)} className="btn-ios-secondary">
              Hủy
            </button>
            <button type="submit" className="btn-ios-primary inline-flex items-center gap-2">
              <Save className="w-4 h-4" />
              {editingCampaign ? 'Cập Nhật' : 'Tạo Mới'}
            </button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
