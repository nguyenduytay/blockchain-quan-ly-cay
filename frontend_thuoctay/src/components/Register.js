import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { authAPI } from '../services/api';
import './Login.css';

function Register({ onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'user'
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register({
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role
      });
      
      if (response && response.data && response.data.success) {
        setSuccess('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
        setFormData({
          username: '',
          password: '',
          confirmPassword: '',
          fullName: '',
          email: '',
          phone: '',
          role: 'user'
        });
        
        if (onRegisterSuccess) {
          setTimeout(() => {
            onRegisterSuccess();
          }, 2000);
        }
      } else {
        throw new Error('Phản hồi từ server không hợp lệ');
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Lỗi đăng ký:', err.message || 'Đăng ký thất bại');
      }
      let errorMessage = err.response?.data?.error || err.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      
      if (errorMessage.includes('Peer endorsements do not match') || 
          errorMessage.includes('No valid responses from any peers')) {
        errorMessage = 'Lỗi blockchain: Chaincode chưa được deploy hoặc network chưa chạy. Vui lòng liên hệ quản trị viên để kiểm tra lại.';
      } else if (errorMessage.includes('chaincode') || errorMessage.includes('Chaincode')) {
        errorMessage = 'Lỗi: Chaincode chưa được deploy. Chạy: cd /fabric-samples/test-network && ./network.sh deployCC -ccn thuoctay -ccp ../chaincode_thuoctay/javascript -ccl javascript';
      } else if (errorMessage.includes('network') || errorMessage.includes('channel')) {
        errorMessage = 'Lỗi: Network chưa được khởi động. Chạy: cd /fabric-samples/test-network && ./network.sh up';
      } else if (errorMessage.includes('da ton tai')) {
        errorMessage = `Tên đăng nhập "${formData.username}" đã tồn tại. Vui lòng chọn tên khác.`;
      }
      
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
              <h1 className="login-title">💊 Đăng Ký</h1>
              <p className="login-subtitle">Tạo tài khoản mới</p>
            </div>
            
            {success && (
              <Alert variant="success" className="mt-3">
                {success}
              </Alert>
            )}
            
            {error && (
              <Alert variant="danger" className="mt-3" dismissible onClose={() => setError(null)}>
                <strong>Lỗi đăng ký:</strong> {error}
              </Alert>
            )}
            
            <Form onSubmit={handleSubmit} className="login-form" noValidate>
              <Form.Group className="mb-3">
                <Form.Label>Tên đăng nhập *</Form.Label>
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
                <Form.Label>Họ tên *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập họ tên"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Nhập email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Số điện thoại</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="Nhập số điện thoại (tùy chọn)"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
                <Form.Text className="text-muted">
                  Số điện thoại để xác thực và reset mật khẩu
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu *</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  minLength={6}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Xác nhận mật khẩu *</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                  minLength={6}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Vai trò</Form.Label>
                <Form.Select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="user">Người dùng</option>
                  <option value="manager">Quản lý</option>
                  <option value="admin">Quản trị viên</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  Chọn "Quản trị viên" nếu bạn muốn có quyền quản lý toàn bộ hệ thống
                </Form.Text>
              </Form.Group>

              <Button 
                variant="danger" 
                type="submit" 
                className="w-100 login-button"
                disabled={loading}
                style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', border: 'none' }}
              >
                {loading ? 'Đang đăng ký...' : 'Đăng ký'}
              </Button>
            </Form>

            <div className="login-footer">
              <p className="text-muted small">
                Đã có tài khoản? <Link to="/login" style={{ color: '#FF6B6B' }}>Đăng nhập ngay</Link>
              </p>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Register;

