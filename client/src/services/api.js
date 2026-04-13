import axios from 'axios';
import toast from 'react-hot-toast';

//  أي طلب يخرج يذهب الى هذا الملف تلقائياً (العنوان الرئيسي، التوكن، ومركز التفتيش)

// ─────────────────────────────────────────────────────────────
//  Axios Instance (centrel refrence)
// ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000, // 15s request timeout
});


// ─────────────────────────────────────────────────────────────
//  Request Interceptor — attach JWT token from localStorage
// ─────────────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eventat_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─────────────────────────────────────────────────────────────
//  Response Interceptor — handle 401 / 500 globally
// ─────────────────────────────────────────────────────────────
api.interceptors.response.use(
  // Pass through successful responses unchanged
  (response) => response,

  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Clear stale session data
      localStorage.removeItem('eventat_token');
      localStorage.removeItem('eventat_user');
      toast.error('Your session has expired. Please log in again.', {
        id: 'session-expired', // deduplicate toasts
      });
      // Redirect to login — works without React Router context
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (status >= 500) {
      toast.error('Something went wrong on our end. Please try again.', {
        id: 'server-error',
      }
      );
      console.log(`the url error is ${error.config.url}`)
    }

    return Promise.reject(error);
  },
);

export default api;
