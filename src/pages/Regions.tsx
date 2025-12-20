import { useState } from 'react';
import {
    MapPin,
    Building2,
    Beef,
    Search,
    Eye,
    BarChart3,
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
import { formatNumber, cn } from '../lib/utils';

// Mock data for Tanzania regions
const regionStats = {
    totalRegions: 31,
    totalDistricts: 184,
    totalFarms: 45230,
    totalLivestock: 1234567,
};

const regionsData = [
    { id: 1, name: 'Arusha', code: 'AR', districts: 7, farms: 3450, livestock: 125000, farmers: 2800, vaccinationRate: 85.2, status: 'active' },
    { id: 2, name: 'Dar es Salaam', code: 'DS', districts: 5, farms: 1250, livestock: 45000, farmers: 980, vaccinationRate: 92.1, status: 'active' },
    { id: 3, name: 'Dodoma', code: 'DO', districts: 7, farms: 4200, livestock: 165000, farmers: 3500, vaccinationRate: 78.5, status: 'active' },
    { id: 4, name: 'Geita', code: 'GE', districts: 5, farms: 2800, livestock: 98000, farmers: 2200, vaccinationRate: 71.3, status: 'active' },
    { id: 5, name: 'Iringa', code: 'IR', districts: 5, farms: 3100, livestock: 142000, farmers: 2650, vaccinationRate: 82.7, status: 'active' },
    { id: 6, name: 'Kagera', code: 'KA', districts: 8, farms: 3800, livestock: 156000, farmers: 3100, vaccinationRate: 76.8, status: 'active' },
    { id: 7, name: 'Katavi', code: 'KT', districts: 3, farms: 1200, livestock: 52000, farmers: 950, vaccinationRate: 68.4, status: 'active' },
    { id: 8, name: 'Kigoma', code: 'KI', districts: 6, farms: 2100, livestock: 78000, farmers: 1750, vaccinationRate: 72.1, status: 'active' },
    { id: 9, name: 'Kilimanjaro', code: 'KL', districts: 7, farms: 2950, livestock: 118000, farmers: 2450, vaccinationRate: 89.3, status: 'active' },
    { id: 10, name: 'Lindi', code: 'LI', districts: 6, farms: 1800, livestock: 62000, farmers: 1400, vaccinationRate: 65.2, status: 'active' },
    { id: 11, name: 'Manyara', code: 'MA', districts: 6, farms: 3250, livestock: 138000, farmers: 2700, vaccinationRate: 79.6, status: 'active' },
    { id: 12, name: 'Mara', code: 'MR', districts: 6, farms: 2600, livestock: 112000, farmers: 2150, vaccinationRate: 74.8, status: 'active' },
    { id: 13, name: 'Mbeya', code: 'MB', districts: 7, farms: 3650, livestock: 152000, farmers: 3050, vaccinationRate: 81.4, status: 'active' },
    { id: 14, name: 'Morogoro', code: 'MO', districts: 7, farms: 3900, livestock: 168000, farmers: 3250, vaccinationRate: 77.9, status: 'active' },
    { id: 15, name: 'Mtwara', code: 'MT', districts: 5, farms: 1650, livestock: 58000, farmers: 1300, vaccinationRate: 69.5, status: 'active' },
    { id: 16, name: 'Mwanza', code: 'MW', districts: 7, farms: 3400, livestock: 145000, farmers: 2850, vaccinationRate: 75.2, status: 'active' },
    { id: 17, name: 'Njombe', code: 'NJ', districts: 4, farms: 1950, livestock: 82000, farmers: 1600, vaccinationRate: 84.6, status: 'active' },
    { id: 18, name: 'Pwani', code: 'PW', districts: 6, farms: 2200, livestock: 76000, farmers: 1800, vaccinationRate: 73.1, status: 'active' },
    { id: 19, name: 'Rukwa', code: 'RK', districts: 4, farms: 1750, livestock: 72000, farmers: 1450, vaccinationRate: 70.8, status: 'active' },
    { id: 20, name: 'Ruvuma', code: 'RV', districts: 5, farms: 2350, livestock: 94000, farmers: 1950, vaccinationRate: 78.2, status: 'active' },
    { id: 21, name: 'Shinyanga', code: 'SH', districts: 5, farms: 2850, livestock: 124000, farmers: 2350, vaccinationRate: 72.9, status: 'active' },
];

const topRegionsChart = regionsData
    .sort((a, b) => b.livestock - a.livestock)
    .slice(0, 10)
    .map((r) => ({ name: r.name, livestock: r.livestock, farms: r.farms }));

export function Regions() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRegion, setSelectedRegion] = useState<typeof regionsData[0] | null>(null);

    const filteredRegions = regionsData.filter((region) =>
        searchQuery === '' ||
        region.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        region.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getVaccinationColor = (rate: number) => {
        if (rate >= 80) return 'text-green-600 dark:text-green-400';
        if (rate >= 70) return 'text-amber-600 dark:text-amber-400';
        return 'text-red-600 dark:text-red-400';
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Regions</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Geographic regions of Tanzania with livestock and farm statistics
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Regions</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{regionStats.totalRegions}</p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Districts</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{regionStats.totalDistricts}</p>
                        </div>
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                            <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Farms</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatNumber(regionStats.totalFarms)}</p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                            <Building2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Livestock</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatNumber(regionStats.totalLivestock)}</p>
                        </div>
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                            <Beef className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="card">
                <div className="card-header">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Top 10 Regions by Livestock</h2>
                </div>
                <div className="card-body">
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topRegionsChart} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${val / 1000}k`} />
                                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={90} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    formatter={(value) => formatNumber(value as number)}
                                />
                                <Bar dataKey="livestock" fill="#3b82f6" name="Livestock" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Regions Table */}
            <div className="card">
                <div className="card-header flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">All Regions</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search regions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
                        />
                    </div>
                </div>
                <div className="card-body overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Region</th>
                                <th className="text-center py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Code</th>
                                <th className="text-center py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Districts</th>
                                <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Farms</th>
                                <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Livestock</th>
                                <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Farmers</th>
                                <th className="text-center py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Vaccination</th>
                                <th className="text-center py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRegions.map((region) => (
                                <tr key={region.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-primary-500" />
                                            <span className="font-medium text-slate-900 dark:text-white">{region.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{region.code}</span>
                                    </td>
                                    <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-300">{region.districts}</td>
                                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">{formatNumber(region.farms)}</td>
                                    <td className="py-3 px-4 text-right text-slate-900 dark:text-white font-medium">{formatNumber(region.livestock)}</td>
                                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">{formatNumber(region.farmers)}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={cn('font-medium', getVaccinationColor(region.vaccinationRate))}>
                                            {region.vaccinationRate}%
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <button
                                            onClick={() => setSelectedRegion(region)}
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
            {selectedRegion && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setSelectedRegion(null)} />
                    <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-xl z-50 overflow-auto max-h-[90vh]">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedRegion.name} Region</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Code: {selectedRegion.code}</p>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Districts</label>
                                <p className="text-slate-900 dark:text-white text-lg font-bold">{selectedRegion.districts}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Farmers</label>
                                <p className="text-slate-900 dark:text-white text-lg font-bold">{formatNumber(selectedRegion.farmers)}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Farms</label>
                                <p className="text-slate-900 dark:text-white text-lg font-bold">{formatNumber(selectedRegion.farms)}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Livestock</label>
                                <p className="text-slate-900 dark:text-white text-lg font-bold">{formatNumber(selectedRegion.livestock)}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Vaccination Rate</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={cn('h-full rounded-full', selectedRegion.vaccinationRate >= 80 ? 'bg-green-500' : selectedRegion.vaccinationRate >= 70 ? 'bg-amber-500' : 'bg-red-500')}
                                            style={{ width: `${selectedRegion.vaccinationRate}%` }}
                                        />
                                    </div>
                                    <span className={cn('font-bold', getVaccinationColor(selectedRegion.vaccinationRate))}>
                                        {selectedRegion.vaccinationRate}%
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                            <button
                                onClick={() => setSelectedRegion(null)}
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
