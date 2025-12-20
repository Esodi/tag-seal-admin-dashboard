import { useState } from 'react';
import {
    ArrowRightLeft,
    Truck,
    MapPin,
    Calendar,
    Search,
    Eye,
    AlertTriangle,
    CheckCircle2,
    Clock,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts';
import { formatNumber, formatDate, cn } from '../lib/utils';

// Mock data for movement tracking
const movementStats = {
    totalMovements: 12450,
    pendingApprovals: 234,
    inTransit: 89,
    completedToday: 156,
};

const monthlyMovements = [
    { month: 'Jan', transfers: 980, quarantine: 45 },
    { month: 'Feb', transfers: 1120, quarantine: 52 },
    { month: 'Mar', transfers: 1340, quarantine: 38 },
    { month: 'Apr', transfers: 1180, quarantine: 61 },
    { month: 'May', transfers: 1420, quarantine: 43 },
    { month: 'Jun', transfers: 1580, quarantine: 55 },
    { month: 'Jul', transfers: 1290, quarantine: 48 },
    { month: 'Aug', transfers: 1450, quarantine: 52 },
    { month: 'Sep', transfers: 1380, quarantine: 39 },
    { month: 'Oct', transfers: 1520, quarantine: 57 },
    { month: 'Nov', transfers: 1680, quarantine: 44 },
    { month: 'Dec', transfers: 1510, quarantine: 51 },
];

const regionMovements = [
    { region: 'Arusha', inbound: 1250, outbound: 980 },
    { region: 'Dar es Salaam', inbound: 2100, outbound: 1850 },
    { region: 'Dodoma', inbound: 890, outbound: 1020 },
    { region: 'Mwanza', inbound: 1560, outbound: 1340 },
    { region: 'Kilimanjaro', inbound: 780, outbound: 920 },
];

const recentMovements = [
    {
        id: 'MVT-2024-001',
        livestockCount: 45,
        species: 'Cattle',
        fromFarm: 'Moshi Dairy Farm',
        toFarm: 'Arusha Livestock Market',
        fromRegion: 'Kilimanjaro',
        toRegion: 'Arusha',
        status: 'completed',
        date: '2024-12-18',
        permitNo: 'PRM-2024-5678',
    },
    {
        id: 'MVT-2024-002',
        livestockCount: 120,
        species: 'Goats',
        fromFarm: 'Dodoma Central Farm',
        toFarm: 'Singida Processing',
        fromRegion: 'Dodoma',
        toRegion: 'Singida',
        status: 'in_transit',
        date: '2024-12-19',
        permitNo: 'PRM-2024-5679',
    },
    {
        id: 'MVT-2024-003',
        livestockCount: 30,
        species: 'Cattle',
        fromFarm: 'Mwanza Ranches',
        toFarm: 'Shinyanga Market',
        fromRegion: 'Mwanza',
        toRegion: 'Shinyanga',
        status: 'pending',
        date: '2024-12-20',
        permitNo: 'PRM-2024-5680',
    },
    {
        id: 'MVT-2024-004',
        livestockCount: 200,
        species: 'Sheep',
        fromFarm: 'Iringa Highland Farm',
        toFarm: 'Dar es Salaam Abattoir',
        fromRegion: 'Iringa',
        toRegion: 'Dar es Salaam',
        status: 'quarantine',
        date: '2024-12-17',
        permitNo: 'PRM-2024-5677',
    },
    {
        id: 'MVT-2024-005',
        livestockCount: 80,
        species: 'Pigs',
        fromFarm: 'Tanga Pig Farm',
        toFarm: 'Mombasa Export',
        fromRegion: 'Tanga',
        toRegion: 'Export',
        status: 'completed',
        date: '2024-12-16',
        permitNo: 'PRM-2024-5676',
    },
];

export function MovementTracking() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedMovement, setSelectedMovement] = useState<typeof recentMovements[0] | null>(null);

    const filteredMovements = recentMovements.filter((item) => {
        const matchesSearch =
            searchQuery === '' ||
            item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.fromFarm.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.toFarm.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return { class: 'badge-success', icon: CheckCircle2, label: 'Completed' };
            case 'in_transit':
                return { class: 'badge-info', icon: Truck, label: 'In Transit' };
            case 'pending':
                return { class: 'badge-warning', icon: Clock, label: 'Pending' };
            case 'quarantine':
                return { class: 'badge-danger', icon: AlertTriangle, label: 'Quarantine' };
            default:
                return { class: 'badge-info', icon: Clock, label: status };
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Movement Tracking</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Monitor livestock transfers and quarantine movements across regions
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Movements</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                {formatNumber(movementStats.totalMovements)}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <ArrowRightLeft className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Approvals</p>
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                                {formatNumber(movementStats.pendingApprovals)}
                            </p>
                        </div>
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                            <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">In Transit</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                                {formatNumber(movementStats.inTransit)}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                            <Truck className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Completed Today</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                {formatNumber(movementStats.completedToday)}
                            </p>
                        </div>
                        <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl">
                            <CheckCircle2 className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Movements */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Monthly Movement Trends</h2>
                    </div>
                    <div className="card-body">
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyMovements}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                                    <YAxis stroke="#94a3b8" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    />
                                    <Line type="monotone" dataKey="transfers" stroke="#3b82f6" strokeWidth={2} name="Transfers" />
                                    <Line type="monotone" dataKey="quarantine" stroke="#ef4444" strokeWidth={2} name="Quarantine" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Regional Movements */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Regional Movement Flow</h2>
                    </div>
                    <div className="card-body">
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={regionMovements} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                                    <YAxis dataKey="region" type="category" stroke="#94a3b8" fontSize={11} width={100} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    />
                                    <Bar dataKey="inbound" fill="#10b981" name="Inbound" radius={[0, 4, 4, 0]} />
                                    <Bar dataKey="outbound" fill="#f59e0b" name="Outbound" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Movements Table */}
            <div className="card">
                <div className="card-header flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Movements</h2>
                    <div className="flex gap-2">
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
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                        >
                            <option value="All">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="in_transit">In Transit</option>
                            <option value="pending">Pending</option>
                            <option value="quarantine">Quarantine</option>
                        </select>
                    </div>
                </div>
                <div className="card-body overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Movement ID</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Livestock</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Route</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Date</th>
                                <th className="text-center py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                                <th className="text-center py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMovements.map((item) => {
                                const status = getStatusBadge(item.status);
                                return (
                                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-400">{item.id}</td>
                                        <td className="py-3 px-4">
                                            <div className="text-slate-900 dark:text-white font-medium">{item.livestockCount} {item.species}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                <MapPin className="w-3 h-3" />
                                                <span>{item.fromRegion}</span>
                                                <ArrowRightLeft className="w-3 h-3" />
                                                <span>{item.toRegion}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(item.date)}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={cn('badge', status.class)}>{status.label}</span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <button
                                                onClick={() => setSelectedMovement(item)}
                                                className="p-1 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedMovement && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setSelectedMovement(null)} />
                    <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-xl z-50 overflow-auto max-h-[90vh]">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Movement Details</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{selectedMovement.id}</p>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Permit No.</label>
                                <p className="text-slate-900 dark:text-white font-mono">{selectedMovement.permitNo}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</label>
                                <span className={cn('badge', getStatusBadge(selectedMovement.status).class)}>
                                    {getStatusBadge(selectedMovement.status).label}
                                </span>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Livestock</label>
                                <p className="text-slate-900 dark:text-white">{selectedMovement.livestockCount} {selectedMovement.species}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Date</label>
                                <p className="text-slate-900 dark:text-white">{formatDate(selectedMovement.date)}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">From</label>
                                <p className="text-slate-900 dark:text-white">{selectedMovement.fromFarm} ({selectedMovement.fromRegion})</p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">To</label>
                                <p className="text-slate-900 dark:text-white">{selectedMovement.toFarm} ({selectedMovement.toRegion})</p>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                            <button
                                onClick={() => setSelectedMovement(null)}
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
