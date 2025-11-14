import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const API_BASE = 'https://synvo-it-solutions-server.vercel.app';

const MyServices = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  const providerEmail = user?.email;

  useEffect(() => {
    if (authLoading) return;
    if (!providerEmail) {
      setServices([]);
      setLoading(false);
      return;
    }

    
    const controller = new AbortController();

    const fetchServices = async () => {
      try {
        setLoading(true);
        setError('');
        const query = new URLSearchParams({ providerEmail }).toString();
        const response = await fetch(`${API_BASE}/products?${query}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to load services. Please try again.');
        }

        const payload = await response.json();
        const serviceArray = Array.isArray(payload)
          ? payload
          : payload.services || payload.data || [];

        setServices(serviceArray);
        if (serviceArray.length) {
          setSelectedService((prev) => prev ?? serviceArray[0]);
        } else {
          setSelectedService(null);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
          setError(err.message || 'Unexpected error while loading services.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchServices();

    return () => controller.abort();
  }, [authLoading, providerEmail, refreshKey]);

  const handleRefresh = () => setRefreshKey((prev) => prev + 1);

  const handleView = (service) => {
    setSelectedService(service);
  };

  // changed code: Add Service handler
  const handleAddService = () => {
    navigate('/add-service');
  };

  // changed code: Open Edit Modal
  const handleOpenEditModal = (service) => {
    setEditFormData({
      title: service.title || service.name || '',
      description: service.description || service.details || '',
      price: service.price ?? service.cost ?? service.rate ?? '',
      category: service.category || service.type || '',
      status: service.status || 'Active',
      image: service.image || '',
      duration: service.duration || '',
      location: service.location || '',
    });
    setIsEditModalOpen(true);
  };

  // changed code: Close Edit Modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditFormData({});
  };

  // changed code: Handle Form Input Change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // changed code: Submit Update Service
  const handleSubmitUpdate = async (e) => {
    e.preventDefault();

    const serviceId = selectedService?._id || selectedService?.id;
    if (!serviceId) {
      toast.info('Missing service identifier. Update aborted.');
      return;
    }

    const updatedData = {
      title: editFormData.title,
      description: editFormData.description,
      price: parseFloat(editFormData.price) || 0,
      category: editFormData.category,
      status: editFormData.status,
      image: editFormData.image,
      duration: editFormData.duration,
      location: editFormData.location,
    };

    try {
      const response = await fetch(`${API_BASE}/products/${serviceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Update request failed.');
      }

      const updatedService = await response.json();
      setServices((prev) =>
        prev.map((item) =>
          (item._id || item.id) === serviceId ? updatedService : item
        )
      );
      setSelectedService(updatedService);
      handleCloseEditModal();
      toast.success('Service updated successfully!');
    } catch (err) {
      console.error(err);
      toast.info('Unable to update service. Please retry.');
    }
  };

  const handleDelete = async (service) => {
    const serviceId = service?._id || service?.id;
    if (!serviceId) {
      toast.info('Missing service identifier. Delete aborted.');
      return;
    }

    const confirmed = window.confirm(
      `Delete "${service.title || service.name || 'this service'}"?`
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE}/products/${serviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Delete request failed.');
      }

      setServices((prev) =>
        prev.filter((item) => (item._id || item.id) !== serviceId)
      );
      setSelectedService((prev) =>
        prev && (prev._id || prev.id) === serviceId ? null : prev
      );
    } catch (err) {
      console.error(err);
      toast.info('Unable to delete service. Please retry.');
    }
  };

  if (!authLoading && !providerEmail) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-4">My Services</h2>
        <div className="alert alert-info max-w-xl">
          <span>Please sign in as a provider to manage your services.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">My Services</h2>
          <p className="text-gray-500">
            Manage offerings tied to your provider account ({providerEmail})
          </p>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Refreshing...
            </>
          ) : (
            'Refresh'
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : error ? (
        <div className="alert alert-error max-w-xl">
          <span>{error}</span>
        </div>
      ) : services.length === 0 ? (
        <div className="alert alert-warning max-w-xl">
          <span>You have not added any services yet.</span>
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-100 shadow rounded-xl">
          <table className="table">
            <thead>
              <tr className="bg-base-200 text-sm uppercase tracking-wide">
                <th>#</th>
                <th>Service</th>
                <th>Price</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => {
                const id = service._id || service.id || `row-${index}`;
                const isSelected =
                  selectedService &&
                  (selectedService._id || selectedService.id) ===
                    (service._id || service.id);

                return (
                  <tr key={id} className={isSelected ? 'bg-base-200/50' : ''}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="font-semibold">
                        {service.title || service.name || 'Untitled Service'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {service.category || service.type || 'No category'}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-outline badge-lg">
                        $
                        {service.price ??
                          service.cost ??
                          service.rate ??
                          'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-primary badge-outline">
                        {service.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => handleView(service)}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => handleDelete(service)}
                        >
                          Delete
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

      {selectedService && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h3 className="card-title">
                {selectedService.title ||
                  selectedService.name ||
                  'Service Details'}
              </h3>
              <span className="badge badge-outline">
                ID: {selectedService._id || selectedService.id || 'N/A'}
              </span>
            </div>
            <p className="text-gray-600">
              {selectedService.description ||
                selectedService.details ||
                'No description provided.'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">
                  {selectedService.category ||
                    selectedService.type ||
                    'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rate</p>
                <p className="font-medium">
                  $
                  {selectedService.price ??
                    selectedService.cost ??
                    selectedService.rate ??
                    'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">
                  {selectedService.status || 'Active'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">
                  {selectedService.duration || 'N/A'}
                </p>
              </div>
            </div>
            <div className="card-actions justify-end gap-2 pt-4">
              <button
                className="btn btn-outline btn-sm"
                onClick={handleAddService}
              >
                Add Service
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handleOpenEditModal(selectedService)}
              >
                Update Service
              </button>
              <button
                className="btn btn-error text-base-100 btn-sm"
                onClick={() => handleDelete(selectedService)}
              >
                Delete Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* changed code: Edit Modal */}
      {isEditModalOpen && (
        <dialog className="modal modal-open">
          <form method="dialog" className="modal-box w-11/12 max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Update Service</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Service Title</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleFormChange}
                  className="input input-bordered w-full"
                  placeholder="Enter service title"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Category</span>
                </label>
                <input
                  type="text"
                  name="category"
                  value={editFormData.category}
                  onChange={handleFormChange}
                  className="input input-bordered w-full"
                  placeholder="e.g. Web Design, Consulting"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Price ($)</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={editFormData.price}
                  onChange={handleFormChange}
                  className="input input-bordered w-full"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Duration</span>
                </label>
                <input
                  type="text"
                  name="duration"
                  value={editFormData.duration}
                  onChange={handleFormChange}
                  className="input input-bordered w-full"
                  placeholder="e.g. 2 hours, 1 day"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Location</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={editFormData.location}
                  onChange={handleFormChange}
                  className="input input-bordered w-full"
                  placeholder="e.g. Online, On-site"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Status</span>
                </label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleFormChange}
                  className="select select-bordered w-full"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Image URL</span>
                </label>
                <input
                  type="url"
                  name="image"
                  value={editFormData.image}
                  onChange={handleFormChange}
                  className="input input-bordered w-full"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-semibold">Description</span>
              </label>
              <textarea
                name="description"
                value={editFormData.description}
                onChange={handleFormChange}
                className="textarea textarea-bordered w-full h-24"
                placeholder="Describe your service in detail..."
              ></textarea>
            </div>

            <div className="modal-action gap-2 mt-6">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleCloseEditModal}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                onClick={handleSubmitUpdate}
              >
                Save Changes
              </button>
            </div>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default MyServices;