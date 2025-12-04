import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col, Tabs, Tab, Badge } from 'react-bootstrap';
import { userAPI, authAPI } from '../services/api';

function AccountPage({ currentUser, onUserUpdate }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.fullName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || ''
      });
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await userAPI.updateUser(currentUser.username, formData);
      setSuccess('Cập nhật thông tin thành công!');
      if (onUserUpdate) {
        onUserUpdate({ ...currentUser, ...formData });
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      await authAPI.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccess('Đổi mật khẩu thành công!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-4">
      <Row className="mb-4">
        <Col>
          <h2>Thông tin tài khoản</h2>
          <p className="text-muted">Quản lý thông tin cá nhân của bạn</p>
        </Col>
      </Row>

      <Row>
        <Col md={8} lg={8}>
          <Tabs defaultActiveKey="profile" className="mb-3">
            <Tab eventKey="profile" title="Thông tin cá nhân">
              <Card>
                <Card.Body>
                  {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
                  {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tên đăng nhập</Form.Label>
                      <Form.Control
                        type="text"
                        value={currentUser?.username || ''}
                        disabled
                        style={{ background: '#f8f9fa' }}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Họ tên *</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Email *</Form.Label>
                      <Form.Control
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Số điện thoại</Form.Label>
                      <Form.Control
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Vai trò</Form.Label>
                      <Form.Control
                        type="text"
                        value={currentUser?.role === 'admin' ? 'Quản trị viên' : 
                               currentUser?.role === 'manager' ? 'Quản lý' : 
                               currentUser?.role === 'guest' ? 'Khách' : 'Người dùng'}
                        disabled
                        style={{ background: '#f8f9fa' }}
                      />
                    </Form.Group>

                    <Button 
                      variant="danger" 
                      type="submit" 
                      disabled={loading}
                      style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', border: 'none' }}
                    >
                      {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="password" title="Đổi mật khẩu">
              <Card>
                <Card.Body>
                  {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
                  {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

                  <Form onSubmit={handleChangePassword}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mật khẩu hiện tại *</Form.Label>
                      <Form.Control
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Mật khẩu mới *</Form.Label>
                      <Form.Control
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        required
                        minLength={6}
                      />
                      <Form.Text className="text-muted">
                        Mật khẩu phải có ít nhất 6 ký tự
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Xác nhận mật khẩu mới *</Form.Label>
                      <Form.Control
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        required
                        minLength={6}
                      />
                    </Form.Group>

                    <Button 
                      variant="danger" 
                      type="submit" 
                      disabled={loading}
                      style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', border: 'none' }}
                    >
                      {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>
        <Col md={4} lg={4}>
          <Card>
            <Card.Header style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', color: 'white' }}>
              <h5 className="mb-0">Thông tin tài khoản</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-3">
                <div style={{ fontSize: '4rem' }}>👤</div>
              </div>
              <p><strong>Username:</strong> {currentUser?.username}</p>
              <p><strong>Họ tên:</strong> {currentUser?.fullName}</p>
              <p><strong>Email:</strong> {currentUser?.email}</p>
              <p><strong>Số điện thoại:</strong> {currentUser?.phone || 'Chưa cập nhật'}</p>
              <p><strong>Vai trò:</strong> 
                <Badge bg={currentUser?.role === 'admin' ? 'danger' : 
                          currentUser?.role === 'manager' ? 'warning' : 
                          currentUser?.role === 'guest' ? 'secondary' : 'info'} className="ms-2">
                  {currentUser?.role === 'admin' ? 'Admin' : 
                   currentUser?.role === 'manager' ? 'Manager' : 
                   currentUser?.role === 'guest' ? 'Guest' : 'User'}
                </Badge>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AccountPage;

