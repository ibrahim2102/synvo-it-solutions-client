import React, { useEffect, useState, useContext, useMemo } from 'react';
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

const DashboardOverview = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userEmail = user?.email;

  useEffect(() => {
    if (authLoading || !userEmail) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch user's services
        const servicesQuery = new URLSearchParams({
          providerEmail: userEmail,
        }).toString();
        const servicesRes = await fetch(`${API_BASE}/products?${servicesQuery}`);
        
        if (!servicesRes.ok) throw new Error('Failed to load services');
        const servicesData = await servicesRes.json();
        const servicesArray = Array.isArray(servicesData)
          ? servicesData
          : servicesData.services || servicesData.data || [];
        setServices(servicesArray);

        // Fetch user's bookings
        const bookingsQuery = new URLSearchParams({
          clientEmail: userEmail,
        }).toString();
        const bookingsRes = await fetch(`${API_BASE}/bookings?${bookingsQuery}`);
        
        if (!bookingsRes.ok) throw new Error('Failed to load bookings');
        const bookingsData = await bookingsRes.json();
        const bookingsArray = Array.isArray(bookingsData)
          ? bookingsData
          : bookingsData.bookings || bookingsData.data || [];
        setBookings(bookingsArray);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, userEmail]);

  // Overview Cards Data
  const overviewStats = useMemo(() => {
    const totalServices = services.length;
    const activeServices = services.filter(
      (s) => s.status === 'Active'
    ).length;
    const totalBookings = bookings.length;
    const totalRevenue = services.reduce((sum, s) => {
      const price = parseFloat(s.price) || 0;
      const serviceBookings = bookings.filter(
        (b) => b.serviceId === (s._id || s.id)
      ).length;
      return sum + price * serviceBookings;
    }, 0);

    return [
      {
        title: 'Total Services',
        value: totalServices,
        icon: '🛠️',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      },
      {
        title: 'Active Services',
        value: activeServices,
        icon: '✅',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      },
      {
        title: 'Total Bookings',
        value: totalBookings,
        icon: '📅',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
      },
      {
        title: 'Total Revenue',
        value: `$${totalRevenue.toFixed(2)}`,
        icon: '💰',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
      },
    ];
  }, [services, bookings]);

  // Chart Data - Services by Category (Pie Chart)
  const categoryData = useMemo(() => {
    const categoryMap = {};
    services.forEach((service) => {
      const category = service.category || service.type || 'Other';
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });

    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
    }));
  }, [services]);

  // Chart Data - Services Price Range (Bar Chart)
  const priceData = useMemo(() => {
    const priceRanges = {
      '$0-50': 0,
      '$51-100': 0,
      '$101-200': 0,
      '$201-500': 0,
      '$500+': 0,
    };

    services.forEach((service) => {
      const price = parseFloat(service.price) || 0;
      if (price <= 50) priceRanges['$0-50']++;
      else if (price <= 100) priceRanges['$51-100']++;
      else if (price <= 200) priceRanges['$101-200']++;
      else if (price <= 500) priceRanges['$201-500']++;
      else priceRanges['$500+']++;
    });

    return Object.entries(priceRanges).map(([name, value]) => ({
      name,
      value,
    }));
  }, [services]);

  // Chart Data - Bookings Over Time (Line Chart) - Monthly
  const bookingsOverTime = useMemo(() => {
    const monthlyData = {};
    bookings.forEach((booking) => {
      if (booking.bookingDate) {
        const date = new Date(booking.bookingDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
      }
    });

    return Object.entries(monthlyData)
      .sort()
      .slice(-6)
      .map(([name, value]) => ({
        name,
        bookings: value,
      }));
  }, [bookings]);

  // Table Data - Recent Services
  const tableData = useMemo(() => {
    return services
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      })
      .slice(0, 10)
      .map((service) => ({
        id: service._id || service.id,
        name: service.name || service.title || 'Untitled',
        category: service.category || service.type || 'N/A',
        price: `$${parseFloat(service.price) || 0}`,
        status: service.status || 'Active',
        createdAt: service.createdAt
          ? new Date(service.createdAt).toLocaleDateString()
          : 'N/A',
      }));
  }, [services]);

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
        <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">
          Welcome back, {user?.displayName || user?.email || 'User'}!
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat, index) => (
          <div key={index} className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`text-4xl ${stat.color}`}>{stat.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Services by Category */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">Services by Category</h2>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
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

        {/* Bar Chart - Services by Price Range */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">Services by Price Range</h2>
            {priceData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priceData}>
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
            <h2 className="card-title mb-4">Bookings Over Time</h2>
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

      {/* Data Table */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title mb-4">Recent Services</h2>
          {tableData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Service Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row) => (
                    <tr key={row.id}>
                      <td className="font-semibold">{row.name}</td>
                      <td>
                        <span className="badge badge-outline">{row.category}</span>
                      </td>
                      <td>{row.price}</td>
                      <td>
                        <span
                          className={`badge ${
                            row.status === 'Active'
                              ? 'badge-success'
                              : 'badge-warning'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td>{row.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No services found. Create your first service!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;