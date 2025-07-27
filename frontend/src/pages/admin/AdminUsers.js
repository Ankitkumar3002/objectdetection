import React from 'react';

const AdminUsers = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          User Management
        </h1>
        <div className="card">
          <p className="text-gray-600">
            User management page is under development. This will include:
          </p>
          <ul className="mt-4 list-disc list-inside text-gray-600 space-y-2">
            <li>User list with search and filters</li>
            <li>User details and statistics</li>
            <li>Account activation/deactivation</li>
            <li>Role management</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
