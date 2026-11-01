export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
    const sizeClasses = {
        sm: 'h-6 w-6 border-2',
        md: 'h-12 w-12 border-3',
        lg: 'h-16 w-16 border-4',
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div
                className={`animate-spin rounded-full border-primary-200 border-t-primary-600 ${sizeClasses[size]}`}
            />
        </div>
    );
}

export function PageLoader() {
    return (
        <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
        </div>
    );
}

export function InlineLoader() {
    return <LoadingSpinner size="sm" className="inline-block ml-2" />;
}
