import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const ServicesGrid = ({ apiEndpoint, showFilter = false }) => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch(apiEndpoint);

        if (!response.ok) {
          throw new Error('Failed to load services');
        }

        const data = await response.json();
        const servicesArray = Array.isArray(data) ? data : data.services || data.data || [];

        setServices(servicesArray);
        setFilteredServices(servicesArray);

        // Extract unique categories
        const uniqueCategories = [
          'All',
          ...new Set(servicesArray.map((service) => service.category || service.type || 'Other')),
        ];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [apiEndpoint]);

  // Handle category filter
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);

    if (category === 'All') {
      setFilteredServices(services);
    } else {
      const filtered = services.filter(
        (service) => (service.category || service.type || 'Other') === category
      );
      setFilteredServices(filtered);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error max-w-md mx-auto">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filter Section */}
      {showFilter && categories.length > 0 && (
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`btn btn-sm ${
                selectedCategory === category
                  ? 'btn-primary'
                  : 'btn-outline'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Services Count */}
      <div className="text-center text-gray-600">
        <p>
          Showing {filteredServices.length} of {services.length} services
        </p>
      </div>

      {/* Services Grid */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const serviceId = service._id || service.id;
            return (
              <div key={serviceId} className="card bg-base-100 shadow-lg hover:shadow-2xl transition-shadow">
                {/* Image */}
                <figure className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={service.image || 'https://via.placeholder.com/400x300?text=Service'}
                    alt={service.name || service.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </figure>

                <div className="card-body">
                  {/* Category Badge */}
                  <div className="flex justify-between items-start gap-2">
                    <span className="badge badge-outline">
                      {service.category || service.type || 'General'}
                    </span>
                    <span className="badge badge-primary">
                      {service.status || 'Active'}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="card-title text-lg line-clamp-2">
                    {service.name || service.title}
                  </h2>

                  {/* Provider Info */}
                  <p className="text-sm text-gray-600">
                    By <span className="font-semibold">{service.providerName || 'Provider'}</span>
                  </p>

                  {/* Description */}
                  <p className="text-gray-700 text-sm line-clamp-2">
                    {service.description || service.details || 'No description available'}
                  </p>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📍</span>
                    <span>{service.location || 'N/A'}</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-2xl font-bold text-primary">
                      ${service.price || 'N/A'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="card-actions justify-between pt-4">
                    <Link
                      to={`/service-details/${serviceId}`}
                      className="btn btn-primary btn-sm flex-1"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No services found in this category</p>
        </div>
      )}
    </div>
  );
};

export default ServicesGrid;