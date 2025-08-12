// Configuration for the webapp
export const config = {
  // API base URL - injected by Vite build process
  apiBaseUrl: (globalThis as any).__API_BASE_URL__ || 'http://localhost:3001',
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;
