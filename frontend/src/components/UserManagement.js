import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Badge, Spinner, Card, Row, Col } from 'react-bootstrap';
import { userAPI } from '../services/api';

function UserManagement({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'user'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userAPI.getAllUsers();
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [currentUser]);

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      const record = user.Record || user;
      setFormData({
        fullName: record.fullName || '',
        email: record.email || '',
        role: record.role || 'user'
      });
    } else {
      setEditingUser(null);
      setFormData({
        fullName: '',
        email: '',
        role: 'user'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const record = editingUser?.Record || editingUser;
      const username = record?.username;
      
      if (!username) {
        throw new Error('Không tìm thấy username');
      }

      await userAPI.updateUser(username, formData);
      setShowModal(false);
      await fetchUsers();
      alert('Cập nhật thành công!');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      alert('Lỗi: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const record = deleteUser?.Record || deleteUser;
      await userAPI.deleteUser(record.username);
      setShowDeleteModal(false);
      setDeleteUser(null);
      await fetchUsers();
      alert('Xóa thành công!');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      alert('Lỗi khi xóa: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <Container className="my-5">
        <Alert variant="warning">
          Chỉ admin mới có quyền truy cập trang này.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <Row className="mb-4">
        <Col>
          <h2>Quản lý người dùng</h2>
          <p className="text-muted">Quản lý tất cả tài khoản trong hệ thống</p>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Danh sách người dùng</h5>
            <Button variant="secondary" onClick={fetchUsers} disabled={loading}>
              Làm mới
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </Spinner>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Tên đăng nhập</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Ngày tạo</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center">Không có dữ liệu</td>
                    </tr>
                  ) : (
                    users.map((item) => {
                      const record = item.Record || item;
                      return (
                        <tr key={record.username}>
                          <td><Badge bg="primary">{record.username}</Badge></td>
                          <td>{record.fullName}</td>
                          <td>{record.email}</td>
                          <td>
                            <Badge bg={record.role === 'admin' ? 'danger' : 'info'}>
                              {record.role === 'admin' ? 'Admin' : 'User'}
                            </Badge>
                          </td>
                          <td>{record.createdAt ? new Date(record.createdAt).toLocaleDateString('vi-VN') : '-'}</td>
                          <td>
                            <Badge bg={record.isActive ? 'success' : 'secondary'}>
                              {record.isActive ? 'Hoạt động' : 'Khóa'}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button size="sm" variant="info" onClick={() => handleOpenModal(item)}>
                                Sửa
                              </Button>
                              {record.username !== currentUser.username && (
                                <Button 
                                  size="sm" 
                                  variant="danger" 
                                  onClick={() => { setDeleteUser(item); setShowDeleteModal(true); }}
                                >
                                  Xóa
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Sửa thông tin người dùng</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
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
              <Form.Label>Vai trò *</Form.Label>
              <Form.Select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button variant="primary" type="submit">Lưu</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa người dùng <strong>{deleteUser?.Record?.fullName || deleteUser?.fullName}</strong> 
          (Username: {deleteUser?.Record?.username || deleteUser?.username})?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Hủy</Button>
          <Button variant="danger" onClick={handleDelete}>Xóa</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default UserManagement;

