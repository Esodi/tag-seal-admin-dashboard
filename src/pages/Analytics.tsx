import { useState, useMemo } from 'react';
import {
    TrendingUp,
    BarChart as BarChartIcon,
    Activity,
    Award
} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    BarChart,
    Bar,
    Legend,
    PieChart,
    Pie
} from 'recharts';
import { useApi } from '../hooks/useApi';
import { api, referenceApi } from '../services/api';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { cn } from '../lib/utils';
import { differenceInMonths } from 'date-fns';

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
                'flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all',
                active
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-200 dark:shadow-none'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            )}
        >
            <Icon className="w-4 h-4" />
            {children}
        </button>
    );
}

export function Analytics() {
    const { data, loading, error, refetch } = useApi(async () => {
        const [
            livestock,
            farms,
            vaccinations,
            births,
            inseminations,
            diseasesResult,
            inseminationServicesResult,
        ] = await Promise.allSettled([
            api.livestock.list(),
            api.farms.list(),
            api.vaccinations.list(),
            api.birthEvents.list(),
            api.inseminations.list(),
            referenceApi.diseases.list(),
            referenceApi.inseminationServices.list(),
        ]);

        return {
            livestock: livestock.status === 'fulfilled' ? livestock.value : [],
            farms: farms.status === 'fulfilled' ? farms.value : [],
            vaccinations: vaccinations.status === 'fulfilled' ? vaccinations.value : [],
            births: births.status === 'fulfilled' ? births.value : [],
            inseminations: inseminations.status === 'fulfilled' ? inseminations.value : [],
            diseases: diseasesResult.status === 'fulfilled' ? diseasesResult.value : [],
            inseminationServices: inseminationServicesResult.status === 'fulfilled' ? inseminationServicesResult.value : [],
        };
    }, []);

    const [activeTab, setActiveTab] = useState<'livestock' | 'farm' | 'health' | 'reproduction'>('livestock');

    const stats = useMemo(() => {
        if (!data) return null;
        const { livestock, farms, vaccinations, births, inseminations, diseases, inseminationServices } = data;

        // Build reference lookups
        const diseaseMap = new Map<number | string, string>();
        diseases.forEach((d: any) => diseaseMap.set(d.id, d.name || `Disease ${d.id}`));

        const inseminationServiceMap = new Map<number | string, string>();
        inseminationServices.forEach((s: any) => inseminationServiceMap.set(s.id, s.name || `Service ${s.id}`));

        // --- Livestock Analytics ---

        // 1. Age Demographics (Calculated from DOB)
        const now = new Date();
        const ageGroups = {
            '0-6m': 0,
            '6-12m': 0,
            '1-2y': 0,
            '2-5y': 0,
            '5y+': 0
        };

        livestock.forEach((l: any) => {
            if (l.dateOfBirth) {
                const months = differenceInMonths(now, new Date(l.dateOfBirth));
                if (months <= 6) ageGroups['0-6m']++;
                else if (months <= 12) ageGroups['6-12m']++;
                else if (months <= 24) ageGroups['1-2y']++;
                else if (months <= 60) ageGroups['2-5y']++;
                else ageGroups['5y+']++;
            }
        });

        const ageDistribution = Object.entries(ageGroups).map(([age, count]) => ({
            age,
            count,
            fill: '#3b82f6' // Default blue
        }));

        // 2. Breed Distribution (Top 10)
        const breedCounts: Record<string, number> = {};
        livestock.forEach((l: any) => {
            const breed = l.breed?.name || (typeof l.breed === 'string' ? l.breed : null) || 'Unknown';
            breedCounts[breed] = (breedCounts[breed] || 0) + 1;
        });

        const breedDistribution = Object.entries(breedCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8) // Top 8 breeds
            .map(([name, value], index) => ({
                name,
                value,
                fill: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#6366f1'][index % 6]
            }));


        // --- Farm Analytics ---

        // 1. Farm Size Distribution
        // Assuming size is in acres or hectares, grouping them
        const sizeGroups = {
            'Micro (< 2)': 0,
            'Small (2-5)': 0,
            'Medium (5-20)': 0,
            'Large (20-100)': 0,
            'Commercial (> 100)': 0
        };

        farms.forEach((f: any) => {
            const size = Number(f.size || 0);
            if (size > 0) {
                if (size < 2) sizeGroups['Micro (< 2)']++;
                else if (size < 5) sizeGroups['Small (2-5)']++;
                else if (size < 20) sizeGroups['Medium (5-20)']++;
                else if (size < 100) sizeGroups['Large (20-100)']++;
                else sizeGroups['Commercial (> 100)']++;
            }
        });

        const farmSizeData = Object.entries(sizeGroups).map(([name, value]) => ({
            name,
            value
        }));

        // --- Health Analytics ---
        // Vaccination coverage by disease (Top diseases vaccinated against)
        const diseaseVaccinationCounts: Record<string, number> = {};
        vaccinations.forEach((v: any) => {
            const disease = v.disease?.name
                || (v.diseaseId != null ? diseaseMap.get(v.diseaseId) : null)
                || 'Unknown';
            diseaseVaccinationCounts[disease] = (diseaseVaccinationCounts[disease] || 0) + 1;
        });

        const vaccinationByDisease = Object.entries(diseaseVaccinationCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);


        // --- Reproduction Analytics ---

        // 1. Calving Success Rate (Births vs Eligible Females - estimated from available data)
        // Assume 'cows' > 2 years are eligible roughly
        // Real logic would be complex. Simplified metric:
        const totalBirths = births.length;
        const totalInseminations = inseminations.length;

        // Insemination Success Rate (Births linked to insemination / Total Inseminations) - approximated
        // In reality we'd check outcomes of insemination records.
        // Let's visualize Insemination Types (AI vs Natural if applicable)
        const inseminationTypeCounts: Record<string, number> = {};
        inseminations.forEach((i: any) => {
            const serviceName = i.inseminationService?.name
                || (i.inseminationServiceId != null ? inseminationServiceMap.get(i.inseminationServiceId) : null)
                || 'Unknown';
            inseminationTypeCounts[serviceName] = (inseminationTypeCounts[serviceName] || 0) + 1;
        });

        const reproductionStats = [
            { name: 'Total Births', value: totalBirths, fill: '#10b981' },
            { name: 'Recorded Inseminations', value: totalInseminations, fill: '#3b82f6' }
        ];

        return {
            ageDistribution,
            breedDistribution,
            farmSizeData,
            vaccinationByDisease,
            reproductionStats,
            totalLivestock: livestock.length,
            totalFarms: farms.length
        };
    }, [data]);

    if (loading) return <PageLoader />;
    if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;

    if (!stats) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Advanced Analytics
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Deep dive into system data and trends
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
                <TabButton
                    active={activeTab === 'livestock'}
                    onClick={() => setActiveTab('livestock')}
                    icon={TrendingUp}
                >
                    Livestock Demographics
                </TabButton>
                <TabButton
                    active={activeTab === 'farm'}
                    onClick={() => setActiveTab('farm')}
                    icon={BarChartIcon}
                >
                    Farm Insights
                </TabButton>
                <TabButton
                    active={activeTab === 'health'}
                    onClick={() => setActiveTab('health')}
                    icon={Activity}
                >
                    Health & Disease
                </TabButton>
                <TabButton
                    active={activeTab === 'reproduction'}
                    onClick={() => setActiveTab('reproduction')}
                    icon={Award}
                >
                    Reproduction Performance
                </TabButton>
            </div>

            {/* Content Area */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">

                {/* --- Livestock Tab --- */}
                {activeTab === 'livestock' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Age Pyramid / Distribution */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="font-semibold text-slate-900 dark:text-white">Age Distribution</h3>
                                <p className="text-sm text-slate-500">Calculated from Date of Birth</p>
                            </div>
                            <div className="card-body h-80 min-w-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.ageDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="age" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        />
                                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Bread Mix */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="font-semibold text-slate-900 dark:text-white">Top Breeds</h3>
                                <p className="text-sm text-slate-500">Most common breeds registered</p>
                            </div>
                            <div className="card-body h-80 min-w-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.breedDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {stats.breedDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        />
                                        <Legend layout="vertical" align="right" verticalAlign="middle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Farm Tab --- */}
                {activeTab === 'farm' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="card lg:col-span-2">
                            <div className="card-header">
                                <h3 className="font-semibold text-slate-900 dark:text-white">Farm Size Classification</h3>
                                <p className="text-sm text-slate-500">Distribution of farms by land size</p>
                            </div>
                            <div className="card-body h-96 min-w-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.farmSizeData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                        <XAxis type="number" stroke="#94a3b8" />
                                        <YAxis dataKey="name" type="category" stroke="#94a3b8" width={120} />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        />
                                        <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Health Tab --- */}
                {activeTab === 'health' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="card">
                            <div className="card-header">
                                <h3 className="font-semibold text-slate-900 dark:text-white">Disease Vaccination Profile</h3>
                                <p className="text-sm text-slate-500">Top diseases targeted by vaccination</p>
                            </div>
                            <div className="card-body h-80 min-w-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.vaccinationByDisease}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            dataKey="count"
                                            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                        >
                                            {stats.vaccinationByDisease.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={['#6366f1', '#e11d48', '#d946ef', '#f43f5e', '#f97316'][index % 5]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Reproduction Tab --- */}
                {activeTab === 'reproduction' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="card">
                            <div className="card-header">
                                <h3 className="font-semibold text-slate-900 dark:text-white">Breeding Activities</h3>
                                <p className="text-sm text-slate-500">Total recorded events</p>
                            </div>
                            <div className="card-body h-80 flex items-center justify-center">
                                <div className="grid grid-cols-2 gap-8 w-full max-w-md text-center">
                                    <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                                        <p className="text-sm text-slate-500 mb-1">Inseminations</p>
                                        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{stats.reproductionStats[1].value}</p>
                                    </div>
                                    <div className="p-6 bg-green-50 dark:bg-green-900/10 rounded-xl">
                                        <p className="text-sm text-slate-500 mb-1">Live Births</p>
                                        <p className="text-4xl font-bold text-green-600 dark:text-green-400">{stats.reproductionStats[0].value}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Analytics;
