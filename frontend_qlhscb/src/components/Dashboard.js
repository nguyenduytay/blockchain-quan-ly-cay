import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { hosocanboAPI, reportAPI } from '../services/api';
import './Dashboard.css';

const COLORS = ['#667eea', '#764ba2', '#8B5CF6', '#A78BFA', '#C4B5FD'];

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

      // Get all ho so can bo
      const hosocanboResponse = await hosocanboAPI.getAllHoSoCanBo();
      const allHoSoCanBo = hosocanboResponse.data.success ? hosocanboResponse.data.data : [];

      // Get report
      const reportResponse = await reportAPI.getReport();
      const report = reportResponse.data.success ? reportResponse.data.report : null;

      // Calculate KPIs
      const kpis = {
        totalCanBo: allHoSoCanBo.length,
        totalLuong: allHoSoCanBo.reduce((sum, item) => 
          sum + parseFloat((item.Record || item).luong || 0), 0
        ),
        avgLuong: allHoSoCanBo.length > 0
          ? allHoSoCanBo.reduce((sum, item) => 
              sum + parseFloat((item.Record || item).luong || 0), 0) / allHoSoCanBo.length
          : 0,
        canBoNam: allHoSoCanBo.filter(item => 
          (item.Record || item).gioiTinh === 'Nam'
        ).length,
        canBoNu: allHoSoCanBo.filter(item => 
          (item.Record || item).gioiTinh === 'Nữ'
        ).length
      };

      // Prepare chart data
      const phongBanData = report?.statistics?.byPhongBan 
        ? Object.entries(report.statistics.byPhongBan).map(([name, data]) => ({
            name,
            value: data.count,
            luong: data.totalLuong
          }))
        : [];

      const chucVuData = report?.statistics?.byChucVu
        ? Object.entries(report.statistics.byChucVu).map(([name, value]) => ({
            name,
            value
          }))
        : [];

      const gioiTinhData = report?.statistics?.byGioiTinh
        ? Object.entries(report.statistics.byGioiTinh).map(([name, value]) => ({
            name,
            value
          }))
        : [];

      setStats(kpis);
      setChartData({ phongBanData, chucVuData, gioiTinhData });
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
          <Spinner animation="border" variant="primary" role="status">
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
          <p className="text-muted">Thống kê và phân tích dữ liệu hồ sơ cán bộ</p>
        </Col>
      </Row>

      {/* KPI Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="kpi-card kpi-primary">
            <Card.Body>
              <div className="kpi-icon">👔</div>
              <Card.Title className="kpi-value">{stats?.totalCanBo || 0}</Card.Title>
              <Card.Text className="kpi-label">Tổng số cán bộ</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="kpi-card kpi-success">
            <Card.Body>
              <div className="kpi-icon">💰</div>
              <Card.Title className="kpi-value">
                {(stats?.totalLuong / 1000000)?.toFixed(1) || 0}M
              </Card.Title>
              <Card.Text className="kpi-label">Tổng lương (VND)</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="kpi-card kpi-warning">
            <Card.Body>
              <div className="kpi-icon">📊</div>
              <Card.Title className="kpi-value">
                {(stats?.avgLuong / 1000000)?.toFixed(1) || 0}M
              </Card.Title>
              <Card.Text className="kpi-label">Lương TB (VND)</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="kpi-card kpi-info">
            <Card.Body>
              <div className="kpi-icon">👥</div>
              <Card.Title className="kpi-value">
                {stats?.canBoNam || 0} / {stats?.canBoNu || 0}
              </Card.Title>
              <Card.Text className="kpi-label">Nam / Nữ</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <h5 className="mb-0">Thống kê theo phòng ban</h5>
            </Card.Header>
            <Card.Body>
              {chartData?.phongBanData && chartData.phongBanData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.phongBanData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#667eea" name="Số lượng" />
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
            <Card.Header style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <h5 className="mb-0">Thống kê theo chức vụ</h5>
            </Card.Header>
            <Card.Body>
              {chartData?.chucVuData && chartData.chucVuData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.chucVuData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.chucVuData.map((entry, index) => (
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
            <Card.Header style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <h5 className="mb-0">Tỷ lệ giới tính</h5>
            </Card.Header>
            <Card.Body>
              {chartData?.gioiTinhData && chartData.gioiTinhData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData.gioiTinhData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.gioiTinhData.map((entry, index) => (
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
            <Card.Header style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
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

