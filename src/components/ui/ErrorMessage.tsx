import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
    message?: string;
    title?: string;
    onRetry?: () => void;
    className?: string;
}

export function ErrorMessage({
    message = 'Something went wrong. Please try again.',
    title = 'Error',
    onRetry,
    className = '',
}: ErrorMessageProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-center max-w-md mb-4">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </button>
            )}
        </div>
    );
}

export function InlineError({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>{message}</span>
        </div>
    );
}
