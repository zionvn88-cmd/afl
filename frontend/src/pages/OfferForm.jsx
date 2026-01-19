import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Save, X, ArrowLeft } from 'lucide-react';
import { offersAPI, campaignsAPI } from '../services/api';

export default function OfferForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const campaignIdFromQuery = searchParams.get('campaign_id');
  
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [formData, setFormData] = useState({
    campaign_id: campaignIdFromQuery || '',
    name: '',
    url: '',
    payout: 0,
    weight: 100,
    status: 'active'
  });
  
  useEffect(() => {
    loadCampaigns();
    if (isEdit) {
      loadOffer();
    }
  }, [id, isEdit]);
  
  const loadCampaigns = async () => {
    try {
      const result = await campaignsAPI.getAll();
      setCampaigns(result.campaigns || []);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    }
  };
  
  const loadOffer = async () => {
    setLoading(true);
    try {
      // Note: We need to get offer from campaign's offers list
      // For now, we'll use a workaround
      const result = await offersAPI.getAll();
      const offer = result.offers?.find(o => o.id === id);
      if (offer) {
        setFormData({
          campaign_id: offer.campaign_id,
          name: offer.name || '',
          url: offer.url || '',
          payout: offer.payout || 0,
          weight: offer.weight || 100,
          status: offer.status || 'active'
        });
      }
    } catch (error) {
      console.error('Failed to load offer:', error);
      alert('Không thể tải thông tin offer');
      navigate('/offers');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.campaign_id) {
      alert('Vui lòng chọn campaign');
      return;
    }
    
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên offer');
      return;
    }
    
    if (!formData.url.trim()) {
      alert('Vui lòng nhập URL');
      return;
    }
    
    setLoading(true);
    try {
      if (isEdit) {
        await offersAPI.update(id, formData);
        alert('Cập nhật offer thành công!');
      } else {
        await offersAPI.create(formData);
        alert('Tạo offer thành công!');
      }
      navigate(`/offers?campaign_id=${formData.campaign_id}`);
    } catch (error) {
      console.error('Failed to save offer:', error);
      alert('Lỗi: ' + (error.response?.data?.error || error.message || 'Không thể lưu offer'));
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/offers${campaignIdFromQuery ? `?campaign_id=${campaignIdFromQuery}` : ''}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Chỉnh Sửa Offer' : 'Tạo Offer Mới'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isEdit ? 'Cập nhật thông tin offer' : 'Thiết lập offer mới'}
            </p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="campaign_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Campaign <span className="text-red-500">*</span>
            </label>
            <select
              id="campaign_id"
              value={formData.campaign_id}
              onChange={(e) => setFormData({ ...formData, campaign_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
              disabled={!!campaignIdFromQuery}
            >
              <option value="">Chọn campaign</option>
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tên Offer <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Nhập tên offer"
              required
            />
          </div>
          
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              id="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="https://example.com/offer"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="payout" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payout ($)
              </label>
              <input
                type="number"
                id="payout"
                value={formData.payout}
                onChange={(e) => setFormData({ ...formData, payout: parseFloat(e.target.value) || 0 })}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weight (Rotation)
              </label>
              <input
                type="number"
                id="weight"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 100 })}
                min="1"
                max="1000"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Weight cao hơn = hiển thị nhiều hơn</p>
            </div>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trạng Thái
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="active">Hoạt Động</option>
              <option value="paused">Tạm Dừng</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => navigate(`/offers${campaignIdFromQuery ? `?campaign_id=${campaignIdFromQuery}` : ''}`)}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Đang lưu...' : isEdit ? 'Cập Nhật' : 'Tạo Mới'}
          </button>
        </div>
      </form>
    </div>
  );
}
