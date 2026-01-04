

import React from 'react';
import ServicesGrid from '../ServicesGrid/ServicesGrid';

const Services = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
                All Services
            </h1>
            <ServicesGrid 
                apiEndpoint="https://synvo-it-solution-server.vercel.app/products" 
                showFilter={true}
            />
        </div>
    );
};

export default Services;