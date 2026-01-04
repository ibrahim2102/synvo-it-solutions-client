import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const API_BASE = 'https://synvo-it-solution-server.vercel.app';

const normalizeId = (booking) =>
  booking._id?.$oid || booking._id || booking.id || '';

const emptyReview = {
  rating: 5,
  comment: '',
};

const MyBookings = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [activeReviewBooking, setActiveReviewBooking] = useState(null);
  const [reviewForm, setReviewForm] = useState(emptyReview);
  const [submittingReview, setSubmittingReview] = useState(false);
  const location = useLocation();
  const highlightId = location.state?.highlightId;

  const clientEmail = user?.email;

  const fetchBookings = async (signal) => {
    try {
      setLoading(true);
      setError('');

      const query = new URLSearchParams({ clientEmail }).toString();
      const res = await fetch(`${API_BASE}/bookings?${query}`, { signal });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to load bookings (${res.status}): ${text}`);
      }

      const payload = await res.json();
      const arr = Array.isArray(payload)
        ? payload
        : payload.bookings || payload.data || [];

      setBookings(arr);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err);
        setError(err.message || 'Unexpected error while loading bookings.');
      }
    } finally {
      setLoading(false);
    }
  };

  

  useEffect(() => {
    if (!authLoading && !clientEmail) {
      setBookings([]);
      setLoading(false);
    }
  }, [authLoading, clientEmail]);

  useEffect(() => {
    if (authLoading || !clientEmail) return;

    const controller = new AbortController();
    fetchBookings(controller.signal);
    return () => controller.abort();
  }, [authLoading, clientEmail]);

  const handleDelete = async (booking) => {
    const id = normalizeId(booking);
    if (!id) {
      toast.info('Booking ID missing. Delete aborted.');
      return;
    }

    const confirmed = window.confirm(
      `Delete booking for "${booking.serviceName || 'this service'}"?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(id);
      const res = await fetch(`${API_BASE}/bookings/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to delete booking (${res.status}): ${text}`);
      }

      setBookings((prev) => prev.filter((item) => normalizeId(item) !== id));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Unable to delete booking. Please retry.');
    } finally {
      setDeletingId('');
    }
  };

  const openReviewModal = (booking) => {
    setActiveReviewBooking(booking);
    setReviewForm(emptyReview);
  };

  const closeReviewModal = () => {
    setActiveReviewBooking(null);
    setReviewForm(emptyReview);
    setSubmittingReview(false);
  };

  const handleReviewChange = (field, value) => {
    setReviewForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    if (!activeReviewBooking) return;

    const bookingId = normalizeId(activeReviewBooking);
    const serviceId =
      activeReviewBooking.serviceId?.$oid ||
      activeReviewBooking.serviceId ||
      activeReviewBooking.productId ||
      '';

    if (!serviceId) {
      toast.info('Service ID missing. Unable to submit review.');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await fetch(`${API_BASE}/products/${serviceId}/reviews`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          clientEmail: user.email,
          clientName: user.displayName || '',
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to submit review (${res.status}): ${text}`);
      }

      setBookings((prev) =>
        prev.map((booking) => {
          if (normalizeId(booking) !== bookingId) return booking;
          return { ...booking, reviewSubmitted: true };
        })
      );

      closeReviewModal();
      toast.success('Review submitted. Thank you!');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Unable to submit review. Please retry.');
      setSubmittingReview(false);
    }
  };

  const reviewedBookingIds = useMemo(
    () =>
      new Set(
        bookings
          .filter((booking) => booking.reviewSubmitted)
          .map((booking) => normalizeId(booking))
      ),
    [bookings]
  );

  if (!authLoading && !clientEmail) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-4">My Bookings</h2>
        <div className="alert alert-info max-w-xl">
          <span>Sign in to view your bookings.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-6">
      <h2 className="text-3xl font-bold">My Bookings</h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : error ? (
        <div className="alert alert-error max-w-xl">
          <span>{error}</span>
        </div>
      ) : bookings.length === 0 ? (
        <div className="alert alert-warning max-w-xl">
          <span>You have no bookings yet.</span>
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-100 shadow rounded-xl">
          <table className="table">
            <thead>
              <tr className="bg-base-200 text-sm uppercase">
                <th>Service</th>
                <th>Date</th>
                <th>Email</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const id = normalizeId(booking);
                const serviceName =
                  booking.serviceName || booking.serviceTitle || 'Untitled';
                const isReviewed =
                  booking.reviewSubmitted || reviewedBookingIds.has(id);

                return (
                  <tr
                    key={id}
                    className={
                      highlightId && id === highlightId
                        ? 'bg-success/20'
                        : ''
                    }
                  >
                    <td>
                      <div className="font-semibold">{serviceName}</div>
                      <div className="text-sm text-gray-500">
                        {booking.providerEmail || '—'}
                      </div>
                    </td>
                    <td>
                      {booking.bookingDate
                        ? new Date(booking.bookingDate).toLocaleDateString()
                        : '—'}
                    </td>
                    <td>{booking.clientEmail || '—'}</td>
                    <td>
                      <span className="badge badge-outline">
                        {booking.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button
                          className="btn btn-sm btn-neutral"
                          onClick={() => openReviewModal(booking)}
                          disabled={isReviewed}
                        >
                          {isReviewed ? 'Reviewed' : 'Add Review'}
                        </button>
                        <button
                          className="btn btn-sm btn-error text-base-100"
                          onClick={() => handleDelete(booking)}
                          disabled={deletingId === id}
                        >
                          {deletingId === id ? (
                            <>
                              <span className="loading loading-spinner loading-xs"></span>
                              Deleting…
                            </>
                          ) : (
                            'Delete'
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeReviewBooking && (
        <dialog className="modal modal-open">
          <form
            method="dialog"
            className="modal-box w-11/12 max-w-md"
            onSubmit={handleSubmitReview}
          >
            <h3 className="font-bold text-lg mb-4">
              Rate {activeReviewBooking.serviceName || 'this service'}
            </h3>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Rating</span>
                </label>
                <div className="rating rating-lg rating-half">
                  {[5, 4, 3, 2, 1].map((value) => (
                    <input
                      key={value}
                      type="radio"
                      name="rating"
                      className="mask mask-star-2 bg-warning"
                      value={value}
                      checked={reviewForm.rating === value}
                      onChange={() => handleReviewChange('rating', value)}
                    />
                  ))}
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Comment <span className="text-xs text-gray-400">(optional)</span>
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  rows={4}
                  value={reviewForm.comment}
                  onChange={(event) =>
                    handleReviewChange('comment', event.target.value)
                  }
                  placeholder="How was your experience?"
                ></textarea>
              </div>
            </div>

            <div className="modal-action gap-2 mt-6">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={closeReviewModal}
                disabled={submittingReview}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submittingReview}
              >
                {submittingReview ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Submitting…
                  </>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default MyBookings;