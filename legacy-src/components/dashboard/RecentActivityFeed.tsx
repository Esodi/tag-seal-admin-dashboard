import { useMemo } from 'react';
import {
    ArrowRightLeft,
    Baby,
    Syringe,
    Stethoscope,
    Activity,
    FilePlus,
    Truck
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

// We'll define a unified activity interface
export interface ActivityItem {
    id: string | number;
    type: 'transfer' | 'birth' | 'vaccination' | 'treatment' | 'registration';
    title: string;
    description: string;
    date: string | Date;
    link?: string;
    user?: string;
}

interface RecentActivityFeedProps {
    activities: ActivityItem[];
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {

    const sortedActivities = useMemo(() => {
        return [...activities].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        ).slice(0, 10); // Show top 10 recent
    }, [activities]);

    const getIcon = (type: ActivityItem['type']) => {
        switch (type) {
            case 'transfer': return <Truck className="w-4 h-4 text-blue-500" />;
            case 'birth': return <Baby className="w-4 h-4 text-green-500" />;
            case 'vaccination': return <Syringe className="w-4 h-4 text-purple-500" />;
            case 'treatment': return <Stethoscope className="w-4 h-4 text-red-500" />;
            case 'registration': return <FilePlus className="w-4 h-4 text-amber-500" />;
            default: return <Activity className="w-4 h-4 text-slate-500" />;
        }
    };

    const getBgColor = (type: ActivityItem['type']) => {
        switch (type) {
            case 'transfer': return 'bg-blue-50 dark:bg-blue-900/10';
            case 'birth': return 'bg-green-50 dark:bg-green-900/10';
            case 'vaccination': return 'bg-purple-50 dark:bg-purple-900/10';
            case 'treatment': return 'bg-red-50 dark:bg-red-900/10';
            case 'registration': return 'bg-amber-50 dark:bg-amber-900/10';
            default: return 'bg-slate-50 dark:bg-slate-900/10';
        }
    };

    if (activities.length === 0) {
        return (
            <div className="card p-6 h-full flex flex-col items-center justify-center text-center text-slate-500">
                <Activity className="w-12 h-12 mb-2 opacity-20" />
                <p>No recent activity recorded</p>
            </div>
        );
    }

    return (
        <div className="card h-full">
            <div className="card-header border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-slate-400" />
                    Recent Activity
                </h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto max-h-[400px]">
                {sortedActivities.map((activity) => (
                    <div key={`${activity.type}-${activity.id}`} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex gap-3">
                            <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getBgColor(activity.type)}`}>
                                {getIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                    {activity.title}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                    {activity.description}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-slate-400">
                                        {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                                    </span>
                                    {activity.user && (
                                        <>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-xs text-slate-500 font-medium">{activity.user}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            {activity.link && (
                                <Link
                                    to={activity.link}
                                    className="self-center p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                >
                                    <ArrowRightLeft className="w-4 h-4" />
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
