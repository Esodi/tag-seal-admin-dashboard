import { useState } from 'react';
import {
    Download,
    FileText,
    TrendingUp,
    PieChart as PieChartIcon,
    BarChart as BarChartIcon,
    Activity,
    Calendar,
    Filter,
} from 'lucide-react';
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
    LineChart,
    Line,
} from 'recharts';
import {
    mockLivestockTrend,
    mockSpeciesDistribution,
    mockRegionalComparison,
    mockVaccinationStats,
    mockRegions,
} from '../data/mockData';
import { formatNumber, formatPercentage, cn } from '../lib/utils';

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

// Age Distribution Data
const ageDistributionData = [
    { age: '0-6 months', count: 145000, color: '#3b82f6' },
    { age: '6-12 months', count: 189000, color: '#10b981' },
    { age: '1-2 years', count: 278000, color: '#f59e0b' },
    { age: '2-4 years', count: 356000, color: '#ef4444' },
    { age: '4-7 years', count: 198000, color: '#8b5cf6' },
    { age: '7+ years', count: 79678, color: '#ec4899' },
];

// Growth Rate Data
const growthRateData = [
    { month: 'Jan', growth: 2.1 },
    { month: 'Feb', growth: 2.3 },
    { month: 'Mar', growth: 2.8 },
    { month: 'Apr', growth: 3.2 },
    { month: 'May', growth: 2.9 },
    { month: 'Jun', growth: 2.5 },
    { month: 'Jul', growth: 2.7 },
    { month: 'Aug', growth: 3.1 },
    { month: 'Sep', growth: 2.4 },
    { month: 'Oct', growth: 2.6 },
    { month: 'Nov', growth: 2.8 },
    { month: 'Dec', growth: 3.0 },
];

// Farm Size Distribution
const farmSizeData = [
    { size: '< 5 ha', count: 18500 },
    { size: '5-10 ha', count: 12300 },
    { size: '10-25 ha', count: 8700 },
    { size: '25-50 ha', count: 4200 },
    { size: '50-100 ha', count: 1200 },
    { size: '> 100 ha', count: 334 },
];

