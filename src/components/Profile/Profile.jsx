import React, { useContext, useMemo, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';

const API_BASE = 'https://synvo-it-solutions-server.vercel.app';
const placeholderAvatar =
  'https://ui-avatars.com/api/?background=random&color=fff&name=';

const Profile = () => {
  const { user, loading } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    displayName: user?.displayName || user?.name || '',
    photoURL: user?.photoURL || '',
  });

  const displayName = useMemo(() => {
    if (!user) return '';
    return (
      user.displayName ||
      user.name ||
      user.email?.split('@')[0] ||
      'User'
    );
  }, [user]);

  const avatarSrc = useMemo(() => {
    if (!user) return '';
    const source = formData.photoURL || user.photoURL;
    if (source) return source;
    return `${placeholderAvatar}${encodeURIComponent(displayName)}`;
  }, [user, formData.photoURL, displayName]);

  const handleStartEditing = () => {
    setFormData({
      displayName: user?.displayName || user?.name || '',
      photoURL: user?.photoURL || '',
    });
    setError('');
    setSuccess('');
    setEditing(true);
  };

  const handleCancelEditing = () => {
    setEditing(false);
    setError('');
    setSuccess('');
  };

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await updateProfile(user, {
        displayName: formData.displayName,
        photoURL: formData.photoURL,
      });

      // optional: refresh auth context by forcing reload
      user.reload?.();

      await fetch(`${API_BASE}/users/${encodeURIComponent(user.email)}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: formData.displayName,
          photoURL: formData.photoURL,
        }),
      });

      setSuccess('Profile updated successfully.');
      setEditing(false);
    } catch (err) {
      console.error('Failed to update profile', err);
      setError(err.message || 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center gap-6">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-3xl font-bold">Profile</h2>
          <p className="text-gray-600">
            You need to sign in to view or edit your profile information.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>
            <Link to="/register" className="btn btn-outline">
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body flex flex-col md:flex-row md:items-center gap-6">
            <div className="avatar">
              <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                <img
                  src={avatarSrc}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <h2 className="text-3xl font-bold">{displayName}</h2>
              <p className="text-gray-600">{user.email}</p>

              {user.phoneNumber && (
                <p className="text-gray-500">Phone: {user.phoneNumber}</p>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="badge badge-outline">Member</span>
                {user.emailVerified ? (
                  <span className="badge badge-success badge-outline">
                    Email Verified
                  </span>
                ) : (
                  <span className="badge badge-warning badge-outline">
                    Email Not Verified
                  </span>
                )}
              </div>

              <button className="btn btn-primary btn-sm mt-4" onClick={handleStartEditing}>
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {editing && (
          <div className="card bg-base-100 shadow">
            <form className="card-body space-y-4" onSubmit={handleSubmit}>
              <h3 className="card-title text-lg">Update Profile</h3>

              {error && (
                <div className="alert alert-error">
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="alert alert-success">
                  <span>{success}</span>
                </div>
              )}

              <label className="form-control">
                <span className="label-text font-semibold">Display Name</span>
                <input
                  className="input input-bordered"
                  value={formData.displayName}
                  onChange={handleChange('displayName')}
                  placeholder="Enter your name"
                  required
                />
              </label>

              <label className="form-control">
                <span className="label-text font-semibold">
                  Photo URL <span className="text-xs text-gray-500">(optional)</span>
                </span>
                <input
                  className="input input-bordered"
                  value={formData.photoURL}
                  onChange={handleChange('photoURL')}
                  placeholder="https://example.com/photo.jpg"
                />
              </label>

              <div className="card-actions justify-end gap-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleCancelEditing}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Saving…
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default Profile;