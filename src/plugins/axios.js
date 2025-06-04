import axios from 'axios';

// Configure base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // e.g., https://backend-qs65.onrender.com
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach the token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('jsontoken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional: Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle token expiration (e.g., redirect to login)
    }
    return Promise.reject(error);
  }
);


export default api;

