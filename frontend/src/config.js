// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// App Configuration
export const APP_NAME = 'AFL Tracker';
export const APP_VERSION = '3.0.0';

// Tracking Configuration
export const TRACKER_URL = import.meta.env.VITE_TRACKER_URL || 'http://localhost:3001';
export const POSTBACK_URL = import.meta.env.VITE_POSTBACK_URL || 'http://localhost:3003';

// Date Formats
export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';
export const TIME_FORMAT = 'HH:mm:ss';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// Refresh Intervals (ms)
export const DASHBOARD_REFRESH_INTERVAL = 30000; // 30 seconds
export const REPORTS_REFRESH_INTERVAL = 60000; // 1 minute
