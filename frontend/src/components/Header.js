import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SearchBar from './SearchBar';
import '../styles/Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>StreamHub</h1>
        </Link>

        <div className="header-center">
          <SearchBar onSearch={(q) => navigate(`/?search=${encodeURIComponent(q)}`)} />
        </div>

        <nav className="nav-menu">
          <Link to="/" className="nav-link">
            Home
          </Link>
          {user && (
            <Link to="/upload" className="nav-link">
              Upload
            </Link>
          )}
        </nav>

        <div className="auth-section">
          {user ? (
            <div className="user-menu">
              <Link to={`/profile/${user._id}`} className="user-profile">
                {user.username}
              </Link>
              <button className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
