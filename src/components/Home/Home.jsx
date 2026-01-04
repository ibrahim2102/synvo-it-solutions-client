import React, { useEffect, useState } from 'react';
import ServicesGrid from '../ServicesGrid/ServicesGrid.jsx';
import Slider from '../Slider/Slider.jsx';
import { Link } from 'react-router';

const API_BASE = 'https://synvo-it-solution-server.vercel.app';

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

      <section className="container mx-auto px-4 space-y-6 ">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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


      <section className="container mx-auto px-4 py-0">
  <header className="text-center max-w-2xl mx-auto space-y-3 mb-12">
    <h2 className="text-3xl font-bold">Why Choose Synvo?</h2>
    <p className="text-gray-600">
      We connect you with trusted professionals and make service booking simple, secure, and reliable.
    </p>
  </header>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    <div className="card bg-base-100 shadow">
      <div className="card-body space-y-2">
        <h3 className="font-semibold text-lg">Verified Providers</h3>
        <p className="text-sm text-gray-600">
          Every provider is reviewed to ensure quality, professionalism, and reliability.
        </p>
      </div>
    </div>
    <div className="card bg-base-100 shadow">
      <div className="card-body space-y-2">
        <h3 className="font-semibold text-lg">Transparent Pricing</h3>
        <p className="text-sm text-gray-600">
          Clear pricing with no hidden fees. Know exactly what you’re paying for.
        </p>
      </div>
    </div>
    <div className="card bg-base-100 shadow">
      <div className="card-body space-y-2">
        <h3 className="font-semibold text-lg">Secure Payments</h3>
        <p className="text-sm text-gray-600">
          Safe and reliable payment system to protect both clients and providers.
        </p>
      </div>
    </div>
  </div>
</section>

<section className="container mx-auto px-4 py-0">
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
            <Link to="/dashboard/add-service" className="btn btn-outline btn-lg">
                List a Service
              </Link>
                <Link to="/dashboard" className="btn btn-base-100 btn-lg">
                Manage Listings
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-base-200 py-0">
  <div className="container mx-auto px-4">
    <header className="flex justify-between items-center mb-8">
      <h2 className="text-3xl font-bold">Popular Categories</h2>
      <a href="/services" className="btn btn-sm btn-outline">
        Browse All
      </a>
    </header>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {["Web Development", "UI/UX Design", "Digital Marketing", "IT Support"].map(
        (cat) => (
          <div
            key={cat}
            className="card bg-base-100 shadow hover:shadow-lg transition"
          >
            <div className="card-body text-center">
              <h3 className="font-semibold">{cat}</h3>
            </div>
          </div>
        )
      )}
    </div>
  </div>
</section>

<section className="container mx-auto px-4 py-0">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
    <div>
      <h3 className="text-4xl font-bold text-primary">1K+</h3>
      <p className="text-sm text-gray-600">Active Services</p>
    </div>
    <div>
      <h3 className="text-4xl font-bold text-primary">500+</h3>
      <p className="text-sm text-gray-600">Verified Providers</p>
    </div>
    <div>
      <h3 className="text-4xl font-bold text-primary">5K+</h3>
      <p className="text-sm text-gray-600">Happy Clients</p>
    </div>
    <div>
      <h3 className="text-4xl font-bold text-primary">4.8★</h3>
      <p className="text-sm text-gray-600">Average Rating</p>
    </div>
  </div>
</section>

<section className="bg-base-200 py-0">
  <div className="container mx-auto px-4">
    <header className="text-center max-w-xl mx-auto mb-10">
      <h2 className="text-3xl font-bold">What Clients Say</h2>
      <p className="text-gray-600">
        Real feedback from people who found trusted services on Synvo.
      </p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {["Amazing service!", "Highly professional", "Fast & reliable"].map(
        (text, index) => (
          <div key={index} className="card bg-base-100 shadow">
            <div className="card-body">
              <p className="text-sm text-gray-600">“{text}”</p>
              <p className="mt-4 font-semibold">— Verified Client</p>
            </div>
          </div>
        )
      )}
    </div>
  </div>
</section>

<section className="container mx-auto px-4 py-0">
  <div className="card bg-base-100 shadow-xl">
    <div className="card-body flex flex-col md:flex-row items-center justify-between gap-6">
      <div>
        <h2 className="text-2xl font-bold">Are you a service provider?</h2>
        <p className="text-gray-600">
          Join Synvo today and start reaching clients who are looking for your skills.
        </p>
      </div>
      <a href="/register" className="btn btn-primary btn-lg">
        Get Started
      </a>
    </div>
  </div>
</section>

<section className="bg-base-200 py-0 mb-5">
  <div className="container mx-auto px-4 max-w-xl text-center space-y-4">
    <h2 className="text-3xl font-bold">Stay Updated</h2>
    <p className="text-gray-600">
      Get updates on new services, offers, and platform improvements.
    </p>
    <div className="join w-full">
      <input
        type="email"
        placeholder="Enter your email"
        className="input input-bordered join-item w-full"
      />
      <button className="btn btn-primary join-item">
        Subscribe
      </button>
    </div>
  </div>
</section>
































    </div>
  );
};

export default Home;