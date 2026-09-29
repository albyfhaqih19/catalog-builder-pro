import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { getUserPermission, isOwnerEmail } from '../../services/licenseService';
import { PendingApprovalPage } from '../../pages/PendingApprovalPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Memeriksa Sesi Login...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Allow admins, owners, or users with approved status / PRO plan
  if (user?.role === 'admin' || (user?.email && isOwnerEmail(user.email)) || user?.status === 'approved') {
    return <>{children}</>;
  }

  // Show pending screen for unapproved / FREE users
  return <PendingApprovalPage />;

  return <>{children}</>;
};
