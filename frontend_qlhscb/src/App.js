import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import HoSoCanBoTable from './components/HoSoCanBoTable';
import UserManagement from './components/UserManagement';
import ReportPage from './components/ReportPage';
import AccountPage from './components/AccountPage';
import './App.css';

function App() {
  // TẤT CẢ HOOKS PHẢI Ở ĐÂY - TRƯỚC BẤT KỲ RETURN NÀO
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  // useEffect phải ở đây - không được đặt sau return
  useEffect(() => {
    // Check if user is already logged in
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error parsing saved user:', error);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);

    // Expose showRegister function globally for Login component
    window.showRegister = () => setShowRegister(true);
    
    return () => {
      delete window.showRegister;
    };
  }, []);

  // Các hàm handler
  const handleLogin = (userData, tokenData) => {
    if (userData && tokenData) {
      setUser(userData);
      setToken(tokenData);
      setActiveTab('home');
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.error('handleLogin: userData hoặc tokenData không hợp lệ');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setActiveTab('home');
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage user={user} />;
      case 'dashboard':
        return <Dashboard currentUser={user} />;
      case 'hosocanbo':
        return <HoSoCanBoTable />;
      case 'report':
        return <ReportPage />;
      case 'users':
        return <UserManagement currentUser={user} />;
      case 'account':
        return <AccountPage currentUser={user} onUserUpdate={handleUserUpdate} />;
      default:
        return <HomePage user={user} />;
    }
  };

  // Bây giờ mới được return
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={!user || !token ? <Login onLogin={handleLogin} /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/register" 
          element={!user || !token ? <Register onRegisterSuccess={() => setShowRegister(false)} /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/forgot-password" 
          element={!user || !token ? <ForgotPassword /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/reset-password" 
          element={!user || !token ? <ResetPassword /> : <Navigate to="/" replace />} 
        />

        {/* Protected routes */}
        <Route 
          path="/*" 
          element={
            user && token ? (
              <div className="App">
                <Navigation 
                  user={user} 
                  onLogout={handleLogout}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
                
                <main className="main-content">
                  {renderContent()}
                </main>
                
                <footer className="app-footer">
                  <div className="container">
                    <p className="mb-0">© 2024 QLHoSoCanBo Blockchain App - Powered by Hyperledger Fabric & React.js</p>
                  </div>
                </footer>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
