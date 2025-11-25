import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { userAPI } from '../services/api';

function AccountPage({ currentUser, onUserUpdate }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.fullName || '',
        email: currentUser.email || ''
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
      // Update current user info
      if (onUserUpdate) {
        onUserUpdate({ ...currentUser, ...formData });
      }
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
        <Col md={8} lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Cập nhật thông tin</h5>
            </Card.Header>
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
                    className="bg-light"
                  />
                  <Form.Text className="text-muted">
                    Tên đăng nhập không thể thay đổi
                  </Form.Text>
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
                  <Form.Label>Vai trò</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentUser?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                    disabled
                    className="bg-light"
                  />
                </Form.Group>

                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} lg={6}>
          <Card className="bg-primary text-white">
            <Card.Body>
              <h5>Thông tin tài khoản</h5>
              <hr className="bg-white" />
              <p><strong>Username:</strong> {currentUser?.username}</p>
              <p><strong>Họ tên:</strong> {currentUser?.fullName}</p>
              <p><strong>Email:</strong> {currentUser?.email}</p>
              <p><strong>Vai trò:</strong> {currentUser?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AccountPage;

