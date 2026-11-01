import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
                    <div className="max-w-lg w-full p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-red-100 dark:border-red-900/30">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Something went wrong</h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">An unexpected error has occurred.</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg mb-6 overflow-auto max-h-48">
                            <code className="text-xs text-red-600 dark:text-red-400 font-mono break-words">
                                {this.state.error?.message || 'Unknown error'}
                            </code>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors font-medium"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
