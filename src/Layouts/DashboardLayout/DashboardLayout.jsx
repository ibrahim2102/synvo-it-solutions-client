import React, { useState, useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const DashboardLayout = () => {
  const { user, userRole, logOut } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Base menu items for user role
  const baseMenuItems = [
    { path: '/dashboard', label: 'Dashboard Home', icon: '📊' },
    { path: '/dashboard/my-services', label: 'My Services', icon: '🛠️' },
    { path: '/dashboard/add-service', label: 'Add Service', icon: '➕' },
    { path: '/dashboard/my-bookings', label: 'My Bookings', icon: '📅' },
    { path: '/dashboard/profile', label: 'Profile', icon: '👤' },
  ];

  // Admin menu items
  const adminMenuItems = [
    { path: '/dashboard/admin', label: 'Admin Panel', icon: '⚙️' },
  ];

  // Combine menu items based on role
  const menuItems = userRole === 'admin' 
    ? [...baseMenuItems, ...adminMenuItems]
    : baseMenuItems;

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Top Navbar */}
      <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50">
        <div className="navbar-start">
          <button
            className="btn btn-ghost btn-sm lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <NavLink to="/dashboard" className="btn btn-ghost text-xl font-bold">
            Synvo Dashboard {userRole === 'admin' && <span className="badge badge-warning ml-2">Admin</span>}
          </NavLink>
        </div>

        <div className="navbar-end">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                {user?.displayName?.charAt(0)?.toUpperCase() ||
                  user?.email?.charAt(0)?.toUpperCase() ||
                  'U'}
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow-lg"
            >
              <li>
                <NavLink to="/dashboard/profile">👤 Profile</NavLink>
              </li>
              <li>
                <NavLink to="/dashboard">📊 Dashboard Home</NavLink>
              </li>
              {userRole === 'admin' && (
                <li>
                  <NavLink to="/dashboard/admin">⚙️ Admin Panel</NavLink>
                </li>
              )}
              <li>
                <button onClick={handleLogout}>🚪 Logout</button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`bg-base-100 shadow-lg transition-all duration-300 ${
            sidebarOpen ? 'w-64' : 'w-0'
          } lg:w-64 overflow-hidden`}
        >
          <div className="p-4 space-y-2 min-h-[calc(100vh-64px)]">
            <div className="px-4 py-2 mb-4">
              <h2 className="text-lg font-bold">Menu</h2>
              {userRole === 'admin' && (
                <span className="badge badge-warning badge-sm mt-1">Admin</span>
              )}
            </div>
            <ul className="menu space-y-1">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      isActive
                        ? 'active bg-primary text-primary-content'
                        : ''
                    }
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false);
                      }
                    }}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="pt-8 px-4">
              <NavLink
                to="/"
                className="btn btn-outline btn-sm w-full"
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
              >
                ← Back to Site
              </NavLink>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;