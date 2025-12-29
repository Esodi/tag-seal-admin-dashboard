import { useState, useMemo } from 'react';
import {
    MapPin,
    Users,
    Building2,
    Search,
    Eye,
    Map,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { formatNumber, cn } from '../lib/utils';

// District data interface
interface DistrictData {
    id: number;
    name: string;
    region?: string;
    regionName?: string;
    type?: 'Urban' | 'Rural' | string;
    wards?: number;
    farms?: number;
    livestock?: number;
    farmers?: number;
    vaccinationRate?: number;
    [key: string]: unknown;
}

// Region data interface
interface RegionData {
    id: number;
    name: string;
    [key: string]: unknown;
}

export function Districts() {
    const { data: districtsData, loading, error, refetch } = useApi<DistrictData[]>(
        () => api.districts.list() as Promise<DistrictData[]>,
        []
    );
    const { data: regionsData } = useApi<RegionData[]>(
        () => api.regions.list() as Promise<RegionData[]>,
        []
    );

    const [searchQuery, setSearchQuery] = useState('');
    const [regionFilter, setRegionFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);

    // Use API data or empty arrays
    const districts = districtsData ?? [];
    const regionsFromApi = regionsData ?? [];

    // Get unique regions from districts data or API
    const regions = useMemo(() => {
        const fromDistricts = [...new Set(districts.map((d) => d.region ?? d.regionName ?? ''))].filter(Boolean);
        if (fromDistricts.length > 0) return fromDistricts;
        return regionsFromApi.map(r => r.name);
    }, [districts, regionsFromApi]);

    // Compute stats from data
    const districtStats = useMemo(() => ({
        totalDistricts: districts.length,
        urbanDistricts: districts.filter(d => d.type === 'Urban').length,
        ruralDistricts: districts.filter(d => d.type !== 'Urban').length,
        totalWards: districts.reduce((sum, d) => sum + (d.wards ?? 0), 0),
    }), [districts]);

    // Chart data: districts per region
    const districtsPerRegion = useMemo(() => {
        const regionCounts: Record<string, number> = {};
        districts.forEach(d => {
            const region = d.region ?? d.regionName ?? 'Unknown';
            regionCounts[region] = (regionCounts[region] ?? 0) + 1;
        });
        return Object.entries(regionCounts)
            .map(([region, count]) => ({ region, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }, [districts]);

    const filteredDistricts = useMemo(() => districts.filter((district) => {
        const regionName = district.region ?? district.regionName ?? '';
        const matchesSearch =
            searchQuery === '' ||
            district.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            regionName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRegion = regionFilter === 'All' || regionName === regionFilter;
        const matchesType = typeFilter === 'All' || district.type === typeFilter;
        return matchesSearch && matchesRegion && matchesType;
    }), [districts, searchQuery, regionFilter, typeFilter]);

    const getVaccinationColor = (rate: number) => {
        if (rate >= 80) return 'text-green-600 dark:text-green-400';
        if (rate >= 70) return 'text-amber-600 dark:text-amber-400';
        return 'text-red-600 dark:text-red-400';
    };

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
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Districts</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Administrative districts across Tanzania's regions
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Districts</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{districtStats.totalDistricts}</p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <Map className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Urban Districts</p>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{districtStats.urbanDistricts}</p>
                        </div>
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                            <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Rural Districts</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{districtStats.ruralDistricts}</p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                            <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Wards</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatNumber(districtStats.totalWards)}</p>
                        </div>
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                            <Users className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="card">
                <div className="card-header">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Districts per Region (Top 8)</h2>
                </div>
                <div className="card-body">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={districtsPerRegion}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="region" stroke="#94a3b8" fontSize={11} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Bar dataKey="count" fill="#8b5cf6" name="Districts" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Districts Table */}
            <div className="card">
                <div className="card-header flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">All Districts</h2>
                    <div className="flex flex-wrap gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-48"
                            />
                        </div>
                        <select
                            value={regionFilter}
                            onChange={(e) => setRegionFilter(e.target.value)}
                            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                        >
                            <option value="All">All Regions</option>
                            {regions.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                        >
                            <option value="All">All Types</option>
                            <option value="Urban">Urban</option>
                            <option value="Rural">Rural</option>
                        </select>
                    </div>
                </div>
                <div className="card-body overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">District</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Region</th>
                                <th className="text-center py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Type</th>
                                <th className="text-center py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Wards</th>
                                <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Farms</th>
                                <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Livestock</th>
                                <th className="text-center py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Vaccination</th>
                                <th className="text-center py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDistricts.map((district) => (
                                <tr key={district.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="py-3 px-4">
                                        <span className="font-medium text-slate-900 dark:text-white">{district.name}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                            <MapPin className="w-3 h-3" />
                                            {district.region}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={cn('badge', district.type === 'Urban' ? 'badge-info' : 'badge-success')}>
                                            {district.type}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-300">{district.wards ?? 0}</td>
                                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">{formatNumber(district.farms ?? 0)}</td>
                                    <td className="py-3 px-4 text-right text-slate-900 dark:text-white font-medium">{formatNumber(district.livestock ?? 0)}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={cn('font-medium', getVaccinationColor(district.vaccinationRate ?? 0))}>
                                            {district.vaccinationRate ?? 0}%
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <button
                                            onClick={() => setSelectedDistrict(district)}
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
            </div>

            {/* Detail Modal */}
            {selectedDistrict && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setSelectedDistrict(null)} />
                    <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-xl z-50 overflow-auto max-h-[90vh]">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedDistrict.name}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{selectedDistrict.region} Region • {selectedDistrict.type}</p>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Wards</label>
                                <p className="text-slate-900 dark:text-white text-lg font-bold">{selectedDistrict.wards ?? 0}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Farmers</label>
                                <p className="text-slate-900 dark:text-white text-lg font-bold">{formatNumber(selectedDistrict.farmers ?? 0)}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Farms</label>
                                <p className="text-slate-900 dark:text-white text-lg font-bold">{formatNumber(selectedDistrict.farms ?? 0)}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Livestock</label>
                                <p className="text-slate-900 dark:text-white text-lg font-bold">{formatNumber(selectedDistrict.livestock ?? 0)}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Vaccination Rate</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={cn('h-full rounded-full', (selectedDistrict.vaccinationRate ?? 0) >= 80 ? 'bg-green-500' : (selectedDistrict.vaccinationRate ?? 0) >= 70 ? 'bg-amber-500' : 'bg-red-500')}
                                            style={{ width: `${selectedDistrict.vaccinationRate ?? 0}%` }}
                                        />
                                    </div>
                                    <span className={cn('font-bold', getVaccinationColor(selectedDistrict.vaccinationRate ?? 0))}>
                                        {selectedDistrict.vaccinationRate ?? 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                            <button
                                onClick={() => setSelectedDistrict(null)}
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
