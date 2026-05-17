import axios from 'axios';

const TOKEN_KEY = 'stride_token';

/**
 * Axios instance for all API calls.
 * baseURL comes from Vite env so dev/prod can point to different servers.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

/** Attach JWT to every request if we have one stored. */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { TOKEN_KEY };
