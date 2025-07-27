import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-primary-600 rounded-full pulse-dot"></div>
          <div className="w-3 h-3 bg-primary-600 rounded-full pulse-dot"></div>
          <div className="w-3 h-3 bg-primary-600 rounded-full pulse-dot"></div>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
