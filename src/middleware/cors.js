import cors from 'cors';

// Build allowed origins list
const getAllowedOrigins = () => {
  if (process.env.NODE_ENV !== 'production') {
    return '*'; // Allow all in development
  }

  const origins = [];
  
  // Add dashboard domain (frontend)
  if (process.env.DASHBOARD_DOMAIN) {
    origins.push(`https://${process.env.DASHBOARD_DOMAIN}`);
  }
  
  // Add tracker domain
  if (process.env.TRACKER_DOMAIN) {
    origins.push(`https://${process.env.TRACKER_DOMAIN}`);
  }
  
  // Add API domain (if needed)
  if (process.env.API_DOMAIN) {
    origins.push(`https://${process.env.API_DOMAIN}`);
  }
  
  // Add APP_URL if provided
  if (process.env.APP_URL) {
    origins.push(process.env.APP_URL);
  }
  
  return origins.length > 0 ? origins : '*';
};

const corsOptions = {
  origin: getAllowedOrigins(),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
};

export default cors(corsOptions);
