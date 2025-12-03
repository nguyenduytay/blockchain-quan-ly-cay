import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { authAPI } from '../services/api';
import './Login.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword(email);
      if (response.data.success) {
        setSuccess('Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.');
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
                Nhập email của bạn để nhận link đặt lại mật khẩu
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
                    required
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? 'Đang gửi...' : 'Gửi email đặt lại mật khẩu'}
                </Button>
              </Form>

              <div className="text-center">
                <a href="/login">Quay lại đăng nhập</a>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
}

export default ForgotPassword;

