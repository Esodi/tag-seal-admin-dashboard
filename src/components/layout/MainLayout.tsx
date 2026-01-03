import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumbs } from './Breadcrumbs';
import { CommandPalette } from '../common/CommandPalette';

export function MainLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="lg:ml-64 min-h-screen flex flex-col">
                <Header
                    onMenuClick={() => setIsSidebarOpen(true)}
                    isDarkMode={isDarkMode}
                    onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                />

                <main className="flex-1 p-4 lg:p-6">
                    <Breadcrumbs />
                    <Outlet />
                </main>

                <CommandPalette />

                <footer className="py-4 px-6 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                        © 2025 Tag & Seal - Ministry of Livestock, United Republic of Tanzania
                    </p>
                </footer>
            </div>
        </div>
    );
}
