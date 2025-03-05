import React from 'react';
import { Outlet } from 'react-router-dom';

const GuestLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <Outlet />
      </div>
    </div>
  );
};

export default GuestLayout; 