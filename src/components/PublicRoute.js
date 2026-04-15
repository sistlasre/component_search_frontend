import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { user } = useAuth();

  // If the user is logged in, redirect them to the homepage
  if (user) {
    return <Navigate to="/" replace />;
  }

  // If not logged in, render the login/register component
  return children;
};

export default PublicRoute;