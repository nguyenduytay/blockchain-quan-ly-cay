import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { thuoctayAPI, reportAPI } from '../services/api';
import './Dashboard.css';

const COLORS = ['#FF6B6B', '#FF8E53', '#FFA07A', '#FFB347', '#FFD700'];

function Dashboard({ currentUser }) {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const thuoctayResponse = await thuoctayAPI.getAllThuocTay();
      const allThuocTay = thuoctayResponse.data.success ? thuoctayResponse.data.data : [];
      const thuoctays = allThuocTay.filter(item => (item.Record || item).docType === 'thuoctay');

      const reportResponse = await reportAPI.getReport();
      const report = reportResponse.data.success ? reportResponse.data.report : null;

      const kpis = {
        totalThuocTay: thuoctays.length,
        totalSoLuong: thuoctays.reduce((sum, item) => 
          sum + parseInt((item.Record || item).soLuong || 0), 0
        ),
        totalGiaTri: thuoctays.reduce((sum, item) => 
          sum + (parseInt((item.Record || item).soLuong || 0) * parseFloat((item.Record || item).giaBan || 0)), 0
        ),
        avgGiaBan: thuoctays.length > 0
          ? thuoctays.reduce((sum, item) => 
              sum + parseFloat((item.Record || item).giaBan || 0), 0) / thuoctays.length
          : 0
      };

      const loaiThuocData = report?.statistics?.byLoaiThuoc 
        ? Object.entries(report.statistics.byLoaiThuoc).map(([name, data]) => ({
            name,
            value: data.count,
            soLuong: data.soLuong
          }))
        : [];

      const nhaSanXuatData = report?.statistics?.byNhaSanXuat
        ? Object.entries(report.statistics.byNhaSanXuat).map(([name, value]) => ({
            name,
            value
          }))
        : [];

      const donViData = report?.statistics?.byDonVi
        ? Object.entries(report.statistics.byDonVi).map(([name, value]) => ({
            name,
            value
          }))
        : [];

      setStats(kpis);
      setChartData({ loaiThuocData, nhaSanXuatData, donViData });
    } catch (err) {
      setError(err.message);
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching dashboard data:', err.message || 'Failed to fetch data');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="my-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <Row className="mb-4">
        <Col>
          <h2>Dashboard Tổng Quan</h2>
          <p className="text-muted">Thống kê và phân tích dữ liệu thuốc tây</p>
        </Col>
      </Row>

      {/* KPI Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="kpi-card kpi-primary">
            <Card.Body>
              <div className="kpi-icon">💊</div>
              <Card.Title className="kpi-value">{stats?.totalThuocTay || 0}</Card.Title>
              <Card.Text className="kpi-label">Tổng số thuốc</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="kpi-card kpi-success">
            <Card.Body>
              <div className="kpi-icon">📦</div>
              <Card.Title className="kpi-value">{stats?.totalSoLuong || 0}</Card.Title>
              <Card.Text className="kpi-label">Tổng số lượng</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="kpi-card kpi-warning">
            <Card.Body>
              <div className="kpi-icon">💰</div>
              <Card.Title className="kpi-value">
                {(stats?.totalGiaTri / 1000000)?.toFixed(1) || 0}M
              </Card.Title>
              <Card.Text className="kpi-label">Tổng giá trị (VND)</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="kpi-card kpi-info">
            <Card.Body>
              <div className="kpi-icon">📊</div>
              <Card.Title className="kpi-value">
                {(stats?.avgGiaBan / 1000)?.toFixed(0) || 0}K
              </Card.Title>
              <Card.Text className="kpi-label">Giá bán TB (VND)</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', color: 'white' }}>
              <h5 className="mb-0">Thống kê theo loại thuốc</h5>
            </Card.Header>
            <Card.Body>
              {chartData?.loaiThuocData && chartData.loaiThuocData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.loaiThuocData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#FF6B6B" name="Số lượng" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted text-center">Chưa có dữ liệu</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', color: 'white' }}>
              <h5 className="mb-0">Thống kê theo nhà sản xuất</h5>
            </Card.Header>
            <Card.Body>
              {chartData?.nhaSanXuatData && chartData.nhaSanXuatData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.nhaSanXuatData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.nhaSanXuatData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted text-center">Chưa có dữ liệu</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Additional Stats */}
      <Row>
        <Col md={6}>
          <Card>
            <Card.Header style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', color: 'white' }}>
              <h5 className="mb-0">Thống kê theo đơn vị</h5>
            </Card.Header>
            <Card.Body>
              {chartData?.donViData && chartData.donViData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData.donViData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.donViData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted text-center">Chưa có dữ liệu</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', color: 'white' }}>
              <h5 className="mb-0">Thông tin hệ thống</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Người dùng:</strong> {currentUser?.fullName || 'N/A'}</p>
              <p><strong>Vai trò:</strong> {currentUser?.role === 'admin' ? 'Quản trị viên' : 
                                           currentUser?.role === 'manager' ? 'Quản lý' : 'Người dùng'}</p>
              <p><strong>Cập nhật lần cuối:</strong> {new Date().toLocaleString('vi-VN')}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;

