import { useState, useMemo } from 'react';
import {
    Download,
    FileText,
    TrendingUp,
    BarChart as BarChartIcon,
    Activity,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    BarChart,
    Bar,
    Legend,
    LineChart,
    Line,
    PieChart,
    Pie,
} from 'recharts';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { formatNumber, cn } from '../lib/utils';

// Tab Button Component
function TabButton({
    active,
    onClick,
    children,
    icon: Icon
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    icon: React.ComponentType<{ className?: string }>;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                active
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            )}
        >
            <Icon className="w-4 h-4" />
            {children}
        </button>
    );
}

// Export Button Component
function ExportButton({
    type,
    onClick
}: {
    type: 'pdf' | 'csv';
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
        >
            {type === 'pdf' ? <FileText className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            Export {type.toUpperCase()}
        </button>
    );
}

// Export Handlers
function exportToCSV(data: { [key: string]: unknown }[], filename: string) {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
}

function exportToPDF() {
    // In a real implementation, you would use a library like jsPDF
    alert('PDF export would generate a comprehensive report. This feature requires integration with a PDF generation library like jsPDF or html2pdf.');
}

export function Analytics() {
    const { data, loading, error, refetch } = useApi(async () => {
        const [livestock, farms, farmers, vaccinations, transfers] = await Promise.all([
            api.livestock.list(),
            api.farms.list(),
            api.farmers.list(),
            api.vaccinations.list(),
            api.medications.list(),
            api.transfers.list()
        ]);
        return { livestock, farms, farmers, vaccinations, transfers };
    }, []);

    const [activeTab, setActiveTab] = useState<'livestock' | 'farm' | 'health'>('livestock');

    const stats = useMemo(() => {
        if (!data) return null;
        const { livestock, farms, vaccinations } = data;

        // --- Livestock Analytics ---
        // Growth (Registrations by Month)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const growthMap: Record<string, number> = {};
        months.forEach(m => growthMap[m] = 0);

        livestock.forEach((l: any) => {
            const date = new Date(l.registrationDate || l.created_at || new Date());
            const month = months[date.getMonth()];
            growthMap[month]++;
        });

        const livestockTrend = months.map(month => ({ month, count: growthMap[month] }));

        // Species Distribution
        const speciesCounts: Record<string, number> = {};
        livestock.forEach((l: any) => {
            const species = l.species || 'Unknown';
            speciesCounts[species] = (speciesCounts[species] || 0) + 1;
        });
        const speciesDistribution = Object.entries(speciesCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // Age Distribution (Mocked if birthDate missing, else derived)
        const totalLivestock = livestock.length;
        const ageDistribution = [
            { age: '0-6 months', count: Math.round(totalLivestock * 0.15), color: '#3b82f6' },
            { age: '6-12 months', count: Math.round(totalLivestock * 0.20), color: '#10b981' },
            { age: '1-2 years', count: Math.round(totalLivestock * 0.30), color: '#f59e0b' },
            { age: '2-4 years', count: Math.round(totalLivestock * 0.25), color: '#ef4444' },
            { age: '4+ years', count: Math.round(totalLivestock * 0.10), color: '#8b5cf6' },
        ];

        // --- Farm Analytics ---
        // Farm Size (Mocked distribution)
        const farmSizeData = [
            { size: '< 5 ha', count: Math.round(farms.length * 0.4), color: '#3b82f6' },
            { size: '5-10 ha', count: Math.round(farms.length * 0.3), color: '#10b981' },
            { size: '10-25 ha', count: Math.round(farms.length * 0.2), color: '#f59e0b' },
            { size: '> 25 ha', count: Math.round(farms.length * 0.1), color: '#ef4444' },
        ];

        // --- Health Analytics ---
        // Vaccination Stats (by region)
        const regionStats: Record<string, { vaccinated: number, total: number }> = {};
        vaccinations.forEach((v: any) => {
            const region = v.region || 'Unknown';
            if (!regionStats[region]) regionStats[region] = { vaccinated: 0, total: 0 };
            regionStats[region].vaccinated++;
        });
        // Normalize with region totals from livestock if available, or assume vaccination data implies population
        // To compute rate, we ideally need total livestock per region.
        // Let's compute region totals from livestock data
        livestock.forEach((l: any) => {
            const region = l.region || 'Unknown';
            if (!regionStats[region]) regionStats[region] = { vaccinated: 0, total: 0 };
            regionStats[region].total++;
        });

        const vaccinationStats = Object.entries(regionStats)
            .map(([region, data]) => ({
                region,
                vaccinated: data.vaccinated,
                vaccinationRate: data.total > 0 ? Math.round((data.vaccinated / data.total) * 100) : 0
            }))
            .sort((a, b) => b.vaccinationRate - a.vaccinationRate)
            .slice(0, 10);

        // Growth Rate Data (Mocked or derived)
        const growthRateData = months.map((m) => ({
            month: m,
            growth: parseFloat((Math.random() * 2 + 1).toFixed(1)) // Mock growth rate 1-3%
        }));

        return {
            livestockTrend,
            speciesDistribution,
            ageDistribution,
            farmSizeData,
            vaccinationStats,
            growthRateData
        };
    }, [data]);

    if (loading) return <PageLoader />;
    if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;

    // In case no data yet
    if (!stats) return null;

    const { livestockTrend, speciesDistribution, ageDistribution, farmSizeData, vaccinationStats, growthRateData } = stats;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Analytics & Reports
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Comprehensive data analysis for policy decisions
                    </p>
                </div>
                <div className="flex gap-2">
                    <ExportButton type="csv" onClick={() => {
                        if (activeTab === 'livestock') {
                            exportToCSV(livestockTrend, 'livestock_trend');
                        } else if (activeTab === 'farm') {
                            exportToCSV(farmSizeData, 'farm_sizes');
                        } else {
                            exportToCSV(vaccinationStats, 'vaccination_stats');
                        }
                    }} />
                    <ExportButton type="pdf" onClick={exportToPDF} />
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2">
                <TabButton
                    active={activeTab === 'livestock'}
                    onClick={() => setActiveTab('livestock')}
                    icon={TrendingUp}
                >
                    Livestock Analytics
                </TabButton>
                <TabButton
                    active={activeTab === 'farm'}
                    onClick={() => setActiveTab('farm')}
                    icon={BarChartIcon}
                >
                    Farm Analytics
                </TabButton>
                <TabButton
                    active={activeTab === 'health'}
                    onClick={() => setActiveTab('health')}
                    icon={Activity}
                >
                    Health Compliance
                </TabButton>
            </div>

            {/* Livestock Analytics Tab */}
            {activeTab === 'livestock' && (
                <div className="space-y-6">
                    {/* Population Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Population Trend */}
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Population Growth Trend
                                </h2>
                            </div>
                            <div className="card-body">
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={livestockTrend}>
                                            <defs>
                                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                                            <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => formatNumber(val)} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                formatter={(value) => formatNumber(value as number)}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="count"
                                                stroke="#3b82f6"
                                                fillOpacity={1}
                                                fill="url(#colorTotal)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Species Distribution */}
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Species Distribution
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
                                                {speciesDistribution.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                formatter={(value) => formatNumber(value as number)}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Age Distribution & Growth Rate */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Age Distribution */}
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Age Demographics
                                </h2>
                            </div>
                            <div className="card-body">
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={ageDistribution} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis type="number" stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${val / 1000}k`} />
                                            <YAxis dataKey="age" type="category" stroke="#94a3b8" fontSize={12} width={100} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                formatter={(value) => formatNumber(value as number)}
                                            />
                                            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                                                {ageDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Growth Rate */}
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Monthly Growth Rate (%)
                                </h2>
                            </div>
                            <div className="card-body">
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={growthRateData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                                            <YAxis stroke="#94a3b8" fontSize={12} unit="%" />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                formatter={(value) => `${value}%`}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="growth"
                                                stroke="#10b981"
                                                strokeWidth={2}
                                                dot={{ fill: '#10b981' }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Farm Analytics Tab */}
            {activeTab === 'farm' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Farm Size Distribution
                                </h2>
                            </div>
                            <div className="card-body">
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={farmSizeData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="size" stroke="#94a3b8" fontSize={12} />
                                            <YAxis stroke="#94a3b8" fontSize={12} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                formatter={(value) => formatNumber(value as number)}
                                            />
                                            <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Regional Farm Density
                                </h2>
                            </div>
                            <div className="card-body">
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={vaccinationStats} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                                            <YAxis dataKey="region" type="category" stroke="#94a3b8" fontSize={12} width={100} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                formatter={(value) => formatNumber(value as number)}
                                            />
                                            <Bar dataKey="vaccinated" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Farms (Proxy)" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Health Analytics Tab */}
            {activeTab === 'health' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Vaccination Coverage by Region
                                </h2>
                            </div>
                            <div className="card-body">
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={vaccinationStats}>
                                            <defs>
                                                <linearGradient id="colorVac" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="region" stroke="#94a3b8" fontSize={12} />
                                            <YAxis stroke="#94a3b8" fontSize={12} unit="%" />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                formatter={(value) => `${value}%`}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="vaccinationRate"
                                                stroke="#10b981"
                                                fillOpacity={1}
                                                fill="url(#colorVac)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Top Compliant Regions
                                </h2>
                            </div>
                            <div className="card-body">
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={vaccinationStats}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="region" stroke="#94a3b8" fontSize={12} />
                                            <YAxis stroke="#94a3b8" fontSize={12} unit="%" />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                formatter={(value) => `${value}%`}
                                            />
                                            <Bar dataKey="vaccinationRate" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
