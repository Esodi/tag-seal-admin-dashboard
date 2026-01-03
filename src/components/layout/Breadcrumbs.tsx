import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useMemo } from 'react';

// Map specific path segments to readable names if auto-capitalization isn't enough
const ROUTE_NAME_MAP: Record<string, string> = {
    'reproduction': 'Reproduction',
    'lifecycle': 'Lifecycle',
    'reference': 'Reference Data',
    'health': 'Health Records',
    'users': 'User Management',
    'birth-events': 'Birth Events',
    'birth-types': 'Birth Types',
    'birth-problems': 'Birth Problems',
    'calving-types': 'Calving Types',
    'calving-problems': 'Calving Problems',
    'heat-types': 'Heat Types',
    'semen-straw-types': 'Semen Straw Types',
    'insemination-services': 'Insemination Services',
    'reproductive-problems': 'Reproductive Problems',
    'disposal-types': 'Disposal Types',
    'feeding-types': 'Feeding Types',
    'milking-methods': 'Milking Methods',
    'vaccine-types': 'Vaccine Types',
    'medicine-types': 'Medicine Types',
    'administration-routes': 'Administration Routes',
    'identity-card-types': 'ID Types',
    'school-levels': 'School Levels',
    'legal-statuses': 'Legal Statuses',
    'livestock-types': 'Livestock Types',
    'livestock-obtained-methods': 'Obtained Methods',
    'system-users': 'System Admins',
    'extension-officers': 'Extension Officers',
    'farm-users': 'Farm Users',
    'extension-officer-farm-invites': 'Officer Invites',
    'otp-verifications': 'OTP Logs',
    'aborted-pregnancies': 'Abortions',
    'weight-changes': 'Weight Logs',
};

export function Breadcrumbs() {
    const location = useLocation();

    const crumbs = useMemo(() => {
        // Remove query params and trailing slash
        const path = location.pathname.split('?')[0].replace(/\/$/, '');

        if (!path || path === '/') {
            return [];
        }

        const segments = path.split('/').filter(Boolean);

        let currentPath = '';

        return segments.map((segment) => {
            currentPath += `/${segment}`;

            // Check map or auto-format
            const name = ROUTE_NAME_MAP[segment] ||
                segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

            return {
                name,
                path: currentPath,
            };
        });
    }, [location.pathname]);

    if (crumbs.length === 0) return null;

    return (
        <nav className="flex items-center text-sm text-slate-500 mb-4 overflow-x-auto whitespace-nowrap pb-1">
            <Link
                to="/"
                className="flex items-center hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
                <Home className="w-4 h-4" />
            </Link>

            {crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1;

                return (
                    <div key={crumb.path} className="flex items-center">
                        <ChevronRight className="w-4 h-4 mx-2 text-slate-400 flex-shrink-0" />

                        {isLast ? (
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                                {crumb.name}
                            </span>
                        ) : (
                            <Link
                                to={crumb.path}
                                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                                {crumb.name}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
