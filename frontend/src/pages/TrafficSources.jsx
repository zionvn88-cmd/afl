import { useState } from 'react';
import { Plus, Edit2, Trash2, Globe, RefreshCw } from 'lucide-react';
import { getApiUrl } from '../config/api';
import Modal, { ModalBody, ModalFooter } from '../components/Modal';
import TrafficSourceIcon from '../components/TrafficSourceIcon';
import { useAPI } from '../hooks/useAPI';

export default function TrafficSources() {
  const [showModal, setShowModal] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '🌐',
    click_id_param: 'click_id',
    is_active: true
  });

  // Load traffic sources với caching
  const { data, loading, refetch } = useAPI('traffic-sources', {
    transform: (data) => data.success ? (data.data || []) : []
  });
  const sources = data || [];

  // Logo suggestions cho các nguồn phổ biến
  const logoSuggestions = [
    { name: 'Google Ads', icon: '/logos/google.png', slug: 'google-ads', param: 'gclid' },
    { name: 'Facebook Ads', icon: '/logos/facebook.png', slug: 'facebook-ads', param: 'fbclid' },
    { name: 'TikTok Ads', icon: '/logos/tiktok.png', slug: 'tiktok-ads', param: 'ttclid' },
    { name: 'Tùy Chỉnh', icon: '🌐', slug: 'custom', param: 'click_id' },
  ];

  const openCreateModal = () => {
    setEditingSource(null);
    setFormData({
      name: '',
      slug: '',
      icon: '🌐',
      click_id_param: 'click_id',
      is_active: true
    });
    setShowModal(true);
  };

  const openEditModal = (source) => {
    setEditingSource(source);
    setFormData({
      name: source.name,
      slug: source.slug,
      icon: source.icon || '🌐',
      click_id_param: source.click_id_param || 'click_id',
      is_active: Boolean(source.is_active) // Convert 0/1 to boolean
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingSource 
        ? getApiUrl(`traffic-sources/${editingSource.id}`)
        : getApiUrl('traffic-sources');
      const method = editingSource ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        alert(`Lỗi: ${errorData.message || `HTTP ${response.status}`}`);
        return;
      }
      
      setShowModal(false);
      refetch(true); // Force refresh to bypass cache
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Lỗi: Không thể lưu nguồn lưu lượng. Vui lòng thử lại.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa nguồn lưu lượng này?')) return;
    try {
      await fetch(getApiUrl(`traffic-sources/${id}`), { method: 'DELETE' });
      refetch(true); // Force refresh to bypass cache
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-ios bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {sources.length} nguồn lưu lượng
            </p>
          </div>
        </div>
        <button onClick={openCreateModal} className="btn-ios-primary flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          <span className="text-sm sm:text-base">Thêm Nguồn</span>
        </button>
      </div>

      {/* Sources - Card View on Mobile, Table on Desktop */}
      <div className="card-ios p-3 lg:p-5">
        {sources.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-500 dark:text-gray-400">
            Chưa có nguồn lưu lượng nào
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
              {sources.map((source) => (
                <div key={source.id} className="p-3 rounded-ios bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <TrafficSourceIcon 
                        slug={source.slug} 
                        icon={source.icon} 
                        className="w-8 h-8 flex-shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{source.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          <code className="text-xs font-mono">{source.slug}</code>
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${
                      source.is_active 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                    }`}>
                      {source.is_active ? 'Hoạt Động' : 'Tắt'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Tham Số Click</p>
                      <code className="text-xs font-mono text-gray-700 dark:text-gray-300">
                        {source.click_id_param || 'click_id'}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openEditModal(source)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-ios-sm"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button 
                        onClick={() => handleDelete(source.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-ios-sm"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto -mx-5">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-5 text-sm font-medium text-gray-600 dark:text-gray-400">Nguồn</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Slug</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Tham Số Click</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Trạng Thái</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((source) => (
                    <tr key={source.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <TrafficSourceIcon 
                            slug={source.slug} 
                            icon={source.icon} 
                            className="w-6 h-6" 
                          />
                          <span className="font-medium text-sm text-gray-900 dark:text-white">
                            {source.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-xs font-mono text-gray-700 dark:text-gray-300">
                          {source.slug}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-xs font-mono text-gray-700 dark:text-gray-300">
                          {source.click_id_param || 'click_id'}
                        </code>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          source.is_active 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                        }`}>
                          {source.is_active ? 'Hoạt Động' : 'Tắt'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(source)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-ios-sm"
                          >
                            <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button 
                            onClick={() => handleDelete(source.id)}
                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-ios-sm"
                          >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSource ? 'Sửa Nguồn Lưu Lượng' : 'Tạo Nguồn Lưu Lượng Mới'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <ModalBody>
              {/* Quick Select - Nguồn phổ biến */}
              {!editingSource && (
                <div className="mb-4">
                  <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chọn Nhanh (tuỳ chọn)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {logoSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          name: suggestion.name,
                          slug: suggestion.slug,
                          icon: suggestion.icon,
                          click_id_param: suggestion.param
                        })}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-ios hover:bg-blue-50 dark:hover:bg-blue-900/20 flex flex-col items-center gap-1 text-xs"
                      >
                        {suggestion.icon.startsWith('http') ? (
                          <img src={suggestion.icon} alt={suggestion.name} className="w-6 h-6 object-contain" />
                        ) : (
                          <span className="text-lg">{suggestion.icon}</span>
                        )}
                        <span className="text-gray-700 dark:text-gray-300 truncate w-full text-center">
                          {suggestion.name === 'Tùy Chỉnh' ? suggestion.name : suggestion.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="traffic-source-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tên Nguồn *
                  </label>
                  <input
                    id="traffic-source-name"
                    name="name"
                    type="text"
                    autoComplete="organization"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Google Ads"
                  />
                </div>

                <div>
                  <label htmlFor="traffic-source-slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Slug (Mã định danh) *
                  </label>
                  <input
                    id="traffic-source-slug"
                    name="slug"
                    type="text"
                    autoComplete="off"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="google-ads"
                  />
                </div>

                <div>
                  <label htmlFor="traffic-source-click-param" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tham Số Click ID
                  </label>
                  <input
                    id="traffic-source-click-param"
                    name="click_id_param"
                    type="text"
                    autoComplete="off"
                    value={formData.click_id_param}
                    onChange={(e) => setFormData({ ...formData, click_id_param: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="click_id"
                  />
                </div>

                <div>
                  <label htmlFor="traffic-source-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Trạng Thái
                  </label>
                  <select
                    id="traffic-source-status"
                    name="is_active"
                    autoComplete="off"
                    value={formData.is_active ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="true">Hoạt Động</option>
                    <option value="false">Tắt</option>
                  </select>
                </div>
              </div>
          </ModalBody>

          <ModalFooter>
            <button type="button" onClick={() => setShowModal(false)} className="btn-ios-secondary">
              Hủy
            </button>
            <button type="submit" className="btn-ios-primary">
              {editingSource ? 'Cập Nhật' : 'Tạo Mới'}
            </button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
