import { useMemo } from 'react';
import {
    Syringe,
    AlertTriangle,
    CheckCircle2,
    Clock,
    TrendingUp,
    MapPin,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
} from 'recharts';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { formatNumber, cn } from '../lib/utils';

// Vaccination data interface
interface VaccinationRecord {
    id: number;
    livestockUuid?: string;
    vaccineId?: number;
    vaccineName?: string;
    vaccinationDate?: string;
    nextDueDate?: string;
    status?: string;
    regionName?: string;
    [key: string]: unknown;
}

// Livestock data interface for counting
interface LivestockRecord {
    id: number;
    status?: string;
    [key: string]: unknown;
}

export function VaccinationMonitoring() {
    const { data: vaccinationsData, loading: vacLoading, error: vacError, refetch: vacRefetch } = useApi<VaccinationRecord[]>(
        () => api.vaccinations.list() as Promise<VaccinationRecord[]>,
        []
    );
    const { data: livestockData, loading: lsLoading } = useApi<LivestockRecord[]>(
        () => api.livestock.list() as Promise<LivestockRecord[]>,
        []
    );

    const vaccinations = vaccinationsData ?? [];
    const livestock = livestockData ?? [];

    // Compute summary stats from data
    const summaryStats = useMemo(() => {
        const totalLivestock = livestock.length;
        const vaccinated = vaccinations.length;
        const now = new Date();
        const overdue = vaccinations.filter(v => {
            if (!v.nextDueDate) return false;
            return new Date(v.nextDueDate) < now;
        }).length;
        const avgRate = totalLivestock > 0 ? Math.round((vaccinated / totalLivestock) * 100) : 0;
        return { totalLivestock, vaccinated, overdue, avgRate };
    }, [vaccinations, livestock]);

    // Group vaccinations by region for chart
    const regionVaccinations = useMemo(() => {
        const regionCounts: Record<string, { total: number; vaccinated: number }> = {};
        vaccinations.forEach(v => {
            const region = v.regionName ?? 'Unknown';
            if (!regionCounts[region]) {
                regionCounts[region] = { total: 0, vaccinated: 0 };
            }
            regionCounts[region].vaccinated++;
            regionCounts[region].total++;
        });
        return Object.entries(regionCounts)
            .map(([region, data]) => ({
                region,
                rate: data.total > 0 ? Math.round((data.vaccinated / data.total) * 100) : 0,
            }))
            .sort((a, b) => b.rate - a.rate)
            .slice(0, 10);
    }, [vaccinations]);

    // Compliance pie data
    const complianceData = useMemo(() => {
        const compliant = regionVaccinations.filter(r => r.rate >= 80).length;
        const atRisk = regionVaccinations.filter(r => r.rate >= 60 && r.rate < 80).length;
        const critical = regionVaccinations.filter(r => r.rate < 60).length;
        return [
            { name: 'Compliant (≥80%)', value: compliant || 1, color: '#10b981' },
            { name: 'At Risk (60-79%)', value: atRisk || 1, color: '#f59e0b' },
            { name: 'Critical (<60%)', value: critical || 1, color: '#ef4444' },
        ];
    }, [regionVaccinations]);

    const loading = vacLoading || lsLoading;

    if (loading) {
        return <PageLoader />;
    }

    if (vacError) {
        return <ErrorMessage message={vacError.message} onRetry={vacRefetch} />;
    }
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Vaccination Monitoring
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    National vaccination compliance and coverage tracking
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Livestock</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                {formatNumber(summaryStats.totalLivestock)}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Vaccinated</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                                {formatNumber(summaryStats.vaccinated)}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Overdue</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                                {formatNumber(summaryStats.overdue)}
                            </p>
                        </div>
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                            <Clock className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg Coverage</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                {summaryStats.avgRate}%
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Target: 80%</p>
                        </div>
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                            <Syringe className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Regional Compliance */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Regional Vaccination Rates
                        </h2>
                    </div>
                    <div className="card-body">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={regionVaccinations} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${val}%`} />
                                    <YAxis dataKey="region" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        formatter={(value) => `${value}%`}
                                    />
                                    <Bar dataKey="rate" name="Vaccination Rate" radius={[0, 4, 4, 0]}>
                                        {regionVaccinations.map((entry: { region: string; rate: number }, index: number) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.rate >= 80 ? '#10b981' : entry.rate >= 60 ? '#f59e0b' : '#ef4444'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Compliance Distribution */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Regional Compliance Status
                        </h2>
                    </div>
                    <div className="card-body">
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={complianceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {complianceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        formatter={(value) => `${value} regions`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                            {complianceData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-sm text-slate-600 dark:text-slate-300">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{item.value} regions</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Regions Table */}
            <div className="card">
                <div className="card-header flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        All Regions - Vaccination Status
                    </h2>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500" /> ≥80%
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-amber-500" /> 60-79%
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-500" /> &lt;60%
                        </span>
                    </div>
                </div>
                <div className="card-body overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Region</th>
                                <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Livestock</th>
                                <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Vaccinated</th>
                                <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Overdue</th>
                                <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Rate</th>
                                <th className="text-center py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {regionVaccinations.map((stat: { region: string; rate: number }) => (
                                <tr key={stat.region} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="py-3 px-4 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-900 dark:text-white font-medium">{stat.region}</span>
                                    </td>
                                    <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-300">-</td>
                                    <td className="text-right py-3 px-4 text-green-600 dark:text-green-400">-</td>
                                    <td className="text-right py-3 px-4 text-red-600 dark:text-red-400">-</td>
                                    <td className="text-right py-3 px-4">
                                        <span className={cn(
                                            'font-semibold',
                                            stat.rate >= 80 ? 'text-green-600 dark:text-green-400' :
                                                stat.rate >= 60 ? 'text-amber-600 dark:text-amber-400' :
                                                    'text-red-600 dark:text-red-400'
                                        )}>
                                            {stat.rate}%
                                        </span>
                                    </td>
                                    <td className="text-center py-3 px-4">
                                        {stat.rate >= 80 ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                                        ) : stat.rate >= 60 ? (
                                            <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto" />
                                        ) : (
                                            <AlertTriangle className="w-5 h-5 text-red-500 mx-auto" />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
