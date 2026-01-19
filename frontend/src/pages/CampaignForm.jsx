import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, ArrowLeft } from 'lucide-react';
import { campaignsAPI, trafficSourcesAPI } from '../services/api';

export default function CampaignForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [trafficSources, setTrafficSources] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    traffic_source: '',
    cost_model: 'cpc',
    cost_value: 0,
    status: 'active'
  });
  
  // Load traffic sources
  useEffect(() => {
    const loadTrafficSources = async () => {
      try {
        const result = await trafficSourcesAPI.getAll();
        setTrafficSources(result.traffic_sources || []);
      } catch (error) {
        console.error('Failed to load traffic sources:', error);
      }
    };
    loadTrafficSources();
  }, []);
  
  // Load campaign data if editing
  useEffect(() => {
    if (isEdit) {
      const loadCampaign = async () => {
        setLoading(true);
        try {
          const result = await campaignsAPI.getOne(id);
          if (result.campaign) {
            setFormData({
              name: result.campaign.name || '',
              traffic_source: result.campaign.traffic_source || '',
              cost_model: result.campaign.cost_model || 'cpc',
              cost_value: result.campaign.cost_value || 0,
              status: result.campaign.status || 'active'
            });
          }
        } catch (error) {
          console.error('Failed to load campaign:', error);
          alert('Không thể tải thông tin chiến dịch');
          navigate('/campaigns');
        } finally {
          setLoading(false);
        }
      };
      loadCampaign();
    }
  }, [id, isEdit, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên chiến dịch');
      return;
    }
    
    if (!formData.traffic_source) {
      alert('Vui lòng chọn nguồn traffic');
      return;
    }
    
    setLoading(true);
    try {
      if (isEdit) {
        await campaignsAPI.update(id, formData);
        alert('Cập nhật chiến dịch thành công!');
      } else {
        await campaignsAPI.create(formData);
        alert('Tạo chiến dịch thành công!');
      }
      navigate('/campaigns');
    } catch (error) {
      console.error('Failed to save campaign:', error);
      alert('Lỗi: ' + (error.response?.data?.error || error.message || 'Không thể lưu chiến dịch'));
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/campaigns')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Chỉnh Sửa Chiến Dịch' : 'Tạo Chiến Dịch Mới'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isEdit ? 'Cập nhật thông tin chiến dịch' : 'Thiết lập chiến dịch tracking mới'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="card-ios p-6">
        <div className="space-y-6">
          {/* Campaign Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tên Chiến Dịch <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập tên chiến dịch"
              required
            />
          </div>
          
          {/* Traffic Source */}
          <div>
            <label htmlFor="traffic_source" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nguồn Traffic <span className="text-red-500">*</span>
            </label>
            <select
              id="traffic_source"
              value={formData.traffic_source}
              onChange={(e) => setFormData({ ...formData, traffic_source: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Chọn nguồn traffic</option>
              {trafficSources.map(source => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
            {trafficSources.length === 0 && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                ⚠️ Chưa có nguồn traffic nào. Vui lòng tạo nguồn traffic trước.
              </p>
            )}
          </div>
          
          {/* Cost Model & Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cost_model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mô Hình Chi Phí
              </label>
              <select
                id="cost_model"
                value={formData.cost_model}
                onChange={(e) => setFormData({ ...formData, cost_model: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="cpc">CPC (Giá Mỗi Click)</option>
                <option value="cpm">CPM (Giá Mỗi 1000 Lượt Xem)</option>
                <option value="cpa">CPA (Giá Mỗi Hành Động)</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="cost_value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Giá Trị Chi Phí
              </label>
              <input
                type="number"
                id="cost_value"
                value={formData.cost_value}
                onChange={(e) => setFormData({ ...formData, cost_value: parseFloat(e.target.value) || 0 })}
                step="0.01"
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>
          
          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trạng Thái
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">Hoạt Động</option>
              <option value="paused">Tạm Dừng</option>
            </select>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => navigate('/campaigns')}
            className="btn-ios-secondary flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-ios-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Đang lưu...' : isEdit ? 'Cập Nhật' : 'Tạo Mới'}
          </button>
        </div>
      </form>
    </div>
  );
}
