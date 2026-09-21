const PUBLIC_BACKEND_URL = 'https://metals-refer-parts-advertisers.trycloudflare.com';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('trycloudflare.com')) {
    return PUBLIC_BACKEND_URL;
  }
  return 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();

