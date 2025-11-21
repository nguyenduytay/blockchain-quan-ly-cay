import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import HoSoCanBoTable from './components/HoSoCanBoTable';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="header-icon">👔</div>
          <div className="header-text">
            <h1 className="header-title">Hệ Thống Quản Lý Hồ Sơ Cán Bộ</h1>
            <p className="header-subtitle">Blockchain Technology - Hyperledger Fabric</p>
          </div>
        </div>
        <div className="header-wave">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C300,100 600,20 900,60 C1050,80 1125,70 1200,60 L1200,120 L0,120 Z" fill="currentColor"></path>
          </svg>
        </div>
      </header>
      
      <HoSoCanBoTable />
      
      <footer className="app-footer">
        <div className="container">
          <div className="footer-content">
            <p className="footer-text">© 2024 QLHoSoCanBo Blockchain Application</p>
            <p className="footer-tech">Powered by Hyperledger Fabric & React.js</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

