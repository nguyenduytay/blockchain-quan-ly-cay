import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Badge, Spinner, Row, Col, Card } from 'react-bootstrap';
import { caytrongAPI } from '../services/api';

function CayTrongTable() {
  const [caytrongs, setCaytrongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCayTrong, setEditingCayTrong] = useState(null);
  const [deleteCayTrong, setDeleteCayTrong] = useState(null);
  const [filterLoai, setFilterLoai] = useState('');
  const [filterGiaiDoan, setFilterGiaiDoan] = useState('');
  const [formData, setFormData] = useState({
    maCay: '',
    tenCay: '',
    loaiCay: '',
    ngayTrong: '',
    giaiDoan: '',
    nangSuat: '',
    dienTich: '',
    viTri: ''
  });

  // Fetch all cay trong
  const fetchCayTrongs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await caytrongAPI.getAllCayTrong();
      if (response.data.success) {
        setCaytrongs(response.data.data);
      }
    } catch (err) {
      setError(err.message);
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching cay trong:', err.message || 'Failed to fetch data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCayTrongs();
  }, []);

  // Initialize data
  const handleInit = async () => {
    try {
      setLoading(true);
      await caytrongAPI.initData();
      await fetchCayTrongs();
      alert('Đã khởi tạo dữ liệu mẫu thành công!');
    } catch (err) {
      setError(err.message);
      alert('Lỗi khi khởi tạo dữ liệu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Open modal for create/edit
  const handleOpenModal = (caytrong = null) => {
    if (caytrong) {
      setEditingCayTrong(caytrong);
      setFormData({
        maCay: caytrong.Record.maCay,
        tenCay: caytrong.Record.tenCay,
        loaiCay: caytrong.Record.loaiCay,
        ngayTrong: caytrong.Record.ngayTrong,
        giaiDoan: caytrong.Record.giaiDoan,
        nangSuat: caytrong.Record.nangSuat,
        dienTich: caytrong.Record.dienTich,
        viTri: caytrong.Record.viTri
      });
    } else {
      setEditingCayTrong(null);
      setFormData({
        maCay: '',
        tenCay: '',
        loaiCay: '',
        ngayTrong: '',
        giaiDoan: '',
        nangSuat: '',
        dienTich: '',
        viTri: ''
      });
    }
    setShowModal(true);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingCayTrong) {
        await caytrongAPI.updateCayTrong(formData.maCay, formData);
      } else {
        await caytrongAPI.createCayTrong(formData);
      }
      setShowModal(false);
      await fetchCayTrongs();
      alert(editingCayTrong ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
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
      await caytrongAPI.deleteCayTrong(deleteCayTrong.Record.maCay);
      setShowDeleteModal(false);
      setDeleteCayTrong(null);
      await fetchCayTrongs();
      alert('Xóa thành công!');
    } catch (err) {
      setError(err.message);
      alert('Lỗi khi xóa: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Change giai doan
  const handleChangeGiaiDoan = async (maCay, giaiDoanMoi) => {
    if (!giaiDoanMoi) {
      giaiDoanMoi = prompt('Nhập giai đoạn mới:');
      if (!giaiDoanMoi) return;
    }
    try {
      setLoading(true);
      await caytrongAPI.changeGiaiDoanCayTrong(maCay, giaiDoanMoi);
      await fetchCayTrongs();
      alert('Chuyển giai đoạn thành công!');
    } catch (err) {
      setError(err.message);
      alert('Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update nang suat
  const handleUpdateNangSuat = async (maCay) => {
    const nangSuatMoi = prompt('Nhập năng suất mới (tấn/ha):');
    if (!nangSuatMoi) return;
    try {
      setLoading(true);
      await caytrongAPI.updateNangSuat(maCay, parseFloat(nangSuatMoi));
      await fetchCayTrongs();
      alert('Cập nhật năng suất thành công!');
    } catch (err) {
      setError(err.message);
      alert('Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter cay trong
  const filteredCayTrongs = caytrongs.filter(item => {
    const record = item.Record || item;
    const matchLoai = !filterLoai || record.loaiCay === filterLoai;
    const matchGiaiDoan = !filterGiaiDoan || record.giaiDoan === filterGiaiDoan;
    return matchLoai && matchGiaiDoan;
  });

  // Get unique values for filters
  const uniqueLoai = [...new Set(caytrongs.map(item => (item.Record || item).loaiCay))];
  const uniqueGiaiDoan = [...new Set(caytrongs.map(item => (item.Record || item).giaiDoan))];

  // Statistics
  const stats = {
    total: filteredCayTrongs.length,
    totalDienTich: filteredCayTrongs.reduce((sum, item) => sum + parseFloat((item.Record || item).dienTich || 0), 0),
    avgNangSuat: filteredCayTrongs.length > 0 
      ? filteredCayTrongs.reduce((sum, item) => sum + parseFloat((item.Record || item).nangSuat || 0), 0) / filteredCayTrongs.length 
      : 0
  };

  return (
    <Container className="my-4">
      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      
      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Tổng số cây trồng</Card.Title>
              <Card.Text className="h3 text-primary">{stats.total}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Tổng diện tích (ha)</Card.Title>
              <Card.Text className="h3 text-success">{stats.totalDienTich.toFixed(2)}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Năng suất TB (tấn/ha)</Card.Title>
              <Card.Text className="h3 text-warning">{stats.avgNangSuat.toFixed(2)}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Action Buttons */}
      <div className="mb-3 d-flex gap-2 flex-wrap">
        <Button variant="success" onClick={handleInit}>Khởi tạo dữ liệu</Button>
        <Button variant="primary" onClick={() => handleOpenModal()}>Thêm cây trồng mới</Button>
        <Button variant="secondary" onClick={fetchCayTrongs}>Làm mới</Button>
      </div>

      {/* Filters */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Select value={filterLoai} onChange={(e) => setFilterLoai(e.target.value)}>
            <option value="">Tất cả loại cây</option>
            {uniqueLoai.map(loai => (
              <option key={loai} value={loai}>{loai}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={6}>
          <Form.Select value={filterGiaiDoan} onChange={(e) => setFilterGiaiDoan(e.target.value)}>
            <option value="">Tất cả giai đoạn</option>
            {uniqueGiaiDoan.map(giaiDoan => (
              <option key={giaiDoan} value={giaiDoan}>{giaiDoan}</option>
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
                <th>Mã cây</th>
                <th>Tên cây</th>
                <th>Loại cây</th>
                <th>Ngày trồng</th>
                <th>Giai đoạn</th>
                <th>Năng suất (tấn/ha)</th>
                <th>Diện tích (ha)</th>
                <th>Vị trí</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCayTrongs.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center">Không có dữ liệu</td>
                </tr>
              ) : (
                filteredCayTrongs.map((item) => {
                  const record = item.Record || item;
                  return (
                    <tr key={record.maCay}>
                      <td><Badge bg="primary">{record.maCay}</Badge></td>
                      <td>{record.tenCay}</td>
                      <td>{record.loaiCay}</td>
                      <td>{record.ngayTrong}</td>
                      <td>
                        <Badge bg={record.giaiDoan === 'Trưởng thành' ? 'success' : 'warning'}>
                          {record.giaiDoan}
                        </Badge>
                      </td>
                      <td>{record.nangSuat}</td>
                      <td>{record.dienTich}</td>
                      <td>{record.viTri}</td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          <Button size="sm" variant="info" onClick={() => handleOpenModal(item)}>Sửa</Button>
                          <Button size="sm" variant="warning" onClick={() => handleChangeGiaiDoan(record.maCay)}>Chuyển giai đoạn</Button>
                          <Button size="sm" variant="secondary" onClick={() => handleUpdateNangSuat(record.maCay)}>Cập nhật năng suất</Button>
                          <Button size="sm" variant="danger" onClick={() => { setDeleteCayTrong(item); setShowDeleteModal(true); }}>Xóa</Button>
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
          <Modal.Title>{editingCayTrong ? 'Sửa cây trồng' : 'Thêm cây trồng mới'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã cây *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.maCay}
                    onChange={(e) => setFormData({...formData, maCay: e.target.value})}
                    required
                    disabled={!!editingCayTrong}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên cây *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.tenCay}
                    onChange={(e) => setFormData({...formData, tenCay: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Loại cây *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.loaiCay}
                    onChange={(e) => setFormData({...formData, loaiCay: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày trồng *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.ngayTrong}
                    onChange={(e) => setFormData({...formData, ngayTrong: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giai đoạn *</Form.Label>
                  <Form.Select
                    value={formData.giaiDoan}
                    onChange={(e) => setFormData({...formData, giaiDoan: e.target.value})}
                    required
                  >
                    <option value="">Chọn giai đoạn</option>
                    <option value="Mới trồng">Mới trồng</option>
                    <option value="Đang phát triển">Đang phát triển</option>
                    <option value="Trưởng thành">Trưởng thành</option>
                    <option value="Thu hoạch">Thu hoạch</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Năng suất (tấn/ha) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={formData.nangSuat}
                    onChange={(e) => setFormData({...formData, nangSuat: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Diện tích (ha) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={formData.dienTich}
                    onChange={(e) => setFormData({...formData, dienTich: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Vị trí *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.viTri}
                    onChange={(e) => setFormData({...formData, viTri: e.target.value})}
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
          Bạn có chắc chắn muốn xóa cây trồng <strong>{deleteCayTrong?.Record?.tenCay}</strong> (Mã: {deleteCayTrong?.Record?.maCay})?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Hủy</Button>
          <Button variant="danger" onClick={handleDelete}>Xóa</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default CayTrongTable;

