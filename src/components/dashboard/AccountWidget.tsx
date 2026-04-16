import { useAuth } from '../../contexts/AuthContext';
import { UserCircle, Shield, Calendar, MapPin } from 'lucide-react';

export function AccountWidget() {
    const { user } = useAuth();

    if (!user) return null;

    // Create display name from user properties
    const displayName = user.email?.split('@')[0] || 'User';
    const roleLabel = user.role?.replace(/([A-Z])/g, ' $1').trim() || 'User'; // CamelCase to spaced
    const dateJoined = user.created_at
        ? new Date(user.created_at).toLocaleDateString()
        : null;

    // Determine location if applicable (for officers/farmers)
    let location = 'System Wide';
    const profile = user.profile as Record<string, { name?: string }> | undefined;
    if (profile && 'district' in profile && profile.district?.name) {
        location = profile.district.name;
    } else if (profile && 'ward' in profile && profile.ward?.name) {
        location = profile.ward.name;
    }

    return (
        <div className="card p-6 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-xl">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-full">
                    <UserCircle className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Welcome back, {displayName}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                        {user.email}
                    </p>

                    <div className="flex flex-wrap gap-3 mt-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
                            <Shield className="w-3.5 h-3.5" />
                            <span className="capitalize">{roleLabel}</span>
                        </div>
                        {dateJoined && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Joined {dateJoined}</span>
                            </div>
                        )}
                        {location && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{location}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
