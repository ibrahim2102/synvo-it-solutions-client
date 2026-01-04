import React, { useContext, use } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import ThemeContext from '../../contexts/ThemeContext';

const Navbar = () => {
  const { user, logOut } = use(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);




  const navLinks = (
    <>
      <li>
        <NavLink 
          to="/" 
          className={({ isActive }) =>
            isActive
              ? "px-4 py-2 rounded-lg bg-primary text-primary-content font-medium transition-colors"
              : "px-4 py-2 rounded-lg bg-base-200 hover:bg-base-300 text-base-content font-medium transition-colors"
          }
        >
          Home
        </NavLink>
      </li>
      <li>
        <NavLink 
          to="/services"
          className={({ isActive }) =>
            isActive
              ? "px-4 py-2 rounded-lg bg-primary text-primary-content font-medium transition-colors"
              : "px-4 py-2 rounded-lg bg-base-200 hover:bg-base-300 text-base-content font-medium transition-colors"
          }
        >
          Services
        </NavLink>
      </li>
      {user && (
      <>
        <li>
          <NavLink 
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? "px-4 py-2 rounded-lg bg-primary text-primary-content font-medium transition-colors"
                : "px-4 py-2 rounded-lg bg-base-200 hover:bg-base-300 text-base-content font-medium transition-colors"
            }
          >
            Dashboard
          </NavLink>
        </li>
      </>
    )}









      {/* {user && (
        <>
          <li>
            <NavLink 
              to="/my-services"
              className={({ isActive }) =>
                isActive
                  ? "px-4 py-2 rounded-lg bg-primary text-primary-content font-medium transition-colors"
                  : "px-4 py-2 rounded-lg bg-base-200 hover:bg-base-300 text-base-content font-medium transition-colors"
              }
            >
              My Services
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/add-service"
              className={({ isActive }) =>
                isActive
                  ? "px-4 py-2 rounded-lg bg-primary text-primary-content font-medium transition-colors"
                  : "px-4 py-2 rounded-lg bg-base-200 hover:bg-base-300 text-base-content font-medium transition-colors"
              }
            >
              Add Service
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/my-bookings"
              className={({ isActive }) =>
                isActive
                  ? "px-4 py-2 rounded-lg bg-primary text-primary-content font-medium transition-colors"
                  : "px-4 py-2 rounded-lg bg-base-200 hover:bg-base-300 text-base-content font-medium transition-colors"
              }
            >
              My Bookings
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/profile"
              className={({ isActive }) =>
                isActive
                  ? "px-4 py-2 rounded-lg bg-primary text-primary-content font-medium transition-colors"
                  : "px-4 py-2 rounded-lg bg-base-200 hover:bg-base-300 text-base-content font-medium transition-colors"
              }
            >
              Profile
            </NavLink>
          </li>
          
        </>
      )} */}
    </>
  );

  const handleLogOut = () => {
    logOut()
      .then(() => {
        console.log('User logged out successfully');
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      });
  };

  return (
    <div className="navbar bg-base-100/90 shadow-sm sticky top-0 z-50">
      <div className="navbar-start">
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost lg:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul
            tabIndex={-1}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            {navLinks}
            <li>
              <button
                className="btn btn-ghost btn-sm w-full"
                onClick={toggleTheme}
              >
                {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </button>
            </li>
            {user ? (
              <li>
                <button
                  onClick={handleLogOut}
                  className="btn btn-ghost btn-sm w-full"
                >
                  Logout
                </button>
              </li>
            ) : (
              <>
                <li>
                  <NavLink to="/login">Login</NavLink>
                </li>
                <li>
                  <NavLink to="/register">Register</NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
        <Link to="/" className="btn btn-ghost text-xl font-bold">
          Synvo
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">{navLinks}</ul>
      </div>

      <div className="navbar-end gap-2">
        <button
          className="btn btn-ghost btn-sm hidden lg:inline-flex"
          onClick={toggleTheme}
        >
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>

        <div className="hidden lg:flex gap-2">
          {user ? (
            <>
              <span className="text-sm font-semibold px-3 py-2">
                {user.email || user.displayName}
              </span>
              <button
                onClick={handleLogOut}
                className="btn btn-ghost btn-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;