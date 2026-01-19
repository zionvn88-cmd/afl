import { useState, useMemo } from 'react';
import { DollarSign, CheckCircle, XCircle, Clock, RefreshCw, Download } from 'lucide-react';
import { useAPI } from '../hooks/useAPI';

export default function Conversions() {
  const [filter, setFilter] = useState({
    status: 'all',
    event: 'all',
    dateRange: 'today'
  });

  // Load conversions với filter
  const params = new URLSearchParams(filter).toString();
  const { data, loading, refetch } = useAPI(`conversions?${params}`, {
    dependencies: [params],
    transform: (data) => data.conversions || []
  });
  const conversions = data || [];

  // Calculate stats với useMemo
  const stats = useMemo(() => ({
    total: conversions.length,
    approved: conversions.filter(c => c.status === 'approved').length,
    pending: conversions.filter(c => c.status === 'pending').length,
    totalPayout: conversions.filter(c => c.status === 'approved').reduce((sum, c) => sum + (c.payout || 0), 0)
  }), [conversions]);

  const exportData = () => {
    if (conversions.length === 0) {
      alert('Không có dữ liệu để xuất');
      return;
    }

    // Tạo CSV content
    const headers = ['Click ID', 'Chiến Dịch', 'Sự Kiện', 'Thu Nhập', 'Trạng Thái', 'Thời Gian'];
    const rows = conversions.map(conv => [
      conv.click_id || '',
      conv.campaign_name || 'N/A',
      conv.event_type || 'sale',
      `$${(conv.payout || 0).toFixed(2)}`,
      conv.status === 'approved' ? 'Đã Duyệt' : conv.status === 'pending' ? 'Chờ Duyệt' : conv.status === 'chargeback' ? 'Hoàn Tiền' : 'Từ Chối',
      new Date(conv.created_at).toLocaleString('vi-VN')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Tạo blob và download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `chuyen-doi-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-1">
          <select
            id="conversion-filter-status"
            name="status"
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-sm"
          >
            <option value="all">Tất Cả Trạng Thái</option>
            <option value="pending">Đang Chờ</option>
            <option value="approved">Đã Duyệt</option>
            <option value="rejected">Từ Chối</option>
            <option value="chargeback">Hoàn Tiền</option>
          </select>

          <select
            id="conversion-filter-daterange"
            name="dateRange"
            value={filter.dateRange}
            onChange={(e) => setFilter({ ...filter, dateRange: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-ios bg-white dark:bg-gray-700 text-sm"
          >
            <option value="today">Hôm Nay</option>
            <option value="yesterday">Hôm Qua</option>
            <option value="last7days">7 Ngày</option>
            <option value="last30days">30 Ngày</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => refetch(true)} className="btn-ios-secondary p-2.5">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={exportData} className="btn-ios-secondary flex items-center gap-2 text-xs sm:text-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Xuất Dữ Liệu</span>
            <span className="sm:hidden">Xuất</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
        {[
          { label: 'Tổng Số', value: stats.total, color: 'blue' },
          { label: 'Đã Duyệt', value: stats.approved, color: 'green' },
          { label: 'Chờ Duyệt', value: stats.pending, color: 'yellow' },
          { label: 'Doanh Thu', value: `$${stats.totalPayout.toFixed(2)}`, color: 'purple' }
        ].map((stat) => (
          <div key={stat.label} className="card-ios p-3 lg:p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
            <p className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Conversions - Card View on Mobile, Table on Desktop */}
      <div className="card-ios p-3 lg:p-5">
        {conversions.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-500 dark:text-gray-400">
            Không có chuyển đổi
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
              {conversions.map((conv) => (
                <div key={conv.id} className="p-3 rounded-ios bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Click ID</p>
                      <code className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                        {conv.click_id?.substring(0, 20)}...
                      </code>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                      conv.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      conv.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {conv.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                      {conv.status === 'pending' && <Clock className="w-3 h-3" />}
                      {conv.status === 'rejected' && <XCircle className="w-3 h-3" />}
                      {conv.status === 'approved' ? 'Đã Duyệt' : conv.status === 'pending' ? 'Chờ Duyệt' : conv.status === 'chargeback' ? 'Hoàn Tiền' : 'Từ Chối'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Chiến Dịch</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{conv.campaign_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Thu Nhập</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">${(conv.payout || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Sự Kiện</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                        {conv.event_type || 'sale'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Thời Gian</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{new Date(conv.created_at).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
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
                    <th className="text-left py-3 px-5 text-sm font-medium text-gray-600 dark:text-gray-400">Click ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Chiến Dịch</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Sự Kiện</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Thu Nhập</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Trạng Thái</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Thời Gian</th>
                  </tr>
                </thead>
                <tbody>
                  {conversions.map((conv) => (
                    <tr key={conv.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-5">
                        <code className="text-xs font-mono text-gray-700 dark:text-gray-300">
                          {conv.click_id?.substring(0, 12)}...
                        </code>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        {conv.campaign_name || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                          {conv.event_type || 'sale'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                        ${(conv.payout || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          conv.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          conv.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {conv.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                          {conv.status === 'pending' && <Clock className="w-3 h-3" />}
                          {conv.status === 'rejected' && <XCircle className="w-3 h-3" />}
                          {conv.status === 'approved' ? 'Đã Duyệt' : conv.status === 'pending' ? 'Chờ Duyệt' : conv.status === 'chargeback' ? 'Hoàn Tiền' : 'Từ Chối'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(conv.created_at).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
