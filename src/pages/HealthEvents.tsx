import { useState } from 'react';
import {
    Activity,
    Syringe,
    AlertTriangle,
    Skull,
    Search,
    Calendar,
    MapPin,
    Eye,
    TrendingUp,
    TrendingDown,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { formatNumber, formatDate, cn } from '../lib/utils';

// Mock data for health events
const healthStats = {
    totalEvents: 3240,
    diseaseOutbreaks: 12,
    mortalityCount: 856,
    recoveryRate: 94.2,
};

const eventsByType = [
    { type: 'Vaccination', count: 1850, color: '#3b82f6' },
    { type: 'Treatment', count: 720, color: '#10b981' },
    { type: 'Disease Report', count: 340, color: '#f59e0b' },
    { type: 'Mortality', count: 230, color: '#ef4444' },
    { type: 'Quarantine', count: 100, color: '#8b5cf6' },
];

const monthlyEvents = [
    { month: 'Jan', disease: 28, mortality: 65, treatment: 120 },
    { month: 'Feb', disease: 22, mortality: 58, treatment: 135 },
    { month: 'Mar', disease: 35, mortality: 72, treatment: 145 },
    { month: 'Apr', disease: 18, mortality: 48, treatment: 110 },
    { month: 'May', disease: 42, mortality: 85, treatment: 160 },
    { month: 'Jun', disease: 30, mortality: 62, treatment: 125 },
    { month: 'Jul', disease: 25, mortality: 55, treatment: 115 },
    { month: 'Aug', disease: 38, mortality: 78, treatment: 155 },
    { month: 'Sep', disease: 20, mortality: 52, treatment: 105 },
    { month: 'Oct', disease: 32, mortality: 68, treatment: 140 },
    { month: 'Nov', disease: 28, mortality: 60, treatment: 130 },
    { month: 'Dec', disease: 22, mortality: 53, treatment: 115 },
];

const recentEvents = [
    {
        id: 'HE-2024-001',
        type: 'Disease Report',
        severity: 'high',
        disease: 'Foot and Mouth Disease',
        livestockAffected: 45,
        species: 'Cattle',
        farmName: 'Moshi Highland Farm',
        region: 'Kilimanjaro',
        reportedDate: '2024-12-18',
        status: 'active',
    },
    {
        id: 'HE-2024-002',
        type: 'Mortality',
        severity: 'medium',
        disease: 'East Coast Fever',
        livestockAffected: 12,
        species: 'Cattle',
        farmName: 'Arusha Dairy Co.',
        region: 'Arusha',
        reportedDate: '2024-12-17',
        status: 'investigating',
    },
    {
        id: 'HE-2024-003',
        type: 'Treatment',
        severity: 'low',
        disease: 'Pneumonia',
        livestockAffected: 25,
        species: 'Goats',
        farmName: 'Dodoma Goat Farm',
        region: 'Dodoma',
        reportedDate: '2024-12-19',
        status: 'resolved',
    },
    {
        id: 'HE-2024-004',
        type: 'Disease Report',
        severity: 'critical',
        disease: 'African Swine Fever',
        livestockAffected: 180,
        species: 'Pigs',
        farmName: 'Tanga Pig Farm',
        region: 'Tanga',
        reportedDate: '2024-12-20',
        status: 'quarantine',
    },
    {
        id: 'HE-2024-005',
        type: 'Vaccination',
        severity: 'low',
        disease: 'Newcastle Disease',
        livestockAffected: 500,
        species: 'Poultry',
        farmName: 'Dar es Salaam Poultry Ltd',
        region: 'Dar es Salaam',
        reportedDate: '2024-12-16',
        status: 'completed',
    },
];

export function HealthEvents() {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [selectedEvent, setSelectedEvent] = useState<typeof recentEvents[0] | null>(null);

    const filteredEvents = recentEvents.filter((item) => {
        const matchesSearch =
            searchQuery === '' ||
            item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.disease.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.farmName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'All' || item.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-600 text-white';
            case 'high':
                return 'badge-danger';
            case 'medium':
                return 'badge-warning';
            case 'low':
                return 'badge-success';
            default:
                return 'badge-info';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return 'badge-danger';
            case 'investigating':
                return 'badge-warning';
            case 'quarantine':
                return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            case 'resolved':
            case 'completed':
                return 'badge-success';
            default:
                return 'badge-info';
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Health Events</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Disease reports, mortality tracking, and health compliance monitoring
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Events</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                {formatNumber(healthStats.totalEvents)}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Outbreaks</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                                {healthStats.diseaseOutbreaks}
                            </p>
                            <div className="flex items-center gap-1 mt-1 text-xs text-red-600 dark:text-red-400">
                                <TrendingUp className="w-3 h-3" />
                                <span>+3 this week</span>
                            </div>
                        </div>
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Mortality (YTD)</p>
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                                {formatNumber(healthStats.mortalityCount)}
                            </p>
                            <div className="flex items-center gap-1 mt-1 text-xs text-green-600 dark:text-green-400">
                                <TrendingDown className="w-3 h-3" />
                                <span>-12% vs last year</span>
                            </div>
                        </div>
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                            <Skull className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Recovery Rate</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                                {healthStats.recoveryRate}%
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                            <Syringe className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Events by Type Pie */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Events by Type</h2>
                    </div>
                    <div className="card-body">
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={eventsByType}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="count"
                                    >
                                        {eventsByType.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        formatter={(value) => formatNumber(value as number)}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {eventsByType.map((item) => (
                                <div key={item.type} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-sm text-slate-600 dark:text-slate-300">{item.type}</span>
                                    <span className="text-sm font-medium text-slate-900 dark:text-white ml-auto">{formatNumber(item.count)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Monthly Trends */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Monthly Health Trends</h2>
                    </div>
                    <div className="card-body">
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyEvents}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                                    <YAxis stroke="#94a3b8" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    />
                                    <Bar dataKey="treatment" fill="#10b981" name="Treatments" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="disease" fill="#f59e0b" name="Disease Reports" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="mortality" fill="#ef4444" name="Mortality" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Events Table */}
            <div className="card">
                <div className="card-header flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Health Events</h2>
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
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                        >
                            <option value="All">All Types</option>
                            <option value="Disease Report">Disease Report</option>
                            <option value="Mortality">Mortality</option>
                            <option value="Treatment">Treatment</option>
                            <option value="Vaccination">Vaccination</option>
                        </select>
                    </div>
                </div>
                <div className="card-body overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Event ID</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Type</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Disease/Condition</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Location</th>
                                <th className="text-center py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Severity</th>
                                <th className="text-center py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                                <th className="text-center py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEvents.map((item) => (
                                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-400">{item.id}</td>
                                    <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{item.type}</td>
                                    <td className="py-3 px-4">
                                        <div className="text-slate-900 dark:text-white">{item.disease}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">{item.livestockAffected} {item.species}</div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                            <MapPin className="w-3 h-3" />
                                            {item.region}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={cn('badge', getSeverityBadge(item.severity))}>{item.severity}</span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={cn('badge', getStatusBadge(item.status))}>{item.status}</span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <button
                                            onClick={() => setSelectedEvent(item)}
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
            {selectedEvent && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setSelectedEvent(null)} />
                    <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-xl z-50 overflow-auto max-h-[90vh]">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Health Event Details</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{selectedEvent.id}</p>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Type</label>
                                <p className="text-slate-900 dark:text-white font-medium">{selectedEvent.type}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</label>
                                <span className={cn('badge', getStatusBadge(selectedEvent.status))}>{selectedEvent.status}</span>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Disease/Condition</label>
                                <p className="text-slate-900 dark:text-white">{selectedEvent.disease}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Severity</label>
                                <span className={cn('badge', getSeverityBadge(selectedEvent.severity))}>{selectedEvent.severity}</span>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Livestock Affected</label>
                                <p className="text-slate-900 dark:text-white">{selectedEvent.livestockAffected} {selectedEvent.species}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Reported Date</label>
                                <p className="text-slate-900 dark:text-white">{formatDate(selectedEvent.reportedDate)}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Farm</label>
                                <p className="text-slate-900 dark:text-white">{selectedEvent.farmName}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Region</label>
                                <p className="text-slate-900 dark:text-white">{selectedEvent.region}</p>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                            <button
                                onClick={() => setSelectedEvent(null)}
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
