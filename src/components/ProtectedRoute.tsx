import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'teacher' | 'admin';
  allowedRoles?: ('student' | 'teacher' | 'admin')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is blocked
  if (user.isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Account Blocked</h1>
          <p className="text-muted-foreground">Your account has been blocked. Please contact support.</p>
        </div>
      </div>
    );
  }

  // Check if user account is active
  if (!user.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Account Inactive</h1>
          <p className="text-muted-foreground">Your account is not active. Please contact support.</p>
        </div>
      </div>
    );
  }

  // Check role-based access and certificate verification
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    switch (user.role) {
      case 'admin':
        // Check if admin has verified certificate
        if (user.adminCertificate?.verified) {
          return <Navigate to="/admin-dashboard" replace />;
        } else {
          return <Navigate to="/admin-certificate" replace />;
        }
      case 'teacher':
        // Check if teacher is approved
        if (user.teacherApprovalStatus === 'approved') {
          return <Navigate to="/teacher-dashboard" replace />;
        } else {
          return <Navigate to="/teacher-pending-approval" replace />;
        }
      case 'student':
        return <Navigate to="/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // Additional checks for admin access
  if (requiredRole === 'admin' && user.role === 'admin') {
    // Check if admin has verified certificate
    if (!user.adminCertificate?.verified) {
      return <Navigate to="/admin-certificate" replace />;
    }
  }

  // Special handling for certificate verification page
  if (allowedRoles && allowedRoles.includes('admin') && user.role === 'admin') {
    // Allow access to certificate verification page even without verified certificate
    return <>{children}</>;
  }

  // Additional checks for teacher access
  if (requiredRole === 'teacher' && user.role === 'teacher') {
    // Check if teacher is approved
    if (user.teacherApprovalStatus !== 'approved') {
      return <Navigate to="/teacher-pending-approval" replace />;
    }
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    switch (user.role) {
      case 'admin':
        // Check if admin has verified certificate
        if (user.adminCertificate?.verified) {
          return <Navigate to="/admin-dashboard" replace />;
        } else {
          return <Navigate to="/admin-certificate" replace />;
        }
      case 'teacher':
        // Check if teacher is approved
        if (user.teacherApprovalStatus === 'approved') {
          return <Navigate to="/teacher-dashboard" replace />;
        } else {
          return <Navigate to="/teacher-pending-approval" replace />;
        }
      case 'student':
        return <Navigate to="/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};