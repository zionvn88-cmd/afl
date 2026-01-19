import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useState } from 'react';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';

export default function PerformanceChart({ data = [], title = "Hiệu Suất" }) {
  const [chartType, setChartType] = useState('area');
  
  // Use real data or empty data (not demo data)
  const chartData = data.length > 0 ? data : [
    { time: '00:00', clicks: 0, conversions: 0, revenue: 0 },
    { time: '04:00', clicks: 0, conversions: 0, revenue: 0 },
    { time: '08:00', clicks: 0, conversions: 0, revenue: 0 },
    { time: '12:00', clicks: 0, conversions: 0, revenue: 0 },
    { time: '16:00', clicks: 0, conversions: 0, revenue: 0 },
    { time: '20:00', clicks: 0, conversions: 0, revenue: 0 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="card-ios p-3 shadow-ios-lg">
          <p className="font-medium text-sm text-gray-900 dark:text-white mb-1.5">{label}</p>
          {payload.map((entry, index) => {
            const nameMap = {
              clicks: 'Lượt Click',
              conversions: 'Chuyển Đổi',
              revenue: 'Doanh Thu'
            };
            return (
              <p key={index} className="text-xs" style={{ color: entry.color }}>
                {nameMap[entry.name]}: <span className="font-semibold">{entry.value}</span>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 10, left: 0, bottom: 0 },
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
            <XAxis dataKey="time" stroke="#9ca3af" className="text-xs" />
            <YAxis stroke="#9ca3af" className="text-xs" />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value) => {
                const nameMap = {
                  clicks: 'Lượt Click',
                  conversions: 'Chuyển Đổi'
                };
                return nameMap[value] || value;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="clicks" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
              name="clicks"
            />
            <Line 
              type="monotone" 
              dataKey="conversions" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={false}
              name="conversions"
            />
          </LineChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
            <XAxis dataKey="time" stroke="#9ca3af" className="text-xs" />
            <YAxis stroke="#9ca3af" className="text-xs" />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value) => {
                const nameMap = {
                  clicks: 'Lượt Click',
                  conversions: 'Chuyển Đổi'
                };
                return nameMap[value] || value;
              }}
            />
            <Bar dataKey="clicks" fill="#3b82f6" radius={[6, 6, 0, 0]} name="clicks" />
            <Bar dataKey="conversions" fill="#10b981" radius={[6, 6, 0, 0]} name="conversions" />
          </BarChart>
        );
      
      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
            <XAxis dataKey="time" stroke="#9ca3af" className="text-xs" />
            <YAxis stroke="#9ca3af" className="text-xs" />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value) => {
                const nameMap = {
                  clicks: 'Lượt Click',
                  conversions: 'Chuyển Đổi'
                };
                return nameMap[value] || value;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="clicks" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorClicks)"
              name="clicks"
            />
            <Area 
              type="monotone" 
              dataKey="conversions" 
              stroke="#10b981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorConv)"
              name="conversions"
            />
          </AreaChart>
        );
    }
  };

  return (
    <div className="card-ios p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Theo dõi thời gian thực</p>
        </div>
        
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-ios-sm">
          {[
            { type: 'area', icon: TrendingUp },
            { type: 'line', icon: Activity },
            { type: 'bar', icon: BarChart3 }
          ].map(({ type, icon: Icon }) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`p-1.5 rounded-ios-sm transition-all ${
                chartType === type 
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
