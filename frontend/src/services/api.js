import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  console.log('🌐 API REQUEST:', config.method?.toUpperCase(), config.url, config.baseURL);
  console.log('🔗 Full URL:', `${config.baseURL}${config.url}`);
  
  // For detection requests, let's make it very obvious
  if (config.url?.includes('realtime')) {
    console.log('🚨 REALTIME DETECTION REQUEST TO:', `${config.baseURL}${config.url}`);
  }
  
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => {
    // Log response for debugging
    if (response.config.url?.includes('realtime')) {
      console.log('🎉 REALTIME RESPONSE:', response.data);
      console.log('🔗 Response from URL:', response.config.url);
      
      // Check if this looks like a backend response
      if (response.data.backend_processed) {
        console.log('✅ Response came from BACKEND');
      } else {
        console.log('⚠️ Response might be from AI SERVICE directly');
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (name, email, password) => 
    api.post('/auth/register', { name, email, password }),
  
  getProfile: () => 
    api.get('/auth/me'),
  
  updateProfile: (data) => 
    api.put('/auth/profile', data),
};

// Detection API
export const detectionAPI = {
  uploadFile: (formData) => 
    api.post('/detection/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000, // 5 minutes for file upload
    }),
  
  detectFromImage: (imageData, detectionType = 'all') => 
    api.post('/detection/realtime', { 
      imageData, 
      detectionType 
    }),
  
  detectFromFile: (formData) => 
    api.post('/detection/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    }),
  
  realtimeDetection: (imageData, detectionType) => 
    api.post('/detection/realtime', { imageData, detectionType }),
  
  getHistory: (params) => 
    api.get('/detection/history', { params }),
  
  getDetection: (id) => 
    api.get(`/detection/${id}`),
  
  deleteDetection: (id) => 
    api.delete(`/detection/${id}`),
  
  getStats: () => 
    api.get('/detection/stats/summary'),
};

// User API
export const userAPI = {
  getProfile: () => 
    api.get('/user/profile'),
  
  updateProfile: (data) => 
    api.put('/user/profile', data),
  
  changePassword: (currentPassword, newPassword) => 
    api.put('/user/change-password', { currentPassword, newPassword }),
  
  getDashboard: () => 
    api.get('/user/dashboard'),
  
  deleteAccount: (password) => 
    api.delete('/user/account', { data: { password } }),
};

// Admin API
export const adminAPI = {
  getStats: () => 
    api.get('/admin/stats'),
  
  getUsers: (params) => 
    api.get('/admin/users', { params }),
  
  getUser: (id) => 
    api.get(`/admin/users/${id}`),
  
  updateUser: (id, data) => 
    api.put(`/admin/users/${id}`, data),
  
  deleteUser: (id) => 
    api.delete(`/admin/users/${id}`),
  
  getDetections: (params) => 
    api.get('/admin/detections', { params }),
  
  getDetection: (id) => 
    api.get(`/admin/detections/${id}`),
  
  deleteDetection: (id) => 
    api.delete(`/admin/detections/${id}`),
};

export default api;
