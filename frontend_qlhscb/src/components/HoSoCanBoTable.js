import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Badge, Spinner, Row, Col, Card } from 'react-bootstrap';
import { hosocanboAPI } from '../services/api';

function HoSoCanBoTable() {
  const [hosocanbos, setHoSoCanBos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingHoSoCanBo, setEditingHoSoCanBo] = useState(null);
  const [deleteHoSoCanBo, setDeleteHoSoCanBo] = useState(null);
  const [filterPhongBan, setFilterPhongBan] = useState('');
  const [filterChucVu, setFilterChucVu] = useState('');
  const [formData, setFormData] = useState({
    maCanBo: '',
    hoTen: '',
    ngaySinh: '',
    gioiTinh: '',
    chucVu: '',
    phongBan: '',
    ngayVaoLam: '',
    trinhDo: '',
    luong: '',
    diaChi: ''
  });

  // Fetch all ho so can bo
  const fetchHoSoCanBos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await hosocanboAPI.getAllHoSoCanBo();
      if (response.data.success) {
        setHoSoCanBos(response.data.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching ho so can bo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoSoCanBos();
  }, []);

  // Initialize data
  const handleInit = async () => {
    try {
      setLoading(true);
      await hosocanboAPI.initData();
      await fetchHoSoCanBos();
      alert('Đã khởi tạo dữ liệu mẫu thành công!');
    } catch (err) {
      setError(err.message);
      alert('Lỗi khi khởi tạo dữ liệu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Open modal for create/edit
  const handleOpenModal = (hosocanbo = null) => {
    if (hosocanbo) {
      setEditingHoSoCanBo(hosocanbo);
      setFormData({
        maCanBo: hosocanbo.Record.maCanBo,
        hoTen: hosocanbo.Record.hoTen,
        ngaySinh: hosocanbo.Record.ngaySinh,
        gioiTinh: hosocanbo.Record.gioiTinh,
        chucVu: hosocanbo.Record.chucVu,
        phongBan: hosocanbo.Record.phongBan,
        ngayVaoLam: hosocanbo.Record.ngayVaoLam,
        trinhDo: hosocanbo.Record.trinhDo,
        luong: hosocanbo.Record.luong,
        diaChi: hosocanbo.Record.diaChi
      });
    } else {
      setEditingHoSoCanBo(null);
      setFormData({
        maCanBo: '',
        hoTen: '',
        ngaySinh: '',
        gioiTinh: '',
        chucVu: '',
        phongBan: '',
        ngayVaoLam: '',
        trinhDo: '',
        luong: '',
        diaChi: ''
      });
    }
    setShowModal(true);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingHoSoCanBo) {
        await hosocanboAPI.updateHoSoCanBo(formData.maCanBo, formData);
      } else {
        await hosocanboAPI.createHoSoCanBo(formData);
      }
      setShowModal(false);
      await fetchHoSoCanBos();
      alert(editingHoSoCanBo ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
    } catch (err) {
      setError(err.message);
      alert('Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      setLoading(true);
      await hosocanboAPI.deleteHoSoCanBo(deleteHoSoCanBo.Record.maCanBo);
      setShowDeleteModal(false);
      setDeleteHoSoCanBo(null);
      await fetchHoSoCanBos();
      alert('Xóa thành công!');
    } catch (err) {
      setError(err.message);
      alert('Lỗi khi xóa: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Change chuc vu
  const handleChangeChucVu = async (maCanBo, chucVuMoi) => {
    if (!chucVuMoi) {
      chucVuMoi = prompt('Nhập chức vụ mới:');
      if (!chucVuMoi) return;
    }
    try {
      setLoading(true);
      await hosocanboAPI.changeChucVu(maCanBo, chucVuMoi);
      await fetchHoSoCanBos();
      alert('Thay đổi chức vụ thành công!');
    } catch (err) {
      setError(err.message);
      alert('Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update luong
  const handleUpdateLuong = async (maCanBo) => {
    const luongMoi = prompt('Nhập lương mới (VND):');
    if (!luongMoi) return;
    try {
      setLoading(true);
      await hosocanboAPI.updateLuong(maCanBo, parseFloat(luongMoi));
      await fetchHoSoCanBos();
      alert('Cập nhật lương thành công!');
    } catch (err) {
      setError(err.message);
      alert('Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter ho so can bo
  const filteredHoSoCanBos = hosocanbos.filter(item => {
    const record = item.Record || item;
    const matchPhongBan = !filterPhongBan || record.phongBan === filterPhongBan;
    const matchChucVu = !filterChucVu || record.chucVu === filterChucVu;
    return matchPhongBan && matchChucVu;
  });

  // Get unique values for filters
  const uniquePhongBan = [...new Set(hosocanbos.map(item => (item.Record || item).phongBan))];
  const uniqueChucVu = [...new Set(hosocanbos.map(item => (item.Record || item).chucVu))];

  // Statistics
  const stats = {
    total: filteredHoSoCanBos.length,
    totalLuong: filteredHoSoCanBos.reduce((sum, item) => sum + parseFloat((item.Record || item).luong || 0), 0),
    avgLuong: filteredHoSoCanBos.length > 0 
      ? filteredHoSoCanBos.reduce((sum, item) => sum + parseFloat((item.Record || item).luong || 0), 0) / filteredHoSoCanBos.length 
      : 0
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <Container className="my-4">
      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      
      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Tổng số cán bộ</Card.Title>
              <Card.Text className="h3 text-primary">{stats.total}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Tổng lương</Card.Title>
              <Card.Text className="h3 text-success">{formatCurrency(stats.totalLuong)}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Lương TB</Card.Title>
              <Card.Text className="h3 text-warning">{formatCurrency(stats.avgLuong)}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Action Buttons */}
      <div className="mb-3 d-flex gap-2 flex-wrap">
        <Button variant="success" onClick={handleInit}>Khởi tạo dữ liệu</Button>
        <Button variant="primary" onClick={() => handleOpenModal()}>Thêm hồ sơ mới</Button>
        <Button variant="secondary" onClick={fetchHoSoCanBos}>Làm mới</Button>
      </div>

      {/* Filters */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Select value={filterPhongBan} onChange={(e) => setFilterPhongBan(e.target.value)}>
            <option value="">Tất cả phòng ban</option>
            {uniquePhongBan.map(phongBan => (
              <option key={phongBan} value={phongBan}>{phongBan}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={6}>
          <Form.Select value={filterChucVu} onChange={(e) => setFilterChucVu(e.target.value)}>
            <option value="">Tất cả chức vụ</option>
            {uniqueChucVu.map(chucVu => (
              <option key={chucVu} value={chucVu}>{chucVu}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Table */}
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
                <th>Mã CB</th>
                <th>Họ tên</th>
                <th>Ngày sinh</th>
                <th>Giới tính</th>
                <th>Chức vụ</th>
                <th>Phòng ban</th>
                <th>Ngày vào làm</th>
                <th>Trình độ</th>
                <th>Lương</th>
                <th>Địa chỉ</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredHoSoCanBos.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center">Không có dữ liệu</td>
                </tr>
              ) : (
                filteredHoSoCanBos.map((item) => {
                  const record = item.Record || item;
                  return (
                    <tr key={record.maCanBo}>
                      <td><Badge bg="primary">{record.maCanBo}</Badge></td>
                      <td>{record.hoTen}</td>
                      <td>{record.ngaySinh}</td>
                      <td>{record.gioiTinh}</td>
                      <td>
                        <Badge bg={record.chucVu === 'Trưởng phòng' ? 'success' : 'info'}>
                          {record.chucVu}
                        </Badge>
                      </td>
                      <td>{record.phongBan}</td>
                      <td>{record.ngayVaoLam}</td>
                      <td>{record.trinhDo}</td>
                      <td>{formatCurrency(record.luong)}</td>
                      <td>{record.diaChi}</td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          <Button size="sm" variant="info" onClick={() => handleOpenModal(item)}>Sửa</Button>
                          <Button size="sm" variant="warning" onClick={() => handleChangeChucVu(record.maCanBo)}>Thay đổi chức vụ</Button>
                          <Button size="sm" variant="secondary" onClick={() => handleUpdateLuong(record.maCanBo)}>Cập nhật lương</Button>
                          <Button size="sm" variant="danger" onClick={() => { setDeleteHoSoCanBo(item); setShowDeleteModal(true); }}>Xóa</Button>
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

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingHoSoCanBo ? 'Sửa hồ sơ cán bộ' : 'Thêm hồ sơ cán bộ mới'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã cán bộ *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.maCanBo}
                    onChange={(e) => setFormData({...formData, maCanBo: e.target.value})}
                    required
                    disabled={!!editingHoSoCanBo}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Họ tên *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.hoTen}
                    onChange={(e) => setFormData({...formData, hoTen: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày sinh *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.ngaySinh}
                    onChange={(e) => setFormData({...formData, ngaySinh: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giới tính *</Form.Label>
                  <Form.Select
                    value={formData.gioiTinh}
                    onChange={(e) => setFormData({...formData, gioiTinh: e.target.value})}
                    required
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Chức vụ *</Form.Label>
                  <Form.Select
                    value={formData.chucVu}
                    onChange={(e) => setFormData({...formData, chucVu: e.target.value})}
                    required
                  >
                    <option value="">Chọn chức vụ</option>
                    <option value="Trưởng phòng">Trưởng phòng</option>
                    <option value="Phó phòng">Phó phòng</option>
                    <option value="Nhân viên">Nhân viên</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phòng ban *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.phongBan}
                    onChange={(e) => setFormData({...formData, phongBan: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày vào làm *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.ngayVaoLam}
                    onChange={(e) => setFormData({...formData, ngayVaoLam: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Trình độ *</Form.Label>
                  <Form.Select
                    value={formData.trinhDo}
                    onChange={(e) => setFormData({...formData, trinhDo: e.target.value})}
                    required
                  >
                    <option value="">Chọn trình độ</option>
                    <option value="Trung cấp">Trung cấp</option>
                    <option value="Cao đẳng">Cao đẳng</option>
                    <option value="Đại học">Đại học</option>
                    <option value="Thạc sĩ">Thạc sĩ</option>
                    <option value="Tiến sĩ">Tiến sĩ</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Lương (VND) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="100000"
                    value={formData.luong}
                    onChange={(e) => setFormData({...formData, luong: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Địa chỉ *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.diaChi}
                    onChange={(e) => setFormData({...formData, diaChi: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
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
          Bạn có chắc chắn muốn xóa hồ sơ cán bộ <strong>{deleteHoSoCanBo?.Record?.hoTen}</strong> (Mã: {deleteHoSoCanBo?.Record?.maCanBo})?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Hủy</Button>
          <Button variant="danger" onClick={handleDelete}>Xóa</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default HoSoCanBoTable;

