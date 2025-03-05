import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <Link 
          to="/dashboard" 
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 