import { useState } from 'react';
import {
    Bell,
    Search,
    Moon,
    Sun,
    User,
    LogOut,
    Settings,
    ChevronDown,
} from 'lucide-react';
import { MobileMenuButton } from './Sidebar';

interface HeaderProps {
    onMenuClick: () => void;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
}

export function Header({ onMenuClick, isDarkMode, onToggleDarkMode }: HeaderProps) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 lg:px-6">
            <div className="flex items-center justify-between h-full">
                {/* Left side */}
                <div className="flex items-center gap-4">
                    <MobileMenuButton onClick={onMenuClick} />

                    {/* Search */}
                    <div className="hidden sm:flex items-center">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search livestock, farms, farmers..."
                                className="w-64 lg:w-80 pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    {/* Dark mode toggle */}
                    <button
                        onClick={onToggleDarkMode}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {isDarkMode ? (
                            <Sun className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        ) : (
                            <Moon className="w-5 h-5 text-slate-600" />
                        )}
                    </button>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </button>

                        {isNotificationsOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsNotificationsOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                                        <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700">
                                            <p className="text-sm font-medium text-red-600 dark:text-red-400">Disease Alert</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-300">Foot-and-mouth detected in Manyara</p>
                                            <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
                                        </div>
                                        <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700">
                                            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Low Vaccination</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-300">Mtwara region below 60%</p>
                                            <p className="text-xs text-slate-400 mt-1">1 day ago</p>
                                        </div>
                                        <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700">
                                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Milestone</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-300">1.2M livestock registered</p>
                                            <p className="text-xs text-slate-400 mt-1">3 days ago</p>
                                        </div>
                                    </div>
                                    <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                                        <button className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium">
                                            View all notifications
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Profile dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <span className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-200">
                                Admin User
                            </span>
                            <ChevronDown className="hidden md:block w-4 h-4 text-slate-400" />
                        </button>

                        {isProfileOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsProfileOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                                        <p className="font-semibold text-slate-900 dark:text-white">Admin User</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">admin@gov.tz</p>
                                    </div>
                                    <div className="py-2">
                                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                                            <Settings className="w-4 h-4" />
                                            Settings
                                        </button>
                                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-slate-50 dark:hover:bg-slate-700">
                                            <LogOut className="w-4 h-4" />
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
