import axios from 'axios';

// Su dung proxy trong development de tranh CORS
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.80.10:3006/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor - Add token và log requests
api.interceptors.request.use(
  (config) => {
    // Add token to requests
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request (chỉ trong development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 API Call: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses và errors
api.interceptors.response.use(
  (response) => {
    // Log success (chỉ trong development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Success: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error);
    
    // Handle 401/403 errors - Unauthorized
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Chỉ redirect nếu không phải đang ở trang login
      if (!window.location.pathname.includes('/login') && !window.location.pathname === '/') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Không redirect ngay, để component tự xử lý
      }
    }
    
    // Format error message
    if (error.code === 'ECONNREFUSED') {
      error.message = 'Không thể kết nối đến server. Kiểm tra xem API server có đang chạy không?';
    } else if (error.message.includes('Network Error') || error.code === 'ERR_NETWORK') {
      error.message = 'Lỗi kết nối mạng. Kiểm tra kết nối internet và server.';
    } else if (error.response) {
      // Server tra ve loi HTTP
      const errorMsg = error.response.data?.error || error.response.data?.message || error.response.statusText;
      error.message = errorMsg;
    } else if (error.request) {
      // Request duoc gui nhung khong nhan duoc response
      error.message = 'Không nhận được phản hồi từ server.';
    }
    
    return Promise.reject(error);
  }
);

// Test ket noi den server
const testConnection = async () => {
  try {
    const healthUrl = API_BASE_URL.replace('/api', '/health');
    const response = await axios.get(healthUrl, { timeout: 5000 });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      details: 'Hãy chắc chắn rằng API server đang chạy trên port 3006'
    };
  }
};

// API Service
export const caytrongAPI = {
  // Khoi tao du lieu
  initData: () => api.post('/init'),
  
  // Lay tat ca cay trong
  getAllCayTrong: () => api.get('/caytrong'),
  
  // Lay cay trong theo ma
  getCayTrongByMa: (maCay) => api.get(`/caytrong/${maCay}`),
  
  // Tao cay trong moi
  createCayTrong: (data) => api.post('/caytrong', data),
  
  // Cap nhat cay trong
  updateCayTrong: (maCay, data) => api.put(`/caytrong/${maCay}`, data),
  
  // Xoa cay trong
  deleteCayTrong: (maCay) => api.delete(`/caytrong/${maCay}`),
  
  // Tim cay trong theo loai
  getCayTrongByLoai: (loaiCay) => api.get(`/caytrong/loai/${loaiCay}`),
  
  // Tim cay trong theo giai doan
  getCayTrongByGiaiDoan: (giaiDoan) => api.get(`/caytrong/giaidoan/${giaiDoan}`),
  
  // Chuyen giai doan cay trong
  changeGiaiDoanCayTrong: (maCay, giaiDoanMoi) => api.patch(`/caytrong/${maCay}/chuyengiaidoan`, { giaiDoanMoi }),
  
  // Cap nhat nang suat
  updateNangSuat: (maCay, nangSuatMoi) => api.patch(`/caytrong/${maCay}/nangsuat`, { nangSuatMoi }),

  // Test connection
  testConnection: testConnection
};

// Authentication API
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me')
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
  getReport: () => api.get('/reports')
};

export { testConnection };
export default api;

