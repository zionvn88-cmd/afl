import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import Table from '../components/Table';
import { offersAPI } from '../services/api';

export default function Offers() {
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('campaign_id');
  
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadOffers();
  }, [campaignId]);
  
  const loadOffers = async () => {
    setLoading(true);
    try {
      const result = await offersAPI.getAll(campaignId);
      setOffers(result.offers || []);
    } catch (error) {
      console.error('Failed to load offers:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa offer này?')) return;
    
    try {
      await offersAPI.delete(id);
      loadOffers();
    } catch (error) {
      alert('Xóa thất bại: ' + error.message);
    }
  };
  
  const columns = [
    {
      key: 'name',
      header: 'Tên Offer',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{value}</div>
          <div className="text-xs text-gray-500 mt-1">ID: {row.id}</div>
        </div>
      )
    },
    {
      key: 'url',
      header: 'URL',
      render: (value) => (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 text-sm truncate max-w-xs block"
        >
          {value}
        </a>
      )
    },
    {
      key: 'payout',
      header: 'Payout',
      align: 'right',
      render: (value) => `$${(value || 0).toFixed(2)}`
    },
    {
      key: 'weight',
      header: 'Weight',
      align: 'right',
      render: (value) => value || 100
    },
    {
      key: 'status',
      header: 'Trạng Thái',
      align: 'center',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
        }`}>
          {value === 'active' ? 'Hoạt động' : 'Tạm dừng'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Hành Động',
      align: 'center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <a
            href={row.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Mở URL"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <Link
            to={`/offers/${row.id}/edit${campaignId ? `?campaign_id=${campaignId}` : ''}`}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Chỉnh sửa"
          >
            <Edit className="w-4 h-4" />
          </Link>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Xóa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Offers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Quản lý các offers
            {campaignId && <span className="ml-2">(Campaign ID: {campaignId})</span>}
          </p>
        </div>
        
        <Link 
          to={`/offers/new${campaignId ? `?campaign_id=${campaignId}` : ''}`}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Offer</span>
        </Link>
      </div>
      
      <Table 
        columns={columns}
        data={offers}
        loading={loading}
      />
    </div>
  );
}
