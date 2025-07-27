import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Admin Dashboard
        </h1>
        <div className="card">
          <p className="text-gray-600">
            Admin dashboard is under development. This will include:
          </p>
          <ul className="mt-4 list-disc list-inside text-gray-600 space-y-2">
            <li>System statistics and analytics</li>
            <li>User management</li>
            <li>Detection monitoring</li>
            <li>System health metrics</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
