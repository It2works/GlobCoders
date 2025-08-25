import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AppDataProvider } from '@/hooks/useAppData';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner, ErrorState } from '@/components/ui/loading-states';

interface DataProviderProps {
    children: ReactNode;
}

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/about', '/contact'];

// Routes that require authentication but should be handled by ProtectedRoute
const PROTECTED_ROUTES = ['/dashboard', '/teacher-dashboard', '/admin-dashboard', '/admin-certificate', '/teacher-pending-approval'];

// Routes that need AppDataProvider but are public
const PUBLIC_WITH_DATA_ROUTES = ['/', '/courses'];

export const DataProvider = ({ children }: DataProviderProps) => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    // Check if current route is public
    const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);
    const isProtectedRoute = PROTECTED_ROUTES.includes(location.pathname);
    const isPublicWithDataRoute = PUBLIC_WITH_DATA_ROUTES.includes(location.pathname);

    // For public routes that need data (like courses), wrap in AppDataProvider
    if (isPublicWithDataRoute) {
        return (
            <AppDataProvider>
                {children}
            </AppDataProvider>
        );
    }

    // For public routes, always render children without authentication check
    if (isPublicRoute) {
        return <>{children}</>;
    }

    // For all other routes (including protected routes), wrap in AppDataProvider
    return (
        <AppDataProvider>
            {children}
        </AppDataProvider>
    );
}; 