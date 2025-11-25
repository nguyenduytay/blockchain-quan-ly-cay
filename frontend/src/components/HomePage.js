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
                  Chào mừng đến với <span className="highlight">QLCayTrong</span>
                </h1>
                <p className="hero-subtitle">
                  Hệ thống quản lý cây trồng hiện đại trên nền tảng Blockchain
                </p>
                <p className="hero-description">
                  Ứng dụng công nghệ Hyperledger Fabric để quản lý thông tin cây trồng một cách 
                  minh bạch, an toàn và hiệu quả. Theo dõi toàn bộ vòng đời của cây trồng từ 
                  khi trồng đến thu hoạch.
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
                  <span>🌳</span>
                  <p>Cây trồng</p>
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
          <h2 className="section-title">Tính năng nổi bật</h2>
          <Row className="g-4">
            <Col md={4}>
              <Card className="feature-card">
                <Card.Body>
                  <div className="feature-icon">🌱</div>
                  <Card.Title>Quản lý cây trồng</Card.Title>
                  <Card.Text>
                    Theo dõi thông tin chi tiết về từng loại cây trồng: loại cây, 
                    giai đoạn phát triển, năng suất, diện tích và vị trí.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="feature-card">
                <Card.Body>
                  <div className="feature-icon">📈</div>
                  <Card.Title>Báo cáo & Thống kê</Card.Title>
                  <Card.Text>
                    Tạo báo cáo chi tiết về tình hình cây trồng, thống kê theo 
                    loại cây, giai đoạn và vị trí địa lý.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="feature-card">
                <Card.Body>
                  <div className="feature-icon">🔐</div>
                  <Card.Title>Bảo mật Blockchain</Card.Title>
                  <Card.Text>
                    Dữ liệu được lưu trữ trên blockchain, đảm bảo tính minh bạch, 
                    không thể thay đổi và an toàn tuyệt đối.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="feature-card">
                <Card.Body>
                  <div className="feature-icon">👥</div>
                  <Card.Title>Quản lý người dùng</Card.Title>
                  <Card.Text>
                    Hệ thống phân quyền rõ ràng với vai trò admin và user, 
                    quản lý tài khoản hiệu quả.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="feature-card">
                <Card.Body>
                  <div className="feature-icon">⚡</div>
                  <Card.Title>Hiệu suất cao</Card.Title>
                  <Card.Text>
                    Giao diện hiện đại, phản hồi nhanh, tối ưu trải nghiệm người dùng 
                    trên mọi thiết bị.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="feature-card">
                <Card.Body>
                  <div className="feature-icon">📱</div>
                  <Card.Title>Responsive Design</Card.Title>
                  <Card.Text>
                    Tương thích với mọi thiết bị: máy tính, tablet và điện thoại di động, 
                    mang lại trải nghiệm tốt nhất.
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
          <Row className="text-center">
            <Col md={3}>
              <div className="stat-item">
                <h3 className="stat-number">100%</h3>
                <p className="stat-label">Bảo mật</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="stat-item">
                <h3 className="stat-number">24/7</h3>
                <p className="stat-label">Hoạt động</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="stat-item">
                <h3 className="stat-number">∞</h3>
                <p className="stat-label">Khả năng mở rộng</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="stat-item">
                <h3 className="stat-number">100%</h3>
                <p className="stat-label">Minh bạch</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
}

export default HomePage;

