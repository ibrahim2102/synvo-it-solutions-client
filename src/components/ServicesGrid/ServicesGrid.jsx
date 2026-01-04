import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

const ServicesGrid = ({ apiEndpoint, showFilter = false }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // Sort state
  const [sortBy, setSortBy] = useState('default');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

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

        // Extract unique categories
        const uniqueCategories = [
          'All',
          ...new Set(servicesArray.map((service) => service.category || service.type || 'Other').filter(Boolean)),
        ];
        setCategories(uniqueCategories);
        
        // Extract unique locations
        const uniqueLocations = [
          'All',
          ...new Set(servicesArray.map((service) => service.location || 'Unknown').filter(Boolean)),
        ];
        setLocations(uniqueLocations);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [apiEndpoint]);

  // Filter and sort services
  const filteredAndSortedServices = useMemo(() => {
    let filtered = [...services];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((service) => {
        const name = (service.name || service.title || '').toLowerCase();
        const description = (service.description || service.details || '').toLowerCase();
        const provider = (service.providerName || '').toLowerCase();
        return name.includes(query) || description.includes(query) || provider.includes(query);
      });
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(
        (service) => (service.category || service.type || 'Other') === selectedCategory
      );
    }

    // Location filter
    if (selectedLocation !== 'All') {
      filtered = filtered.filter(
        (service) => (service.location || 'Unknown') === selectedLocation
      );
    }

    // Price range filter
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        filtered = filtered.filter((service) => {
          const price = parseFloat(service.price) || 0;
          return price >= min;
        });
      }
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        filtered = filtered.filter((service) => {
          const price = parseFloat(service.price) || 0;
          return price <= max;
        });
      }
    }

    // Sorting
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
    } else if (sortBy === 'name-asc') {
      filtered.sort((a, b) => {
        const nameA = (a.name || a.title || '').toLowerCase();
        const nameB = (b.name || b.title || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    } else if (sortBy === 'name-desc') {
      filtered.sort((a, b) => {
        const nameA = (a.name || a.title || '').toLowerCase();
        const nameB = (b.name || b.title || '').toLowerCase();
        return nameB.localeCompare(nameA);
      });
    }

    return filtered;
  }, [services, searchQuery, selectedCategory, selectedLocation, minPrice, maxPrice, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServices = filteredAndSortedServices.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedLocation, minPrice, maxPrice, sortBy]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedLocation('All');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('default');
    setCurrentPage(1);
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
      {/* Search Bar */}
      {showFilter && (
        <div className="w-full max-w-2xl mx-auto">
          <div className="form-control">
            <div className="input-group">
              <input
                type="text"
                placeholder="Search services by name, description, or provider..."
                className="input input-bordered w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-square btn-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Sorting Section */}
      {showFilter && (
        <div className="bg-base-200 rounded-lg p-4 space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="form-control flex-1 min-w-[150px]">
                <label className="label">
                  <span className="label-text font-semibold">Category</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Location Filter */}
            {locations.length > 0 && (
              <div className="form-control flex-1 min-w-[150px]">
                <label className="label">
                  <span className="label-text font-semibold">Location</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Price Range Filters */}
            <div className="form-control min-w-[120px]">
              <label className="label">
                <span className="label-text font-semibold">Min Price</span>
              </label>
              <input
                type="number"
                placeholder="$0"
                className="input input-bordered w-full"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min="0"
              />
            </div>

            <div className="form-control min-w-[120px]">
              <label className="label">
                <span className="label-text font-semibold">Max Price</span>
              </label>
              <input
                type="number"
                placeholder="$9999"
                className="input input-bordered w-full"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min="0"
              />
            </div>

            {/* Sort Option */}
            <div className="form-control min-w-[180px]">
              <label className="label">
                <span className="label-text font-semibold">Sort By</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <button
              className="btn btn-outline btn-error"
              onClick={handleClearFilters}
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Services Count */}
      <div className="flex justify-between items-center">
        <div className="text-gray-600">
          <p>
            Showing {paginatedServices.length > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, filteredAndSortedServices.length)} of {filteredAndSortedServices.length} services
          </p>
        </div>
      </div>

      {/* Services Grid */}
      {paginatedServices.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedServices.map((service) => {
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                className="btn btn-sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="join">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        className={`join-item btn btn-sm ${
                          currentPage === page ? 'btn-active' : ''
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <button key={page} className="join-item btn btn-sm btn-disabled">
                        ...
                      </button>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                className="btn btn-sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No services found matching your criteria</p>
          <button
            className="btn btn-outline btn-primary mt-4"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ServicesGrid;