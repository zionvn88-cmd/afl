import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, RefreshCw, Target, Info, Search } from 'lucide-react';
import { getApiUrl } from '../config/api';
import { NETWORKS, generateOfferUrlTemplate, generatePostbackUrl } from '../config/networks';
import Modal, { ModalBody, ModalFooter } from '../components/Modal';
import TrafficSourceIcon from '../components/TrafficSourceIcon';
import { useBatchAPI, clearCacheFor } from '../hooks/useAPI';

export default function CampaignEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [networkSearch, setNetworkSearch] = useState('');
  const [showNetworkInfo, setShowNetworkInfo] = useState(false);
  const [currentNetworkInfo, setCurrentNetworkInfo] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    traffic_source: '',
    flow_type: 'direct',
    landing_page_id: '',
    offer_url: '',
    custom_click_param: 'click_id', // For custom network only
    cost_model: 'cpc',
    cost_value: 0,
    custom_domain_id: '',
    status: 'active'
  });

  // Load dropdown data với batching
  const { data: dropdownData } = useBatchAPI([
    'custom-domains/active',
    'landing-pages',
    'traffic-sources'
  ]);

  const customDomains = useMemo(() => 
    dropdownData['custom-domains/active']?.success ? (dropdownData['custom-domains/active'].domains || []) : []
  , [dropdownData]);

  const landingPages = useMemo(() => {
    const apiData = dropdownData['landing-pages'];
    const landers = apiData ? (apiData.landers || apiData.Landers || apiData.data || []) : [];
    return landers.filter(l => l.status === 'active');
  }, [dropdownData]);

  const trafficSources = useMemo(() => 
    dropdownData['traffic-sources']?.success ? (dropdownData['traffic-sources'].data || []) : []
  , [dropdownData]);

  useEffect(() => {
    loadCampaign();
  }, [id]);
  const handleNetworkSelect = (e) => {
    const networkId = e.target.value;
    setSelectedNetwork(networkId);
    setNetworkSearch(''); // Clear search after selection
    
    // Don't auto-fill offer URL anymore, just store the network
    // The click_id param will be added automatically by the backend based on network
  };

  // Filter networks based on search
  const filteredNetworks = useMemo(() => {
    if (!networkSearch.trim()) return NETWORKS;
    
    const searchLower = networkSearch.toLowerCase();
    return NETWORKS.filter(network => 
      network.name.toLowerCase().includes(searchLower) ||
      network.clickParam.toLowerCase().includes(searchLower) ||
      (network.category && network.category.toLowerCase().includes(searchLower))
    );
  }, [networkSearch]);

  const showNetworkInstructions = (networkId) => {
    const network = NETWORKS.find(n => n.id === networkId);
    if (network) {
      setCurrentNetworkInfo({
        ...network,
        postbackUrl: generatePostbackUrl(networkId)
      });
      setShowNetworkInfo(true);
    }
  };

  const loadCampaign = async () => {
    try {
      const res = await fetch(getApiUrl(`campaigns/${id}`));
      const data = await res.json();
      if (data.success) {
        // Map API field names to form field names
        // Remove traffic_source_id to avoid conflict with traffic_source
        const { traffic_source_id, ...campaignData } = data.campaign;
        setFormData({
          ...campaignData,
          traffic_source: traffic_source_id || '',
          landing_page_id: data.campaign.landing_page_id || '',
          custom_domain_id: data.campaign.custom_domain_id || '',
        });
        // Set selectedNetwork from saved affiliate_network
        if (data.campaign.affiliate_network) {
          setSelectedNetwork(data.campaign.affiliate_network);
        }
      }
    } catch (error) {
      console.error('Error loading campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Include affiliate_network from selectedNetwork
    const submitData = {
      ...formData,
      affiliate_network: selectedNetwork || null
    };
    
    console.log('Submitting update:', submitData);
    console.log('Selected Network:', selectedNetwork);
    
    try {
      const res = await fetch(getApiUrl(`campaigns/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      const data = await res.json();
      console.log('Update response:', data);
      if (data.success) {
        // Clear campaign detail cache and campaigns list cache
        clearCacheFor(`campaigns/${id}?preset=today`);
        clearCacheFor(`campaigns/${id}?preset=yesterday`);
        clearCacheFor(`campaigns/${id}?preset=last7days`);
        clearCacheFor(`campaigns/${id}?preset=last30days`);
        clearCacheFor('campaigns');
        navigate(`/campaigns/${id}`);
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-ios bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Chỉnh Sửa Chiến Dịch
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cập nhật thông tin chiến dịch
          </p>
        </div>
        <button 
          onClick={() => navigate(`/campaigns/${id}`)} 
          className="btn-ios-secondary inline-flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Huỷ
        </button>
      </div>

      {/* Form Card */}
      <div className="card-ios p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label htmlFor="edit-campaign-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tên Chiến Dịch *
              </label>
              <input
                id="edit-campaign-name"
                name="name"
                type="text"
                autoComplete="organization"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="edit-campaign-traffic-source" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nguồn Lưu Lượng
              </label>
              <select
                id="edit-campaign-traffic-source"
                name="traffic_source"
                value={formData.traffic_source}
                onChange={(e) => {
                  console.log('Traffic source changed to:', e.target.value);
                  setFormData({ ...formData, traffic_source: e.target.value });
                }}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Chọn nguồn</option>
                {trafficSources.map(source => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </select>
              {trafficSources.length === 0 && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  ⚠️ Chưa có nguồn traffic nào. <a href="/traffic-sources" className="underline">Tạo mới tại đây</a>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="edit-campaign-custom-domain" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tên Miền *
              </label>
              <select
                id="edit-campaign-custom-domain"
                name="custom_domain_id"
                value={formData.custom_domain_id || ''}
                onChange={(e) => setFormData({ ...formData, custom_domain_id: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">-- Chọn domain --</option>
                {customDomains.map(domain => (
                  <option key={domain.id} value={domain.id}>
                    {domain.domain}
                  </option>
                ))}
              </select>
              {customDomains.length === 0 && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  ⚠️ Chưa có domain nào. <a href="/custom-domains" className="underline">Thêm domain tại đây</a>
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                🌐 Sử dụng domain riêng để tránh bị Facebook/Google chặn
              </p>
            </div>

            <div>
              <label htmlFor="edit-campaign-flow-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Loại Flow Campaign *
              </label>
              <select
                id="edit-campaign-flow-type"
                name="flow_type"
                value={formData.flow_type || 'direct'}
                onChange={(e) => setFormData({ ...formData, flow_type: e.target.value, landing_page_id: '' })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="direct">Direct Linking (Traffic → Offer)</option>
                <option value="lander">Landing Page (Traffic → Lander → Offer)</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {(formData.flow_type || 'direct') === 'direct' 
                  ? '🚀 Redirect trực tiếp từ traffic source đến offer'
                  : '📄 Dùng landing page làm trang đệm để pre-sell'}
              </p>
            </div>

            {formData.flow_type === 'lander' && (
              <div>
                <label htmlFor="edit-campaign-landing-page" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chọn Landing Page *
                </label>
                <select
                  id="edit-campaign-landing-page"
                  name="landing_page_id"
                  value={formData.landing_page_id || ''}
                  onChange={(e) => setFormData({ ...formData, landing_page_id: e.target.value })}
                  required={formData.flow_type === 'lander'}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">-- Chọn landing page --</option>
                  {landingPages.map(lander => (
                    <option key={lander.id} value={lander.id}>
                      {lander.name} {lander.category ? `(${lander.category})` : ''}
                    </option>
                  ))}
                </select>
                {landingPages.length === 0 && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    ⚠️ Chưa có landing page nào. <a href="/landing-pages" className="underline">Tạo mới tại đây</a>
                  </p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="edit-campaign-network" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Affiliate Network
              </label>
              
              {/* Search Input */}
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm network..."
                  value={networkSearch}
                  onChange={(e) => setNetworkSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {networkSearch && (
                  <button
                    type="button"
                    onClick={() => setNetworkSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <select
                  id="edit-campaign-network"
                  name="network"
                  value={selectedNetwork}
                  onChange={handleNetworkSelect}
                  size={filteredNetworks.length > 0 && networkSearch ? Math.min(filteredNetworks.length + 1, 10) : 1}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Chọn network ({filteredNetworks.length} kết quả) --</option>
                  
                  {filteredNetworks.map(network => (
                    <option key={network.id} value={network.id}>
                      [{network.category}] {network.name} (Param: {network.clickParam})
                    </option>
                  ))}
                </select>
                {selectedNetwork && selectedNetwork !== 'custom' && (
                  <button
                    type="button"
                    onClick={() => showNetworkInstructions(selectedNetwork)}
                    className="btn-ios-secondary flex items-center gap-2 whitespace-nowrap"
                    title="Xem hướng dẫn postback"
                  >
                    <Info className="w-4 h-4" />
                    Hướng Dẫn
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                🔍 Tìm kiếm và chọn network để tự động điền định dạng Offer URL
              </p>
            </div>

            <div>
              <label htmlFor="edit-campaign-offer-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Offer URL *
              </label>
              <input
                id="edit-campaign-offer-url"
                name="offer_url"
                type="url"
                autoComplete="url"
                required
                value={formData.offer_url || ''}
                onChange={(e) => setFormData({ ...formData, offer_url: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://maxbounty.com/track.php?aff_id=123&camp_id=456"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                💡 Chỉ cần dán link offer gốc, hệ thống sẽ tự động thêm tham số tracking
              </p>
            </div>

            {/* Custom Click Param - Only show for Custom Network */}
            {selectedNetwork === 'custom' && (
              <div>
                <label htmlFor="edit-campaign-click-param" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên Tham Số Click ID
                </label>
                <input
                  id="edit-campaign-click-param"
                  name="custom_click_param"
                  type="text"
                  value={formData.custom_click_param || 'click_id'}
                  onChange={(e) => setFormData({ ...formData, custom_click_param: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="click_id, sub_id, aff_sub, etc."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  📝 Tên tham số sẽ được thêm vào URL (VD: ?click_id={'{click_id}'} hoặc &sub_id={'{click_id}'})
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-campaign-cost-model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mô Hình Chi Phí
                </label>
                <select
                  id="edit-campaign-cost-model"
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
                <label htmlFor="edit-campaign-cost-value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Giá Trị ($)
                </label>
                <input
                  id="edit-campaign-cost-value"
                  name="cost_value"
                  type="number"
                  step="0.01"
                  autoComplete="off"
                  value={formData.cost_value}
                  onChange={(e) => setFormData({ ...formData, cost_value: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit-campaign-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trạng Thái
              </label>
              <select
                id="edit-campaign-status"
                name="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="active">Hoạt Động</option>
                <option value="paused">Tạm Dừng</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-gray-200 dark:border-gray-700">
            <button 
              type="button" 
              onClick={() => navigate(`/campaigns/${id}`)} 
              className="btn-ios-secondary"
            >
              Huỷ
            </button>
            <button type="submit" className="btn-ios-primary inline-flex items-center gap-2">
              <Save className="w-4 h-4" />
              Lưu Thay Đổi
            </button>
          </div>
        </form>
      </div>

      {/* Network Instructions Modal */}
      <Modal
        isOpen={showNetworkInfo}
        onClose={() => setShowNetworkInfo(false)}
        title={`Setup ${currentNetworkInfo?.name || 'Network'}`}
      >
        <ModalBody>
          {currentNetworkInfo && (
            <div className="space-y-4">
              {/* Postback URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📡 Postback URL (copy vào {currentNetworkInfo.name})
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={currentNetworkInfo.postbackUrl}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-ios text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(currentNetworkInfo.postbackUrl);
                      alert('Đã copy Postback URL!');
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-500 hover:text-blue-600 font-semibold"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Offer URL Template */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🔗 Offer URL Template
                </label>
                <input
                  type="text"
                  readOnly
                  value={currentNetworkInfo.offerUrlTemplate}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-ios text-sm font-mono"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Thay YOUR_* bằng thông tin thực của bạn
                </p>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📋 Hướng Dẫn Setup
                </label>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-ios p-3">
                  <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-sans">
                    {currentNetworkInfo.instructions}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <button type="button" onClick={() => setShowNetworkInfo(false)} className="btn-ios-primary">
            Đóng
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
