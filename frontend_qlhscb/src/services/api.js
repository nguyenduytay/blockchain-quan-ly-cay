import axios from 'axios';

// Su dung proxy trong development de tranh CORS
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.80.10:3007/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor de log requests
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Call: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor de xu ly loi
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      error.message = 'Không thể kết nối đến server. Kiểm tra xem API server có đang chạy không?';
    } else if (error.message.includes('Network Error')) {
      error.message = 'Lỗi kết nối mạng. Kiểm tra kết nối internet và server.';
    } else if (error.response) {
      // Server tra ve loi HTTP
      error.message = `Server error: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`;
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
    const response = await axios.get(API_BASE_URL.replace('/api', '/health'));
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      details: 'Hãy chắc chắn rằng API server đang chạy trên port 3007'
    };
  }
};

// API Service
export const hosocanboAPI = {
  // Khoi tao du lieu
  initData: () => api.post('/init'),
  
  // Lay tat ca ho so can bo
  getAllHoSoCanBo: () => api.get('/hosocanbo'),
  
  // Lay ho so can bo theo ma
  getHoSoCanBoByMa: (maCanBo) => api.get(`/hosocanbo/${maCanBo}`),
  
  // Tao ho so can bo moi
  createHoSoCanBo: (data) => api.post('/hosocanbo', data),
  
  // Cap nhat ho so can bo
  updateHoSoCanBo: (maCanBo, data) => api.put(`/hosocanbo/${maCanBo}`, data),
  
  // Xoa ho so can bo
  deleteHoSoCanBo: (maCanBo) => api.delete(`/hosocanbo/${maCanBo}`),
  
  // Tim ho so can bo theo phong ban
  getHoSoCanBoByPhongBan: (phongBan) => api.get(`/hosocanbo/phongban/${phongBan}`),
  
  // Tim ho so can bo theo chuc vu
  getHoSoCanBoByChucVu: (chucVu) => api.get(`/hosocanbo/chucvu/${chucVu}`),
  
  // Thay doi chuc vu can bo
  changeChucVu: (maCanBo, chucVuMoi) => api.patch(`/hosocanbo/${maCanBo}/thaydoichucvu`, { chucVuMoi }),
  
  // Cap nhat luong
  updateLuong: (maCanBo, luongMoi) => api.patch(`/hosocanbo/${maCanBo}/luong`, { luongMoi }),

  // Test connection
  testConnection: testConnection
};

export { testConnection };
export default api;

