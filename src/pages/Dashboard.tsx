import {
    Building2,
    Users,
    Syringe,
    AlertTriangle,
    AlertCircle,
    Info,
    ArrowUpRight,
    Beef,
} from 'lucide-react';
import { useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend,
} from 'recharts';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { formatNumber, formatPercentage, getAlertColor, cn } from '../lib/utils';

// Stat Card Component
function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    color = 'primary'
}: {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: { value: number; label: string };
    color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning';
}) {
    const colorClasses = {
        primary: 'bg-primary-500',
        secondary: 'bg-secondary-500',
        accent: 'bg-accent-500',
        success: 'bg-green-500',
        warning: 'bg-amber-500',
    };

    return (
        <div className="card p-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
                    {subtitle && (
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
                    )}
                    {trend && (
                        <div className="mt-2 flex items-center gap-1 text-sm">
                            <ArrowUpRight className="w-4 h-4 text-green-500" />
                            <span className="text-green-600 dark:text-green-400 font-medium">
                                {trend.value}%
                            </span>
                            <span className="text-slate-500 dark:text-slate-400">{trend.label}</span>
                        </div>
                    )}
                </div>
                <div className={cn('p-3 rounded-xl', colorClasses[color])}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );
}

// Alert Component
function AlertCard({ type, title, message, region, createdAt }: {
    type: 'danger' | 'warning' | 'info';
    title: string;
    message: string;
    region?: string;
    createdAt: string;
}) {
    const icons = {
        danger: AlertCircle,
        warning: AlertTriangle,
        info: Info,
    };
    const Icon = icons[type];

    return (
        <div className={cn('p-4 rounded-lg border', getAlertColor(type))}>
            <div className="flex gap-3">
                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-sm mt-1 opacity-90">{message}</p>
                    <div className="flex gap-4 mt-2 text-xs opacity-75">
                        {region && <span>Region: {region}</span>}
                        <span>{new Date(createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function Dashboard() {
    const { data, loading, error, refetch } = useApi(async () => {
        const [livestock, farms, farmers, vaccinations, medications] = await Promise.all([
            api.livestock.list(),
            api.farms.list(),
            api.farmers.list(),
            api.vaccinations.list(),
            api.medications.list()
        ]);
        return { livestock, farms, farmers, vaccinations, medications };
    }, []);

    const stats = useMemo(() => {
        if (!data) return null;
        const { livestock, farms, farmers, vaccinations, medications } = data;

        // Dashboard Stats
        const totalLivestock = livestock.length;
        const activeLivestock = livestock.filter((l: any) => l.status === 'Alive' || l.status === 'Active').length;
        const totalFarms = farms.length;
        const activeFarms = farms.filter((f: any) => f.status === 'Active').length;
        const totalFarmers = farmers.length;
        const uniqueVaccinatedLivestock = new Set(vaccinations.map((v: any) => v.livestockId)).size;
        const vaccinationCoverage = totalLivestock > 0 ? (uniqueVaccinatedLivestock / totalLivestock) * 100 : 0;

        // Species Distribution
        const speciesCounts: Record<string, number> = {};
        livestock.forEach((l: any) => {
            const species = l.species || 'Unknown';
            speciesCounts[species] = (speciesCounts[species] || 0) + 1;
        });

        const speciesColors: Record<string, string> = {
            'Cattle': '#3b82f6',
            'Goats': '#10b981',
            'Sheep': '#f59e0b',
            'Pigs': '#ec4899',
            'Poultry': '#8b5cf6',
            'Donkeys': '#64748b'
        };

        const speciesDistribution = Object.entries(speciesCounts)
            .map(([name, value]) => ({
                name,
                value,
                color: speciesColors[name] || '#94a3b8'
            }))
            .sort((a, b) => b.value - a.value);

        // Regional Comparison
        const regionStats: Record<string, { livestock: number, vaccinated: number }> = {};
        livestock.forEach((l: any) => {
            const region = l.region || 'Unknown';
            if (!regionStats[region]) regionStats[region] = { livestock: 0, vaccinated: 0 };
            regionStats[region].livestock++;
        });

        vaccinations.forEach((v: any) => {
            const region = v.region || 'Unknown';
            if (regionStats[region]) {
                regionStats[region].vaccinated++; // Approximate since vaccination record has region
            } else {
                // Should fetch region from livestock if not in vaccination, but assuming vaccination has it
                if (!regionStats[region]) regionStats[region] = { livestock: 0, vaccinated: 0 };
                regionStats[region].vaccinated++;
            }
        });

        const regionalComparison = Object.entries(regionStats)
            .map(([region, stat]) => ({
                region,
                livestock: stat.livestock,
                vaccinationRate: stat.livestock > 0 ? Math.round((stat.vaccinated / stat.livestock) * 100) : 0
            }))
            .sort((a, b) => b.livestock - a.livestock)
            .slice(0, 10);

        // Livestock Trend (Monthly)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const trendMap: Record<string, { cattle: number, goats: number }> = {};
        months.forEach(m => trendMap[m] = { cattle: 0, goats: 0 });

        livestock.forEach((l: any) => {
            const date = new Date(l.registrationDate || l.created_at || new Date());
            const month = months[date.getMonth()];
            if (l.species === 'Cattle') trendMap[month].cattle++;
            else if (l.species === 'Goats') trendMap[month].goats++;
        });

        const livestockTrend = months.map(month => ({
            month,
            cattle: trendMap[month].cattle,
            goats: trendMap[month].goats
        }));

        // Alerts (High Severity Medications/Events)
        const alerts = medications
            .filter((m: any) => m.severity === 'critical' || m.severity === 'high')
            .map((m: any) => ({
                id: m.id,
                type: m.severity === 'critical' ? 'danger' : 'warning',
                title: m.disease || 'Health Alert',
                message: `${m.type} reported in ${m.farmName || 'Unknown Farm'}`,
                region: m.region,
                createdAt: m.reportedDate || m.created_at || new Date().toISOString()
            }))
            .slice(0, 5) as any[];

        return {
            dashboardStats: { totalLivestock, activeLivestock, totalFarms, activeFarms, totalFarmers, vaccinationCoverage },
            livestockTrend,
            speciesDistribution,
            regionalComparison,
            alerts
        };
    }, [data]);

    if (loading) {
        return <PageLoader />;
    }

    if (error) {
        return <ErrorMessage message={error.message} onRetry={refetch} />;
    }

    // In case no data yet
    if (!stats) return null;

    const { dashboardStats, livestockTrend, speciesDistribution, regionalComparison, alerts } = stats;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    National Livestock Dashboard
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Overview of livestock population and regulatory compliance across Tanzania
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Livestock"
                    value={formatNumber(dashboardStats.totalLivestock)}
                    subtitle={`${formatNumber(dashboardStats.activeLivestock)} active`}
                    icon={Beef}
                    trend={{ value: 5.2, label: 'vs last month' }}
                    color="primary"
                />
                <StatCard
                    title="Registered Farms"
                    value={formatNumber(dashboardStats.totalFarms)}
                    subtitle={`${formatNumber(dashboardStats.activeFarms)} active`}
                    icon={Building2}
                    trend={{ value: 3.1, label: 'vs last month' }}
                    color="secondary"
                />
                <StatCard
                    title="Registered Farmers"
                    value={formatNumber(dashboardStats.totalFarmers)}
                    icon={Users}
                    trend={{ value: 2.8, label: 'vs last month' }}
                    color="accent"
                />
                <StatCard
                    title="Vaccination Coverage"
                    value={formatPercentage(dashboardStats.vaccinationCoverage)}
                    subtitle="Nationwide average"
                    icon={Syringe}
                    color="success"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Line Chart - Population Trend */}
                <div className="lg:col-span-2 card">
                    <div className="card-header">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Livestock Population Trend
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Monthly registration data for the past year
                        </p>
                    </div>
                    <div className="card-body">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={livestockTrend}>
                                    <defs>
                                        <linearGradient id="colorCattle" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorGoats" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${val / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                        formatter={(value) => formatNumber(value as number)}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="cattle"
                                        stroke="#3b82f6"
                                        fillOpacity={1}
                                        fill="url(#colorCattle)"
                                        name="Cattle"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="goats"
                                        stroke="#10b981"
                                        fillOpacity={1}
                                        fill="url(#colorGoats)"
                                        name="Goats"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Pie Chart - Species Distribution */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Distribution by Species
                        </h2>
                    </div>
                    <div className="card-body">
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={speciesDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {speciesDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => formatNumber(value as number ?? 0)}
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                            {speciesDistribution.map((item) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-sm text-slate-600 dark:text-slate-300">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                                        {formatNumber(item.value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Regional Comparison & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Regional Bar Chart */}
                <div className="lg:col-span-2 card">
                    <div className="card-header">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Regional Comparison (Top 10)
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Livestock population and vaccination rates by region
                        </p>
                    </div>
                    <div className="card-body">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={regionalComparison} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis type="number" stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${val / 1000}k`} />
                                    <YAxis dataKey="region" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                        formatter={(value, name) => [
                                            name === 'vaccinationRate' ? `${value}%` : formatNumber(value as number),
                                            name === 'vaccinationRate' ? 'Vaccination Rate' : 'Livestock'
                                        ]}
                                    />
                                    <Legend />
                                    <Bar dataKey="livestock" fill="#3b82f6" name="Livestock" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Alerts Panel */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Alerts & Notifications
                        </h2>
                    </div>
                    <div className="card-body space-y-4">
                        {alerts.length > 0 ? (
                            alerts.map((alert) => (
                                <AlertCard key={alert.id} {...alert} />
                            ))
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-4">No active alerts</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
