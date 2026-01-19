import { useState, useEffect } from 'react'

export default function OfferModal({ offer, campaignId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    payout: '',
    weight: 100,
  })

  const isEdit = !!offer

  useEffect(() => {
    if (offer) {
      setFormData({
        name: offer.name || '',
        url: offer.url || '',
        payout: offer.payout || '',
        weight: offer.weight || 100,
      })
    }
  }, [offer])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.url) {
      alert('Vui lòng điền đầy đủ tên và URL')
      return
    }

    try {
      const url = isEdit ? `/api/offers/${offer.id}` : '/api/offers'
      const method = isEdit ? 'PUT' : 'POST'
      
      const payload = isEdit 
        ? formData 
        : { ...formData, campaign_id: campaignId }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          payout: parseFloat(formData.payout) || 0,
          weight: parseInt(formData.weight) || 100,
        }),
      })

      if (!res.ok) throw new Error('Không thể lưu offer')

      alert(isEdit ? '✅ Đã cập nhật offer!' : '✅ Đã tạo offer mới!')
      onSuccess()
      onClose()
    } catch (error) {
      alert('❌ Lỗi: ' + error.message)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-t-3xl">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="text-4xl">{isEdit ? '✏️' : '✨'}</div>
                <h2 className="text-3xl font-bold">
                  {isEdit ? 'Chỉnh Sửa Offer' : 'Thêm Offer Mới'}
                </h2>
              </div>
              <p className="text-blue-100">
                Thiết lập thông tin offer của bạn
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-300 text-3xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Offer Name */}
          <div>
            <label htmlFor="offer-name" className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
              <span>🎁</span>
              <span>Tên Offer</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              id="offer-name"
              type="text"
              name="name"
              autoComplete="organization"
              value={formData.name}
              onChange={handleChange}
              placeholder="VD: Network A - High Converting"
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 text-lg"
              required
            />
          </div>

          {/* Offer URL */}
          <div>
            <label htmlFor="offer-url" className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
              <span>🔗</span>
              <span>URL Offer</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              id="offer-url"
              type="url"
              name="url"
              autoComplete="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://network.com/offer?aff_sub={afl_click_id}"
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 text-lg font-mono"
              required
            />
            <div className="mt-3 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Quan trọng:</strong> Sử dụng placeholder <code className="bg-blue-100 px-2 py-1 rounded font-mono">{'{afl_click_id}'}</code> để tracker tự động thay thế bằng click ID thực
              </p>
            </div>
          </div>

          {/* Payout & Weight */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="offer-payout" className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                <span>💰</span>
                <span>Thu Nhập ($)</span>
              </label>
              <input
                id="offer-payout"
                type="number"
                name="payout"
                autoComplete="off"
                value={formData.payout}
                onChange={handleChange}
                placeholder="15.00"
                step="0.01"
                min="0"
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 text-lg"
              />
              <p className="text-sm text-gray-500 mt-2">Thu nhập dự kiến mỗi conversion</p>
            </div>

            <div>
              <label htmlFor="offer-weight" className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                <span>📊</span>
                <span>Traffic Split (%)</span>
              </label>
              <input
                id="offer-weight"
                type="number"
                name="weight"
                autoComplete="off"
                value={formData.weight}
                onChange={handleChange}
                placeholder="100"
                min="0"
                max="100"
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 text-lg"
              />
              <p className="text-sm text-gray-500 mt-2">Phần trăm traffic đến offer này</p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <div className="text-3xl">📝</div>
              <div>
                <h4 className="font-bold text-purple-900 mb-3 text-lg">Cách hoạt động của Traffic Split</h4>
                <ul className="space-y-2 text-sm text-purple-800">
                  <li className="flex items-start space-x-2">
                    <span className="mt-1">•</span>
                    <span><strong>Weight</strong> xác định tỷ lệ % traffic được gửi đến offer này</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="mt-1">•</span>
                    <span>Nếu có nhiều offers, tổng weight &gt; 100 cũng OK (tính theo tỷ lệ)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="mt-1">•</span>
                    <span><strong>Ví dụ:</strong> Offer A (weight 60) + Offer B (weight 40) = Split 60/40</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="mt-1">•</span>
                    <span>Dùng để A/B test và tìm offer convert tốt nhất 🎯</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Example */}
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <div className="text-3xl">✅</div>
              <div>
                <h4 className="font-bold text-green-900 mb-3 text-lg">Ví dụ URL hoàn chỉnh</h4>
                <div className="space-y-3 text-sm text-green-800">
                  <div>
                    <div className="font-semibold mb-1">1. URL bạn nhập vào:</div>
                    <code className="block bg-green-100 px-3 py-2 rounded-lg font-mono text-xs break-all">
                      https://network.com/offer?o=123&aff_sub={'{afl_click_id}'}
                    </code>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">2. User click → Tracker chuyển thành:</div>
                    <code className="block bg-green-100 px-3 py-2 rounded-lg font-mono text-xs break-all">
                      https://network.com/offer?o=123&aff_sub=BCK_lp3k9x_xyz789
                    </code>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">3. Network gửi postback với ID đó:</div>
                    <code className="block bg-green-100 px-3 py-2 rounded-lg font-mono text-xs break-all">
                      https://postback.../pb?click_id=BCK_lp3k9x_xyz789&payout=15
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-5 rounded-2xl hover:shadow-2xl font-bold text-lg transition-all duration-300 hover:-translate-y-1"
            >
              {isEdit ? '💾 Cập Nhật Offer' : '✨ Thêm Offer'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-5 border-2 border-gray-300 rounded-2xl hover:bg-gray-50 font-semibold text-lg transition-all duration-300"
            >
              Hủy Bỏ
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
