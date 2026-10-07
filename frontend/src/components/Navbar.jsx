import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <nav className="container nav-inner">
        <Link to="/" className="brand">🍲 FoodBridge</Link>
        <div className="nav-links">
          <NavLink to="/donations">Find Food</NavLink>
          {/* Conditional rendering: show different links depending on login + role */}
          {user?.role === 'donor' && <NavLink to="/donate">+ Donate Food</NavLink>}
          {user ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <span className="nav-user">
                {user.name} <span className={`role role-${user.role}`}>{user.role}</span>
              </span>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <Link to="/register" className="btn btn-sm">Join</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
