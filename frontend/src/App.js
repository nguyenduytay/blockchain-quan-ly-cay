import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import CayTrongTable from './components/CayTrongTable';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="bg-primary text-white py-3 mb-4">
        <div className="container">
          <h1 className="mb-0">🌳 Hệ Thống Quản Lý Cây Trồng Blockchain</h1>
          <p className="mb-0">Powered by Hyperledger Fabric & React.js</p>
        </div>
      </div>
      
      <CayTrongTable />
      
      <footer className="bg-dark text-white text-center py-3 mt-5">
        <div className="container">
          <p className="mb-0">© 2024 QLCayTrong Blockchain App - Hyperledger Fabric</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

