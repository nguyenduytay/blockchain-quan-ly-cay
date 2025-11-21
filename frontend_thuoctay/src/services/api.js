import axios from 'axios';

// Su dung proxy trong development de tranh CORS
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3007/api';

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

  // Test connection
  testConnection: testConnection
};

export { testConnection };
export default api;

