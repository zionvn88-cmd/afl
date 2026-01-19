import { useState } from 'react';
import { Globe, Plus, Edit, Trash2, CheckCircle, XCircle, RefreshCw, AlertCircle, Copy } from 'lucide-react';
import { getApiUrl } from '../config/api';
import Modal, { ModalBody, ModalFooter } from '../components/Modal';
import { useAPI } from '../hooks/useAPI';

export default function CustomDomains() {
  const [showModal, setShowModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  
  // Load domains với caching
  const { data: domainsData, loading, refetch } = useAPI('custom-domains', {
    transform: (data) => data.domains || []
  });
  const domains = domainsData || [];
  
  const [formData, setFormData] = useState({
    domain: '',
    notes: '',
    domain_type: 'tracking'
  });

  // Modal alert/confirm
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'alert' });
  const [confirmCallback, setConfirmCallback] = useState(null);

  const showAlert = (message) => {
    setAlertModal({ isOpen: true, message, type: 'alert' });
  };

  const showConfirm = (message, callback) => {
    setAlertModal({ isOpen: true, message, type: 'confirm' });
    setConfirmCallback(() => callback);
  };

  const handleAlertClose = () => {
    setAlertModal({ ...alertModal, isOpen: false });
  };

  const handleConfirm = () => {
    if (confirmCallback) {
      confirmCallback();
    }
    handleAlertClose();
  };

  const openCreateModal = () => {
    setEditingDomain(null);
    setFormData({ 
      domain: '', 
      notes: '',
      domain_type: 'tracking'
    });
    setShowModal(true);
  };

  const openEditModal = (domain) => {
    setEditingDomain(domain);
    setFormData({
      domain: domain.domain,
      notes: domain.notes || '',
      domain_type: domain.domain_type || 'tracking'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingDomain 
        ? getApiUrl(`custom-domains/${editingDomain.id}`)
        : getApiUrl('custom-domains');
      
      const res = await fetch(url, {
        method: editingDomain ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setShowModal(false);
        await refetch(true); // Force refresh to bypass cache
        showAlert(editingDomain ? 'Domain đã được cập nhật' : 'Domain đã được thêm thành công');
      } else {
        showAlert('Lỗi: ' + (data.message || 'Không thể lưu domain'));
      }
    } catch (error) {
      console.error('Error saving domain:', error);
      showAlert('Lỗi kết nối: ' + error.message);
    }
  };

  const handleVerifyDNS = async (id) => {
    setVerifyingId(id);
    try {
      const res = await fetch(getApiUrl(`custom-domains/${id}/verify`), {
        method: 'POST'
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await refetch(true); // Force refresh to bypass cache
        showAlert(data.message);
      } else {
        showAlert('Lỗi xác thực: ' + (data.message || 'Không thể xác thực DNS'));
      }
    } catch (error) {
      console.error('Error verifying DNS:', error);
      showAlert('Lỗi kết nối: ' + error.message);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDelete = async (id, domain) => {
    showConfirm(`Bạn có chắc muốn xóa domain "${domain}"?`, async () => {
      try {
        const res = await fetch(getApiUrl(`custom-domains/${id}`), { method: 'DELETE' });
        const data = await res.json();
        
        if (res.ok && data.success) {
          await refetch(true); // Force refresh to bypass cache
          showAlert('Domain đã được xóa');
        } else {
          showAlert('Lỗi: ' + (data.message || 'Không thể xóa domain'));
        }
      } catch (error) {
        console.error('Error deleting:', error);
        showAlert('Lỗi kết nối: ' + error.message);
      }
    });
  };

  const getStatusBadge = (domain) => {
    if (domain.status === 'active' && domain.dns_verified) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
          <CheckCircle className="w-3 h-3" />
          Hoạt Động
        </span>
      );
    } else if (domain.status === 'banned') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
          <XCircle className="w-3 h-3" />
          Bị Chặn
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
          <AlertCircle className="w-3 h-3" />
          Chờ DNS
        </span>
      );
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tên Miền Tùy Chỉnh</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {domains.filter(d => d.domain_type === 'tracking').length} tracking • {domains.filter(d => d.domain_type === 'postback').length} postback
            </p>
          </div>
        </div>
        <button onClick={openCreateModal} className="btn-ios-primary flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          <span className="text-sm sm:text-base">Thêm Domain</span>
        </button>
      </div>

      {domains.length === 0 ? (
        <div className="card-ios p-8 lg:p-12 text-center">
          <Globe className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Chưa có domain tùy chỉnh nào</p>
          <button onClick={openCreateModal} className="btn-ios-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span className="text-sm sm:text-base">Thêm Domain Đầu Tiên</span>
          </button>
        </div>
      ) : (
        <>
          {/* Postback Domains Section */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-ios bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-lg">📡</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Postback Domains</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Nhận conversion từ affiliate networks</p>
              </div>
            </div>
            <div className="space-y-3">
              {domains.filter(d => d.domain_type === 'postback').length === 0 ? (
                <div className="card-ios p-6 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Chưa có postback domain</p>
                  <button onClick={openCreateModal} className="btn-ios-secondary text-xs inline-flex items-center gap-1">
                    <Plus className="w-3 h-3" />
                    Thêm Postback Domain
                  </button>
                </div>
              ) : (
                domains.filter(d => d.domain_type === 'postback').map((domain) => (
                  <div key={domain.id} className="card-ios p-4 lg:p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-semibold text-base text-gray-900 dark:text-white truncate">
                            {domain.domain}
                          </h3>
                          {getStatusBadge(domain)}
                        </div>
                        {domain.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{domain.notes}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          📡 Dùng trong postback URL: https://{domain.domain}/postback
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(domain)}
                          className="btn-ios-secondary text-xs"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(domain.id, domain.domain)}
                          className="btn-ios-secondary text-xs hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Tracking/Ads Domains Section */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-ios bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <span className="text-lg">🎯</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tracking/Ads Domains</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tracking clicks và hiển thị landing pages</p>
              </div>
            </div>
            <div className="space-y-3">
              {domains.filter(d => d.domain_type === 'tracking').length === 0 ? (
                <div className="card-ios p-6 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Chưa có tracking domain</p>
                  <button onClick={openCreateModal} className="btn-ios-secondary text-xs inline-flex items-center gap-1">
                    <Plus className="w-3 h-3" />
                    Thêm Tracking Domain
                  </button>
                </div>
              ) : (
                domains.filter(d => d.domain_type === 'tracking').map((domain) => (
                  <div key={domain.id} className="card-ios p-4 lg:p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-semibold text-base text-gray-900 dark:text-white truncate">
                            {domain.domain}
                          </h3>
                          {getStatusBadge(domain)}
                        </div>
                        {domain.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{domain.notes}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{domain.clicks?.toLocaleString() || 0} clicks</span>
                          <span>{domain.conversions || 0} conversions</span>
                          <span>{domain.campaigns_count || 0} campaigns</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {domain.status === 'pending' && (
                          <button
                            onClick={() => handleVerifyDNS(domain.id)}
                            disabled={verifyingId === domain.id}
                            className="btn-ios-secondary text-xs flex items-center gap-1"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${verifyingId === domain.id ? 'animate-spin' : ''}`} />
                            Xác Thực DNS
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(domain)}
                          className="btn-ios-secondary text-xs"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(domain.id, domain.domain)}
                          className="btn-ios-secondary text-xs hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}

      {/* Modal Form */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingDomain ? 'Sửa Domain' : 'Thêm Domain Mới'}
      >
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div>
              <label htmlFor="domain-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Loại Domain *
              </label>
              <select
                id="domain-type"
                name="domain_type"
                value={formData.domain_type}
                onChange={(e) => setFormData({ ...formData, domain_type: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="tracking">🎯 Tracking/Ads (Lander Server)</option>
                <option value="postback">📡 Postback (Nhận Conversion)</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.domain_type === 'tracking' ? '✓ Dùng để tracking click và hiển thị landing page' : '✓ Dùng để nhận postback từ affiliate networks'}
              </p>
            </div>

            <div>
              <label htmlFor="domain-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tên Domain *
              </label>
              <input
                id="domain-name"
                name="domain"
                type="text"
                autoComplete="url"
                required
                disabled={editingDomain}
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                placeholder={formData.domain_type === 'tracking' ? 'track.yourdomain.com' : 'pb.yourdomain.com'}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.domain_type === 'tracking' 
                  ? 'Ví dụ: track.mydomain.com, click.example.com, go.mydomain.com' 
                  : 'Ví dụ: pb.mydomain.com, postback.example.com, cv.mydomain.com'}
              </p>
            </div>

            <div>
              <label htmlFor="domain-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ghi Chú
              </label>
              <textarea
                id="domain-notes"
                name="notes"
                autoComplete="off"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ví dụ: Domain dùng cho Facebook Ads, Domain backup..."
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <button type="button" onClick={() => setShowModal(false)} className="btn-ios-secondary">
              Hủy
            </button>
            <button type="submit" className="btn-ios-primary">
              {editingDomain ? 'Cập Nhật' : 'Thêm Mới'}
            </button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Alert/Confirm Modal */}
      <Modal
        isOpen={alertModal.isOpen}
        onClose={handleAlertClose}
        title={alertModal.type === 'alert' ? 'Thông Báo' : 'Xác Nhận'}
      >
        <ModalBody>
          <p className="text-gray-700 dark:text-gray-300">{alertModal.message}</p>
        </ModalBody>
        <ModalFooter>
          {alertModal.type === 'confirm' ? (
            <>
              <button onClick={handleAlertClose} className="btn-ios-secondary">
                Hủy
              </button>
              <button onClick={handleConfirm} className="btn-ios-primary">
                Xác Nhận
              </button>
            </>
          ) : (
            <button onClick={handleAlertClose} className="btn-ios-primary">
              Đóng
            </button>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
}
