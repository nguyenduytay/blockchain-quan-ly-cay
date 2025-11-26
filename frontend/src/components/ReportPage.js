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
    let csv = 'BÁO CÁO QUẢN LÝ CÂY TRỒNG\n\n';
    csv += `Ngày tạo: ${new Date(report.generatedAt).toLocaleString('vi-VN')}\n`;
    csv += `Người tạo: ${report.generatedBy}\n\n`;
    
    csv += 'THỐNG KÊ TỔNG QUAN\n';
    csv += `Tổng số cây trồng,${stats.totalCayTrong}\n`;
    csv += `Tổng diện tích (ha),${stats.totalDienTich.toFixed(2)}\n`;
    csv += `Năng suất trung bình (tấn/ha),${stats.avgNangSuat.toFixed(2)}\n\n`;
    
    csv += 'THỐNG KÊ THEO LOẠI CÂY\n';
    csv += 'Loại cây,Số lượng,Diện tích (ha)\n';
    Object.entries(stats.byLoaiCay).forEach(([loai, data]) => {
      csv += `${loai},${data.count},${data.dienTich.toFixed(2)}\n`;
    });
    
    csv += '\nTHỐNG KÊ THEO GIAI ĐOẠN\n';
    csv += 'Giai đoạn,Số lượng\n';
    Object.entries(stats.byGiaiDoan).forEach(([giaiDoan, count]) => {
      csv += `${giaiDoan},${count}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bao-cao-cay-trong-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  useEffect(() => {
    generateReport();
  }, []);

  return (
    <Container className="my-4">
      <Row className="mb-4">
        <Col>
          <h2>Báo cáo & Thống kê</h2>
          <p className="text-muted">Xem báo cáo chi tiết về tình hình cây trồng</p>
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
                  <div className="stat-icon">🌳</div>
                  <Card.Title className="stat-value">{report.statistics.totalCayTrong}</Card.Title>
                  <Card.Text className="stat-label">Tổng số cây trồng</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="stat-card stat-success">
                <Card.Body>
                  <div className="stat-icon">📏</div>
                  <Card.Title className="stat-value">{report.statistics.totalDienTich.toFixed(2)}</Card.Title>
                  <Card.Text className="stat-label">Tổng diện tích (ha)</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="stat-card stat-warning">
                <Card.Body>
                  <div className="stat-icon">📊</div>
                  <Card.Title className="stat-value">{report.statistics.avgNangSuat.toFixed(2)}</Card.Title>
                  <Card.Text className="stat-label">Năng suất TB (tấn/ha)</Card.Text>
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
                  <h5 className="mb-0">Thống kê theo loại cây</h5>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Loại cây</th>
                        <th>Số lượng</th>
                        <th>Diện tích (ha)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(report.statistics.byLoaiCay).map(([loai, data]) => (
                        <tr key={loai}>
                          <td><Badge bg="primary">{loai}</Badge></td>
                          <td>{data.count}</td>
                          <td>{data.dienTich.toFixed(2)}</td>
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
                  <h5 className="mb-0">Thống kê theo giai đoạn</h5>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Giai đoạn</th>
                        <th>Số lượng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(report.statistics.byGiaiDoan).map(([giaiDoan, count]) => (
                        <tr key={giaiDoan}>
                          <td>
                            <Badge bg={giaiDoan === 'Trưởng thành' ? 'success' : 'warning'}>
                              {giaiDoan}
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

          {/* Statistics by Location */}
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Thống kê theo vị trí</h5>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Vị trí</th>
                        <th>Số lượng cây trồng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(report.statistics.byViTri).map(([viTri, count]) => (
                        <tr key={viTri}>
                          <td><Badge bg="info">{viTri}</Badge></td>
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

