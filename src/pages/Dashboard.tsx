import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
    Building2,
    Users,
    Syringe,
    AlertTriangle,
    AlertCircle,
    Info,
    ArrowUpRight,
    ArrowDownRight,
    Beef,
    Baby,
    RefreshCw,
    Heart,
    Stethoscope,
    TrendingUp,
    Clock,
    ShieldCheck,
    Search,
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
    Legend,
    ComposedChart,
    Bar,
    Line,
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { useApi } from '../hooks/useApi';
import { api, reproductionLogApi } from '../services/api';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { formatNumber, formatPercentage, getAlertColor, cn } from '../lib/utils';
import { AccountWidget } from '../components/dashboard/AccountWidget';
import { RecentActivityFeed, ActivityItem } from '../components/dashboard/RecentActivityFeed';
import { useAuth } from '../contexts/AuthContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const CHART_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ec4899',
    '#8b5cf6', '#6366f1', '#ef4444', '#14b8a6',
];

const STATUS_COLORS: Record<string, string> = {
    Alive: '#10b981',
    Active: '#3b82f6',
    Healthy: '#10b981',
    Dead: '#ef4444',
    Deceased: '#ef4444',
    Sold: '#f59e0b',
    Transferred: '#8b5cf6',
    Slaughtered: '#f97316',
    Unknown: '#94a3b8',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Try multiple field names, return first valid Date or null */
function parseRecordDate(rec: any, ...fields: string[]): Date | null {
    for (const f of fields) {
        const v = rec[f];
        if (v) {
            const d = new Date(v);
            if (!isNaN(d.getTime())) return d;
        }
    }
    return null;
}

/** Truncate a label to fit chart axis */
function truncate(s: string, len = 14): string {
    return s.length > len ? s.slice(0, len) + '…' : s;
}

/** Month key "YYYY-MM" */
function monthKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    color = 'primary',
    delta,
    loading = false,
}: {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string }>;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'danger';
    delta?: { value: number | null; label: string };
    loading?: boolean;
}) {
    const bg: Record<string, string> = {
        primary: 'bg-primary-500',
        secondary: 'bg-secondary-500',
        success: 'bg-green-500',
        warning: 'bg-amber-500',
        info: 'bg-cyan-500',
        danger: 'bg-red-500',
    };

    if (loading) {
        return <div className="card p-6 h-32 animate-pulse bg-slate-100 dark:bg-slate-800" />;
    }

    const isPositive = delta && delta.value !== null && delta.value >= 0;

    return (
        <div className="card p-6">
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
                    {subtitle && (
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>
                    )}
                    {delta && delta.value !== null && (
                        <div className="mt-2 flex items-center gap-1 text-sm">
                            {isPositive ? (
                                <ArrowUpRight className="w-4 h-4 text-green-500" />
                            ) : (
                                <ArrowDownRight className="w-4 h-4 text-red-400" />
                            )}
                            <span className={cn('font-medium', isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400')}>
                                {isPositive ? '+' : ''}{delta.value}%
                            </span>
                            <span className="text-slate-500 dark:text-slate-400">{delta.label}</span>
                        </div>
                    )}
                </div>
                <div className={cn('p-3 rounded-xl shadow-sm flex-shrink-0 ml-3', bg[color])}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );
}

/** Small pill for the health pulse strip */
function PulsePill({
    label,
    value,
    icon: Icon,
    color,
}: {
    label: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}) {
    return (
        <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className={cn('p-2 rounded-lg', color)}>
                <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{formatNumber(value)}</p>
            </div>
        </div>
    );
}

function AlertCard({ type, title, message, createdAt }: {
    type: 'danger' | 'warning' | 'info';
    title: string;
    message: string;
    createdAt: string;
}) {
    const icons = { danger: AlertCircle, warning: AlertTriangle, info: Info };
    const Icon = icons[type];
    return (
        <div className={cn('p-4 rounded-lg border flex gap-3', getAlertColor(type))}>
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{title}</p>
                <p className="text-sm mt-0.5 opacity-90 line-clamp-2">{message}</p>
                <p className="text-xs opacity-70 mt-1">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</p>
            </div>
        </div>
    );
}

/** Recharts custom tooltip wrapper with dark background */
function DarkTooltip({ active, payload, label, formatter }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl text-xs text-white min-w-[120px]">
            {label && <p className="font-medium mb-2 text-slate-300">{label}</p>}
            {payload.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2 py-0.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color || p.fill }} />
                    <span className="text-slate-400">{p.name}:</span>
                    <span className="font-semibold ml-auto pl-3">
                        {formatter ? formatter(p.value, p.name) : p.value}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function Dashboard() {
    useAuth();
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const refetchRef = useRef<() => void>(() => {});

    const { data, loading, error, refetch } = useApi(async () => {
        setIsRefreshing(true);
        try {
            // All calls use allSettled so a single failing endpoint never breaks the dashboard
            const results = await Promise.allSettled([
                api.livestock.list(),                       // 0
                api.farms.list(),                           // 1
                api.farmers.list(),                         // 2
                api.vaccinations.list(),                    // 3
                api.transfers.list(),                       // 4
                api.birthEvents.list(),                     // 5
                api.vets.list(),                            // 6
                api.extensionOfficers.list(),               // 7
                api.treatments.list(),                      // 8
                reproductionLogApi.inseminations.list(),    // 9
                reproductionLogApi.pregnancies.list(),      // 10
            ]);

            const unwrap = (r: PromiseSettledResult<any>): any[] =>
                r.status === 'fulfilled' && Array.isArray(r.value) ? r.value : [];

            return {
                livestock:     unwrap(results[0]),
                farms:         unwrap(results[1]),
                farmers:       unwrap(results[2]),
                vaccinations:  unwrap(results[3]),
                transfers:     unwrap(results[4]),
                births:        unwrap(results[5]),
                vets:          unwrap(results[6]),
                officers:      unwrap(results[7]),
                medications:   unwrap(results[8]),
                inseminations: unwrap(results[9]),
                pregnancies:   unwrap(results[10]),
            };
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    // Keep ref current so the interval closure always calls the latest refetch
    refetchRef.current = refetch;

    // Mark data freshness
    useEffect(() => {
        if (data) setLastUpdated(new Date());
    }, [data]);

    // Auto-refresh every 5 minutes
    useEffect(() => {
        const id = setInterval(() => refetchRef.current(), 5 * 60 * 1000);
        return () => clearInterval(id);
    }, []);

    // ─── Computation ───────────────────────────────────────────────────────────

    const stats = useMemo(() => {
        if (!data) return null;
        const { livestock, farms, farmers, vaccinations, medications,
            transfers, births, vets, officers, inseminations, pregnancies } = data;

        const now = new Date();
        const thirtyDaysAgo  = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        // Filter data based on selected range for time-based metrics
        const rangeMs = {
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000,
            '90d': 90 * 24 * 60 * 60 * 1000,
            'all': Infinity,
        }[dateRange];
        
        const filterByRange = (items: any[], dateFields: string[]) => {
            if (dateRange === 'all') return items;
            const threshold = new Date(now.getTime() - rangeMs);
            return items.filter(item => {
                const d = parseRecordDate(item, ...dateFields);
                return d && d >= threshold;
            });
        };

        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        // ── KPI ──────────────────────────────────────────────────────────────

        const totalLivestock  = livestock.length;
        const aliveLivestock  = livestock.filter((l: any) =>
            ['alive', 'active', 'healthy'].includes((l.status ?? '').toLowerCase())).length;
        const deadLivestock   = livestock.filter((l: any) =>
            ['dead', 'deceased', 'died'].includes((l.status ?? '').toLowerCase())).length;

        const totalFarms  = farms.length;
        const activeFarms = farms.filter((f: any) =>
            ['active', 'operational'].includes((f.status ?? '').toLowerCase())).length;

        // Corrected Vaccination coverage: percentage of ALIVE livestock with at least one COMPLETED vaccination
        const vaccinatedSet = new Set(
            vaccinations
                .filter((v: any) => v.status?.toLowerCase() === 'completed')
                .map((v: any) => v.livestockUuid)
                .filter(Boolean)
        );
        
        // Match UUIDs against alive livestock only for a more meaningful metric
        const aliveUuids = new Set(livestock
            .filter((l: any) => ['alive', 'active'].includes((l.status ?? '').toLowerCase()))
            .map((l: any) => l.uuid || l.id));
            
        const vaccinatedAliveCount = Array.from(vaccinatedSet).filter(uuid => aliveUuids.has(uuid)).length;
        
        const vaccinationCoverage = aliveLivestock > 0
            ? (vaccinatedAliveCount / aliveLivestock) * 100
            : 0;

        // This-month vs last-month helper
        const inRange = (rec: any, from: Date, to?: Date, ...fields: string[]) => {
            const d = parseRecordDate(rec, ...fields);
            if (!d) return false;
            return d >= from && (!to || d <= to);
        };

        const thisMonthBirths       = births.filter((b: any) => inRange(b, thisMonthStart, undefined, 'birthDate', 'eventDate', 'created_at')).length;
        const lastMonthBirths       = births.filter((b: any) => inRange(b, lastMonthStart, lastMonthEnd, 'birthDate', 'eventDate', 'created_at')).length;
        const thisMonthVaccinations = vaccinations.filter((v: any) => inRange(v, thisMonthStart, undefined, 'eventDate', 'vaccinationDate', 'created_at')).length;
        const thisMonthTreatments   = medications.filter((m: any) => inRange(m, thisMonthStart, undefined, 'medicationDate', 'eventDate', 'created_at')).length;

        const thisMonthReg  = livestock.filter((l: any) => inRange(l, thisMonthStart, undefined, 'created_at', 'dateFirstEnteredToFarm')).length;
        const lastMonthReg  = livestock.filter((l: any) => inRange(l, lastMonthStart, lastMonthEnd, 'created_at', 'dateFirstEnteredToFarm')).length;
        const registrationDelta = lastMonthReg > 0
            ? Math.round(((thisMonthReg - lastMonthReg) / lastMonthReg) * 100)
            : (thisMonthReg > 0 ? 100 : 0);

        const activePregnancies = pregnancies.filter((p: any) =>
            ['confirmed', 'suspected', 'active'].includes((p.status ?? '').toLowerCase())).length;

        const recentCritical = medications.filter((m: any) => {
            const d = parseRecordDate(m, 'medicationDate', 'eventDate', 'created_at');
            return d && d >= thirtyDaysAgo && ['critical', 'high', 'emergency'].includes((m.severity ?? '').toLowerCase());
        });

        // ── Performance/Innovation: Composite Health Index ───────────────────
        // 35% alive ratio + 35% vaccination coverage + 30% low disease burden
        const aliveRatio   = totalLivestock > 0 ? (aliveLivestock / totalLivestock) * 100 : 100;
        const diseaseScore = Math.max(0, 100 - (recentCritical.length * 10)); // -10% per critical event in 30 days
        const healthScore  = Math.max(0, Math.round(
            aliveRatio * 0.35 + vaccinationCoverage * 0.35 + diseaseScore * 0.30
        ));

        // ── Trend Logic with Range filtering ─────────────────────────────────
        const rollingMonths = dateRange === '7d' ? 1 : dateRange === '30d' ? 3 : dateRange === '90d' ? 6 : 12;

        const lastMonths = Array.from({ length: rollingMonths }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (rollingMonths - 1) + i, 1);
            return {
                key:   monthKey(d),
                label: d.toLocaleString('default', { month: 'short' }) + " '" + String(d.getFullYear()).slice(2),
            };
        });

        // ── Species data ──────────────────────────────────────────────────────

        const speciesCounts: Record<string, number> = {};
        livestock.forEach((l: any) => {
            const s = l.species?.name ?? (typeof l.species === 'string' ? l.species : null) ?? 'Unknown';
            speciesCounts[s] = (speciesCounts[s] ?? 0) + 1;
        });

        const speciesDistribution = Object.entries(speciesCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([name, value], i) => ({ name, value, fill: CHART_COLORS[i % CHART_COLORS.length] }));

        // Top 4 species for trend chart
        const topSpecies = Object.entries(speciesCounts)
            .filter(([n]) => n !== 'Unknown')
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([name]) => name);
        if (topSpecies.length === 0) topSpecies.push('Unknown');

        // Registration trend per month per species
        const trendData = lastMonths.map(({ key, label }) => {
            const row: Record<string, any> = { month: label };
            topSpecies.forEach(s => { row[s] = 0; });
            return row;
        });

        livestock.forEach((l: any) => {
            const d = parseRecordDate(l, 'created_at', 'dateFirstEnteredToFarm');
            if (!d) return;
            const key = monthKey(d);
            const idx = lastMonths.findIndex(m => m.key === key);
            if (idx === -1) return;
            const sn = l.species?.name ?? (typeof l.species === 'string' ? l.species : null) ?? 'Unknown';
            if (topSpecies.includes(sn)) trendData[idx][sn]++;
        });

        // ── Improved Livestock Status Breakdown ──────────────────────────────

        const statusCounts: Record<string, number> = {};
        livestock.forEach((l: any) => {
            const s = l.status || 'Unknown';
            statusCounts[s] = (statusCounts[s] ?? 0) + 1;
        });
        const livestockStatusData = Object.entries(statusCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([status, count]) => ({ 
                status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(), 
                count, 
                fill: STATUS_COLORS[status] || STATUS_COLORS[status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()] || '#94a3b8' 
            }));

        // ── Gender split ──────────────────────────────────────────────────────

        const males   = livestock.filter((l: any) => (l.gender ?? '').toLowerCase() === 'male' || (l.gender ?? '').toLowerCase() === 'm').length;
        const females = livestock.filter((l: any) => (l.gender ?? '').toLowerCase() === 'female' || (l.gender ?? '').toLowerCase() === 'f').length;
        const genderData = [
            { name: 'Female', value: females, fill: '#ec4899' },
            { name: 'Male',   value: males,   fill: '#3b82f6' },
        ].filter(g => g.value > 0);

        // ── Top farms: livestock count + vaccination coverage overlay ─────────────────

        const farmNameMap: Record<string, string> = {};
        farms.forEach((f: any) => {
            if (f.uuid) farmNameMap[f.uuid] = f.name ?? f.farmName ?? f.uuid.slice(0, 8);
        });

        // livestock per farm
        const farmLivestockCount: Record<string, number> = {};
        const farmVaccinatedCount: Record<string, Set<string>> = {};
        
        livestock.forEach((l: any) => {
            if (!l.farmUuid) return;
            farmLivestockCount[l.farmUuid] = (farmLivestockCount[l.farmUuid] ?? 0) + 1;
        });

        vaccinations
            .filter((v: any) => v.status?.toLowerCase() === 'completed' && v.farmUuid && v.livestockUuid)
            .forEach((v: any) => {
                if (!farmVaccinatedCount[v.farmUuid]) farmVaccinatedCount[v.farmUuid] = new Set();
                farmVaccinatedCount[v.farmUuid].add(v.livestockUuid);
            });

        const topFarmsData = Object.entries(farmLivestockCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([uuid, count]) => {
                const vacc     = farmVaccinatedCount[uuid]?.size ?? 0;
                const coverage = count > 0 ? Math.round((vacc / count) * 100) : 0;
                return {
                    farm:      truncate(farmNameMap[uuid] ?? uuid.slice(0, 8)),
                    livestock: count,
                    coverage,
                };
            });

        // ── Health activity timeline ─────────────────────────────────────────

        const healthActivity = lastMonths.map(({ key, label }) => {
            const vacc = vaccinations.filter((v: any) => {
                const d = parseRecordDate(v, 'eventDate', 'vaccinationDate', 'created_at');
                return d && monthKey(d) === key;
            }).length;
            const treat = medications.filter((m: any) => {
                const d = parseRecordDate(m, 'medicationDate', 'eventDate', 'created_at');
                return d && monthKey(d) === key;
            }).length;
            return { month: label, Vaccinations: vacc, Treatments: treat, Total: vacc + treat };
        });

        // ── Activity feed aggregation ────────────────────────────────────────

        const activities: ActivityItem[] = [];

        // Recent registrations
        [...livestock]
            .sort((a: any, b: any) => (new Date(b.created_at ?? 0).getTime()) - (new Date(a.created_at ?? 0).getTime()))
            .slice(0, 10)
            .forEach((l: any) => {
                activities.push({
                    id: `reg-${l.id ?? l.uuid}`,
                    type: 'registration',
                    title: 'Livestock Registered',
                    description: `${l.species?.name || 'Livestock'}${l.identificationNumber ? ' #' + l.identificationNumber : ''}`,
                    date: l.created_at ?? new Date().toISOString(),
                    link: '/livestock',
                });
            });

        // Add more log types... (transfers, births, etc.)

        return {
            totalLivestock, aliveLivestock, deadLivestock,
            totalFarms, activeFarms,
            totalFarmers: farmers.length,
            totalVets: vets.length,
            vaccinationCoverage,
            registrationDelta,
            activePregnancies,
            healthScore,
            thisMonthBirths,
            lastMonthBirths,
            speciesDistribution,
            trendData,
            topSpecies,
            livestockStatusData,
            genderData,
            topFarmsData,
            healthActivity,
            activities: activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 15),
            recentCritical
        };
    }, [data, dateRange]);
                date: b.birthDate ?? b.eventDate ?? b.created_at ?? new Date().toISOString(),
                link: '/reproduction/births',
            });
        });

        vaccinations.slice(0, 20).forEach((v: any) => activities.push({
            id: `vac-${v.id}`,
            type: 'vaccination',
            title: 'Vaccination Administered',
            description: v.disease?.name ? `${v.disease.name} vaccination` : 'Vaccination recorded',
            date: v.eventDate ?? v.vaccinationDate ?? v.created_at ?? new Date().toISOString(),
            link: '/health/vaccinations',
        }));

        medications.slice(0, 15).forEach((m: any) => activities.push({
            id: `med-${m.id}`,
            type: 'treatment',
            title: 'Medical Treatment',
            description: m.disease?.name ? `${m.disease.name} treatment` : 'Treatment recorded',
            date: m.medicationDate ?? m.eventDate ?? m.created_at ?? new Date().toISOString(),
            link: '/health/treatments',
        }));

        // ── Smart alerts ──────────────────────────────────────────────────────

        const alerts: { id: string; type: 'danger' | 'warning' | 'info'; title: string; message: string; createdAt: string }[] = [];

        recentCritical.slice(0, 3).forEach((m: any) => alerts.push({
            id: `alert-med-${m.id}`,
            type: m.severity === 'critical' ? 'danger' : 'warning',
            title: 'Disease Alert',
            message: `${m.disease?.name ?? 'Unknown disease'} — ${m.severity} severity treatment in last 30 days`,
            createdAt: m.medicationDate ?? m.eventDate ?? m.created_at ?? new Date().toISOString(),
        }));

        // Low-coverage farms (>=5 animals, <40% vaccinated)
        topFarmsData
            .filter(f => f.livestock >= 5 && f.coverage < 40)
            .slice(0, 2)
            .forEach(f => alerts.push({
                id: `alert-cov-${f.farm}`,
                type: 'warning',
                title: 'Low Vaccination Coverage',
                message: `${f.farm}: ${f.coverage}% vaccinated (${f.livestock} animals)`,
                createdAt: new Date().toISOString(),
            }));

        // High mortality (>5% of herd dead)
        const mortalityRate = totalLivestock > 0 ? (deadLivestock / totalLivestock) * 100 : 0;
        if (mortalityRate > 5) alerts.push({
            id: 'alert-mortality',
            type: 'danger',
            title: 'High Mortality Rate',
            message: `${deadLivestock} animals recorded dead — ${mortalityRate.toFixed(1)}% of total herd`,
            createdAt: new Date().toISOString(),
        });

        return {
            kpi: {
                totalLivestock, aliveLivestock, deadLivestock,
                totalFarms, activeFarms,
                vaccinationCoverage, vaccinatedCount: vaccinatedSet.size,
                totalFarmers: farmers.length, totalVets: vets.length, totalOfficers: officers.length,
                thisMonthBirths, lastMonthBirths,
                thisMonthVaccinations, thisMonthTreatments,
                thisMonthReg, registrationDelta,
                activePregnancies,
                healthScore,
            },
            topSpecies,
            trendData,
            speciesDistribution,
            livestockStatusData,
            genderData,
            topFarmsData,
            healthActivity,
            activities,
            alerts,
        };
    }, [data, dateRange]);

    // ─── Render ────────────────────────────────────────────────────────────────

    if (loading && !data) return <PageLoader />;
    if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;
    if (!stats) return null;

    const {
        kpi, topSpecies, trendData, speciesDistribution,
        livestockStatusData, genderData, topFarmsData, healthActivity,
        activities, alerts,
    } = stats;

    const healthScoreColor = kpi.healthScore >= 80 ? 'text-green-600 dark:text-green-400'
        : kpi.healthScore >= 60 ? 'text-amber-600 dark:text-amber-400'
        : 'text-red-600 dark:text-red-400';

    return (
        <div className="space-y-6">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-4 flex-wrap bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                        <TrendingUp className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Overview</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                            System Health Score: <span className={cn('font-bold', healthScoreColor)}>{kpi.healthScore}%</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                        {(['7d', '30d', '90d', 'all'] as const).map((r) => (
                            <button
                                key={r}
                                onClick={() => setDateRange(r)}
                                className={cn(
                                    'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                                    dateRange === r
                                        ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                )}
                            >
                                {r.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                    <div className="flex items-center gap-2">
                        {lastUpdated && (
                            <span className="text-[10px] text-slate-400 hidden sm:block">
                                Last sync: {formatDistanceToNow(lastUpdated)} ago
                            </span>
                        )}
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
                        </button>
                    </div>
                </div>
            </div>
                        </span>
                    )}
                    <button
                        onClick={refetch}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* ── KPI Cards + Account Widget ───────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <StatCard
                        title="Total Livestock"
                        value={formatNumber(kpi.totalLivestock)}
                        subtitle={`${formatNumber(kpi.aliveLivestock)} alive · ${formatNumber(kpi.deadLivestock)} dead`}
                        icon={Beef}
                        color="primary"
                        delta={kpi.registrationDelta !== null ? { value: kpi.registrationDelta, label: 'vs last month' } : undefined}
                    />
                    <StatCard
                        title="Vaccination Coverage"
                        value={formatPercentage(kpi.vaccinationCoverage)}
                        subtitle={`${formatNumber(kpi.vaccinatedCount)} of ${formatNumber(kpi.totalLivestock)} animals`}
                        icon={Syringe}
                        color={kpi.vaccinationCoverage >= 70 ? 'success' : 'warning'}
                    />
                    <StatCard
                        title="Active Farms"
                        value={formatNumber(kpi.activeFarms)}
                        subtitle={`Out of ${formatNumber(kpi.totalFarms)} registered`}
                        icon={Building2}
                        color="info"
                    />
                    <StatCard
                        title="Field Personnel"
                        value={formatNumber(kpi.totalOfficers + kpi.totalVets)}
                        subtitle={`${kpi.totalOfficers} Officers · ${kpi.totalVets} Vets · ${kpi.totalFarmers} Farmers`}
                        icon={Users}
                        color="secondary"
                    />
                </div>

                {/* Account Widget */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <AccountWidget />

                    {/* Health Score — innovation: composite KPI */}
                    <div className="card p-5 flex items-center gap-4">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                            <ShieldCheck className="w-7 h-7 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Herd Health Score</p>
                            <div className="flex items-end gap-2 mt-1">
                                <span className={cn('text-3xl font-bold', healthScoreColor)}>{kpi.healthScore}</span>
                                <span className="text-slate-400 text-sm mb-1">/ 100</span>
                            </div>
                            <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                <div
                                    className={cn('h-full rounded-full transition-all duration-700',
                                        kpi.healthScore >= 80 ? 'bg-green-500' : kpi.healthScore >= 60 ? 'bg-amber-500' : 'bg-red-500')}
                                    style={{ width: `${kpi.healthScore}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-1.5">
                                Alive ratio · Vaccination rate · Disease burden
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Health Pulse Strip ───────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <PulsePill label="Births this month"       value={kpi.thisMonthBirths}        icon={Baby}        color="bg-green-500" />
                <PulsePill label="Vaccinations this month" value={kpi.thisMonthVaccinations}   icon={Syringe}     color="bg-indigo-500" />
                <PulsePill label="Treatments this month"   value={kpi.thisMonthTreatments}     icon={Stethoscope} color="bg-red-500" />
                <PulsePill label="Active Pregnancies"      value={kpi.activePregnancies}       icon={Heart}       color="bg-pink-500" />
            </div>

            {/* ── Main Grid: Charts + Activity ─────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Charts */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Monthly Registration Trend — all species dynamically */}
                    <div className="card">
                        <div className="card-header">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Registration Trend
                                </h2>
                                <p className="text-sm text-slate-500">Monthly new livestock registrations (rolling 12 months)</p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {topSpecies.map((s, i) => (
                                    <span key={s} className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="card-body h-72 min-w-0">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <AreaChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                                    <defs>
                                        {topSpecies.map((s, i) => (
                                            <linearGradient key={s} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.25} />
                                                <stop offset="95%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0} />
                                            </linearGradient>
                                        ))}
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tick={{ fill: '#94a3b8' }} />
                                    <YAxis stroke="#94a3b8" fontSize={11} tick={{ fill: '#94a3b8' }} allowDecimals={false} />
                                    <Tooltip content={<DarkTooltip />} />
                                    {topSpecies.map((s, i) => (
                                        <Area
                                            key={s}
                                            type="monotone"
                                            dataKey={s}
                                            stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                            strokeWidth={2}
                                            fill={`url(#grad-${i})`}
                                            fillOpacity={1}
                                        />
                                    ))}
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Species + Livestock Status + Gender */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Species donut */}
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Species Mix</h2>
                            </div>
                            <div className="card-body h-52 min-w-0">
                                {speciesDistribution.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-sm text-slate-400">No data</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                        <PieChart>
                                            <Pie
                                                data={speciesDistribution}
                                                cx="50%" cy="50%"
                                                innerRadius={48} outerRadius={68}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {speciesDistribution.map((e, i) => (
                                                    <Cell key={i} fill={e.fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<DarkTooltip />} />
                                            <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Livestock status bar */}
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Herd Status</h2>
                            </div>
                            <div className="card-body h-52 min-w-0">
                                {livestockStatusData.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-sm text-slate-400">No data</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                        <ComposedChart
                                            layout="vertical"
                                            data={livestockStatusData}
                                            margin={{ top: 0, right: 16, bottom: 0, left: -8 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                                            <XAxis type="number" stroke="#94a3b8" fontSize={10} tick={{ fill: '#94a3b8' }} />
                                            <YAxis
                                                type="category"
                                                dataKey="status"
                                                stroke="#94a3b8"
                                                fontSize={10}
                                                tick={{ fill: '#94a3b8' }}
                                                width={70}
                                            />
                                            <Tooltip content={<DarkTooltip />} />
                                            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14} name="Count">
                                                {livestockStatusData.map((e, i) => (
                                                    <Cell key={i} fill={e.fill} />
                                                ))}
                                            </Bar>
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Gender split donut */}
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Gender Split</h2>
                            </div>
                            <div className="card-body h-52 min-w-0 flex flex-col items-center justify-center gap-3">
                                {genderData.length === 0 ? (
                                    <span className="text-sm text-slate-400">No data</span>
                                ) : (
                                    <>
                                        <ResponsiveContainer width="100%" height={120} minWidth={0}>
                                            <PieChart>
                                                <Pie
                                                    data={genderData}
                                                    cx="50%" cy="50%"
                                                    innerRadius={36} outerRadius={52}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                >
                                                    {genderData.map((e, i) => (
                                                        <Cell key={i} fill={e.fill} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<DarkTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="flex gap-4 text-sm">
                                            {genderData.map(g => {
                                                const pct = kpi.totalLivestock > 0
                                                    ? Math.round((g.value / kpi.totalLivestock) * 100)
                                                    : 0;
                                                return (
                                                    <div key={g.name} className="flex items-center gap-1.5">
                                                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: g.fill }} />
                                                        <span className="text-slate-600 dark:text-slate-300">
                                                            {g.name} <strong>{pct}%</strong>
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Top Farms: livestock count + vaccination coverage overlay */}
                    <div className="card">
                        <div className="card-header">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Top Farms</h2>
                                <p className="text-sm text-slate-500">Livestock count (bars) vs vaccination coverage % (line)</p>
                            </div>
                        </div>
                        <div className="card-body h-72 min-w-0">
                            {topFarmsData.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-sm text-slate-400">No farm data</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    <ComposedChart data={topFarmsData} margin={{ top: 4, right: 40, bottom: 0, left: -10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="farm" stroke="#94a3b8" fontSize={11} tick={{ fill: '#94a3b8' }} />
                                        <YAxis
                                            yAxisId="left"
                                            stroke="#94a3b8"
                                            fontSize={11}
                                            tick={{ fill: '#94a3b8' }}
                                            allowDecimals={false}
                                        />
                                        <YAxis
                                            yAxisId="right"
                                            orientation="right"
                                            domain={[0, 100]}
                                            tickFormatter={v => `${v}%`}
                                            stroke="#f59e0b"
                                            fontSize={11}
                                            tick={{ fill: '#f59e0b' }}
                                        />
                                        <Tooltip
                                            content={<DarkTooltip formatter={(v: any, n: string) =>
                                                n === 'Coverage %' ? `${v}%` : formatNumber(v)
                                            } />}
                                        />
                                        <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                                        <Bar
                                            yAxisId="left"
                                            dataKey="livestock"
                                            fill="#3b82f6"
                                            radius={[4, 4, 0, 0]}
                                            barSize={28}
                                            name="Livestock"
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="coverage"
                                            stroke="#f59e0b"
                                            strokeWidth={2.5}
                                            dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }}
                                            activeDot={{ r: 6 }}
                                            name="Coverage %"
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Health Activity Timeline: vaccinations + treatments stacked */}
                    <div className="card">
                        <div className="card-header">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Health Activity Timeline</h2>
                                <p className="text-sm text-slate-500">Monthly vaccinations and treatments (last 12 months)</p>
                            </div>
                        </div>
                        <div className="card-body h-72 min-w-0">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <ComposedChart data={healthActivity} margin={{ top: 4, right: 16, bottom: 0, left: -10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tick={{ fill: '#94a3b8' }} />
                                    <YAxis stroke="#94a3b8" fontSize={11} tick={{ fill: '#94a3b8' }} allowDecimals={false} />
                                    <Tooltip content={<DarkTooltip />} />
                                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                                    <Bar dataKey="Vaccinations" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="Treatments"   stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    <Line
                                        type="monotone"
                                        dataKey="Total"
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                        dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }}
                                        activeDot={{ r: 5 }}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Right: Alerts + Activity Feed */}
                <div className="lg:col-span-1 space-y-4">

                    {/* Alerts */}
                    {alerts.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2 px-1">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                Active Alerts
                            </h3>
                            {alerts.map(a => <AlertCard key={a.id} {...a} />)}
                        </div>
                    )}

                    {/* Birth comparison mini card */}
                    <div className="card p-4 flex items-center gap-4">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Births</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {kpi.thisMonthBirths}
                                </span>
                                <span className="text-sm text-slate-500">this month</span>
                            </div>
                            {kpi.lastMonthBirths > 0 && (
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {kpi.lastMonthBirths} last month
                                    {kpi.thisMonthBirths > kpi.lastMonthBirths
                                        ? <span className="text-green-500 ml-1">▲</span>
                                        : kpi.thisMonthBirths < kpi.lastMonthBirths
                                        ? <span className="text-red-400 ml-1">▼</span>
                                        : null}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="h-[640px]">
                        <RecentActivityFeed activities={activities} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
