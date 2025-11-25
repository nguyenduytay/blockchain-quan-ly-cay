import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { authAPI } from '../services/api';
import './Login.css';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authAPI.login(formData.username, formData.password);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        onLogin(response.data.user, response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Đăng nhập thất bại');
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
              <h1 className="login-title">🌳 QLCayTrong</h1>
              <p className="login-subtitle">Hệ Thống Quản Lý Cây Trồng Blockchain</p>
            </div>
            
            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            
            <Form onSubmit={handleSubmit} className="login-form">
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

