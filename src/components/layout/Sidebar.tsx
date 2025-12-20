import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    BarChart3,
    Beef,
    Building2,
    Users,
    MapPin,
    Shield,
    ChevronDown,
    ChevronRight,
    Menu,
    X,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    children?: { name: string; href: string }[];
}

const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    {
        name: 'Livestock Registry',
        href: '/livestock',
        icon: Beef,
        children: [
            { name: 'All Livestock', href: '/livestock' },
            { name: 'By Species', href: '/livestock/species' },
            { name: 'By Region', href: '/livestock/regions' },
        ],
    },
    {
        name: 'Farm Registry',
        href: '/farms',
        icon: Building2,
        children: [
            { name: 'All Farms', href: '/farms' },
            { name: 'By Region', href: '/farms/regions' },
        ],
    },
    {
        name: 'Farmer Database',
        href: '/farmers',
        icon: Users,
    },
    {
        name: 'Geographic Data',
        href: '/geographic',
        icon: MapPin,
        children: [
            { name: 'Regions', href: '/geographic/regions' },
            { name: 'Districts', href: '/geographic/districts' },
        ],
    },
    {
        name: 'Compliance',
        href: '/compliance',
        icon: Shield,
        children: [
            { name: 'Vaccination Monitoring', href: '/compliance/vaccinations' },
            { name: 'Movement Tracking', href: '/compliance/movements' },
            { name: 'Health Events', href: '/compliance/health' },
        ],
    },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const location = useLocation();
    const [expandedItems, setExpandedItems] = useState<string[]>(['Livestock Registry']);

    const toggleExpand = (name: string) => {
        setExpandedItems((prev) =>
            prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
        );
    };

    const isActive = (href: string) => {
        if (href === '/') return location.pathname === '/';
        return location.pathname.startsWith(href);
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
                        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                            <Beef className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg text-slate-900 dark:text-white">Tag & Seal</span>
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
                            Government Portal
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
                                                isActive(item.href)
                                                    ? 'bg-primary-600 text-white'
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
                                                                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
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
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                        <p>Ministry of Livestock</p>
                        <p>United Republic of Tanzania</p>
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
