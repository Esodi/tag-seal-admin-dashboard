import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <div className="text-center max-w-md w-full p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl">
                <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>

                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">404</h1>
                <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4">Page Not Found</h2>

                <p className="text-slate-500 dark:text-slate-400 mb-8">
                    The page you are looking for doesn't exist or has been moved.
                </p>

                <button
                    onClick={() => navigate('/')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors font-medium"
                >
                    <Home className="w-5 h-5" />
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}
