import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { authAPI, testConnection } from '../services/api';
import './Login.css';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);

  // Test API connection on mount
  useEffect(() => {
    const checkApi = async () => {
      const result = await testConnection();
      setApiStatus(result);
    };
    checkApi();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setLoading(true);

    try {
      const response = await authAPI.login(formData.username, formData.password);
      
      if (response && response.data && response.data.success) {
        // Lưu token và user vào localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Gọi callback onLogin
        onLogin(response.data.user, response.data.token);
      } else {
        throw new Error('Phản hồi từ server không hợp lệ');
      }
    } catch (err) {
      // Chỉ log error message, không log toàn bộ error object
      if (process.env.NODE_ENV === 'development') {
        console.error('Lỗi đăng nhập:', err.message || 'Đăng nhập thất bại');
      }
      const errorMessage = err.response?.data?.error || err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Container className="login-container">
        <Card className="login-card">
          <Card.Body>
            <div className="login-header">
              <h1 className="login-title">👔 QLHoSoCanBo</h1>
              <p className="login-subtitle">Hệ Thống Quản Lý Hồ Sơ Cán Bộ Blockchain</p>
            </div>
            
            {apiStatus && !apiStatus.success && (
              <Alert variant="warning" className="mt-3">
                <strong>Cảnh báo:</strong> {apiStatus.error || 'Không thể kết nối đến API server. Vui lòng kiểm tra backend có đang chạy không.'}
              </Alert>
            )}
            
            {error && (
              <Alert variant="danger" className="mt-3" dismissible onClose={() => setError(null)}>
                <strong>Lỗi đăng nhập:</strong> {error}
                {error.includes('không tồn tại') && (
                  <div className="mt-3">
                    <p className="mb-2"><strong>Giải pháp:</strong> Bạn cần tạo tài khoản trước.</p>
                    <p className="mb-2">Chạy lệnh sau trên server (VMHyper):</p>
                    <div className="bg-dark text-light p-3 rounded" style={{fontSize: '0.85rem'}}>
                      <code style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>
{`curl -X POST http://192.168.80.10:3007/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "admin",
    "password": "admin123",
    "fullName": "Administrator",
    "email": "admin@example.com",
    "role": "admin"
  }'`}
                      </code>
                    </div>
                    <p className="mt-2 mb-0"><small>Sau khi tạo thành công, bạn có thể đăng nhập với username và password trên.</small></p>
                  </div>
                )}
              </Alert>
            )}
            
            <Form onSubmit={handleSubmit} className="login-form" noValidate>
              <Form.Group className="mb-3">
                <Form.Label>Tên đăng nhập</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                  autoFocus
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </Form.Group>

              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 login-button"
                disabled={loading}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </Form>

            <div className="login-footer">
              <p className="text-muted small">
                Chưa có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); if (window.showRegister) window.showRegister(); }}>Đăng ký ngay</a>
              </p>
              <p className="text-muted small mt-2">
                Powered by Hyperledger Fabric & React.js
              </p>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Login;

