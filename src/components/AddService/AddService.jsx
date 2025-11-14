import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const API_BASE = 'https://synvo-it-solutions-server.vercel.app';

const AddService = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    location: '',
    image: '',
    status: 'Active',
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Handle form input change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user?.email) {
      toast.info('Please sign in to add a service');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    const serviceData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      location: formData.location,
      image: formData.image || 'https://via.placeholder.com/400x300?text=Service',
      status: formData.status,
      providerEmail: user.email,
      providerName: user.displayName || 'Anonymous Provider',
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add service');
      }

      const addedService = await response.json();
      console.log('Service added:', addedService);

      setSuccessMessage('Service added successfully! Redirecting...');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        location: '',
        image: '',
        status: 'Active',
      });

      // Redirect to My Services after 2 seconds
      setTimeout(() => {
        navigate('/my-services');
      }, 2000);
    } catch (err) {
      console.error('Error adding service:', err);
      setErrors({
        submit: err.message || 'Unable to add service. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-4">Add Service</h2>
        <div className="alert alert-info max-w-xl">
          <span>Please sign in to add a service.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2">Add New Service</h2>
          <p className="text-gray-600">
            Fill in the details below to add a new service to your portfolio
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Provider: <span className="font-semibold">{user.email}</span>
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="alert alert-success mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="alert alert-error mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m2-2l2 2M9 1H5a4 4 0 00-4 4v14a4 4 0 004 4h14a4 4 0 004-4V5a4 4 0 00-4-4h-4m-4 0h4"
              />
            </svg>
            <span>{errors.submit}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="card bg-base-100 shadow-xl">
          <form onSubmit={handleSubmit} className="card-body space-y-6">
            {/* Name and Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Service Name <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className={`input input-bordered w-full ${
                    errors.name ? 'input-error' : ''
                  }`}
                  placeholder="e.g. Web Design, Consulting"
                />
                {errors.name && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.name}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Category <span className="text-error">*</span>
                  </span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className={`select select-bordered w-full ${
                    errors.category ? 'select-error' : ''
                  }`}
                >
                  <option value="">Select a category</option>
                  <option value="Web Design">Web Design</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Graphic Design">Graphic Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="SEO">SEO</option>
                  <option value="Content Writing">Content Writing</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.category}
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* Price and Location Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Price ($) <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleFormChange}
                  className={`input input-bordered w-full ${
                    errors.price ? 'input-error' : ''
                  }`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                {errors.price && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.price}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Location <span className="text-error">*</span>
                  </span>
                </label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  className={`select select-bordered w-full ${
                    errors.location ? 'select-error' : ''
                  }`}
                >
                  <option value="">Select location type</option>
                  <option value="Online">Online</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
                {errors.location && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.location}
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Status</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="select select-bordered w-full"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {/* Description */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Description <span className="text-error">*</span>
                </span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                className={`textarea textarea-bordered w-full h-32 ${
                  errors.description ? 'textarea-error' : ''
                }`}
                placeholder="Provide a detailed description of your service..."
              ></textarea>
              {errors.description && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.description}
                  </span>
                </label>
              )}
            </div>

            {/* Image URL */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Image URL <span className="text-gray-400 text-xs">(Optional)</span>
                </span>
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleFormChange}
                className="input input-bordered w-full"
                placeholder="https://example.com/service-image.jpg"
              />
              <label className="label">
                <span className="label-text-alt text-gray-500">
                  Leave blank for default placeholder image
                </span>
              </label>
            </div>

            {/* Buttons */}
            <div className="card-actions justify-end gap-3 pt-6">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/my-services')}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Adding Service...
                  </>
                ) : (
                  'Add Service'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddService;