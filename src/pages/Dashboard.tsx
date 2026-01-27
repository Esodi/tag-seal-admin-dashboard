import {
    Building2,
    Users,
    Syringe,
    AlertTriangle,
    AlertCircle,
    Info,
    ArrowUpRight,
    Beef
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
import { AccountWidget } from '../components/dashboard/AccountWidget';
import { RecentActivityFeed, ActivityItem } from '../components/dashboard/RecentActivityFeed';
import { useAuth } from '../contexts/AuthContext';

// Stat Card Component
function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    color = 'primary',
    loading = false
}: {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: { value: number; label: string };
    color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'info';
    loading?: boolean;
}) {
    const colorClasses = {
        primary: 'bg-primary-500',
        secondary: 'bg-secondary-500',
        accent: 'bg-accent-500',
        success: 'bg-green-500',
        warning: 'bg-amber-500',
        info: 'bg-cyan-500',
    };

    if (loading) {
        return <div className="card p-6 h-32 animate-pulse bg-slate-100 dark:bg-slate-800" />;
    }

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
                <div className={cn('p-3 rounded-xl shadow-sm', colorClasses[color])}>
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
        <div className={cn('p-4 rounded-lg border flex gap-3', getAlertColor(type))}>
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
                <p className="font-medium text-sm">{title}</p>
                <p className="text-sm mt-0.5 opacity-90">{message}</p>
                <div className="flex items-center gap-3 mt-2 text-xs opacity-75">
                    {region && (
                        <span className="bg-white/20 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold">
                            {region}
                        </span>
                    )}
                    <span>{new Date(createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
}

export function Dashboard() {
    // Fetch user for potential welcome message (used indirectly)
    useAuth();

    // Fetch all necessary data for dashboard
    const { data, loading, error, refetch } = useApi(async () => {
        // Use Promise.allSettled for medications since that endpoint may not exist yet
        const [
            livestock,
            farms,
            farmers,
            vaccinations,
            transfers,
            births,
            vets,
            officers
        ] = await Promise.all([
            api.livestock.list(),
            api.farms.list(),
            api.farmers.list(),
            api.vaccinations.list(),
            api.transfers.list(),
            api.birthEvents.list(),
            api.vets.list(),
            api.extensionOfficers.list()
        ]);

        // Medications endpoint may not exist - fetch separately with error handling
        let medications: any[] = [];
        try {
            medications = await api.medications.list();
        } catch (e) {
            console.warn('Medications endpoint not available:', e);
        }

        return {
            livestock,
            farms,
            farmers,
            vaccinations,
            medications,
            transfers,
            births,
            vets,
            officers
        };
    }, []);

    const stats = useMemo(() => {
        if (!data) return null;
        const {
            livestock,
            farms,
            farmers,
            vaccinations,
            medications,
            transfers,
            births,
            vets,
            officers
        } = data;

        // --- Core KPI Stats ---
        const totalLivestock = livestock.length;
        const activeLivestock = livestock.filter((l: any) => l.status?.toLowerCase() === 'active' || l.status?.toLowerCase() === 'alive').length;

        const totalFarms = farms.length;
        const activeFarms = farms.filter((f: any) => f.status?.toLowerCase() === 'active').length;

        // const totalUsers = users.length + farmers.length; // Approximate total system users

        const uniqueVaccinatedLivestock = new Set(vaccinations.map((v: any) => v.livestockId)).size;
        const vaccinationCoverage = totalLivestock > 0 ? (uniqueVaccinatedLivestock / totalLivestock) * 100 : 0;

        // --- Charts Data ---

        // 1. Species Distribution Pie Chart
        const speciesCounts: Record<string, number> = {};
        livestock.forEach((l: any) => {
            const species = l.species || 'Unknown';
            speciesCounts[species] = (speciesCounts[species] || 0) + 1;
        });

        const speciesColors: Record<string, string> = {
            'Cattle': '#3b82f6', // Blue
            'Goats': '#10b981',  // Green
            'Sheep': '#f59e0b',  // Amber
            'Pigs': '#ec4899',   // Pink
            'Poultry': '#8b5cf6', // Violet
            'Donkeys': '#64748b'  // Slate
        };

        const speciesDistribution = Object.entries(speciesCounts)
            .map(([name, value]) => ({
                name,
                value,
                color: speciesColors[name] || '#94a3b8'
            }))
            .sort((a, b) => b.value - a.value);

        // 2. Livestock Trend Area Chart (Monthly Registrations)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const trendMap: Record<string, { cattle: number, goats: number }> = {};
        months.forEach(m => trendMap[m] = { cattle: 0, goats: 0 });

        livestock.forEach((l: any) => {
            const date = new Date(l.registrationDate || l.created_at || new Date());
            // Filter only last 12 months ideally, but demonstrating with full dataset mapped to months
            if (date.getFullYear() === new Date().getFullYear() || date.getFullYear() === new Date().getFullYear() - 1) {
                const month = months[date.getMonth()];
                if (l.species === 'Cattle') trendMap[month].cattle++;
                else if (l.species === 'Goats') trendMap[month].goats++;
            }
        });

        const livestockTrend = months.map(month => ({
            month,
            cattle: trendMap[month].cattle,
            goats: trendMap[month].goats
        }));

        // 3. Regional Comparison Bar Chart
        const regionStats: Record<string, { livestock: number, vaccinated: number }> = {};
        livestock.forEach((l: any) => {
            const region = l.region || 'Unknown';
            if (!regionStats[region]) regionStats[region] = { livestock: 0, vaccinated: 0 };
            regionStats[region].livestock++;
        });

        // Mapping vaccinations to regions (assuming vaccination record has region or linking via livestock)
        // Map vaccinations to regions via the region field on vaccination records
        vaccinations.forEach((v: any) => {
            const region = v.region || 'Unknown';
            if (regionStats[region]) {
                regionStats[region].vaccinated++;
            } else {
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


        // --- Activity Feed Construction ---
        // Combine transfers, births, vaccinations, medications into a single timeline
        const activities: ActivityItem[] = [];

        transfers.forEach((t: any) => activities.push({
            id: `transfer-${t.id}`,
            type: 'transfer',
            title: 'Livestock Transfer',
            description: `${t.livestockId ? 'Livestock #' + t.livestockId : 'Livestock'} transferred from ${t.sourceFarmUuid || 'Farm'} to ${t.destinationFarmUuid || 'Farm'}`,
            date: t.transferDate || t.created_at || new Date().toISOString(),
            link: '/lifecycle/transfers'
        }));

        births.forEach((b: any) => activities.push({
            id: `birth-${b.id}`,
            type: 'birth',
            title: 'Birth Recorded',
            description: `New birth logged for Mother #${b.motherId || 'Unknown'}`,
            date: b.birthDate || b.created_at || new Date().toISOString(),
            link: '/reproduction/births'
        }));

        vaccinations.slice(0, 20).forEach((v: any) => activities.push({ // Limit older records
            id: `vac-${v.id}`,
            type: 'vaccination',
            title: 'Vaccination Administered',
            description: `Vaccination against ${v.diseaseId || 'Disease'} completed`,
            date: v.vaccinationDate || v.created_at || new Date().toISOString(),
            link: '/health/vaccinations'
        }));

        medications.slice(0, 20).forEach((m: any) => activities.push({
            id: `med-${m.id}`,
            type: 'treatment',
            title: 'Medical Treatment',
            description: `Treatment for ${m.disease || 'illness'} recorded`,
            date: m.treatmentDate || m.created_at || new Date().toISOString(),
            link: '/health/medications'
        }));

        // --- Alerts Logic ---
        // High severity medications/diseases
        const alerts = medications
            .filter((m: any) => m.severity === 'critical' || m.severity === 'high')
            .map((m: any) => ({
                id: m.id,
                type: m.severity === 'critical' ? 'danger' : 'warning',
                title: 'Disease Alert',
                message: `${m.disease || 'Unknown Disease'} outbreak reported in ${m.region || 'Unknown Region'}`,
                region: m.region,
                createdAt: m.treatmentDate || new Date().toISOString()
            }))
            .slice(0, 5) as any[];

        return {
            dashboardStats: {
                totalLivestock,
                activeLivestock,
                totalFarms,
                activeFarms,
                totalFarmers: farmers.length,
                vaccinationCoverage,
                totalVets: vets?.length || 0,
                totalOfficers: officers?.length || 0
            },
            livestockTrend,
            speciesDistribution,
            regionalComparison,
            activities,
            alerts
        };
    }, [data]);

    if (loading) {
        return <PageLoader />;
    }

    if (error) {
        return <ErrorMessage message={error.message} onRetry={refetch} />;
    }

    if (!stats) return null;

    const {
        dashboardStats,
        livestockTrend,
        speciesDistribution,
        regionalComparison,
        activities,
        alerts
    } = stats;

    return (
        <div className="space-y-6">
            {/* Page Header & Account Widget */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Dashboard
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Livestock management and monitoring overview
                        </p>
                    </div>

                    {/* Primary KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <StatCard
                            title="Total Livestock"
                            value={formatNumber(dashboardStats.totalLivestock)}
                            subtitle={`${formatNumber(dashboardStats.activeLivestock)} active animals`}
                            icon={Beef}
                            color="primary"
                        />
                        <StatCard
                            title="Active Farms"
                            value={formatNumber(dashboardStats.activeFarms)}
                            subtitle={`Out of ${formatNumber(dashboardStats.totalFarms)} registered`}
                            icon={Building2}
                            color="secondary"
                        />
                        <StatCard
                            title="Vaccination Rate"
                            value={formatPercentage(dashboardStats.vaccinationCoverage)}
                            subtitle="Overall coverage"
                            icon={Syringe}
                            color={dashboardStats.vaccinationCoverage > 70 ? 'success' : 'warning'}
                        />
                        <StatCard
                            title="System Users"
                            value={formatNumber(dashboardStats.totalFarmers + dashboardStats.totalOfficers + dashboardStats.totalVets)}
                            subtitle={`${dashboardStats.totalOfficers} Officers, ${dashboardStats.totalVets} Vets`}
                            icon={Users}
                            color="info"
                        />
                    </div>
                </div>

                {/* Account Widget Column */}
                <div className="lg:col-span-1">
                    <AccountWidget />
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (Charts) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Livestock Trend Chart */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Population Growth
                            </h2>
                            <p className="text-sm text-slate-500">Registrations over the last 12 months</p>
                        </div>
                        <div className="card-body h-80">
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
                                    <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${val}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="cattle" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCattle)" name="Cattle" />
                                    <Area type="monotone" dataKey="goats" stroke="#10b981" fillOpacity={1} fill="url(#colorGoats)" name="Goats" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Regional & Species Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Species Distribution */}
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Species Mix
                                </h2>
                            </div>
                            <div className="card-body h-64">
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
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Regions */}
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Top Regions
                                </h2>
                            </div>
                            <div className="card-body h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={regionalComparison} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="region" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        />
                                        <Bar dataKey="livestock" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Livestock" barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Feed & Alerts) */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Alerts Section */}
                    {alerts.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                Critical Alerts
                            </h3>
                            {alerts.map((alert) => (
                                <AlertCard key={alert.id} {...alert} />
                            ))}
                        </div>
                    )}

                    {/* Activity Feed */}
                    <div className="h-[600px]">
                        <RecentActivityFeed activities={activities} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
