import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { authAPI } from '../services/api';
import './Login.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!email && !phone) {
      setError('Vui lòng nhập email hoặc số điện thoại');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.forgotPassword(email || undefined, phone || undefined);
      if (response.data.success) {
        setSuccess('Email/SMS đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư hoặc tin nhắn của bạn.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Container>
        <div className="login-wrapper">
          <Card className="login-card">
            <Card.Body>
              <h2 className="text-center mb-4">Quên mật khẩu</h2>
              <p className="text-muted text-center mb-4">
                Nhập email hoặc số điện thoại của bạn để nhận link đặt lại mật khẩu
              </p>

              {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
              {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
                  />
                </Form.Group>

                <div className="text-center mb-3">
                  <span className="text-muted">HOẶC</span>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại của bạn"
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 mb-3"
                  disabled={loading}
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                >
                  {loading ? 'Đang gửi...' : 'Gửi yêu cầu đặt lại mật khẩu'}
                </Button>
              </Form>

              <div className="text-center">
                <a href="/login" style={{ color: '#667eea' }}>Quay lại đăng nhập</a>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
}

export default ForgotPassword;

