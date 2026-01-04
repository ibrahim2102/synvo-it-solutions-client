import React from 'react';
import { Outlet } from 'react-router';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

const RootLayout = () => {
    return (
        <div className="min-h-screen bg-base-200">
            <Navbar ></Navbar>
            <main className="bg-base-200">
                <Outlet></Outlet>
            </main>
            <Footer></Footer>
        </div>
    );
};

export default RootLayout;