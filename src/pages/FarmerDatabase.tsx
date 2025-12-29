import { useState, useMemo } from 'react';
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Eye,
    Phone,
    Mail,
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { formatDate, formatNumber, cn } from '../lib/utils';

const ITEMS_PER_PAGE = 10;

// Farmer item interface based on backend response
interface FarmerItem {
    id: number;
    uuid?: string;
    firstName: string;
    middleName?: string;
    surname: string;
    farmerNo?: string;
    phone?: string;
    phone1?: string;
    email?: string;
    gender?: 'male' | 'female';
    regionName?: string;
    regionId?: number;
    districtName?: string;
    districtId?: number;
    farmsCount?: number;
    livestockCount?: number;
    registeredAt?: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}

// Region item interface
interface RegionItem {
    id: number;
    name: string;
    [key: string]: unknown;
}

export function FarmerDatabase() {
    const { data: farmersData, loading, error, refetch } = useApi<FarmerItem[]>(() => api.farmers.list() as Promise<FarmerItem[]>, []);
    const { data: regionsData } = useApi<RegionItem[]>(() => api.regions.list() as Promise<RegionItem[]>, []);

    const [searchQuery, setSearchQuery] = useState('');
    const [regionFilter, setRegionFilter] = useState('All');
    const [genderFilter, setGenderFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedFarmer, setSelectedFarmer] = useState<FarmerItem | null>(null);

    // Use API data or empty arrays
    const farmers = farmersData ?? [];
    const regions = regionsData ?? [];

    // Filter and search logic
    const filteredFarmers = useMemo(() => {
        return farmers.filter((item: FarmerItem) => {
            const fullName = `${item.firstName} ${item.middleName || ''} ${item.surname}`.toLowerCase();
            const matchesSearch =
                searchQuery === '' ||
                fullName.includes(searchQuery.toLowerCase()) ||
                (item.farmerNo ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.phone ?? item.phone1 ?? '').includes(searchQuery);

            const matchesRegion = regionFilter === 'All' || item.regionName === regionFilter;
            const matchesGender = genderFilter === 'All' || item.gender === genderFilter;

            return matchesSearch && matchesRegion && matchesGender;
        });
    }, [farmers, searchQuery, regionFilter, genderFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredFarmers.length / ITEMS_PER_PAGE) || 1;
    const paginatedFarmers = filteredFarmers.slice(
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
                    Farmer Database
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Registered farmers - {filteredFarmers.length.toLocaleString()} records found
                </p>
            </div>

            {/* Search and Filters */}
            <div className="card p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, ID, or phone..."
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
                            value={genderFilter}
                            onChange={(e) => {
                                setGenderFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="All">All Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
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
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Farmer ID</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Name</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Phone</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Region</th>
                                <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Farms</th>
                                <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Livestock</th>
                                <th className="text-center py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Gender</th>
                                <th className="text-center py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedFarmers.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                >
                                    <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                                        {item.farmerNo}
                                    </td>
                                    <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">
                                        {item.firstName} {item.middleName || ''} {item.surname}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                            <Phone className="w-3 h-3" />
                                            {item.phone}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.regionName}</td>
                                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">{item.farmsCount ?? 0}</td>
                                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">
                                        {formatNumber(item.livestockCount ?? 0)}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={cn('badge', item.gender === 'male' ? 'badge-info' : 'badge-warning')}>
                                            {item.gender}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <button
                                            onClick={() => setSelectedFarmer(item)}
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
                        {Math.min(currentPage * ITEMS_PER_PAGE, filteredFarmers.length)} of {filteredFarmers.length}
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
            {selectedFarmer && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setSelectedFarmer(null)} />
                    <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-xl z-50 overflow-auto max-h-[90vh]">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {selectedFarmer.firstName} {selectedFarmer.middleName || ''} {selectedFarmer.surname}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{selectedFarmer.farmerNo}</p>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Phone</label>
                                <p className="text-slate-900 dark:text-white flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> {selectedFarmer.phone}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Email</label>
                                <p className="text-slate-900 dark:text-white flex items-center gap-1">
                                    {selectedFarmer.email ? (
                                        <><Mail className="w-3 h-3" /> {selectedFarmer.email}</>
                                    ) : (
                                        <span className="text-slate-400">Not provided</span>
                                    )}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Gender</label>
                                <span className={cn('badge', selectedFarmer.gender === 'male' ? 'badge-info' : 'badge-warning')}>
                                    {selectedFarmer.gender}
                                </span>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Region</label>
                                <p className="text-slate-900 dark:text-white">{selectedFarmer.regionName}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">District</label>
                                <p className="text-slate-900 dark:text-white">{selectedFarmer.districtName}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Ward</label>
                                <p className="text-slate-900 dark:text-white">{String(selectedFarmer.wardName ?? '-')}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Farms</label>
                                <p className="text-slate-900 dark:text-white">{selectedFarmer.farmsCount ?? 0}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Livestock</label>
                                <p className="text-slate-900 dark:text-white">{formatNumber(selectedFarmer.livestockCount ?? 0)}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Registered</label>
                                <p className="text-slate-900 dark:text-white">{formatDate(selectedFarmer.registeredAt ?? selectedFarmer.created_at ?? '')}</p>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                            <button
                                onClick={() => setSelectedFarmer(null)}
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
