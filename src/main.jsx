import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { RouterProvider } from 'react-router-dom';
import { createBrowserRouter } from 'react-router';
import RootLayout from './Layouts/RootLayout/RootLayout.jsx';
import Home from './components/Home/Home.jsx';
import Services from './components/Services/Services.jsx';
import MyServices from './components/MyServices/MyServices.jsx';
import AddService from './components/AddService/AddService.jsx';
import MyBookings from './components/MyBookings/MyBookings.jsx';
import Profile from './components/Profile/Profile.jsx';
import Login from './components/Auth/Login.jsx';
import Register from './components/Auth/Register.jsx';
import ServiceDetails from './components/ServiceDetails/ServiceDetails.jsx';
import AuthProvider from './contexts/AuthProvider.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: 'services', Component: Services },
      { path: 'service-details/:id', Component: ServiceDetails },
      { path: 'my-services', Component: MyServices },
      { path: 'add-service', Component: AddService },
      { path: 'my-bookings', Component: MyBookings },
      { path: 'profile', Component: Profile },
      { path: 'login', Component: Login },
      { path: 'register', Component: Register },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
         <ToastContainer position="top-right" autoClose={3000} />
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
);