import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../Firebase/firebase.init';

const googleProvider = new GoogleAuthProvider();

const API_BASE = 'https://synvo-it-solution-server.vercel.app';

const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);

    // Fetch user role from backend
    const fetchUserRole = async (email) => {
        try {
            const response = await fetch(`${API_BASE}/users/${encodeURIComponent(email)}`);
            if (response.ok) {
                const userData = await response.json();
                return userData.role || 'user';
            }
        } catch (error) {
            console.error('Error fetching user role:', error);
        }
        return 'user'; // Default role
    };

    const createUser = ( email, password ) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password)
    }

    const signInUser = ( email, password ) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password)
    }

    const signInWithGoogle = () => {
        setLoading(true);
        return signInWithPopup(auth, googleProvider)
    }

    const logOut = () => {
        setLoading(true);
        setUserRole(null);
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser?.email) {
                const role = await fetchUserRole(currentUser.email);
                setUserRole(role);
            } else {
                setUserRole(null);
            }
            setLoading(false);
        })
        return () => {
            unsubscribe();
        }
    }, [])

    const authInfo = {
        createUser,
        signInUser,
        signInWithGoogle,
        logOut,
        user,
        userRole,
        loading,
    }

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;