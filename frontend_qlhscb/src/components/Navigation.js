import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import './Navigation.css';

function Navigation({ user, onLogout, activeTab, onTabChange }) {
  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="custom-navbar">
      <Container fluid>
        <Navbar.Brand href="#" onClick={() => onTabChange('home')}>
          <span className="brand-icon">👔</span> QLHoSoCanBo
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              active={activeTab === 'home'} 
              onClick={() => onTabChange('home')}
            >
              Trang chủ
            </Nav.Link>
            <Nav.Link 
              active={activeTab === 'hosocanbo'} 
              onClick={() => onTabChange('hosocanbo')}
            >
              Quản lý hồ sơ cán bộ
            </Nav.Link>
            <Nav.Link 
              active={activeTab === 'report'} 
              onClick={() => onTabChange('report')}
            >
              Báo cáo
            </Nav.Link>
            {user?.role === 'admin' && (
              <Nav.Link 
                active={activeTab === 'users'} 
                onClick={() => onTabChange('users')}
              >
                Quản lý người dùng
              </Nav.Link>
            )}
            <Nav.Link 
              active={activeTab === 'account'} 
              onClick={() => onTabChange('account')}
            >
              Tài khoản
            </Nav.Link>
          </Nav>
          <Nav>
            <NavDropdown 
              title={
                <span>
                  <span className="user-icon">👤</span> {user?.fullName || 'User'}
                </span>
              } 
              id="user-dropdown"
              align="end"
            >
              <NavDropdown.Item onClick={() => onTabChange('account')}>
                Thông tin tài khoản
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={onLogout}>
                Đăng xuất
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;

