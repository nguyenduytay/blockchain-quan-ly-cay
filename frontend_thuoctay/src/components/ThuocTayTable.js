import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Badge, Spinner, Row, Col, Card } from 'react-bootstrap';
import { thuoctayAPI } from '../services/api';

function ThuocTayTable() {
  const [thuoctays, setThuoctays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingThuocTay, setEditingThuocTay] = useState(null);
  const [deleteThuocTay, setDeleteThuocTay] = useState(null);
  const [filterLoai, setFilterLoai] = useState('');
  const [filterNhaSanXuat, setFilterNhaSanXuat] = useState('');
  const [formData, setFormData] = useState({
    maThuoc: '',
    tenThuoc: '',
    hoatchat: '',
    nhaSanXuat: '',
    ngaySanXuat: '',
    hanSuDung: '',
    donVi: '',
    soLuong: '',
    giaBan: '',
    loaiThuoc: ''
  });

  // Fetch all thuoc tay
  const fetchThuocTays = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await thuoctayAPI.getAllThuocTay();
      if (response.data.success) {
        setThuoctays(response.data.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching thuoc tay:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThuocTays();
  }, []);

  // Initialize data
  const handleInit = async () => {
    try {
      setLoading(true);
      await thuoctayAPI.initData();
      await fetchThuocTays();
      alert('Đã khởi tạo dữ liệu mẫu thành công!');
    } catch (err) {
      setError(err.message);
      alert('Lỗi khi khởi tạo dữ liệu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Open modal for create/edit
  const handleOpenModal = (thuoctay = null) => {
    if (thuoctay) {
      setEditingThuocTay(thuoctay);
      setFormData({
        maThuoc: thuoctay.Record.maThuoc,
        tenThuoc: thuoctay.Record.tenThuoc,
        hoatchat: thuoctay.Record.hoatchat,
        nhaSanXuat: thuoctay.Record.nhaSanXuat,
        ngaySanXuat: thuoctay.Record.ngaySanXuat,
        hanSuDung: thuoctay.Record.hanSuDung,
        donVi: thuoctay.Record.donVi,
        soLuong: thuoctay.Record.soLuong,
        giaBan: thuoctay.Record.giaBan,
        loaiThuoc: thuoctay.Record.loaiThuoc
      });
    } else {
      setEditingThuocTay(null);
      setFormData({
        maThuoc: '',
        tenThuoc: '',
        hoatchat: '',
        nhaSanXuat: '',
        ngaySanXuat: '',
        hanSuDung: '',
        donVi: '',
        soLuong: '',
        giaBan: '',
        loaiThuoc: ''
      });
    }
    setShowModal(true);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingThuocTay) {
        await thuoctayAPI.updateThuocTay(formData.maThuoc, formData);
      } else {
        await thuoctayAPI.createThuocTay(formData);
      }
      setShowModal(false);
      await fetchThuocTays();
      alert(editingThuocTay ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
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
      await thuoctayAPI.deleteThuocTay(deleteThuocTay.Record.maThuoc);
      setShowDeleteModal(false);
      setDeleteThuocTay(null);
      await fetchThuocTays();
      alert('Xóa thành công!');
    } catch (err) {
      setError(err.message);
      alert('Lỗi khi xóa: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update so luong
  const handleUpdateSoLuong = async (maThuoc) => {
    const soLuongMoi = prompt('Nhập số lượng mới:');
    if (!soLuongMoi) return;
    try {
      setLoading(true);
      await thuoctayAPI.updateSoLuong(maThuoc, parseInt(soLuongMoi));
      await fetchThuocTays();
      alert('Cập nhật số lượng thành công!');
    } catch (err) {
      setError(err.message);
      alert('Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update gia ban
  const handleUpdateGiaBan = async (maThuoc) => {
    const giaBanMoi = prompt('Nhập giá bán mới (VNĐ):');
    if (!giaBanMoi) return;
    try {
      setLoading(true);
      await thuoctayAPI.updateGiaBan(maThuoc, parseFloat(giaBanMoi));
      await fetchThuocTays();
      alert('Cập nhật giá bán thành công!');
    } catch (err) {
      setError(err.message);
      alert('Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter thuoc tay
  const filteredThuocTays = thuoctays.filter(item => {
    const record = item.Record || item;
    const matchLoai = !filterLoai || record.loaiThuoc === filterLoai;
    const matchNhaSanXuat = !filterNhaSanXuat || record.nhaSanXuat === filterNhaSanXuat;
    return matchLoai && matchNhaSanXuat;
  });

  // Get unique values for filters
  const uniqueLoai = [...new Set(thuoctays.map(item => (item.Record || item).loaiThuoc))];
  const uniqueNhaSanXuat = [...new Set(thuoctays.map(item => (item.Record || item).nhaSanXuat))];

  // Check if expired
  const isExpired = (hanSuDung) => {
    if (!hanSuDung) return false;
    const today = new Date();
    const expiryDate = new Date(hanSuDung);
    return expiryDate < today;
  };

  // Statistics
  const stats = {
    total: filteredThuocTays.length,
    totalSoLuong: filteredThuocTays.reduce((sum, item) => sum + parseInt((item.Record || item).soLuong || 0), 0),
    totalGiaTri: filteredThuocTays.reduce((sum, item) => {
      const record = item.Record || item;
      return sum + (parseInt(record.soLuong || 0) * parseFloat(record.giaBan || 0));
    }, 0),
    expiredCount: filteredThuocTays.filter(item => isExpired((item.Record || item).hanSuDung)).length
  };

  return (
    <Container className="my-4">
      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      
      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center stat-card stat-card-primary">
            <Card.Body>
              <div className="stat-icon">📊</div>
              <Card.Title>Tổng số thuốc</Card.Title>
              <Card.Text className="h3 stat-number text-primary">{stats.total}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center stat-card stat-card-success">
            <Card.Body>
              <div className="stat-icon">📦</div>
              <Card.Title>Tổng số lượng</Card.Title>
              <Card.Text className="h3 stat-number text-success">{stats.totalSoLuong.toLocaleString()}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center stat-card stat-card-warning">
            <Card.Body>
              <div className="stat-icon">💰</div>
              <Card.Title>Tổng giá trị (VNĐ)</Card.Title>
              <Card.Text className="h3 stat-number text-warning">{stats.totalGiaTri.toLocaleString()}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center stat-card stat-card-danger">
            <Card.Body>
              <div className="stat-icon">⚠️</div>
              <Card.Title>Thuốc hết hạn</Card.Title>
              <Card.Text className="h3 stat-number text-danger">{stats.expiredCount}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Action Buttons */}
      <div className="mb-4 d-flex gap-2 flex-wrap action-buttons">
        <Button variant="success" onClick={handleInit} className="action-btn">
          <span className="btn-icon">🔄</span> Khởi tạo dữ liệu
        </Button>
        <Button variant="primary" onClick={() => handleOpenModal()} className="action-btn">
          <span className="btn-icon">➕</span> Thêm thuốc mới
        </Button>
        <Button variant="secondary" onClick={fetchThuocTays} className="action-btn">
          <span className="btn-icon">🔄</span> Làm mới
        </Button>
      </div>

      {/* Filters */}
      <Row className="mb-4 filter-section">
        <Col md={6}>
          <Form.Label className="filter-label">🔍 Lọc theo loại thuốc</Form.Label>
          <Form.Select 
            value={filterLoai} 
            onChange={(e) => setFilterLoai(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả loại thuốc</option>
            {uniqueLoai.map(loai => (
              <option key={loai} value={loai}>{loai}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={6}>
          <Form.Label className="filter-label">🏭 Lọc theo nhà sản xuất</Form.Label>
          <Form.Select 
            value={filterNhaSanXuat} 
            onChange={(e) => setFilterNhaSanXuat(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả nhà sản xuất</option>
            {uniqueNhaSanXuat.map(nsx => (
              <option key={nsx} value={nsx}>{nsx}</option>
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
                <th>Mã thuốc</th>
                <th>Tên thuốc</th>
                <th>Hoạt chất</th>
                <th>Nhà sản xuất</th>
                <th>Ngày SX</th>
                <th>Hạn SD</th>
                <th>Đơn vị</th>
                <th>Số lượng</th>
                <th>Giá bán (VNĐ)</th>
                <th>Loại thuốc</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredThuocTays.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center">Không có dữ liệu</td>
                </tr>
              ) : (
                filteredThuocTays.map((item) => {
                  const record = item.Record || item;
                  const expired = isExpired(record.hanSuDung);
                  return (
                    <tr key={record.maThuoc} className={expired ? 'table-danger' : ''}>
                      <td><Badge bg="primary">{record.maThuoc}</Badge></td>
                      <td>{record.tenThuoc}</td>
                      <td>{record.hoatchat}</td>
                      <td>{record.nhaSanXuat}</td>
                      <td>{record.ngaySanXuat}</td>
                      <td>
                        {expired ? (
                          <Badge bg="danger">Hết hạn</Badge>
                        ) : (
                          record.hanSuDung
                        )}
                      </td>
                      <td>{record.donVi}</td>
                      <td>{record.soLuong.toLocaleString()}</td>
                      <td>{record.giaBan.toLocaleString()}</td>
                      <td>{record.loaiThuoc}</td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap action-buttons-row">
                          <Button size="sm" variant="info" onClick={() => handleOpenModal(item)} className="action-btn-sm">
                            ✏️ Sửa
                          </Button>
                          <Button size="sm" variant="warning" onClick={() => handleUpdateSoLuong(record.maThuoc)} className="action-btn-sm">
                            📊 SL
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => handleUpdateGiaBan(record.maThuoc)} className="action-btn-sm">
                            💰 Giá
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => { setDeleteThuocTay(item); setShowDeleteModal(true); }} className="action-btn-sm">
                            🗑️ Xóa
                          </Button>
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
          <Modal.Title>{editingThuocTay ? 'Sửa thuốc tây' : 'Thêm thuốc tây mới'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã thuốc *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.maThuoc}
                    onChange={(e) => setFormData({...formData, maThuoc: e.target.value})}
                    required
                    disabled={!!editingThuocTay}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên thuốc *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.tenThuoc}
                    onChange={(e) => setFormData({...formData, tenThuoc: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hoạt chất *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.hoatchat}
                    onChange={(e) => setFormData({...formData, hoatchat: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nhà sản xuất *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.nhaSanXuat}
                    onChange={(e) => setFormData({...formData, nhaSanXuat: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày sản xuất *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.ngaySanXuat}
                    onChange={(e) => setFormData({...formData, ngaySanXuat: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hạn sử dụng *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.hanSuDung}
                    onChange={(e) => setFormData({...formData, hanSuDung: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Đơn vị *</Form.Label>
                  <Form.Select
                    value={formData.donVi}
                    onChange={(e) => setFormData({...formData, donVi: e.target.value})}
                    required
                  >
                    <option value="">Chọn đơn vị</option>
                    <option value="Viên">Viên</option>
                    <option value="Chai">Chai</option>
                    <option value="Ống">Ống</option>
                    <option value="Gói">Gói</option>
                    <option value="Hộp">Hộp</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Số lượng *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={formData.soLuong}
                    onChange={(e) => setFormData({...formData, soLuong: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá bán (VNĐ) *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.giaBan}
                    onChange={(e) => setFormData({...formData, giaBan: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Loại thuốc *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.loaiThuoc}
                    onChange={(e) => setFormData({...formData, loaiThuoc: e.target.value})}
                    placeholder="Ví dụ: Kháng sinh, Giảm đau, Vitamin..."
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
          Bạn có chắc chắn muốn xóa thuốc tây <strong>{deleteThuocTay?.Record?.tenThuoc}</strong> (Mã: {deleteThuocTay?.Record?.maThuoc})?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Hủy</Button>
          <Button variant="danger" onClick={handleDelete}>Xóa</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ThuocTayTable;

