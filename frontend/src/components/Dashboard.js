import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { caytrongAPI, reportAPI } from '../services/api';
import './Dashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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

      // Get all cay trong
      const caytrongResponse = await caytrongAPI.getAllCayTrong();
      const allCayTrong = caytrongResponse.data.success ? caytrongResponse.data.data : [];

      // Get report
      const reportResponse = await reportAPI.getReport();
      const report = reportResponse.data.success ? reportResponse.data.report : null;

      // Calculate KPIs
      const kpis = {
        totalCayTrong: allCayTrong.length,
        totalDienTich: allCayTrong.reduce((sum, item) => 
          sum + parseFloat((item.Record || item).dienTich || 0), 0
        ),
        avgNangSuat: allCayTrong.length > 0
          ? allCayTrong.reduce((sum, item) => 
              sum + parseFloat((item.Record || item).nangSuat || 0), 0) / allCayTrong.length
          : 0,
        cayTrongThanh: allCayTrong.filter(item => 
          (item.Record || item).giaiDoan === 'Trưởng thành'
        ).length,
        cayTrongMoi: allCayTrong.filter(item => 
          (item.Record || item).giaiDoan === 'Mới trồng'
        ).length
      };

      // Prepare chart data
      const loaiCayData = report?.statistics?.byLoaiCay 
        ? Object.entries(report.statistics.byLoaiCay).map(([name, data]) => ({
            name,
            value: data.count,
            dienTich: data.dienTich
          }))
        : [];

      const giaiDoanData = report?.statistics?.byGiaiDoan
        ? Object.entries(report.statistics.byGiaiDoan).map(([name, value]) => ({
            name,
            value
          }))
        : [];

      setStats(kpis);
      setChartData({ loaiCayData, giaiDoanData });
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
          <Spinner animation="border" role="status">
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
          <p className="text-muted">Thống kê và phân tích dữ liệu cây trồng</p>
        </Col>
      </Row>

      {/* KPI Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="kpi-card kpi-primary">
            <Card.Body>
              <div className="kpi-icon">🌳</div>
              <Card.Title className="kpi-value">{stats?.totalCayTrong || 0}</Card.Title>
              <Card.Text className="kpi-label">Tổng số cây trồng</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="kpi-card kpi-success">
            <Card.Body>
              <div className="kpi-icon">📏</div>
              <Card.Title className="kpi-value">{stats?.totalDienTich?.toFixed(2) || 0}</Card.Title>
              <Card.Text className="kpi-label">Tổng diện tích (ha)</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="kpi-card kpi-warning">
            <Card.Body>
              <div className="kpi-icon">📊</div>
              <Card.Title className="kpi-value">{stats?.avgNangSuat?.toFixed(2) || 0}</Card.Title>
              <Card.Text className="kpi-label">Năng suất TB (tấn/ha)</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="kpi-card kpi-info">
            <Card.Body>
              <div className="kpi-icon">✅</div>
              <Card.Title className="kpi-value">{stats?.cayTrongThanh || 0}</Card.Title>
              <Card.Text className="kpi-label">Cây trưởng thành</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Thống kê theo loại cây</h5>
            </Card.Header>
            <Card.Body>
              {chartData?.loaiCayData && chartData.loaiCayData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.loaiCayData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#0088FE" name="Số lượng" />
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
            <Card.Header>
              <h5 className="mb-0">Thống kê theo giai đoạn</h5>
            </Card.Header>
            <Card.Body>
              {chartData?.giaiDoanData && chartData.giaiDoanData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.giaiDoanData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.giaiDoanData.map((entry, index) => (
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
            <Card.Header>
              <h5 className="mb-0">Tỷ lệ cây trồng</h5>
            </Card.Header>
            <Card.Body>
              <div className="stat-item">
                <span className="stat-label">Cây trưởng thành:</span>
                <span className="stat-value">
                  {stats?.totalCayTrong > 0 
                    ? ((stats.cayTrongThanh / stats.totalCayTrong) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Cây mới trồng:</span>
                <span className="stat-value">
                  {stats?.totalCayTrong > 0
                    ? ((stats.cayTrongMoi / stats.totalCayTrong) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
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

