import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Target, Globe, Bell, Settings, Zap, FileText, DollarSign, Menu, X, Globe2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import ThemeToggle from './ThemeToggle'
import { useTheme } from '../contexts/ThemeContext'

export default function Layout() {
  const location = useLocation()
  const { isDark } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const isActive = (path) => {
    return location.pathname === path
  }

  // Đóng mobile menu khi chuyển trang
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const navItems = [
    { path: '/', label: 'Tổng Quan', icon: Home },
    { path: '/campaigns', label: 'Chiến Dịch', icon: Target },
    { path: '/landing-pages', label: 'Trang Đích', icon: FileText },
    { path: '/conversions', label: 'Chuyển Đổi', icon: DollarSign },
    { path: '/traffic-sources', label: 'Nguồn Lưu Lượng', icon: Globe },
    { path: '/custom-domains', label: 'Tên Miền', icon: Globe2 },
    { path: '/alerts', label: 'Cảnh Báo', icon: Bell },
    { path: '/settings', label: 'Cài Đặt', icon: Settings },
  ]
  
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-50 lg:hidden"
            >
              {/* Mobile Sidebar Content */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-ios-lg flex items-center justify-center shadow-ios">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">AFL Tracker</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Version 3.0</div>
                  </div>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-ios hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.path)
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-ios text-sm font-medium transition-all duration-200
                        ${active 
                          ? 'bg-blue-500 text-white shadow-sm' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* User Profile - Bottom */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-ios bg-gray-50 dark:bg-gray-700/50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-sm">
                    👤
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">Quản Trị</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">admin@afl.com</div>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col z-40">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-ios-lg flex items-center justify-center shadow-ios">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">AFL Tracker</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Version 3.0</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-ios text-sm font-medium transition-all duration-200
                  ${active 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Profile - Bottom */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-ios bg-gray-50 dark:bg-gray-700/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-sm">
              👤
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">Quản Trị</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">admin@afl.com</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Top Bar - Fixed */}
        <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-ios hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">
              {navItems.find(item => item.path === location.pathname)?.label || 'AFL Tracker'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content - With Top and Bottom Padding */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 pt-16 pb-20 lg:pb-16">
          <div className="max-w-7xl mx-auto p-4 lg:p-6">
            <Outlet />
          </div>
        </main>

        {/* Footer - Fixed */}
        <footer className="fixed bottom-0 right-0 left-0 lg:left-64 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-3 lg:py-4 z-30">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-2 lg:gap-0 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">© 2026 AFL Tracker - Nền tảng tracking chuyên nghiệp</span>
              <span className="sm:hidden">© 2026 AFL Tracker</span>
            </div>
            <div className="flex gap-4 lg:gap-6">
              <a href="#" className="hover:text-blue-500 transition-colors">Trợ giúp</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Tài liệu</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Liên hệ</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
