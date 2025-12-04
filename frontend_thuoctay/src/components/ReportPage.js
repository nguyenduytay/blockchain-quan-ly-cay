import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Spinner, Alert, Table, Badge } from 'react-bootstrap';
import { reportAPI, thuoctayAPI } from '../services/api';
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
    let csv = 'BÁO CÁO QUẢN LÝ THUỐC TÂY\n\n';
    csv += `Ngày tạo: ${new Date(report.generatedAt).toLocaleString('vi-VN')}\n`;
    csv += `Người tạo: ${report.generatedBy}\n\n`;
    
    csv += 'THỐNG KÊ TỔNG QUAN\n';
    csv += `Tổng số thuốc,${stats.totalThuocTay}\n`;
    csv += `Tổng số lượng,${stats.totalSoLuong}\n`;
    csv += `Tổng giá trị (VND),${stats.totalGiaTri.toLocaleString('vi-VN')}\n\n`;
    
    csv += 'THỐNG KÊ THEO LOẠI THUỐC\n';
    csv += 'Loại thuốc,Số lượng,Số lượng tổng\n';
    Object.entries(stats.byLoaiThuoc).forEach(([loai, data]) => {
      csv += `${loai},${data.count},${data.soLuong}\n`;
    });
    
    csv += '\nTHỐNG KÊ THEO NHÀ SẢN XUẤT\n';
    csv += 'Nhà sản xuất,Số lượng\n';
    Object.entries(stats.byNhaSanXuat).forEach(([nhaSanXuat, count]) => {
      csv += `${nhaSanXuat},${count}\n`;
    });

    csv += '\nTHỐNG KÊ THEO ĐƠN VỊ\n';
    csv += 'Đơn vị,Số lượng\n';
    Object.entries(stats.byDonVi).forEach(([donVi, count]) => {
      csv += `${donVi},${count}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bao-cao-thuoc-tay-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToExcel = async () => {
    try {
      const response = await thuoctayAPI.exportExcel();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `thuoc-tay-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Lỗi khi xuất Excel: ' + (err.message || 'Export failed'));
    }
  };

  const exportToPDF = async () => {
    try {
      const response = await thuoctayAPI.exportPDF();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `thuoc-tay-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Lỗi khi xuất PDF: ' + (err.message || 'Export failed'));
    }
  };

  const saveReport = async () => {
    try {
      setLoading(true);
      await reportAPI.saveReport();
      alert('Lưu báo cáo thành công!');
    } catch (err) {
      alert('Lỗi khi lưu báo cáo: ' + (err.message || 'Save failed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, []);

  return (
    <Container className="my-4">
      <Row className="mb-4">
        <Col>
          <h2>Báo cáo & Thống kê</h2>
          <p className="text-muted">Xem báo cáo chi tiết về tình hình thuốc tây</p>
        </Col>
        <Col xs="auto">
          <div className="d-flex gap-2">
            <Button variant="danger" onClick={generateReport} disabled={loading} style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', border: 'none' }}>
              {loading ? 'Đang tạo...' : 'Làm mới báo cáo'}
            </Button>
            {report && (
              <>
                <Button variant="warning" onClick={saveReport} disabled={loading}>
                  Lưu báo cáo
                </Button>
                <Button variant="success" onClick={exportToCSV}>
                  Xuất CSV
                </Button>
                <Button variant="info" onClick={exportToExcel}>
                  Xuất Excel
                </Button>
                <Button variant="secondary" onClick={exportToPDF}>
                  Xuất PDF
                </Button>
              </>
            )}
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" role="status">
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
                  <div className="stat-icon">💊</div>
                  <Card.Title className="stat-value">{report.statistics.totalThuocTay}</Card.Title>
                  <Card.Text className="stat-label">Tổng số thuốc</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="stat-card stat-success">
                <Card.Body>
                  <div className="stat-icon">📦</div>
                  <Card.Title className="stat-value">{report.statistics.totalSoLuong.toLocaleString('vi-VN')}</Card.Title>
                  <Card.Text className="stat-label">Tổng số lượng</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="stat-card stat-warning">
                <Card.Body>
                  <div className="stat-icon">💰</div>
                  <Card.Title className="stat-value">
                    {(report.statistics.totalGiaTri / 1000000).toFixed(1)}M
                  </Card.Title>
                  <Card.Text className="stat-label">Tổng giá trị (VND)</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="stat-card stat-info">
                <Card.Body>
                  <div className="stat-icon">📊</div>
                  <Card.Title className="stat-value">
                    {Object.keys(report.statistics.byLoaiThuoc).length}
                  </Card.Title>
                  <Card.Text className="stat-label">Loại thuốc</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Statistics Tables */}
          <Row>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', color: 'white' }}>
                  <h5 className="mb-0">Thống kê theo loại thuốc</h5>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Loại thuốc</th>
                        <th>Số lượng</th>
                        <th>Tổng số lượng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(report.statistics.byLoaiThuoc).map(([loai, data]) => (
                        <tr key={loai}>
                          <td><Badge bg="danger">{loai}</Badge></td>
                          <td>{data.count}</td>
                          <td>{data.soLuong.toLocaleString('vi-VN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', color: 'white' }}>
                  <h5 className="mb-0">Thống kê theo nhà sản xuất</h5>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Nhà sản xuất</th>
                        <th>Số lượng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(report.statistics.byNhaSanXuat).map(([nhaSanXuat, count]) => (
                        <tr key={nhaSanXuat}>
                          <td><Badge bg="warning">{nhaSanXuat}</Badge></td>
                          <td>{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Card>
                <Card.Header style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', color: 'white' }}>
                  <h5 className="mb-0">Thống kê theo đơn vị</h5>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Đơn vị</th>
                        <th>Số lượng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(report.statistics.byDonVi).map(([donVi, count]) => (
                        <tr key={donVi}>
                          <td><Badge bg="info">{donVi}</Badge></td>
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
                <Card.Header style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', color: 'white' }}>
                  <h5 className="mb-0">Thông tin báo cáo</h5>
                </Card.Header>
                <Card.Body>
                  <p><strong>Ngày tạo:</strong> {new Date(report.generatedAt).toLocaleString('vi-VN')}</p>
                  <p><strong>Người tạo:</strong> {report.generatedBy}</p>
                  <p><strong>Tổng số bản ghi:</strong> {report.data?.length || 0}</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <Alert variant="info">Chưa có dữ liệu báo cáo. Vui lòng tạo báo cáo mới.</Alert>
      )}
    </Container>
  );
}

export default ReportPage;

