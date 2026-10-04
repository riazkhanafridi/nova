import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  withCredentials: true,
});

// Request interceptor — attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — silent token refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Never retry auth endpoints themselves
    if (
      original.url.includes('/auth/login') ||
      original.url.includes('/auth/refresh-token') ||
      original.url.includes('/auth/profile')
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          'http://localhost:8000/api/v1/auth/refresh-token',
          {},
          { withCredentials: true }
        );
        const newToken = data.accessToken || data.data?.accessToken;
        if (newToken) {
          localStorage.setItem('accessToken', newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        }
      } catch {
        // Refresh failed — clear token but DO NOT force redirect here.
        // ProtectedRoute / AuthContext will handle UI state.
        localStorage.removeItem('accessToken');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
