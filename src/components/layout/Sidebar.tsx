import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    BarChart3,
    Beef,
    Building2,
    Users,
    MapPin,
    ChevronDown,
    ChevronRight,
    Menu,
    X,
    Heart,
    Baby,
    Activity,
    Database,
    Settings,
    ScrollText,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    children?: { name: string; href: string }[];
    badge?: number;
}

// Clean, standard admin dashboard navigation
const navigation: NavItem[] = [
    // Main
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Reports', href: '/reports', icon: ScrollText },

    // User Management
    {
        name: 'User Management',
        href: '/users',
        icon: Users,
        children: [
            { name: 'All Users', href: '/users' },
            { name: 'System Admins', href: '/users/admins' },
            { name: 'Field Officers', href: '/users/officers' },
            { name: 'Veterinarians', href: '/users/vets' },
            { name: 'Farm Invites', href: '/users/invites' },
        ],
    },

    // Core Data Management
    {
        name: 'Livestock',
        href: '/livestock',
        icon: Beef,
        children: [
            { name: 'All Livestock', href: '/livestock' },
            { name: 'Species', href: '/data/species' },
            { name: 'Breeds', href: '/data/breeds' },
            { name: 'Types', href: '/data/livestock-types' },
        ],
    },
    {
        name: 'Farms',
        href: '/farms',
        icon: Building2,
        children: [
            { name: 'All Farms', href: '/farms' },
            { name: 'Farmers', href: '/farmers' },
        ],
    },

    // Health & Medical
    {
        name: 'Health Records',
        href: '/health',
        icon: Heart,
        children: [
            { name: 'Vaccinations', href: '/health/vaccinations' },
            { name: 'Treatments', href: '/health/treatments' },
            { name: 'Dewormings', href: '/health/dewormings' },
            { name: 'Diseases', href: '/data/diseases' },
            { name: 'Vaccines', href: '/data/vaccines' },
            { name: 'Medicines', href: '/data/medicines' },
        ],
    },

    // Reproduction
    {
        name: 'Reproduction',
        href: '/reproduction',
        icon: Baby,
        children: [
            { name: 'Pregnancies', href: '/reproduction/pregnancies' },
            { name: 'Births', href: '/reproduction/births' },
            { name: 'Calvings', href: '/reproduction/calvings' },
            { name: 'Inseminations', href: '/reproduction/inseminations' },
            { name: 'Abortions', href: '/reproduction/abortions' },
            { name: 'Dry-offs', href: '/reproduction/dryoffs' },
        ],
    },

    // Lifecycle & Production
    {
        name: 'Production',
        href: '/production',
        icon: Activity,
        children: [
            { name: 'Milkings', href: '/production/milkings' },
            { name: 'Weight Records', href: '/production/weights' },
            { name: 'Feedings', href: '/production/feedings' },
            { name: 'Transfers', href: '/production/transfers' },
            { name: 'Disposals', href: '/production/disposals' },
        ],
    },

    // Location Management
    {
        name: 'Locations',
        href: '/locations',
        icon: MapPin,
        children: [
            { name: 'Countries', href: '/locations/countries' },
            { name: 'Regions', href: '/locations/regions' },
            { name: 'Districts', href: '/locations/districts' },
            { name: 'Wards', href: '/locations/wards' },
            { name: 'Villages', href: '/locations/villages' },
            { name: 'Streets', href: '/locations/streets' },
            { name: 'Divisions', href: '/locations/divisions' },
        ],
    },

    // Reference Data
    {
        name: 'Reference Data',
        href: '/data',
        icon: Database,
        children: [
            { name: 'Birth Types', href: '/data/birth-types' },
            { name: 'Birth Problems', href: '/data/birth-problems' },
            { name: 'Heat Types', href: '/data/heat-types' },
            { name: 'Disposal Types', href: '/data/disposal-types' },
            { name: 'Feeding Types', href: '/data/feeding-types' },
            { name: 'Milking Methods', href: '/data/milking-methods' },
            { name: 'Admin Routes', href: '/data/admin-routes' },
            { name: 'ID Card Types', href: '/data/id-types' },
            { name: 'School Levels', href: '/data/school-levels' },
            { name: 'Legal Statuses', href: '/data/legal-statuses' },
            { name: 'Obtained Methods', href: '/data/obtained-methods' },
            { name: 'Vaccine Types', href: '/data/vaccine-types' },
            { name: 'Medicine Types', href: '/data/medicine-types' },
            { name: 'Insemination Services', href: '/data/insemination-services' },
            { name: 'Semen Straw Types', href: '/data/semen-types' },
            { name: 'Reproductive Problems', href: '/data/reproductive-problems' },
            { name: 'Stages', href: '/data/stages' },
            { name: 'Test Results', href: '/data/test-results' },
        ],
    },

    // Settings
    { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const location = useLocation();
    const [expandedItems, setExpandedItems] = useState<string[]>(['User Management']);

    const toggleExpand = (name: string) => {
        setExpandedItems((prev) =>
            prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
        );
    };

    const isActive = (href: string) => {
        if (href === '/') return location.pathname === '/';
        return location.pathname.startsWith(href);
    };

    const isChildActive = (children?: { name: string; href: string }[]) => {
        if (!children) return false;
        return children.some(child => location.pathname === child.href);
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-900 text-slate-800 dark:text-white border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-700">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                            <Beef className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg text-slate-900 dark:text-white">Livestock Admin</span>
                    </Link>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4">
                    <div className="px-3 mb-2">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Main Menu
                        </span>
                    </div>
                    <ul className="space-y-1 px-2">
                        {navigation.map((item) => (
                            <li key={item.name}>
                                {item.children ? (
                                    <div>
                                        <button
                                            onClick={() => toggleExpand(item.name)}
                                            className={cn(
                                                'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors',
                                                isActive(item.href) || isChildActive(item.children)
                                                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon className="w-5 h-5" />
                                                <span>{item.name}</span>
                                            </div>
                                            {expandedItems.includes(item.name) ? (
                                                <ChevronDown className="w-4 h-4" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4" />
                                            )}
                                        </button>
                                        {expandedItems.includes(item.name) && (
                                            <ul className="mt-1 ml-8 space-y-1">
                                                {item.children.map((child) => (
                                                    <li key={child.href}>
                                                        <Link
                                                            to={child.href}
                                                            onClick={onClose}
                                                            className={cn(
                                                                'block px-3 py-2 text-sm rounded-lg transition-colors',
                                                                location.pathname === child.href
                                                                    ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-medium'
                                                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                                            )}
                                                        >
                                                            {child.name}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        to={item.href}
                                        onClick={onClose}
                                        className={cn(
                                            'flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                                            isActive(item.href)
                                                ? 'bg-primary-600 text-white'
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                        )}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span>{item.name}</span>
                                        {item.badge !== undefined && (
                                            <span className="ml-auto bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs font-medium px-2 py-0.5 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                        <p className="font-medium">Livestock Management</p>
                        <p>Admin Dashboard v1.0</p>
                    </div>
                </div>
            </aside>
        </>
    );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
        >
            <Menu className="w-6 h-6" />
        </button>
    );
}
