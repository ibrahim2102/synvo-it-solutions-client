import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const API_BASE = 'https://synvo-it-solution-server.vercel.app';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalServices: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch all data
        const [usersRes, servicesRes, bookingsRes] = await Promise.all([
          fetch(`${API_BASE}/users`),
          fetch(`${API_BASE}/products`),
          fetch(`${API_BASE}/bookings`),
        ]);

        if (!usersRes.ok || !servicesRes.ok || !bookingsRes.ok) {
          throw new Error('Failed to load admin data');
        }

        const usersData = await usersRes.json();
        const servicesData = await servicesRes.json();
        const bookingsData = await bookingsRes.json();

        const usersArray = Array.isArray(usersData) ? usersData : usersData.users || usersData.data || [];
        const servicesArray = Array.isArray(servicesData) ? servicesData : servicesData.services || servicesData.data || [];
        const bookingsArray = Array.isArray(bookingsData) ? bookingsData : bookingsData.bookings || bookingsData.data || [];

        setUsers(usersArray);
        setServices(servicesArray);
        setBookings(bookingsArray);

        // Calculate stats
        const totalRevenue = bookingsArray.reduce((sum, booking) => {
          const service = servicesArray.find((s) => (s._id || s.id) === (booking.serviceId || booking.productId));
          return sum + (parseFloat(service?.price) || 0);
        }, 0);

        setStats({
          totalUsers: usersArray.length,
          totalServices: servicesArray.length,
          totalBookings: bookingsArray.length,
          totalRevenue,
        });
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // Chart Data - Users by Role
  const usersByRole = React.useMemo(() => {
    const roleMap = {};
    users.forEach((user) => {
      const role = user.role || 'user';
      roleMap[role] = (roleMap[role] || 0) + 1;
    });
    return Object.entries(roleMap).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [users]);

  // Chart Data - Services by Category
  const servicesByCategory = React.useMemo(() => {
    const categoryMap = {};
    services.forEach((service) => {
      const category = service.category || service.type || 'Other';
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });
    return Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [services]);

  // Chart Data - Bookings Over Time (Last 7 days)
  const bookingsOverTime = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const bookingsByDate = {};
    bookings.forEach((booking) => {
      if (booking.bookingDate) {
        const date = new Date(booking.bookingDate).toISOString().split('T')[0];
        if (last7Days.includes(date)) {
          bookingsByDate[date] = (bookingsByDate[date] || 0) + 1;
        }
      }
    });

    return last7Days.map((date) => ({
      name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      bookings: bookingsByDate[date] || 0,
    }));
  }, [bookings]);

  // Handle Role Update
  const handleRoleUpdate = async (userEmail, newRole) => {
    try {
      const response = await fetch(`${API_BASE}/users/${encodeURIComponent(userEmail)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error('Failed to update role');

      setUsers((prev) =>
        prev.map((u) => (u.email === userEmail ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Failed to update user role');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error max-w-2xl mx-auto">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, services, and bookings</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold mt-1">{stats.totalUsers}</p>
              </div>
              <div className="text-4xl text-blue-600">👥</div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Services</p>
                <p className="text-2xl font-bold mt-1">{stats.totalServices}</p>
              </div>
              <div className="text-4xl text-green-600">🛠️</div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="text-2xl font-bold mt-1">{stats.totalBookings}</p>
              </div>
              <div className="text-4xl text-purple-600">📅</div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="text-4xl text-yellow-600">💰</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Users by Role */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">Users by Role</h2>
            {usersByRole.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={usersByRole}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {usersByRole.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-[300px] text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart - Services by Category */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">Top Services by Category</h2>
            {servicesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={servicesByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Number of Services" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-[300px] text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Line Chart - Bookings Over Time */}
      {bookingsOverTime.length > 0 && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">Bookings Over Last 7 Days</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bookingsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Bookings"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Users Management Table */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title mb-4">Users Management</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 20).map((userItem) => (
                  <tr key={userItem.email || userItem._id}>
                    <td>{userItem.email || 'N/A'}</td>
                    <td>{userItem.name || userItem.displayName || 'N/A'}</td>
                    <td>
                      <span className="badge badge-outline">
                        {userItem.role || 'user'}
                      </span>
                    </td>
                    <td>
                      <select
                        className="select select-bordered select-sm"
                        value={userItem.role || 'user'}
                        onChange={(e) => handleRoleUpdate(userItem.email, e.target.value)}
                        disabled={userItem.email === user?.email}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;