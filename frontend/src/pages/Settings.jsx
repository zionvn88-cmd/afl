import { useState, useEffect } from 'react';
import { Save, Send, CheckCircle, AlertCircle, Copy, Link as LinkIcon, MessageSquare, FileText, Globe, Zap, Settings as SettingsIcon, Plus, X, Edit, Trash2 } from 'lucide-react';
import { getApiUrl } from '../config/api';
import Modal, { ModalFooter } from '../components/Modal';
import { NETWORKS } from '../config/networks';
import { useBatchAPI } from '../hooks/useAPI';

// Chuyển đổi NETWORKS từ config thành format cho Settings
const affiliateNetworks = NETWORKS.map(network => ({
  name: network.name,
  category: network.category,
  postbackUrl: network.postbackTemplate,
  instructions: network.instructions
}));

export default function Settings() {
  const baseApiUrl = getApiUrl('').replace(/\/[^/]*$/, '');
  
  const [settings, setSettings] = useState({
    apiUrl: baseApiUrl,
    trackerUrl: baseApiUrl.replace('api', 'tracker'),
    postbackUrl: baseApiUrl.replace('api', 'postback'),
  });

  const [telegramConfig, setTelegramConfig] = useState({
    botToken: '',
    chatId: ''
  });
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copied, setCopied] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [postbackDomains, setPostbackDomains] = useState([]);
  
  // Batch API call - Load tất cả data cùng lúc
  const { data: batchData, loading, refetch: reloadAll } = useBatchAPI([
    'settings',
    'custom-domains',
    'settings/custom-postbacks'
  ]);
  
  // Custom postback state
  const [customPostback, setCustomPostback] = useState({
    baseUrl: '',
    params: [
      { key: 'click_id', value: '{afl_click_id}', enabled: true },
      { key: 'payout', value: '{payout}', enabled: true }
    ]
  });
  const [savedPostbacks, setSavedPostbacks] = useState([]);
  const [editingPostback, setEditingPostback] = useState(null);
  const [postbackName, setPostbackName] = useState('');
  const [showCustomPostbackForm, setShowCustomPostbackForm] = useState(false);
  
  // Alert/Confirm modal state
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'alert' }); // 'alert' or 'confirm'
  const [confirmCallback, setConfirmCallback] = useState(null);

  // Process batch data khi load xong
  useEffect(() => {
    if (batchData['settings']?.success && batchData['settings'].data) {
      const settingsData = batchData['settings'].data;
      setSettings(prev => ({
        apiUrl: settingsData.apiUrl || prev.apiUrl,
        trackerUrl: settingsData.trackerUrl || prev.trackerUrl,
        postbackUrl: settingsData.postbackUrl || prev.postbackUrl,
      }));
      setTelegramConfig({
        botToken: settingsData.telegramBotToken || '',
        chatId: settingsData.telegramChatId || ''
      });
    }

    if (batchData['custom-domains']?.success) {
      const pbDomains = batchData['custom-domains'].domains?.filter(
        d => d.domain_type === 'postback' && d.status === 'active'
      ) || [];
      setPostbackDomains(pbDomains);
      console.log('Postback domains loaded:', pbDomains);
    }

    if (batchData['settings/custom-postbacks']?.success) {
      setSavedPostbacks(batchData['settings/custom-postbacks'].data || []);
    }
  }, [batchData]);

  // Helper functions for alert/confirm
  const showAlert = (message) => {
    setAlertModal({ isOpen: true, message, type: 'alert' });
  };

  const showConfirm = (message, callback) => {
    setAlertModal({ isOpen: true, message, type: 'confirm' });
    setConfirmCallback(() => callback);
  };

  const handleAlertClose = () => {
    setAlertModal({ isOpen: false, message: '', type: 'alert' });
  };

  const handleConfirm = () => {
    if (confirmCallback) {
      confirmCallback();
    }
    setAlertModal({ isOpen: false, message: '', type: 'alert' });
    setConfirmCallback(null);
  };

  const handleCancel = () => {
    setAlertModal({ isOpen: false, message: '', type: 'alert' });
    setConfirmCallback(null);
  };

  // Load custom postbacks - giữ lại function này cho refresh manual
  const loadCustomPostbacks = async () => {
    try {
      const res = await fetch(getApiUrl('settings/custom-postbacks'));
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setSavedPostbacks(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to load custom postbacks:', error);
    }
  };

  const saveCustomPostback = async () => {
    if (!postbackName || !customPostback.baseUrl) {
      showAlert('Vui lòng nhập tên và base URL');
      return;
    }

    try {
      const url = editingPostback 
        ? getApiUrl(`settings/custom-postbacks/${editingPostback.id}`)
        : getApiUrl('settings/custom-postbacks');
      const method = editingPostback ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: postbackName,
          baseUrl: customPostback.baseUrl,
          params: customPostback.params.filter(p => p.enabled && p.key && p.value),
          isActive: true
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          showAlert(editingPostback ? 'Đã cập nhật postback!' : 'Đã lưu postback!');
          setPostbackName('');
          setCustomPostback({
            baseUrl: '',
            params: [
              { key: 'click_id', value: '{afl_click_id}', enabled: true },
              { key: 'payout', value: '{payout}', enabled: true }
            ]
          });
          setEditingPostback(null);
          loadCustomPostbacks();
        }
      } else {
        const error = await res.json().catch(() => ({ message: 'Unknown error' }));
        showAlert('Lỗi: ' + (error.message || `HTTP ${res.status}`));
      }
    } catch (error) {
      showAlert('Lỗi: Không thể lưu postback. ' + error.message);
    }
  };

  const deleteCustomPostback = async (id) => {
    try {
      const res = await fetch(getApiUrl(`settings/custom-postbacks/${id}`), {
        method: 'DELETE'
      });

      if (res.ok) {
        showAlert('Đã xóa postback!');
        loadCustomPostbacks();
      } else {
        const data = await res.json().catch(() => ({}));
        showAlert('Lỗi: ' + (data.message || 'Không thể xóa postback'));
      }
    } catch (error) {
      showAlert('Lỗi: ' + error.message);
    }
  };

  const loadPostbackToEdit = (postback) => {
    setEditingPostback(postback);
    setPostbackName(postback.name);
    setCustomPostback({
      baseUrl: postback.baseUrl,
      params: postback.params.length > 0 ? postback.params : [
        { key: 'click_id', value: '{afl_click_id}', enabled: true },
        { key: 'payout', value: '{payout}', enabled: true }
      ]
    });
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaveSuccess(false);
    
    const settingsToSave = {
      apiUrl: settings.apiUrl,
      trackerUrl: settings.trackerUrl,
      postbackUrl: settings.postbackUrl,
      telegramBotToken: telegramConfig.botToken,
      telegramChatId: telegramConfig.chatId
    };

    try {
      // Save to API
      const res = await fetch(getApiUrl('settings'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsToSave)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        } else {
          throw new Error(data.message || 'Failed to save');
        }
      } else {
        const error = await res.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `HTTP ${res.status}`);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      showAlert('Lỗi: Không thể lưu settings. ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const selectNetwork = (network) => {
    setSelectedNetwork(network);
    // Replace placeholder với postback URL thực tế
    const postbackTemplate = network.postbackUrl.replace('https://your-postback-url', settings.postbackUrl);
    copyToClipboard(postbackTemplate, `postback-${network.name}`);
  };

  const testTelegram = async () => {
    if (!telegramConfig.botToken || !telegramConfig.chatId) {
      showAlert('Vui lòng nhập đầy đủ Bot Token và Chat ID');
      return;
    }

    setTestingTelegram(true);
    setTestResult(null);

    try {
      const res = await fetch(`https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramConfig.chatId,
          text: '✅ AFL Tracker - Test Message\n\nTelegram integration đã hoạt động!\n\nBạn sẽ nhận alerts ở đây.'
        })
      });

      if (res.ok) {
        setTestResult({ success: true, message: 'Test message đã gửi thành công!' });
      } else {
        const error = await res.json();
        setTestResult({ 
          success: false, 
          message: `Lỗi: ${error.description || 'Unknown error'}` 
        });
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Không thể kết nối Telegram API' });
    } finally {
      setTestingTelegram(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Affiliate Networks */}
      <section className="card-ios p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-ios bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Network Affiliate</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Chọn network để copy postback URL</p>
          </div>
        </div>

        <div className="flex gap-2">
          <select
            id="affiliate-network-select"
            name="affiliateNetwork"
            value={selectedNetwork?.name || ''}
            onChange={(e) => {
              const network = affiliateNetworks.find(n => n.name === e.target.value);
              if (network) selectNetwork(network);
            }}
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">-- Chọn network --</option>
            {/* Group by category */}
            {['International', 'Vietnam', 'SaaS', 'Digital Products', 'Tracking Platform'].map(category => {
              const networksInCategory = affiliateNetworks.filter(n => n.category === category);
              if (networksInCategory.length === 0) return null;
              return (
                <optgroup key={category} label={category}>
                  {networksInCategory.map((network) => (
                    <option key={network.name} value={network.name}>
                      {network.name}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
          {selectedNetwork && (
            <button
              onClick={() => {
                // Lấy postback domain thực tế từ danh sách
                let postbackDomain = 'https://YOUR_POSTBACK_DOMAIN';
                
                if (postbackDomains.length > 0) {
                  // Dùng postback domain đầu tiên
                  postbackDomain = `https://${postbackDomains[0].domain}`;
                } else if (!settings.postbackUrl.includes('workers.dev')) {
                  // Fallback nếu có custom postback URL
                  postbackDomain = settings.postbackUrl.replace('/postback', '');
                }
                
                const postbackTemplate = selectedNetwork.postbackUrl.replace(/YOUR_TRACKER_DOMAIN/g, postbackDomain);
                copyToClipboard(postbackTemplate, `postback-${selectedNetwork.name}`);
              }}
              className="btn-ios-primary flex items-center gap-2 whitespace-nowrap"
              title="Copy Postback URL"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
          )}
        </div>

        {selectedNetwork && (
          <div className="mt-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-ios p-4">
            <div className="bg-white dark:bg-gray-800 rounded-ios p-3 mb-3">
              <code className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all block">
                {(() => {
                  // Lấy postback domain thực tế từ danh sách
                  let postbackDomain = 'https://YOUR_POSTBACK_DOMAIN';
                  
                  if (postbackDomains.length > 0) {
                    postbackDomain = `https://${postbackDomains[0].domain}`;
                  } else if (!settings.postbackUrl.includes('workers.dev')) {
                    postbackDomain = settings.postbackUrl.replace('/postback', '');
                  }
                  
                  return selectedNetwork.postbackUrl.replace(/YOUR_TRACKER_DOMAIN/g, postbackDomain);
                })()}
              </code>
            </div>
            <div className="text-xs text-purple-700 dark:text-purple-300 whitespace-pre-line">
              💡 {selectedNetwork.instructions}
            </div>
            {postbackDomains.length === 0 && (
              <div className="mt-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-ios p-3 text-xs text-yellow-800 dark:text-yellow-300">
                ⚠️ <strong>Chưa có postback domain!</strong> Vào <strong>Tên Miền</strong> → Thêm domain loại <strong>Postback</strong> (ví dụ: <code>pb.yourdomain.com</code>)
              </div>
            )}
          </div>
        )}
      </section>

      {/* Custom Postback Builder */}
      <section className="card-ios p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-ios bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Postback Tùy Chỉnh</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Quản lý postback URL tùy chỉnh</p>
            </div>
          </div>
          <button
            onClick={() => setShowCustomPostbackForm(!showCustomPostbackForm)}
            className="btn-ios-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            {showCustomPostbackForm ? 'Ẩn Form' : 'Tạo Mới'}
          </button>
        </div>

        {/* Saved Postbacks List */}
        {savedPostbacks.length > 0 && (
          <div className="space-y-2 mb-4">
            {savedPostbacks.map((postback) => (
              <div
                key={postback.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-ios hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                    {postback.name}
                  </p>
                  <code className="text-xs font-mono text-gray-600 dark:text-gray-400 truncate block">
                    {postback.base_url}
                  </code>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <button
                    onClick={() => {
                      const fullUrl = `${postback.base_url}?${JSON.parse(postback.params || '[]').filter(p => p.enabled).map(p => `${p.key}=${p.value}`).join('&')}`;
                      copyToClipboard(fullUrl, `custom-${postback.id}`);
                    }}
                    className="text-blue-500 hover:text-blue-600 p-1.5"
                    title="Copy URL"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => loadPostbackToEdit(postback)}
                    className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 p-1.5"
                    title="Sửa"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      showConfirm(`Xóa postback "${postback.name}"?`, () => deleteCustomPostback(postback.id));
                    }}
                    className="text-red-500 hover:text-red-600 p-1.5"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Custom Postback Form (Collapsible) */}
        {showCustomPostbackForm && (
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div>
            <label htmlFor="custom-postback-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tên Postback {editingPostback && <span className="text-xs text-gray-500">(đang sửa)</span>}
            </label>
            <input
              id="custom-postback-name"
              name="customPostbackName"
              type="text"
              autoComplete="off"
              value={postbackName}
              onChange={(e) => setPostbackName(e.target.value)}
              placeholder="VD: MaxBounty Custom, Network A, etc."
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label htmlFor="custom-postback-base" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Base URL
            </label>
            <input
              id="custom-postback-base"
              name="customPostbackBase"
              type="text"
              autoComplete="off"
              value={customPostback.baseUrl}
              onChange={(e) => setCustomPostback({ ...customPostback, baseUrl: e.target.value })}
              placeholder={settings.postbackUrl || "https://your-postback-url.com/postback"}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              URL gốc của postback (có thể dùng URL Postback ở trên)
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tham Số
              </div>
              <button
                onClick={() => {
                  setCustomPostback({
                    ...customPostback,
                    params: [...customPostback.params, { key: '', value: '', enabled: true }]
                  });
                }}
                className="btn-ios-secondary text-xs px-3 py-1.5 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Thêm
              </button>
            </div>
            <div className="space-y-2">
              {customPostback.params.map((param, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <label className="flex-1">
                    <span className="sr-only">Tên tham số {index + 1}</span>
                    <input
                      id={`param-key-${index}`}
                      name={`param-key-${index}`}
                      type="text"
                      autoComplete="off"
                      placeholder="Tên tham số"
                      value={param.key}
                      onChange={(e) => {
                        const newParams = [...customPostback.params];
                        newParams[index].key = e.target.value;
                        setCustomPostback({ ...customPostback, params: newParams });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
                    />
                  </label>
                  <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">=</span>
                  <label className="flex-1">
                    <span className="sr-only">Giá trị tham số {index + 1}</span>
                    <input
                      id={`param-value-${index}`}
                      name={`param-value-${index}`}
                      type="text"
                      autoComplete="off"
                      placeholder="Giá trị (dùng {afl_click_id}, {payout}, etc.)"
                      value={param.value}
                      onChange={(e) => {
                        const newParams = [...customPostback.params];
                        newParams[index].value = e.target.value;
                        setCustomPostback({ ...customPostback, params: newParams });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
                    />
                  </label>
                  <label htmlFor={`param-enabled-${index}`} className="flex items-center gap-1 cursor-pointer sm:flex-shrink-0">
                    <input
                      id={`param-enabled-${index}`}
                      name={`param-enabled-${index}`}
                      type="checkbox"
                      checked={param.enabled}
                      onChange={(e) => {
                        const newParams = [...customPostback.params];
                        newParams[index].enabled = e.target.checked;
                        setCustomPostback({ ...customPostback, params: newParams });
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Bật</span>
                  </label>
                  <button
                    onClick={() => {
                      const newParams = customPostback.params.filter((_, i) => i !== index);
                      setCustomPostback({ ...customPostback, params: newParams });
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-ios-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-ios-sm p-3">
              <p className="text-xs text-blue-800 dark:text-blue-300 mb-1 font-medium">Các biến có sẵn:</p>
              <div className="flex flex-wrap gap-2 text-xs">
                {['{afl_click_id}', '{payout}', '{status}', '{txid}', '{campaign_id}', '{offer_id}'].map((varName) => (
                  <code
                    key={varName}
                    onClick={() => {
                      const newParams = [...customPostback.params];
                      const lastParam = newParams[newParams.length - 1];
                      if (lastParam) {
                        lastParam.value = varName;
                        setCustomPostback({ ...customPostback, params: newParams });
                      }
                    }}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-mono"
                  >
                    {varName}
                  </code>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          {customPostback.baseUrl && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-ios p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview URL:</p>
                <button
                  onClick={() => {
                    const enabledParams = customPostback.params.filter(p => p.enabled && p.key && p.value);
                    const queryString = enabledParams.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&');
                    const fullUrl = `${customPostback.baseUrl}${queryString ? '?' + queryString : ''}`;
                    copyToClipboard(fullUrl, 'custom-postback');
                  }}
                  className="btn-ios-primary text-xs px-3 py-1.5 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>
              <code className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all block">
                {(() => {
                  const enabledParams = customPostback.params.filter(p => p.enabled && p.key && p.value);
                  const queryString = enabledParams.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&');
                  return `${customPostback.baseUrl}${queryString ? '?' + queryString : ''}`;
                })()}
              </code>
            </div>
          )}

          {/* Save Button */}
          <div className="flex gap-2">
            <button
              onClick={saveCustomPostback}
              className="btn-ios-primary flex-1 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {editingPostback ? 'Cập Nhật' : 'Lưu Postback'}
            </button>
            {editingPostback && (
              <button
                onClick={() => {
                  setEditingPostback(null);
                  setPostbackName('');
                  setCustomPostback({
                    baseUrl: '',
                    params: [
                      { key: 'click_id', value: '{afl_click_id}', enabled: true },
                      { key: 'payout', value: '{payout}', enabled: true }
                    ]
                  });
                }}
                className="btn-ios-secondary"
              >
                Hủy
              </button>
            )}
          </div>
        </div>
        )}
      </section>

      {/* Telegram Config */}
      <section className="card-ios p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-ios bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Telegram Alerts</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Nhận cảnh báo qua Telegram</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-ios-sm p-4 mb-5">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Hướng dẫn setup</h3>
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-blue-800 dark:text-blue-300">
            <li>Mở Telegram, tìm <code className="text-xs">@BotFather</code></li>
            <li>Gửi lệnh <code className="text-xs">/newbot</code> để tạo bot mới</li>
            <li>Copy Bot Token nhận được</li>
            <li>Tìm <code className="text-xs">@userinfobot</code> để lấy Chat ID</li>
            <li>Điền thông tin bên dưới và test</li>
          </ol>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="telegram-bot-token" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bot Token
            </label>
            <input
              id="telegram-bot-token"
              name="botToken"
              type="password"
              autoComplete="off"
              value={telegramConfig.botToken}
              onChange={(e) => setTelegramConfig({ ...telegramConfig, botToken: e.target.value })}
              placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-mono"
            />
          </div>

          <div>
            <label htmlFor="telegram-chat-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chat ID
            </label>
            <input
              id="telegram-chat-id"
              name="chatId"
              type="text"
              autoComplete="off"
              value={telegramConfig.chatId}
              onChange={(e) => setTelegramConfig({ ...telegramConfig, chatId: e.target.value })}
              placeholder="987654321"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-mono"
            />
          </div>

          <button
            onClick={testTelegram}
            disabled={testingTelegram}
            className="btn-ios-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testingTelegram ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Đang test...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Kiểm Tra Telegram
              </>
            )}
          </button>

          {testResult && (
            <div className={`p-3.5 rounded-ios text-sm ${
              testResult.success 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            </div>
          )}

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-ios-sm p-3.5 text-sm text-yellow-800 dark:text-yellow-300">
            <p className="mb-2 font-medium">⚠️ Sau khi test OK, set secrets vào Worker:</p>
            <code className="block bg-yellow-100 dark:bg-yellow-900/30 px-3 py-2 rounded text-xs font-mono">
              cd workers/monitor<br/>
              wrangler secret put TELEGRAM_BOT_TOKEN<br/>
              wrangler secret put TELEGRAM_CHAT_ID
            </code>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="btn-ios-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Lưu Cài Đặt
            </>
          )}
        </button>
        {saveSuccess && (
          <div className="ml-3 flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            Đã lưu thành công!
          </div>
        )}
      </div>

      {/* Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tracking Link Template */}
        <section className="card-ios p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-ios bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Link Theo Dõi</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Mẫu link cho quảng cáo</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-ios-sm p-3 font-mono text-xs break-all text-gray-700 dark:text-gray-300">
              {settings.trackerUrl}/click?cid=<span className="font-semibold text-purple-600 dark:text-purple-400">CAMPAIGN_ID</span>&external_id=<span className="font-semibold text-purple-600 dark:text-purple-400">{'{{clickid}}'}</span>
            </div>

            <div className="space-y-2">
              {[
                { platform: 'Facebook', param: '{{clickid}}' },
                { platform: 'Google', param: '{{gclid}}' },
                { platform: 'TikTok', param: '__CLICK_ID__' },
              ].map((item) => (
                <div key={item.platform} className="bg-gray-50 dark:bg-gray-700 rounded-ios-sm p-3">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{item.platform} Ads</div>
                  <code className="text-xs text-gray-700 dark:text-gray-300 break-all">
                    ?external_id={item.param}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Postback Template */}
        <section className="card-ios p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-ios bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Send className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Postback URL</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Setup trong network</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-ios-sm p-3 font-mono text-xs break-all text-gray-700 dark:text-gray-300">
              {settings.postbackUrl}/postback?click_id=<span className="font-semibold text-green-600 dark:text-green-400">{'{{afl_click_id}}'}</span>&payout=<span className="font-semibold text-green-600 dark:text-green-400">{'{{payout}}'}</span>
            </div>

            <div className="space-y-1.5 text-xs">
              {[
                { key: 'click_id', desc: 'AFL Click ID (bắt buộc)' },
                { key: 'payout', desc: 'Số tiền được trả (bắt buộc)' },
                { key: 'status', desc: 'approved/success (tùy chọn)' },
                { key: 'txid', desc: 'Transaction ID (tùy chọn)' },
              ].map((item) => (
                <div key={item.key} className="flex items-baseline gap-2 text-gray-600 dark:text-gray-400">
                  <code className="font-semibold text-gray-900 dark:text-white">{item.key}:</code>
                  <span>{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Platform Credentials */}
      <section className="card-ios p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-ios bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Tích Hợp Nền Tảng Quảng Cáo</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Kết nối để lấy chi tiêu thực tế</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Facebook Ads */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-ios p-4">
            <div className="flex items-center gap-3 mb-3">
              <img src="/logos/facebook.png" alt="Facebook" className="w-8 h-8 rounded" onError={(e) => { e.target.src = '/logos/facebook.svg' }} />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Facebook Ads</h3>
                <span className="text-xs text-gray-500">Chưa kết nối</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Kết nối để lấy chi tiêu, clicks, impressions từ Facebook Ads.
            </p>
            <button 
              onClick={() => showAlert('Tính năng Facebook Ads sẽ sớm ra mắt! Vui lòng liên hệ để được hỗ trợ tích hợp.')}
              className="btn-ios-secondary w-full text-sm"
            >
              Kết nối Facebook
            </button>
          </div>

          {/* Google Ads */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-ios p-4">
            <div className="flex items-center gap-3 mb-3">
              <img src="/logos/google.png" alt="Google" className="w-8 h-8 rounded" onError={(e) => { e.target.src = '/logos/google.svg' }} />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Google Ads</h3>
                <span className="text-xs text-gray-500">Chưa kết nối</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Kết nối để lấy chi tiêu, clicks, impressions từ Google Ads.
            </p>
            <button 
              onClick={() => showAlert('Tính năng Google Ads sẽ sớm ra mắt! Vui lòng liên hệ để được hỗ trợ tích hợp.')}
              className="btn-ios-secondary w-full text-sm"
            >
              Kết nối Google
            </button>
          </div>

          {/* TikTok Ads */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-ios p-4">
            <div className="flex items-center gap-3 mb-3">
              <img src="/logos/tiktok.png" alt="TikTok" className="w-8 h-8 rounded" onError={(e) => { e.target.src = '/logos/tiktok.svg' }} />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">TikTok Ads</h3>
                <span className="text-xs text-gray-500">Chưa kết nối</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Kết nối để lấy chi tiêu, clicks, impressions từ TikTok Ads.
            </p>
            <button 
              onClick={() => showAlert('Tính năng TikTok Ads sẽ sớm ra mắt! Vui lòng liên hệ để được hỗ trợ tích hợp.')}
              className="btn-ios-secondary w-full text-sm"
            >
              Kết nối TikTok
            </button>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-ios">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>Hướng dẫn:</strong> Để kết nối, bạn cần tạo App/Project trên nền tảng quảng cáo và lấy Access Token. 
            Liên hệ để được hỗ trợ cấu hình chi tiết.
          </p>
        </div>
      </section>

      {/* System Info */}
      <section className="card-ios p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Thông Tin Hệ Thống</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Phiên Bản', value: '3.0.0' },
            { label: 'Nền Tảng', value: 'Cloudflare' },
            { label: 'Cơ Sở Dữ Liệu', value: 'D1 (SQLite)' },
            { label: 'Bộ Nhớ Đệm', value: 'KV Storage' },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 dark:bg-gray-700 rounded-ios p-4 text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.label}</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Alert/Confirm Modal */}
      <Modal
        isOpen={alertModal.isOpen}
        onClose={alertModal.type === 'alert' ? handleAlertClose : handleCancel}
        title={alertModal.type === 'alert' ? 'Thông báo' : 'Xác nhận'}
        size="sm"
        showCloseButton={alertModal.type === 'alert'}
      >
        <div className="py-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {alertModal.message}
          </p>
        </div>
        {alertModal.type === 'confirm' && (
          <ModalFooter>
            <button
              onClick={handleCancel}
              className="btn-ios-secondary flex-1 sm:flex-initial px-4 py-2"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              className="btn-ios-primary flex-1 sm:flex-initial px-4 py-2"
            >
              Xác nhận
            </button>
          </ModalFooter>
        )}
        {alertModal.type === 'alert' && (
          <ModalFooter>
            <button
              onClick={handleAlertClose}
              className="btn-ios-primary w-full sm:w-auto px-6 py-2"
            >
              OK
            </button>
          </ModalFooter>
        )}
      </Modal>
    </div>
  )
}
