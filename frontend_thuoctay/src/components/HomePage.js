import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import './HomePage.css';

function HomePage({ user }) {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <div className="hero-content">
                <h1 className="hero-title">
                  Chào mừng đến với <span className="highlight">QLThuocTay</span>
                </h1>
                <p className="hero-subtitle">
                  Hệ thống quản lý thuốc tây hiện đại trên nền tảng Blockchain
                </p>
                <p className="hero-description">
                  Ứng dụng công nghệ Hyperledger Fabric để quản lý thông tin thuốc tây một cách 
                  minh bạch, an toàn và hiệu quả. Theo dõi toàn bộ thông tin thuốc từ nhập kho 
                  đến hết hạn sử dụng.
                </p>
                {user && (
                  <div className="user-greeting">
                    <p>Xin chào, <strong>{user.fullName}</strong>!</p>
                  </div>
                )}
              </div>
            </Col>
            <Col lg={6}>
              <div className="hero-image">
                <div className="floating-card card-1">
                  <span>💊</span>
                  <p>Thuốc tây</p>
                </div>
                <div className="floating-card card-2">
                  <span>📊</span>
                  <p>Thống kê</p>
                </div>
                <div className="floating-card card-3">
                  <span>🔒</span>
                  <p>Bảo mật</p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Container>
          <h2 className="section-title text-center mb-5">Tính Năng Nổi Bật</h2>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="feature-card">
                <Card.Body className="text-center">
                  <div className="feature-icon">💊</div>
                  <Card.Title>Quản Lý Thuốc</Card.Title>
                  <Card.Text>
                    Quản lý toàn bộ thông tin thuốc tây: tên thuốc, hoạt chất, nhà sản xuất, 
                    hạn sử dụng, số lượng, giá bán.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="feature-card">
                <Card.Body className="text-center">
                  <div className="feature-icon">🔍</div>
                  <Card.Title>Tìm Kiếm & Lọc</Card.Title>
                  <Card.Text>
                    Tìm kiếm và lọc thuốc theo nhiều tiêu chí: loại thuốc, nhà sản xuất, 
                    đơn vị, hạn sử dụng.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="feature-card">
                <Card.Body className="text-center">
                  <div className="feature-icon">📈</div>
                  <Card.Title>Báo Cáo & Thống Kê</Card.Title>
                  <Card.Text>
                    Dashboard với KPI và biểu đồ trực quan. Xuất báo cáo đa định dạng 
                    (Excel, CSV, PDF).
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <Container>
          <Row>
            <Col md={3} className="text-center mb-4">
              <div className="stat-item">
                <div className="stat-number">💊</div>
                <div className="stat-label">Quản lý thuốc</div>
              </div>
            </Col>
            <Col md={3} className="text-center mb-4">
              <div className="stat-item">
                <div className="stat-number">🔐</div>
                <div className="stat-label">Bảo mật cao</div>
              </div>
            </Col>
            <Col md={3} className="text-center mb-4">
              <div className="stat-item">
                <div className="stat-number">📊</div>
                <div className="stat-label">Thống kê chi tiết</div>
              </div>
            </Col>
            <Col md={3} className="text-center mb-4">
              <div className="stat-item">
                <div className="stat-number">⚡</div>
                <div className="stat-label">Hiệu suất cao</div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
}

export default HomePage;

