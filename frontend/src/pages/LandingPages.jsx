import { useState } from 'react';
import { FileText, Plus, Edit, Trash2, Eye, RefreshCw, Upload, FolderArchive, MousePointer, Target } from 'lucide-react';
import { getApiUrl } from '../config/api';
import Modal, { ModalBody, ModalFooter } from '../components/Modal';
import { useAPI } from '../hooks/useAPI';

export default function LandingPages() {
  const [showModal, setShowModal] = useState(false);
  const [editingLander, setEditingLander] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    status: 'active'
  });

  // Load landing pages với caching
  const { data, loading, refetch } = useAPI('landing-pages', {
    transform: (data) => data.landers || data.Landers || data.data || []
  });
  const landers = data || [];

  const openCreateModal = () => {
    setEditingLander(null);
    setSelectedFile(null);
    setFormData({ name: '', category: '', status: 'active' });
    setShowModal(true);
  };

  const openEditModal = (lander) => {
    setEditingLander(lander);
    setSelectedFile(null);
    setFormData({
      name: lander.name,
      category: lander.category || '',
      status: lander.status
    });
    setShowModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/zip', 'application/x-zip-compressed', 'text/html'];
      if (!validTypes.includes(file.type) && !file.name.endsWith('.zip') && !file.name.endsWith('.html')) {
        alert('Chỉ chấp nhận file .zip hoặc .html');
        return;
      }
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('File không được vượt quá 50MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create mode requires file upload
    if (!editingLander && !selectedFile) {
      alert('Vui lòng chọn file ZIP hoặc HTML để upload');
      return;
    }

    setUploading(true);
    try {
      if (editingLander) {
        // Update mode - only update metadata
        const url = getApiUrl(`landing-pages/${editingLander.id}`);
        const res = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setShowModal(false);
          await refetch(true); // Force refresh to bypass cache
          alert('Landing page đã được cập nhật');
        } else {
          alert('Lỗi: ' + (data.message || 'Không thể cập nhật landing page'));
        }
      } else {
        // Create mode - upload file
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        uploadFormData.append('name', formData.name);
        uploadFormData.append('category', formData.category);
        uploadFormData.append('status', formData.status);

        const res = await fetch(getApiUrl('landing-pages/upload'), {
          method: 'POST',
          body: uploadFormData
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setShowModal(false);
          await refetch(true); // Force refresh to bypass cache
          alert('Landing page đã được upload thành công');
        } else {
          alert('Lỗi: ' + (data.message || 'Không thể upload landing page'));
        }
      }
    } catch (error) {
      console.error('Error saving landing page:', error);
      alert('Lỗi kết nối: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa trang đích này?')) return;
    try {
      await fetch(getApiUrl(`landing-pages/${id}`), { method: 'DELETE' });
      refetch(true); // Force refresh to bypass cache
    } catch (error) {
      console.error('Error deleting:', error);
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
          <div className="w-10 h-10 rounded-ios bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {landers.length} trang đích
            </p>
          </div>
        </div>
        <button onClick={openCreateModal} className="btn-ios-primary flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          <span className="text-sm sm:text-base">Thêm Mới</span>
        </button>
      </div>

      {/* Landing Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {landers.length === 0 ? (
          <div className="col-span-full card-ios p-8 lg:p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Chưa có trang đích nào</p>
            <button onClick={openCreateModal} className="btn-ios-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="text-sm sm:text-base">Tạo Trang Đích Đầu Tiên</span>
            </button>
          </div>
        ) : (
          landers.map((lander) => (
            <div key={lander.id} className="card-ios p-4 lg:p-5 hover:shadow-ios-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 truncate">
                    {lander.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {lander.url}
                  </p>
                </div>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  lander.status === 'active' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                }`}>
                  {lander.status === 'active' ? 'Hoạt Động' : 'Tạm Dừng'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Files</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {lander.file_count || 0}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <MousePointer className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Click</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {lander.clicks?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">CV</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {lander.conversions || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.open(`https://afl-lander-server.neovn524.workers.dev/lp/${lander.id}`, '_blank')}
                  className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-medium"
                  title="Xem trước"
                >
                  <Eye className="w-4 h-4" />
                </button>
                
                <button 
                  onClick={() => openEditModal(lander)}
                  className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-medium"
                  title="Sửa"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(lander.id)}
                  className="flex-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-medium"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingLander ? 'Sửa Landing Page' : 'Upload Landing Page Mới'}
      >
        <form onSubmit={handleSubmit}>
          <ModalBody>
              <div>
                <label htmlFor="landing-page-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên Landing Page *
                </label>
                <input
                  id="landing-page-name"
                  name="name"
                  type="text"
                  autoComplete="organization"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="iPhone 15 VSL Landing"
                />
              </div>

              <div>
                <label htmlFor="landing-page-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ghi Chú
                </label>
                <input
                  id="landing-page-category"
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="VSL iPhone, Quiz Survey, v.v..."
                />
              </div>

              {!editingLander && (
                <div>
                  <label htmlFor="landing-page-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    File Landing Page *
                  </label>
                  <div className="relative">
                    <input
                      id="landing-page-file"
                      name="file"
                      type="file"
                      accept=".zip,.html"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="landing-page-file"
                      className="flex items-center justify-center gap-3 w-full px-4 py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-ios bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {selectedFile ? (
                        <div className="text-center">
                          <FolderArchive className="w-10 h-10 text-blue-500 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Click để chọn file
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Hỗ trợ: .zip, .html (tối đa 50MB)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    📦 File ZIP: Toàn bộ landing page (HTML, CSS, JS, images)<br />
                    📄 File HTML: Chỉ file index.html đơn
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="landing-page-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trạng Thái
                </label>
                <select
                  id="landing-page-status"
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
            <button 
              type="button" 
              onClick={() => setShowModal(false)} 
              className="btn-ios-secondary flex-1"
              disabled={uploading}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn-ios-primary flex-1 items-center justify-center gap-2" 
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {editingLander ? 'Đang cập nhật...' : 'Đang tải lên...'}
                </>
              ) : (
                <>
                  {editingLander ? (
                    <>
                      <Edit className="w-4 h-4" />
                      Cập Nhật
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Tải Lên
                    </>
                  )}
                </>
              )}
            </button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
