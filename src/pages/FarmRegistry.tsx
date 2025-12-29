import { useState, useMemo } from 'react';
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Eye,
    MapPin,
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { formatDate, formatNumber, cn } from '../lib/utils';

const ITEMS_PER_PAGE = 10;

// Farm item interface based on backend response
interface FarmItem {
    id: number;
    uuid: string;
    name: string;
    referenceNo?: string;
    farmerName?: string;
    farmerId?: number;
    regionName?: string;
    regionId?: number;
    districtName?: string;
    districtId?: number;
    wardName?: string;
    wardId?: number;
    livestock?: number;
    status?: 'active' | 'inactive';
    registeredAt?: string;
    created_at?: string;
    updated_at?: string;
    latitude?: number;
    longitude?: number;
    size?: number | string;
    sizeUnit?: string;
    [key: string]: unknown;
}

// Region item interface
interface RegionItem {
    id: number;
    name: string;
    [key: string]: unknown;
}

export function FarmRegistry() {
    const { data: farmsData, loading, error, refetch } = useApi<FarmItem[]>(() => api.farms.list() as Promise<FarmItem[]>, []);
    const { data: regionsData } = useApi<RegionItem[]>(() => api.regions.list() as Promise<RegionItem[]>, []);

    const [searchQuery, setSearchQuery] = useState('');
    const [regionFilter, setRegionFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedFarm, setSelectedFarm] = useState<FarmItem | null>(null);

    // Use API data or empty arrays
    const farms = farmsData ?? [];
    const regions = regionsData ?? [];

    // Filter and search logic
    const filteredFarms = useMemo(() => {
        return farms.filter((item: FarmItem) => {
            const matchesSearch =
                searchQuery === '' ||
                (item.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.referenceNo ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.farmerName ?? '').toLowerCase().includes(searchQuery.toLowerCase());

            const matchesRegion = regionFilter === 'All' || item.regionName === regionFilter;
            const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

            return matchesSearch && matchesRegion && matchesStatus;
        });
    }, [farms, searchQuery, regionFilter, statusFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredFarms.length / ITEMS_PER_PAGE) || 1;
    const paginatedFarms = filteredFarms.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Loading state
    if (loading) {
        return <PageLoader />;
    }

    // Error state
    if (error) {
        return <ErrorMessage message={error.message} onRetry={refetch} />;
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Farm Registry
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    National farm database - {filteredFarms.length.toLocaleString()} records found
                </p>
            </div>

            {/* Search and Filters */}
            <div className="card p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, reference, or farmer..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select
                            value={regionFilter}
                            onChange={(e) => {
                                setRegionFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="All">All Regions</option>
                            {regions.map((region: RegionItem) => (
                                <option key={region.id} value={region.name}>
                                    {region.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="All">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
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
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Reference</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Farm Name</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Farmer</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Region</th>
                                <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Livestock</th>
                                <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Size (ha)</th>
                                <th className="text-center py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                                <th className="text-center py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedFarms.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                >
                                    <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                                        {item.referenceNo}
                                    </td>
                                    <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{item.name}</td>
                                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.farmerName}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                            <MapPin className="w-3 h-3" />
                                            {item.regionName}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">
                                        {formatNumber(typeof item.livestock === 'number' ? item.livestock : 0)}
                                    </td>
                                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">{item.size ?? '-'}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={cn('badge', item.status === 'active' ? 'badge-success' : 'badge-danger')}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <button
                                            onClick={() => setSelectedFarm(item)}
                                            className="p-1 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400"
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
                        {Math.min(currentPage * ITEMS_PER_PAGE, filteredFarms.length)} of {filteredFarms.length}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm">Page {currentPage} of {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedFarm && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setSelectedFarm(null)} />
                    <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-xl z-50 overflow-auto max-h-[90vh]">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedFarm.name}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{selectedFarm.referenceNo}</p>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Farmer</label>
                                <p className="text-slate-900 dark:text-white">{selectedFarm.farmerName}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</label>
                                <span className={cn('badge', selectedFarm.status === 'active' ? 'badge-success' : 'badge-danger')}>
                                    {selectedFarm.status}
                                </span>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Region</label>
                                <p className="text-slate-900 dark:text-white">{selectedFarm.regionName}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">District</label>
                                <p className="text-slate-900 dark:text-white">{selectedFarm.districtName}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Ward</label>
                                <p className="text-slate-900 dark:text-white">{selectedFarm.wardName}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Livestock</label>
                                <p className="text-slate-900 dark:text-white">{formatNumber(typeof selectedFarm.livestock === 'number' ? selectedFarm.livestock : 0)}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Size</label>
                                <p className="text-slate-900 dark:text-white">{String(selectedFarm.size ?? '-')} {String(selectedFarm.sizeUnit ?? '')}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Registered</label>
                                <p className="text-slate-900 dark:text-white">{formatDate(selectedFarm.registeredAt ?? selectedFarm.created_at ?? '')}</p>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                            <button
                                onClick={() => setSelectedFarm(null)}
                                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
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
