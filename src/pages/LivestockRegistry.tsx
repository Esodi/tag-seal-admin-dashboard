import { useState, useMemo } from 'react';
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Eye,
} from 'lucide-react';
import { mockLivestock } from '../data/mockData';
import { formatDate, cn } from '../lib/utils';

const ITEMS_PER_PAGE = 10;

// Species filter options
const speciesOptions = ['All', 'Cattle', 'Goat', 'Sheep', 'Pig', 'Poultry'];
const statusOptions = ['All', 'active', 'sold', 'dead', 'transferred'];

export function LivestockRegistry() {
    const [searchQuery, setSearchQuery] = useState('');
    const [speciesFilter, setSpeciesFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedLivestock, setSelectedLivestock] = useState<typeof mockLivestock[0] | null>(null);

    // Filter and search logic
    const filteredLivestock = useMemo(() => {
        return mockLivestock.filter((item) => {
            const matchesSearch =
                searchQuery === '' ||
                item.identificationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.farmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.regionName.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesSpecies = speciesFilter === 'All' || item.species === speciesFilter;
            const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

            return matchesSearch && matchesSpecies && matchesStatus;
        });
    }, [searchQuery, speciesFilter, statusFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredLivestock.length / ITEMS_PER_PAGE);
    const paginatedLivestock = filteredLivestock.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'active':
                return 'badge-success';
            case 'sold':
            case 'transferred':
                return 'badge-warning';
            case 'dead':
                return 'badge-danger';
            default:
                return 'badge-info';
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Livestock Registry
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    National livestock database - {filteredLivestock.length.toLocaleString()} records found
                </p>
            </div>

            {/* Search and Filters */}
            <div className="card p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by ID, name, farm, or region..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    {/* Species Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select
                            value={speciesFilter}
                            onChange={(e) => {
                                setSpeciesFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            {speciesOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option === 'All' ? 'All Species' : option}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            {statusOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option === 'All' ? 'All Status' : option.charAt(0).toUpperCase() + option.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">ID</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Name</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Species</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Breed</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Farm</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Region</th>
                                <th className="text-center py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                                <th className="text-center py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedLivestock.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                >
                                    <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                                        {item.identificationNumber}
                                    </td>
                                    <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{item.name}</td>
                                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.species}</td>
                                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.breed}</td>
                                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.farmName}</td>
                                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.regionName}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={cn('badge', getStatusBadgeClass(item.status))}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <button
                                            onClick={() => setSelectedLivestock(item)}
                                            className="p-1 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                        {Math.min(currentPage * ITEMS_PER_PAGE, filteredLivestock.length)} of{' '}
                        {filteredLivestock.length} results
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedLivestock && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-50"
                        onClick={() => setSelectedLivestock(null)}
                    />
                    <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-xl z-50 overflow-auto max-h-[90vh]">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Livestock Details
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {selectedLivestock.identificationNumber}
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Name</label>
                                    <p className="text-slate-900 dark:text-white">{selectedLivestock.name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Species</label>
                                    <p className="text-slate-900 dark:text-white">{selectedLivestock.species}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Breed</label>
                                    <p className="text-slate-900 dark:text-white">{selectedLivestock.breed}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Type</label>
                                    <p className="text-slate-900 dark:text-white">{selectedLivestock.livestockType}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Gender</label>
                                    <p className="text-slate-900 dark:text-white capitalize">{selectedLivestock.gender}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</label>
                                    <span className={cn('badge', getStatusBadgeClass(selectedLivestock.status))}>
                                        {selectedLivestock.status}
                                    </span>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Farm</label>
                                    <p className="text-slate-900 dark:text-white">{selectedLivestock.farmName}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Region</label>
                                    <p className="text-slate-900 dark:text-white">{selectedLivestock.regionName}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Date of Birth</label>
                                    <p className="text-slate-900 dark:text-white">{formatDate(selectedLivestock.dateOfBirth)}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Registered</label>
                                    <p className="text-slate-900 dark:text-white">{formatDate(selectedLivestock.registeredAt)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                            <button
                                onClick={() => setSelectedLivestock(null)}
                                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
