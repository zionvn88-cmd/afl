import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function EnhancedStatCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon: Icon, 
  color = 'blue',
  delay = 0 
}) {
  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };
  
  const iconColor = colors[color] || colors.blue;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="card-ios p-5 hover:shadow-ios-lg transition-shadow duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
            {value}
          </p>
        </div>
        
        {Icon && (
          <div className={`w-12 h-12 rounded-ios flex items-center justify-center ${iconColor}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      
      {(subtitle || trend !== undefined) && (
        <div className="flex items-center justify-between text-sm">
          {subtitle && (
            <span className="text-gray-600 dark:text-gray-400">{subtitle}</span>
          )}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 font-medium ${
              trend > 0 ? 'text-green-600 dark:text-green-400' : 
              trend < 0 ? 'text-red-600 dark:text-red-400' : 
              'text-gray-600 dark:text-gray-400'
            }`}>
              {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{trend > 0 ? '+' : ''}{trend}%</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
