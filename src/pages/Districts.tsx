import { useState } from 'react';
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
import { formatNumber, cn } from '../lib/utils';

// Mock data for Tanzania districts
const districtStats = {
    totalDistricts: 184,
    urbanDistricts: 42,
    ruralDistricts: 142,
    totalWards: 3956,
};

const districtsData = [
    { id: 1, name: 'Arusha City', region: 'Arusha', type: 'Urban', wards: 25, farms: 320, livestock: 12500, farmers: 280, vaccinationRate: 91.2 },
    { id: 2, name: 'Arusha District', region: 'Arusha', type: 'Rural', wards: 20, farms: 850, livestock: 35000, farmers: 720, vaccinationRate: 84.5 },
    { id: 3, name: 'Karatu', region: 'Arusha', type: 'Rural', wards: 18, farms: 680, livestock: 28000, farmers: 580, vaccinationRate: 82.1 },
    { id: 4, name: 'Longido', region: 'Arusha', type: 'Rural', wards: 15, farms: 420, livestock: 18500, farmers: 360, vaccinationRate: 78.3 },
    { id: 5, name: 'Meru', region: 'Arusha', type: 'Rural', wards: 22, farms: 720, livestock: 28500, farmers: 620, vaccinationRate: 86.7 },
    { id: 6, name: 'Monduli', region: 'Arusha', type: 'Rural', wards: 16, farms: 380, livestock: 16000, farmers: 320, vaccinationRate: 79.8 },
    { id: 7, name: 'Ngorongoro', region: 'Arusha', type: 'Rural', wards: 12, farms: 180, livestock: 8500, farmers: 150, vaccinationRate: 72.4 },
    { id: 8, name: 'Ilala', region: 'Dar es Salaam', type: 'Urban', wards: 34, farms: 180, livestock: 6500, farmers: 150, vaccinationRate: 94.2 },
    { id: 9, name: 'Kinondoni', region: 'Dar es Salaam', type: 'Urban', wards: 38, farms: 220, livestock: 8200, farmers: 190, vaccinationRate: 93.5 },
    { id: 10, name: 'Temeke', region: 'Dar es Salaam', type: 'Urban', wards: 36, farms: 280, livestock: 10500, farmers: 240, vaccinationRate: 91.8 },
    { id: 11, name: 'Ubungo', region: 'Dar es Salaam', type: 'Urban', wards: 28, farms: 150, livestock: 5800, farmers: 130, vaccinationRate: 92.1 },
    { id: 12, name: 'Kigamboni', region: 'Dar es Salaam', type: 'Urban', wards: 20, farms: 420, livestock: 14000, farmers: 360, vaccinationRate: 88.7 },
    { id: 13, name: 'Dodoma City', region: 'Dodoma', type: 'Urban', wards: 41, farms: 520, livestock: 18500, farmers: 450, vaccinationRate: 85.3 },
    { id: 14, name: 'Bahi', region: 'Dodoma', type: 'Rural', wards: 22, farms: 680, livestock: 28000, farmers: 580, vaccinationRate: 76.8 },
    { id: 15, name: 'Chamwino', region: 'Dodoma', type: 'Rural', wards: 32, farms: 920, livestock: 38500, farmers: 780, vaccinationRate: 78.2 },
    { id: 16, name: 'Chemba', region: 'Dodoma', type: 'Rural', wards: 18, farms: 450, livestock: 19000, farmers: 380, vaccinationRate: 74.5 },
    { id: 17, name: 'Kondoa', region: 'Dodoma', type: 'Rural', wards: 35, farms: 780, livestock: 32500, farmers: 660, vaccinationRate: 77.9 },
    { id: 18, name: 'Kongwa', region: 'Dodoma', type: 'Rural', wards: 25, farms: 650, livestock: 27000, farmers: 550, vaccinationRate: 79.1 },
    { id: 19, name: 'Mpwapwa', region: 'Dodoma', type: 'Rural', wards: 28, farms: 580, livestock: 24500, farmers: 490, vaccinationRate: 75.6 },
    { id: 20, name: 'Moshi Municipal', region: 'Kilimanjaro', type: 'Urban', wards: 21, farms: 280, livestock: 11200, farmers: 240, vaccinationRate: 92.5 },
];

const districtsPerRegion = [
    { region: 'Arusha', count: 7 },
    { region: 'Dar es Salaam', count: 5 },
    { region: 'Dodoma', count: 7 },
    { region: 'Kilimanjaro', count: 7 },
    { region: 'Mbeya', count: 7 },
    { region: 'Morogoro', count: 7 },
    { region: 'Mwanza', count: 7 },
    { region: 'Kagera', count: 8 },
];

export function Districts() {
    const [searchQuery, setSearchQuery] = useState('');
    const [regionFilter, setRegionFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [selectedDistrict, setSelectedDistrict] = useState<typeof districtsData[0] | null>(null);

    const regions = [...new Set(districtsData.map((d) => d.region))];

    const filteredDistricts = districtsData.filter((district) => {
        const matchesSearch =
            searchQuery === '' ||
            district.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            district.region.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRegion = regionFilter === 'All' || district.region === regionFilter;
        const matchesType = typeFilter === 'All' || district.type === typeFilter;
        return matchesSearch && matchesRegion && matchesType;
    });

    const getVaccinationColor = (rate: number) => {
        if (rate >= 80) return 'text-green-600 dark:text-green-400';
        if (rate >= 70) return 'text-amber-600 dark:text-amber-400';
        return 'text-red-600 dark:text-red-400';
    };

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
                                    <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-300">{district.wards}</td>
                                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">{formatNumber(district.farms)}</td>
                                    <td className="py-3 px-4 text-right text-slate-900 dark:text-white font-medium">{formatNumber(district.livestock)}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={cn('font-medium', getVaccinationColor(district.vaccinationRate))}>
                                            {district.vaccinationRate}%
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
                                <p className="text-slate-900 dark:text-white text-lg font-bold">{selectedDistrict.wards}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Farmers</label>
                                <p className="text-slate-900 dark:text-white text-lg font-bold">{formatNumber(selectedDistrict.farmers)}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Farms</label>
                                <p className="text-slate-900 dark:text-white text-lg font-bold">{formatNumber(selectedDistrict.farms)}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Livestock</label>
                                <p className="text-slate-900 dark:text-white text-lg font-bold">{formatNumber(selectedDistrict.livestock)}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Vaccination Rate</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={cn('h-full rounded-full', selectedDistrict.vaccinationRate >= 80 ? 'bg-green-500' : selectedDistrict.vaccinationRate >= 70 ? 'bg-amber-500' : 'bg-red-500')}
                                            style={{ width: `${selectedDistrict.vaccinationRate}%` }}
                                        />
                                    </div>
                                    <span className={cn('font-bold', getVaccinationColor(selectedDistrict.vaccinationRate))}>
                                        {selectedDistrict.vaccinationRate}%
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
