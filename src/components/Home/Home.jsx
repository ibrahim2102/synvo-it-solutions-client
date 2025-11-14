import React, { useEffect, useState } from 'react';
import ServicesGrid from '../ServicesGrid/ServicesGrid.jsx';
import Slider from '../Slider/Slider.jsx';

const API_BASE = 'https://synvo-it-solutions-server.vercel.app';

const normalizeId = (service) =>
  service._id?.$oid || service._id || service.id || '';

const Home = () => {
  const [topRated, setTopRated] = useState([]);
  const [loadingTopRated, setLoadingTopRated] = useState(true);
  const [topRatedError, setTopRatedError] = useState('');

  useEffect(() => {
    const fetchTopRated = async () => {
      try {
        setLoadingTopRated(true);
        setTopRatedError('');

        const params = new URLSearchParams({
          sortBy: 'rating',
          limit: '6',
        });
        const res = await fetch(`${API_BASE}/products?${params.toString()}`);

        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Failed to load top-rated services (${res.status}): ${text}`
          );
        }

        const payload = await res.json();
        const servicesArray = Array.isArray(payload)
          ? payload
          : payload.services || payload.data || [];

        setTopRated(servicesArray);
      } catch (err) {
        console.error(err);
        setTopRatedError(err.message || 'Unable to load top-rated services.');
      } finally {
        setLoadingTopRated(false);
      }
    };

    fetchTopRated();
  }, []);

  return (
    <div className="space-y-16">
      <Slider />

      <section className="container mx-auto px-4 space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Top Rated Services</h2>
            <p className="text-gray-600">
              Highest rated offerings from our community (minimum one review).
            </p>
          </div>
          <a href="/services" className="btn btn-sm btn-outline">
            View All
          </a>
        </header>

        {loadingTopRated ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : topRatedError ? (
          <div className="alert alert-error max-w-xl mx-auto">
            <span>{topRatedError}</span>
          </div>
        ) : topRated.length === 0 ? (
          <div className="alert alert-info max-w-xl mx-auto">
            <span>No rated services yet. Check back soon!</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topRated.map((service) => {
              const id = normalizeId(service);
              const averageRating = service.averageRating || 0;
              const reviewCount = service.reviewCount || 0;

              return (
                <div
                  key={id}
                  className="card bg-base-100 shadow-lg hover:shadow-2xl transition-shadow"
                >
                  <figure className="h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={
                        service.image ||
                        'https://via.placeholder.com/400x300?text=Service'
                      }
                      alt={service.name || service.title}
                      className="w-full h-full object-cover"
                    />
                  </figure>

                  <div className="card-body space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="badge badge-outline">
                        {service.category || service.type || 'General'}
                      </span>
                      <span className="badge badge-primary">
                        {service.status || 'Active'}
                      </span>
                    </div>

                    <h3 className="card-title text-xl">
                      {service.name || service.title}
                    </h3>

                    <div className="text-sm text-gray-600">
                      By{' '}
                      <span className="font-semibold">
                        {service.providerName || 'Provider'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-3">
                      {service.description ||
                        service.details ||
                        'No description available.'}
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          ${service.price || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="rating rating-sm">
                          {Array.from({ length: 5 }).map((_, index) => {
                            const starValue = index + 1;
                            return (
                              <input
                                key={starValue}
                                type="radio"
                                readOnly
                                className={`mask mask-star-2 ${
                                  starValue <= Math.round(averageRating)
                                    ? 'bg-warning'
                                    : 'bg-gray-300'
                                }`}
                              />
                            );
                          })}
                        </div>
                        <p className="text-xs text-gray-500">
                          {averageRating ? `${averageRating} / 5` : 'No rating'}
                          {' • '}
                          {reviewCount} review{reviewCount === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>

                    <div className="card-actions">
                      <a
                        href={`/service-details/${id}`}
                        className="btn btn-primary btn-sm flex-1"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* <section className="container mx-auto px-4 space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Browse All Services</h2>
            <p className="text-gray-600">
              Filter, sort, and explore our full catalog.
            </p>
          </div>
        </header>

        <ServicesGrid apiEndpoint={`${API_BASE}/products`} showFilter />
      </section> */}

      <section className="bg-base-200 py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card bg-base-100 shadow">
            <div className="card-body space-y-2">
              <span className="badge badge-primary badge-outline w-max">Step 1</span>
              <h3 className="text-xl font-semibold">Discover Services</h3>
              <p className="text-sm text-gray-600">
                Browse hundreds of vetted providers across technology, design, marketing, and more.
              </p>
            </div>
          </div>
          <div className="card bg-base-100 shadow">
            <div className="card-body space-y-2">
              <span className="badge badge-primary badge-outline w-max">Step 2</span>
              <h3 className="text-xl font-semibold">Compare & Review</h3>
              <p className="text-sm text-gray-600">
                Read verified reviews, check ratings, and pick the service that fits your needs perfectly.
              </p>
            </div>
          </div>
          <div className="card bg-base-100 shadow">
            <div className="card-body space-y-2">
              <span className="badge badge-primary badge-outline w-max">Step 3</span>
              <h3 className="text-xl font-semibold">Book with Confidence</h3>
              <p className="text-sm text-gray-600">
                Reserve your slot, share project details, and collaborate efficiently from day one.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="card bg-linear-to-r from-primary/90 to-secondary shadow-xl text-white">
          <div className="card-body flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-1 space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Ready to grow your service business?
              </h2>
              <p className="text-base lg:text-lg text-primary-content/90">
                Join Synvo and showcase your expertise to clients looking for top-rated providers.
              </p>
            </div>
            <div className="flex gap-3">
              <a href="/add-service" className="btn btn-outline btn-lg">
                List a Service
              </a>
              <a href="/my-services" className="btn btn-base-100 btn-lg">
                Manage Listings
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;