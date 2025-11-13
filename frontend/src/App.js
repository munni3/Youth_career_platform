import React, { useState, useEffect } from 'react';
import Jobs from './Jobs';
import Resources from './Resources';
import Dashboard from './Dashboard';
import Profile from './Profile';
import Auth from './auth.js';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('jobs');
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const navButtonStyle = (isActive) => ({
    padding: '10px 15px',
    border: 'none',
    backgroundColor: isActive ? '#007bff' : 'transparent',
    color: isActive ? 'white' : '#007bff',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  });

  return (
    <div className="App">
      <nav style={{ 
        padding: '15px 20px', 
        backgroundColor: '#f8f9fa', 
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap'
      }}>
        {user ? (
          <>
            <button
              onClick={() => setCurrentPage('dashboard')}
              style={navButtonStyle(currentPage === 'dashboard')}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('jobs')}
              style={navButtonStyle(currentPage === 'jobs')}
            >
              🎯 Jobs
            </button>
            <button
              onClick={() => setCurrentPage('resources')}
              style={navButtonStyle(currentPage === 'resources')}
            >
              📚 Resources
            </button>
            <button
              onClick={() => setCurrentPage('profile')}
              style={navButtonStyle(currentPage === 'profile')}
            >
              👤 Profile
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: '10px 15px',
                border: 'none',
                backgroundColor: '#dc3545',
                color: 'white',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginLeft: 'auto'
              }}
            >
              🚪 Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setCurrentPage('jobs')}
              style={navButtonStyle(currentPage === 'jobs')}
            >
              🎯 Jobs
            </button>
            <button
              onClick={() => setCurrentPage('resources')}
              style={navButtonStyle(currentPage === 'resources')}
            >
              📚 Resources
            </button>
            <button
              onClick={() => setCurrentPage('auth')}
              style={navButtonStyle(currentPage === 'auth')}
            >
              🔐 Login
            </button>
          </>
        )}
      </nav>

      <div>
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'jobs' && <Jobs />}
        {currentPage === 'resources' && <Resources />}
        {currentPage === 'profile' && <Profile />}
        {currentPage === 'auth' && <Auth onLogin={handleLogin} />}
      </div>
    </div>
  );
}

export default App;