// Export Handlers
function exportToCSV(data: Record<string, unknown>[], filename: string) {
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
    const [activeTab, setActiveTab] = useState<'livestock' | 'farm' | 'health'>('livestock');

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
                            exportToCSV(mockLivestockTrend, 'livestock_trend');
                        } else if (activeTab === 'farm') {
                            exportToCSV(farmSizeData.map(d => ({ ...d })), 'farm_sizes');
                        } else {
                            exportToCSV(mockVaccinationStats.map(d => ({ ...d })), 'vaccination_stats');
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
                                    Population Trend (12 Months)
                                </h2>
                            </div>
                            <div className="card-body">
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={mockLivestockTrend}>
                                            <defs>
                                                <linearGradient id="colorCattle2" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorGoats2" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                                            <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${val / 1000}k`} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                formatter={(value) => formatNumber(value as number)}
                                            />
                                            <Legend />
                                            <Area type="monotone" dataKey="cattle" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCattle2)" name="Cattle" />
                                            <Area type="monotone" dataKey="goats" stroke="#10b981" fillOpacity={1} fill="url(#colorGoats2)" name="Goats" />
                                            <Area type="monotone" dataKey="sheep" stroke="#f59e0b" fillOpacity={0.3} fill="#fef3c7" name="Sheep" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Age Distribution */}
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Age Distribution
                                </h2>
                            </div>
                            <div className="card-body">
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={ageDistributionData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis type="number" stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${val / 1000}k`} />
                                            <YAxis dataKey="age" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                formatter={(value) => formatNumber(value as number)}
                                            />
                                            <Bar dataKey="count" name="Livestock Count" radius={[0, 4, 4, 0]}>
                                                {ageDistributionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
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
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={growthRateData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                                        <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 4]} tickFormatter={(val) => `${val}%`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                            formatter={(value) => `${value}%`}
                                        />
                                        <Line type="monotone" dataKey="growth" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} name="Growth Rate" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Species Distribution Table */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Species Population Summary
                            </h2>
                        </div>
                        <div className="card-body overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Species</th>
                                        <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Total Count</th>
                                        <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Percentage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockSpeciesDistribution.map((species) => {
                                        const total = mockSpeciesDistribution.reduce((sum, s) => sum + s.value, 0);
                                        const percentage = ((species.value / total) * 100).toFixed(1);
                                        return (
                                            <tr key={species.name} className="border-b border-slate-100 dark:border-slate-800">
                                                <td className="py-3 px-4 flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: species.color }} />
                                                    <span className="text-slate-900 dark:text-white">{species.name}</span>
                                                </td>
                                                <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-300">{formatNumber(species.value)}</td>
                                                <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-300">{percentage}%</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Farm Analytics Tab */}
            {activeTab === 'farm' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Farm Size Distribution */}
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Farm Size Distribution
                                </h2>
                            </div>
                            <div className="card-body">
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={farmSizeData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="size" stroke="#94a3b8" fontSize={11} />
                                            <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${val / 1000}k`} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                formatter={(value) => formatNumber(value as number)}
                                            />
                                            <Bar dataKey="count" fill="#14b8a6" name="Number of Farms" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Geographic Distribution */}
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Farms by Region (Top 10)
                                </h2>
                            </div>
                            <div className="card-body">
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={mockRegionalComparison} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                                            <YAxis dataKey="region" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                formatter={(value) => formatNumber(value as number)}
                                            />
                                            <Bar dataKey="farms" fill="#8b5cf6" name="Farms" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Regional Farm Summary Table */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Regional Farm Summary
                            </h2>
                        </div>
                        <div className="card-body overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Region</th>
                                        <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Farms</th>
                                        <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Livestock</th>
                                        <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Avg per Farm</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockRegions.slice(0, 10).map((region) => (
                                        <tr key={region.id} className="border-b border-slate-100 dark:border-slate-800">
                                            <td className="py-3 px-4 text-slate-900 dark:text-white">{region.name}</td>
                                            <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-300">{formatNumber(region.farms)}</td>
                                            <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-300">{formatNumber(region.livestock)}</td>
                                            <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-300">{Math.round(region.livestock / region.farms)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Health Compliance Tab */}
            {activeTab === 'health' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Vaccination Rate by Region */}
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Vaccination Rate by Region
                                </h2>
                            </div>
                            <div className="card-body">
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={mockVaccinationStats.slice(0, 10)} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${val}%`} />
                                            <YAxis dataKey="region" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                formatter={(value) => `${value}%`}
                                            />
                                            <Bar dataKey="rate" name="Vaccination Rate" radius={[0, 4, 4, 0]}>
                                                {mockVaccinationStats.slice(0, 10).map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.rate >= 75 ? '#10b981' : entry.rate >= 60 ? '#f59e0b' : '#ef4444'}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Overdue Vaccinations */}
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Overdue Vaccinations by Region
                                </h2>
                            </div>
                            <div className="card-body">
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={mockVaccinationStats.slice(0, 10)} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis type="number" stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${val / 1000}k`} />
                                            <YAxis dataKey="region" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                formatter={(value) => formatNumber(value as number)}
                                            />
                                            <Bar dataKey="overdue" fill="#ef4444" name="Overdue" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vaccination Stats Table */}
                    <div className="card">
                        <div className="card-header flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Regional Vaccination Summary
                            </h2>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                Target: 80% coverage
                            </span>
                        </div>
                        <div className="card-body overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Region</th>
                                        <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Total</th>
                                        <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Vaccinated</th>
                                        <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Overdue</th>
                                        <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Rate</th>
                                        <th className="text-center py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockVaccinationStats.map((stat) => (
                                        <tr key={stat.region} className="border-b border-slate-100 dark:border-slate-800">
                                            <td className="py-3 px-4 text-slate-900 dark:text-white">{stat.region}</td>
                                            <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-300">{formatNumber(stat.totalLivestock)}</td>
                                            <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-300">{formatNumber(stat.vaccinated)}</td>
                                            <td className="text-right py-3 px-4 text-red-600 dark:text-red-400">{formatNumber(stat.overdue)}</td>
                                            <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-300">{stat.rate}%</td>
                                            <td className="text-center py-3 px-4">
                                                <span className={cn(
                                                    'badge',
                                                    stat.rate >= 80 ? 'badge-success' : stat.rate >= 60 ? 'badge-warning' : 'badge-danger'
                                                )}>
                                                    {stat.rate >= 80 ? 'On Track' : stat.rate >= 60 ? 'At Risk' : 'Critical'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
