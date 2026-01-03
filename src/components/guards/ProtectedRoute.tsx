import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: string[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 dark:text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role requirements
    if (requiredRoles && user && !requiredRoles.includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Access Denied
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                        You don't have permission to access this page.
                    </p>
                    <a
                        href="/"
                        className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                        Go to Dashboard
                    </a>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

export default ProtectedRoute;
