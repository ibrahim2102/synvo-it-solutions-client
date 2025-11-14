import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';


const Register = () => {

    const { signInWithGoogle, createUser } = useContext(AuthContext);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleGoogleSignIn = () => {
        signInWithGoogle()
            .then(result => {
                console.log(result);

                const newUser = {
                    name: result.user.displayName,
                    email: result.user.email,
                    photoURL: result.user.photoURL
                }

               fetch('http://localhost:3000/users', {
                    
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json'
                    },

                    body: JSON.stringify(newUser)
               })

               .then(res => res.json())
               .then(data => {
                  console.log('data', data)
               });

               // clear form fields after successful Google sign-in
               setName('');
               setEmail('');
               setPhotoURL('');
               setPassword('');
               setConfirmPassword('');

            })
            .catch(error => {
                console.error(error);
            });
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            console.error('Passwords do not match');
            return;
        }

        createUser(email, password)
            .then(result => {
                console.log('registered', result.user);
                // optionally save additional user info to backend here

                const newUser = {
                    name: result.user.displayName,
                    email: result.user.email,
                    photoURL: result.user.photoURL
                }

               fetch('http://localhost:3000/users ', {
                    
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json'
                    },

                    body: JSON.stringify(newUser)
               })

               .then(res => res.json())
               .then(data => {
                  console.log('data', data)
               });

                // clear form on successful registration
                setName('');
                setEmail('');
                setPhotoURL('');
                setPassword('');
                setConfirmPassword('');
            })
            .catch(error => {
                console.error(error);
            });
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h2 className="text-4xl font-bold text-gray-900">
                        Create Account
                    </h2>
                    <p className="text-gray-600">
                        Sign up to get started with our services
                    </p>
                </div>

                {/* Card */}
                <div className="card bg-base-100 shadow-2xl">
                    <div className="card-body p-8 space-y-6">
                        {/* Google button */}
                        <button
                           onClick={handleGoogleSignIn}
                            type="button"
                            className="btn btn-outline w-full"
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Continue with Google
                        </button>

                        <div className="divider">OR</div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Full Name</span>
                                </label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    type="text"
                                    placeholder="Enter your full name"
                                    className="input input-bordered w-full"
                                    autoComplete="name"
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Email Address</span>
                                </label>
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="email"
                                    placeholder="Enter your email"
                                    className="input input-bordered w-full"
                                    autoComplete="email"
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Photo URL</span>
                                    <span className="label-text-alt text-gray-500">(Optional)</span>
                                </label>
                                <input
                                    value={photoURL}
                                    onChange={(e) => setPhotoURL(e.target.value)}
                                    type="url"
                                    placeholder="https://example.com/photo.jpg"
                                    className="input input-bordered w-full"
                                />
                                <label className="label">
                                    <span className="label-text-alt text-gray-500">
                                        Enter a URL to your profile picture
                                    </span>
                                </label>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Password</span>
                                </label>
                                <input
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    type="password"
                                    placeholder="Create a password"
                                    className="input input-bordered w-full"
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Confirm Password</span>
                                </label>
                                <input
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    type="password"
                                    placeholder="Confirm your password"
                                    className="input input-bordered w-full"
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className="form-control pt-2">
                                <button type="submit" className="btn btn-primary w-full">
                                    Create Account
                                </button>
                            </div>
                        </form>

                        <div className="text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="link link-primary font-semibold">
                                Sign in here
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;