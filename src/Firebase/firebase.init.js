// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  // apiKey: "AIzaSyDuIlZ8CrhEkgNt6ySoCJNSBPda98rgGZY",
  // authDomain: "synvo-it-solutions.firebaseapp.com",
  // projectId: "synvo-it-solutions",
  // storageBucket: "synvo-it-solutions.firebasestorage.app",
  // messagingSenderId: "853395052115",
  // appId: "1:853395052115:web:59620a3d60cd208c5ed8a6"

   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID










};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Firebase Authentication and get a reference to the service
 export const auth = getAuth(app);
// Create and export Google auth provider for use in sign-in
export const googleProvider = new GoogleAuthProvider();