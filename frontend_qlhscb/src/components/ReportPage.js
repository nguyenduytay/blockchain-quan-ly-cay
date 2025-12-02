import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Spinner, Alert, Table, Badge } from 'react-bootstrap';
import { reportAPI } from '../services/api';
import './ReportPage.css';

function ReportPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportAPI.getReport();
      if (response.data.success) {
        setReport(response.data.report);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      if (process.env.NODE_ENV === 'development') {
        console.error('Error generating report:', err.message || 'Failed to generate report');
      }
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!report) return;

    const stats = report.statistics;
    let csv = 'BÁO CÁO QUẢN LÝ HỒ SƠ CÁN BỘ\n\n';
    csv += `Ngày tạo: ${new Date(report.generatedAt).toLocaleString('vi-VN')}\n`;
    csv += `Người tạo: ${report.generatedBy}\n\n`;
    
    csv += 'THỐNG KÊ TỔNG QUAN\n';
    csv += `Tổng số cán bộ,${stats.totalCanBo}\n`;
    csv += `Tổng lương (VND),${stats.totalLuong.toFixed(0)}\n`;
    csv += `Lương trung bình (VND),${stats.avgLuong.toFixed(0)}\n\n`;
    
    csv += 'THỐNG KÊ THEO PHÒNG BAN\n';
    csv += 'Phòng ban,Số lượng,Tổng lương (VND)\n';
    Object.entries(stats.byPhongBan).forEach(([phongBan, data]) => {
      csv += `${phongBan},${data.count},${data.totalLuong.toFixed(0)}\n`;
    });
    
    csv += '\nTHỐNG KÊ THEO CHỨC VỤ\n';
    csv += 'Chức vụ,Số lượng\n';
    Object.entries(stats.byChucVu).forEach(([chucVu, count]) => {
      csv += `${chucVu},${count}\n`;
    });

    csv += '\nTHỐNG KÊ THEO TRÌNH ĐỘ\n';
    csv += 'Trình độ,Số lượng\n';
    Object.entries(stats.byTrinhDo).forEach(([trinhDo, count]) => {
      csv += `${trinhDo},${count}\n`;
    });

    csv += '\nTHỐNG KÊ THEO GIỚI TÍNH\n';
    csv += 'Giới tính,Số lượng\n';
    Object.entries(stats.byGioiTinh).forEach(([gioiTinh, count]) => {
      csv += `${gioiTinh},${count}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bao-cao-ho-so-can-bo-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  useEffect(() => {
    generateReport();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <Container className="my-4">
      <Row className="mb-4">
        <Col>
          <h2>Báo cáo & Thống kê</h2>
          <p className="text-muted">Xem báo cáo chi tiết về tình hình nhân sự</p>
        </Col>
        <Col xs="auto">
          <div className="d-flex gap-2">
            <Button variant="primary" onClick={generateReport} disabled={loading}>
              {loading ? 'Đang tạo...' : 'Làm mới báo cáo'}
            </Button>
            {report && (
              <Button variant="success" onClick={exportToCSV}>
                Xuất CSV
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
        </div>
      ) : report ? (
        <>
          {/* Summary Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="stat-card stat-primary">
                <Card.Body>
                  <div className="stat-icon">👥</div>
                  <Card.Title className="stat-value">{report.statistics.totalCanBo}</Card.Title>
                  <Card.Text className="stat-label">Tổng số cán bộ</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="stat-card stat-success">
                <Card.Body>
                  <div className="stat-icon">💰</div>
                  <Card.Title className="stat-value">{formatCurrency(report.statistics.totalLuong)}</Card.Title>
                  <Card.Text className="stat-label">Tổng lương</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="stat-card stat-warning">
                <Card.Body>
                  <div className="stat-icon">📊</div>
                  <Card.Title className="stat-value">{formatCurrency(report.statistics.avgLuong)}</Card.Title>
                  <Card.Text className="stat-label">Lương TB</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="stat-card stat-info">
                <Card.Body>
                  <div className="stat-icon">📅</div>
                  <Card.Title className="stat-value">
                    {new Date(report.generatedAt).toLocaleDateString('vi-VN')}
                  </Card.Title>
                  <Card.Text className="stat-label">Ngày tạo báo cáo</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Statistics by Category */}
          <Row className="mb-4">
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Thống kê theo phòng ban</h5>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Phòng ban</th>
                        <th>Số lượng</th>
                        <th>Tổng lương</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(report.statistics.byPhongBan).map(([phongBan, data]) => (
                        <tr key={phongBan}>
                          <td><Badge bg="primary">{phongBan}</Badge></td>
                          <td>{data.count}</td>
                          <td>{formatCurrency(data.totalLuong)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Thống kê theo chức vụ</h5>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Chức vụ</th>
                        <th>Số lượng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(report.statistics.byChucVu).map(([chucVu, count]) => (
                        <tr key={chucVu}>
                          <td>
                            <Badge bg={chucVu === 'Trưởng phòng' ? 'success' : 'info'}>
                              {chucVu}
                            </Badge>
                          </td>
                          <td>{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Statistics by Trinh Do and Gioi Tinh */}
          <Row className="mb-4">
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Thống kê theo trình độ</h5>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Trình độ</th>
                        <th>Số lượng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(report.statistics.byTrinhDo).map(([trinhDo, count]) => (
                        <tr key={trinhDo}>
                          <td><Badge bg="info">{trinhDo}</Badge></td>
                          <td>{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Thống kê theo giới tính</h5>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Giới tính</th>
                        <th>Số lượng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(report.statistics.byGioiTinh).map(([gioiTinh, count]) => (
                        <tr key={gioiTinh}>
                          <td><Badge bg="info">{gioiTinh}</Badge></td>
                          <td>{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Report Info */}
          <Card className="bg-light">
            <Card.Body>
              <p className="mb-0">
                <strong>Báo cáo được tạo bởi:</strong> {report.generatedBy} | 
                <strong> Thời gian:</strong> {new Date(report.generatedAt).toLocaleString('vi-VN')}
              </p>
            </Card.Body>
          </Card>
        </>
      ) : (
        <Alert variant="info">
          Chưa có dữ liệu báo cáo. Vui lòng tạo báo cáo mới.
        </Alert>
      )}
    </Container>
  );
}

export default ReportPage;

