import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

interface AdminRouteProps {
  children: React.ReactElement;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    // If not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (user && user.role === 'admin') {
    // If user is an admin, render the children (the protected page)
    return children;
  }

  // If user is authenticated but not an admin, redirect to home page
  return <Navigate to="/" replace />;
};
