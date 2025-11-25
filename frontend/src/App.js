import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './components/Login';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import CayTrongTable from './components/CayTrongTable';
import UserManagement from './components/UserManagement';
import ReportPage from './components/ReportPage';
import AccountPage from './components/AccountPage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    setActiveTab('home');
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
      case 'caytrong':
        return <CayTrongTable />;
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

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
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
          <p className="mb-0">© 2024 QLCayTrong Blockchain App - Powered by Hyperledger Fabric & React.js</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

