import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  showCloseButton = true
}) {
  if (!isOpen) return null;

  // Responsive width based on content
  const sizeClasses = {
    sm: 'w-full max-w-[500px]',   // 500px - cho form đơn giản
    md: 'w-full max-w-[600px]',   // 600px - mặc định
    lg: 'w-full max-w-[800px]',   // 800px - cho form có grid
    xl: 'w-full max-w-[1000px]'   // 1000px - cho form phức tạp
  };
  
  const modalWidth = sizeClasses[size];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Container - Centered */}
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`relative ${modalWidth} mx-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Content */}
            <div className="card-ios overflow-hidden">
              {/* Header - Fixed padding */}
              <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-ios-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                )}
              </div>

              {/* Body - Fixed padding, Scrollable content */}
              <div className="px-4 lg:px-6 py-4 lg:py-5 max-h-[75vh] overflow-y-auto bg-white dark:bg-gray-800">
                {children}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

// Modal Footer Component (optional)
export function ModalFooter({ children, className = '' }) {
  return (
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 sm:pt-5 mt-4 sm:mt-5 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
}

// Modal Body Component (optional wrapper)
export function ModalBody({ children, className = '' }) {
  return (
    <div className={`space-y-5 ${className}`}>
      {children}
    </div>
  );
}
