import React from 'react';
import { Link } from 'react-router-dom';
import { UserIcon } from 'lucide-react';

const Users: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <Link
          to="/users/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition"
        >
          Add New User
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center justify-center text-gray-500">
            <UserIcon className="w-8 h-8 mr-2" />
            <p>No users found</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users; 