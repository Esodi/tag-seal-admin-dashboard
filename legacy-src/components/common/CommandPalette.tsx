import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    MapPin,
    Users,
    Syringe,
    Activity,
    Beef,
    Home,
    Plus
} from 'lucide-react';

interface CommandOption {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    action: () => void;
    category: 'Pages' | 'Actions' | 'Recent';
}

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();

    // Toggle with Cmd+K / Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Navigation Options
    const options: CommandOption[] = useMemo(() => [
        { id: 'home', label: 'Dashboard', icon: Home, category: 'Pages', action: () => navigate('/') },
        { id: 'livestock', label: 'Livestock Registry', icon: Beef, category: 'Pages', action: () => navigate('/livestock') },
        { id: 'farms', label: 'Farm Registry', icon: MapPin, category: 'Pages', action: () => navigate('/farms') },
        { id: 'farmers', label: 'Farmer Database', icon: Users, category: 'Pages', action: () => navigate('/farmers') },
        { id: 'health', label: 'Vaccination Monitoring', icon: Syringe, category: 'Pages', action: () => navigate('/health/vaccinations') },
        { id: 'analytics', label: 'Analytics', icon: Activity, category: 'Pages', action: () => navigate('/analytics') },
        { id: 'users', label: 'User Management', icon: Users, category: 'Pages', action: () => navigate('/users') },

        // Actions
        { id: 'new-livestock', label: 'Register New Livestock', icon: Plus, category: 'Actions', action: () => navigate('/livestock?action=create') }, // Assuming param handling or just nav
        { id: 'new-farm', label: 'Register New Farm', icon: Plus, category: 'Actions', action: () => navigate('/farms?action=create') },
    ], [navigate]);

    const filteredOptions = useMemo(() => {
        if (!query) return options;
        return options.filter(opt =>
            opt.label.toLowerCase().includes(query.toLowerCase()) ||
            opt.category.toLowerCase().includes(query.toLowerCase())
        );
    }, [query, options]);

    // Handle arrow keys
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredOptions.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredOptions[selectedIndex]) {
                    filteredOptions[selectedIndex].action();
                    setIsOpen(false);
                    setQuery('');
                }
            } else if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredOptions, selectedIndex]);

    // Reset selection on query change
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

            <div className="relative w-full max-w-xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl ring-1 ring-slate-900/5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center border-b border-slate-200 dark:border-slate-700 px-4">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input
                        autoFocus
                        type="text"
                        placeholder="Search pages, actions..."
                        className="flex-1 border-0 bg-transparent py-4 pl-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 sm:text-sm"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="text-xs text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5">
                        ESC
                    </div>
                </div>

                <div className="max-h-[300px] overflow-y-auto py-2">
                    {filteredOptions.length === 0 ? (
                        <p className="p-4 text-center text-sm text-slate-500">No results found.</p>
                    ) : (
                        <>
                            {Object.entries(
                                filteredOptions.reduce((acc, opt) => {
                                    (acc[opt.category] = acc[opt.category] || []).push(opt);
                                    return acc;
                                }, {} as Record<string, CommandOption[]>)
                            ).map(([category, opts]) => (
                                <div key={category}>
                                    <div className="px-4 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/50">
                                        {category}
                                    </div>
                                    {opts.map((opt) => {
                                        const isSelected = filteredOptions.indexOf(opt) === selectedIndex;
                                        return (
                                            <button
                                                key={opt.id}
                                                onClick={() => {
                                                    opt.action();
                                                    setIsOpen(false);
                                                }}
                                                onMouseEnter={() => setSelectedIndex(filteredOptions.indexOf(opt))}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isSelected
                                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                                    }`}
                                            >
                                                <opt.icon className={`w-4 h-4 ${isSelected ? 'text-primary-500' : 'text-slate-400'}`} />
                                                <span>{opt.label}</span>
                                                {isSelected && (
                                                    <span className="ml-auto text-xs text-primary-400">Jump to</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
