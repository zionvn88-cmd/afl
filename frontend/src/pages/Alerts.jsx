import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { getApiUrl } from '../config/api';
import { useAPI } from '../hooks/useAPI';

export default function Alerts() {
  const [filter, setFilter] = useState('all');

  // Load alerts với caching
  const { data, loading, refetch } = useAPI('alerts', {
    transform: (data) => data.success ? (data.alerts || []) : []
  });
  const [alerts, setAlerts] = useState(data || []);

  // Update alerts khi data thay đổi
  useMemo(() => {
    if (data) setAlerts(data);
  }, [data]);

  const acknowledgeAlert = async (alertId) => {
    try {
      const res = await fetch(getApiUrl(`alerts/${alertId}/acknowledge`), {
        method: 'POST'
      });
      
      if (res.ok) {
        setAlerts(alerts.map(alert => 
          alert.id === alertId 
            ? { ...alert, acknowledged: 1 }
            : alert
        ));
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return alert.acknowledged === 0;
    if (filter === 'read') return alert.acknowledged === 1;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-ios">
            {[
              { key: 'all', label: 'Tất Cả' },
              { key: 'unread', label: 'Chưa Đọc' },
              { key: 'read', label: 'Đã Đọc' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-ios-sm text-sm font-medium transition-all ${
                  filter === key
                    ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => refetch(true)} className="btn-ios-secondary">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="card-ios p-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Không có cảnh báo</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`card-ios p-4 ${
                alert.acknowledged === 0 ? 'border-l-4 border-l-red-500' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`mt-0.5 w-9 h-9 rounded-ios flex items-center justify-center ${
                    alert.severity === 'high' 
                      ? 'bg-red-100 dark:bg-red-900/30' 
                      : alert.severity === 'medium'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30'
                      : 'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    <AlertCircle className={`w-5 h-5 ${
                      alert.severity === 'high' ? 'text-red-600 dark:text-red-400' :
                      alert.severity === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-blue-600 dark:text-blue-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                        {alert.title}
                      </h3>
                      {alert.acknowledged === 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                          Mới
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <Link 
                        to={`/campaigns/${alert.campaign_id}`}
                        className="font-medium hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {alert.campaign_name}
                      </Link>
                      : {alert.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(alert.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alert.acknowledged === 0 && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="btn-ios-secondary text-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Đánh dấu đã đọc
                    </button>
                  )}
                  <Link
                    to={`/campaigns/${alert.campaign_id}`}
                    className="btn-ios-primary text-xs"
                  >
                    Xem Chi Tiết
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
