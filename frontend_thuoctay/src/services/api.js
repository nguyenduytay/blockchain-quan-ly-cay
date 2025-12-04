import axios from 'axios';

// Su dung proxy trong development de tranh CORS
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.80.10:3008/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor - Add token và log requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 API Call: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Request Error:', error.message || 'Request failed');
    }
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses và errors
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Success: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      const status = error.response?.status || 'N/A';
      const url = error.config?.url || 'unknown';
      console.error(`❌ API Error: ${status} ${url} - ${error.message || 'Request failed'}`);
    }
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (!window.location.pathname.includes('/login') && !window.location.pathname === '/') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    if (error.code === 'ECONNREFUSED') {
      error.message = 'Không thể kết nối đến server. Kiểm tra xem API server có đang chạy không?';
    } else if (error.message.includes('Network Error') || error.code === 'ERR_NETWORK') {
      error.message = 'Lỗi kết nối mạng. Kiểm tra kết nối internet và server.';
    } else if (error.response) {
      const errorMsg = error.response.data?.error || error.response.data?.message || error.response.statusText;
      error.message = errorMsg;
    } else if (error.request) {
      error.message = 'Không nhận được phản hồi từ server.';
    }
    
    return Promise.reject(error);
  }
);

// Test ket noi den server
const testConnection = async () => {
  try {
    const response = await axios.get(API_BASE_URL.replace('/api', '/health'));
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      details: 'Hãy chắc chắn rằng API server đang chạy trên port 3008'
    };
  }
};

// API Service
export const thuoctayAPI = {
  // Khoi tao du lieu
  initData: () => api.post('/init'),
  
  // Lay tat ca thuoc tay
  getAllThuocTay: () => api.get('/thuoctay'),
  
  // Lay thuoc tay theo ma
  getThuocTayByMa: (maThuoc) => api.get(`/thuoctay/${maThuoc}`),
  
  // Tao thuoc tay moi
  createThuocTay: (data) => api.post('/thuoctay', data),
  
  // Cap nhat thuoc tay
  updateThuocTay: (maThuoc, data) => api.put(`/thuoctay/${maThuoc}`, data),
  
  // Xoa thuoc tay
  deleteThuocTay: (maThuoc) => api.delete(`/thuoctay/${maThuoc}`),
  
  // Tim thuoc tay theo loai
  getThuocTayByLoai: (loaiThuoc) => api.get(`/thuoctay/loai/${loaiThuoc}`),
  
  // Tim thuoc tay theo nha san xuat
  getThuocTayByNhaSanXuat: (nhaSanXuat) => api.get(`/thuoctay/nhasanxuat/${nhaSanXuat}`),
  
  // Cap nhat so luong
  updateSoLuong: (maThuoc, soLuongMoi) => api.patch(`/thuoctay/${maThuoc}/soluong`, { soLuongMoi }),
  
  // Cap nhat gia ban
  updateGiaBan: (maThuoc, giaBanMoi) => api.patch(`/thuoctay/${maThuoc}/giaban`, { giaBanMoi }),

  // Tim kiem full-text
  searchThuocTay: (query) => api.get(`/thuoctay/search?q=${encodeURIComponent(query)}`),

  // Loc ket hop nhieu tieu chi
  filterThuocTay: (filters) => {
    const params = new URLSearchParams();
    if (filters.loaiThuoc) params.append('loaiThuoc', filters.loaiThuoc);
    if (filters.nhaSanXuat) params.append('nhaSanXuat', filters.nhaSanXuat);
    if (filters.donVi) params.append('donVi', filters.donVi);
    return api.get(`/thuoctay/filter?${params.toString()}`);
  },

  // Export Excel
  exportExcel: () => api.get('/thuoctay/export/excel', { responseType: 'blob' }),

  // Export PDF
  exportPDF: () => api.get('/thuoctay/export/pdf', { responseType: 'blob' }),

  // Import Excel/CSV
  importFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/thuoctay/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Test connection
  testConnection: testConnection
};

// Authentication API
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email, phone) => api.post('/auth/forgot-password', { email, phone }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  changePassword: (currentPassword, newPassword) => api.post('/auth/change-password', { currentPassword, newPassword }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  verifyPhone: (otp) => api.post('/auth/verify-phone', { otp })
};

// User Management API
export const userAPI = {
  getAllUsers: () => api.get('/users'),
  getUser: (username) => api.get(`/users/${username}`),
  updateUser: (username, data) => api.put(`/users/${username}`, data),
  deleteUser: (username) => api.delete(`/users/${username}`)
};

// Report API
export const reportAPI = {
  getReport: () => api.get('/reports'),
  saveReport: () => api.post('/reports'),
  getReportHistory: () => api.get('/reports/history'),
  getReportById: (reportId) => api.get(`/reports/${reportId}`)
};

export { testConnection };
export default api;

