import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const API_BASE = 'https://synvo-it-solutions-server.vercel.app';

const normalizeId = (id) =>
  id?.$oid || id?.toString?.() || id || '';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingService, setLoadingService] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [error, setError] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    serviceId: id,
    serviceName: '',
    price: '',
    clientName: '',
    clientEmail: '',
    bookingDate: '',
    notes: '',
  });

  const isOwnService = Boolean(
    user &&
      service?.providerEmail &&
      service.providerEmail === user.email
  );

//   const canBook = Boolean(user && !isOwnService);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoadingService(true);
        setError('');
        const response = await fetch(`${API_BASE}/products/${id}`);

        if (!response.ok) {
          throw new Error('Service not found');
        }

        const serviceData = await response.json();
        setService(serviceData);
        setBookingData((prev) => ({
          ...prev,
          serviceName: serviceData.name || serviceData.title,
          price: serviceData.price,
        }));
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load service details');
      } finally {
        setLoadingService(false);
      }
    };

    fetchService();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        setReviewError('');
        const res = await fetch(`${API_BASE}/products/${id}/reviews`);

        if (!res.ok) {
          if (res.status === 404) {
            setReviews([]);
            return;
          }
          const text = await res.text();
          throw new Error(`Failed to load reviews (${res.status}): ${text}`);
        }

        const payload = await res.json();
        const reviewArray = Array.isArray(payload)
          ? payload
          : payload.reviews || [];
        setReviews(reviewArray);
      } catch (err) {
        console.error(err);
        setReviewError(err.message || 'Unable to load reviews.');
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [id]);

  const handleBookingFormChange = (event) => {
    const { name, value } = event.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenBookingModal = () => {
    if (isOwnService) {
      toast.info('You cannot book your own service.');
      return;
    }

    if (!user) {
      toast.info('Please sign in to book a service');
      navigate('/login');
      return;
    }

    setBookingData((prev) => ({
      ...prev,
      clientName: user.displayName || '',
      clientEmail: user.email || '',
    }));
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
  };

  const handleSubmitBooking = async (event) => {
    event.preventDefault();

    if (!bookingData.bookingDate) {
      toast.info('Please select a booking date');
      return;
    }

    if (!service) {
      toast.info('Unable to book this service.');
      return;
    }

    if (isOwnService) {
      toast.info('You cannot book your own service.');
      return;
    }

    try {
      const booking = {
        serviceId: normalizeId(service._id) || id,
        serviceName: bookingData.serviceName,
        price: bookingData.price,
        clientName: bookingData.clientName,
        clientEmail: bookingData.clientEmail,
        bookingDate: bookingData.bookingDate,
        notes: bookingData.notes,
        providerEmail: service.providerEmail,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };

      const response = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(booking),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to create booking (${response.status}): ${text}`);
      }

      const savedBooking = await response.json();
      toast.success('Booking submitted successfully!');
      handleCloseBookingModal();
      navigate('/my-bookings', {
        replace: true,
        state: { highlightId: normalizeId(savedBooking._id) },
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Unable to submit booking. Please try again.');
    }
  };

  const averageRating = useMemo(() => {
    if (service?.averageRating) return service.averageRating;
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return Math.round((total / reviews.length) * 10) / 10;
  }, [service, reviews]);

  const reviewCount = service?.reviewCount ?? reviews.length ?? 0;

  if (loadingService) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="alert alert-error max-w-2xl mx-auto">
          <span>{error || 'Service not found'}</span>
        </div>
        <div className="text-center mt-6">
          <button
            className="btn btn-outline"
            onClick={() => navigate('/services')}
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <button
          className="btn btn-ghost btn-sm mb-6"
          onClick={() => navigate('/services')}
        >
          ← Back to Services
        </button>

        <div className="card bg-base-100 shadow-2xl overflow-hidden">
          <figure className="w-full h-96 bg-gray-200 overflow-hidden">
            <img
              src={
                service.image ||
                'https://via.placeholder.com/600x400?text=Service'
              }
              alt={service.name || service.title}
              className="w-full h-full object-cover"
            />
          </figure>

          <div className="card-body space-y-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="card-title text-3xl md:text-4xl">
                  {service.name || service.title}
                </h1>
                <p className="text-gray-500 mt-2">
                  By{' '}
                  <span className="font-semibold">
                    {service.providerName || 'Provider'}
                  </span>
                </p>
                <div className="flex items-center gap-3 mt-3">
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
                  <span className="font-semibold">
                    {averageRating || 'No ratings yet'}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({reviewCount} review{reviewCount === 1 ? '' : 's'})
                  </span>
                </div>
              </div>
              <span className="badge badge-primary badge-lg">
                {service.status || 'Active'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Price</p>
                <p className="text-2xl font-bold text-primary">
                  ${service.price || 'N/A'}
                </p>
              </div>
              <div className="bg-secondary/10 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Category</p>
                <p className="text-lg font-semibold">
                  {service.category || service.type || 'General'}
                </p>
              </div>
              <div className="bg-accent/10 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Location</p>
                <p className="text-lg font-semibold">
                  {service.location || 'N/A'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold">About This Service</h2>
              <p className="text-gray-700 leading-relaxed">
                {service.description ||
                  service.details ||
                  'No description available'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-t border-b">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Service ID</p>
                <p className="font-mono text-sm break-all">
                  {normalizeId(service._id)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Provider Email</p>
                <p className="font-mono text-sm">
                  {service.providerEmail || 'N/A'}
                </p>
              </div>
              {service.createdAt && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Posted On</p>
                  <p className="text-sm">
                    {new Date(service.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            <div className="card-actions justify-end gap-3 pt-6">
              <button
                className="btn btn-outline"
                onClick={() => navigate('/services')}
              >
                Continue Shopping
              </button>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleOpenBookingModal}
                disabled={isOwnService}
              >
                Book Now
              </button>
            </div>

            {isOwnService && (
              <div className="alert alert-info">
                <span>You cannot book your own service.</span>
              </div>
            )}

            <section className="space-y-4">
              <h2 className="text-xl font-bold">Customer Reviews</h2>

              {loadingReviews ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-md"></span>
                </div>
              ) : reviewError ? (
                <div className="alert alert-warning">
                  <span>{reviewError}</span>
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-gray-500">
                  No reviews yet. Book this service to be the first reviewer!
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <article
                      key={normalizeId(review._id) || review.bookingId}
                      className="p-4 border border-base-300 rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">
                            {review.clientName || review.clientEmail || 'Client'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {review.createdAt
                              ? new Date(review.createdAt).toLocaleString()
                              : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="rating rating-sm">
                            {Array.from({ length: 5 }).map((_, index) => {
                              const starValue = index + 1;
                              return (
                                <input
                                  key={starValue}
                                  type="radio"
                                  readOnly
                                  className={`mask mask-star-2 ${
                                    starValue <= (review.rating || 0)
                                      ? 'bg-warning'
                                      : 'bg-gray-300'
                                  }`}
                                />
                              );
                            })}
                          </div>
                          <span className="font-semibold">
                            {review.rating}/5
                          </span>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700">{review.comment}</p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {isBookingModalOpen && (
        <dialog className="modal modal-open">
          <form
            method="dialog"
            className="modal-box w-11/12 max-w-md"
            onSubmit={handleSubmitBooking}
          >
            <h3 className="font-bold text-lg mb-4">Book This Service</h3>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Service</span>
                </label>
                <input
                  type="text"
                  value={bookingData.serviceName}
                  disabled
                  className="input input-bordered w-full bg-gray-100"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Price</span>
                </label>
                <input
                  type="text"
                  value={`$${bookingData.price || 0}`}
                  disabled
                  className="input input-bordered w-full bg-gray-100"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Your Name</span>
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={bookingData.clientName}
                  onChange={handleBookingFormChange}
                  className="input input-bordered w-full"
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Email</span>
                </label>
                <input
                  type="email"
                  name="clientEmail"
                  value={bookingData.clientEmail}
                  onChange={handleBookingFormChange}
                  className="input input-bordered w-full"
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Booking Date <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="date"
                  name="bookingDate"
                  value={bookingData.bookingDate}
                  onChange={handleBookingFormChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Additional Notes{' '}
                    <span className="text-gray-400 text-xs">(Optional)</span>
                  </span>
                </label>
                <textarea
                  name="notes"
                  value={bookingData.notes}
                  onChange={handleBookingFormChange}
                  className="textarea textarea-bordered w-full h-20"
                  placeholder="Any special requests or details..."
                ></textarea>
              </div>
            </div>

            <div className="modal-action gap-2 mt-6">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleCloseBookingModal}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Confirm Booking
              </button>
            </div>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default ServiceDetails;