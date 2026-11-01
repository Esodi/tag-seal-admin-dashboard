import { useState } from 'react';
import {
    User,
    Bell,
    Shield,
    Palette,
    Database,
    Key,
    Save,
    Check,
    AlertCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import { cn } from '../lib/utils';

interface SettingsTab {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
}

const tabs: SettingsTab[] = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'system', name: 'System', icon: Database },
];

export function SettingsPage() {
    const { user, changePassword, logout, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    // Profile form state
    const [profileForm, setProfileForm] = useState({
        username: user?.username || '',
        email: user?.email || '',
        first_name: user?.first_name || '',
        surname: user?.surname || '',
        phone: user?.phone || '',
    });
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);

    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        current: '',
        next: '',
        confirm: '',
    });
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordSaved, setPasswordSaved] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const handleProfileSave = async () => {
        setProfileSaving(true);
        setProfileError(null);
        try {
            await authApi.updateProfile(profileForm);
            await refreshUser();
            setProfileSaved(true);
            setTimeout(() => setProfileSaved(false), 2000);
        } catch (err) {
            setProfileError(err instanceof Error ? err.message : 'Failed to save profile');
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePasswordSave = async () => {
        if (passwordForm.next !== passwordForm.confirm) {
            setPasswordError('New passwords do not match');
            return;
        }
        if (passwordForm.next.length < 8) {
            setPasswordError('Password must be at least 8 characters');
            return;
        }
        setPasswordSaving(true);
        setPasswordError(null);
        try {
            await changePassword(passwordForm.current, passwordForm.next);
            setPasswordSaved(true);
            setPasswordForm({ current: '', next: '', confirm: '' });
            setTimeout(() => setPasswordSaved(false), 2000);
        } catch (err) {
            setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
        } finally {
            setPasswordSaving(false);
        }
    };

    const handleLogoutAllSessions = async () => {
        await logout();
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Manage your account settings and preferences
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <div className="lg:w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors',
                                    activeTab === tab.id
                                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                )}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        {activeTab === 'profile' && (
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                                    Profile Settings
                                </h2>
                                <div className="space-y-6">
                                    {/* Avatar */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                            <User className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <div>
                                            <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
                                                Change Avatar
                                            </button>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                JPG, GIF or PNG. Max size 2MB
                                            </p>
                                        </div>
                                    </div>

                                    {profileError && (
                                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            {profileError}
                                        </div>
                                    )}

                                    {/* Form Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Username
                                            </label>
                                            <input
                                                type="text"
                                                value={profileForm.username}
                                                onChange={(e) => setProfileForm(f => ({ ...f, username: e.target.value }))}
                                                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={profileForm.email}
                                                onChange={(e) => setProfileForm(f => ({ ...f, email: e.target.value }))}
                                                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profileForm.first_name}
                                                onChange={(e) => setProfileForm(f => ({ ...f, first_name: e.target.value }))}
                                                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profileForm.surname}
                                                onChange={(e) => setProfileForm(f => ({ ...f, surname: e.target.value }))}
                                                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={profileForm.phone}
                                                onChange={(e) => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                                                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                                    Notification Preferences
                                </h2>
                                <div className="space-y-4">
                                    {[
                                        { id: 'email_alerts', label: 'Email Notifications', description: 'Receive email alerts for important updates' },
                                        { id: 'push_alerts', label: 'Push Notifications', description: 'Get push notifications on your browser' },
                                        { id: 'health_alerts', label: 'Health Alerts', description: 'Notifications about livestock health events' },
                                        { id: 'system_updates', label: 'System Updates', description: 'Receive updates about system maintenance' },
                                    ].map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{item.label}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                                    Security Settings
                                </h2>
                                <div className="space-y-6">
                                    {/* Change Password */}
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                                            Change Password
                                        </h3>
                                        {passwordError && (
                                            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm">
                                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                {passwordError}
                                            </div>
                                        )}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                                                    Current Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={passwordForm.current}
                                                    onChange={(e) => setPasswordForm(f => ({ ...f, current: e.target.value }))}
                                                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                                                    New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={passwordForm.next}
                                                    onChange={(e) => setPasswordForm(f => ({ ...f, next: e.target.value }))}
                                                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                                                    Confirm New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={passwordForm.confirm}
                                                    onChange={(e) => setPasswordForm(f => ({ ...f, confirm: e.target.value }))}
                                                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                />
                                            </div>
                                            <button
                                                onClick={handlePasswordSave}
                                                disabled={passwordSaving}
                                                className={cn(
                                                    'flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-colors',
                                                    passwordSaved
                                                        ? 'bg-green-600 text-white'
                                                        : 'bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50'
                                                )}
                                            >
                                                {passwordSaved ? (
                                                    <><Check className="w-4 h-4" /> Password Updated</>
                                                ) : passwordSaving ? 'Updating...' : (
                                                    <><Save className="w-4 h-4" /> Update Password</>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Two-Factor Auth */}
                                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Key className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">Two-Factor Authentication</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">Add an extra layer of security</p>
                                                </div>
                                            </div>
                                            <button className="px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                                Enable
                                            </button>
                                        </div>
                                    </div>

                                    {/* Active Sessions */}
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                                            Active Sessions
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">Current Session</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Admin Portal • Active now</p>
                                                </div>
                                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">
                                                    Current
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleLogoutAllSessions}
                                            className="mt-4 text-sm text-red-600 dark:text-red-400 hover:text-red-700 font-medium"
                                        >
                                            Log out all sessions
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                                    Appearance Settings
                                </h2>
                                <div className="space-y-6">
                                    {/* Theme */}
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                                            Theme
                                        </h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            {['Light', 'Dark', 'System'].map((theme) => (
                                                <button
                                                    key={theme}
                                                    className={cn(
                                                        'p-4 border rounded-lg text-center transition-colors',
                                                        theme === 'System'
                                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                                            : 'border-slate-200 dark:border-slate-600 hover:border-primary-300 text-slate-700 dark:text-slate-300'
                                                    )}
                                                >
                                                    {theme}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Compact Mode */}
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">Compact Mode</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Use smaller spacing and font sizes</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'system' && (
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                                    System Information
                                </h2>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Application Version', value: '1.0.0' },
                                        { label: 'API Version', value: 'v1' },
                                        { label: 'Environment', value: 'Production' },
                                        { label: 'Last Updated', value: new Date().toLocaleDateString() },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                            <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                                            <span className="font-medium text-slate-900 dark:text-white">{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Clear Cache */}
                                <div className="mt-6 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">Clear Local Cache</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Remove cached data and refresh the application</p>
                                        </div>
                                        <button className="px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                            Clear Cache
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Save Button — shown only on profile tab */}
                        {activeTab === 'profile' && (
                            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                                <button
                                    onClick={handleProfileSave}
                                    disabled={profileSaving}
                                    className={cn(
                                        'flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-lg transition-colors',
                                        profileSaved
                                            ? 'bg-green-600 text-white'
                                            : 'bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50'
                                    )}
                                >
                                    {profileSaved ? (
                                        <><Check className="w-4 h-4" /> Saved</>
                                    ) : profileSaving ? 'Saving...' : (
                                        <><Save className="w-4 h-4" /> Save Changes</>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;
