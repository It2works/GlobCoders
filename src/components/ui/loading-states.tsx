import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { Alert, AlertDescription } from './alert';

// Loading spinner component
export const LoadingSpinner = ({ size = 'default', text = 'Loading...' }: {
    size?: 'sm' | 'default' | 'lg';
    text?: string;
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        default: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    return (
        <div className="flex items-center justify-center space-x-2">
            <Loader2 className={`${sizeClasses[size]} animate-spin`} />
            {text && <span className="text-sm text-muted-foreground">{text}</span>}
        </div>
    );
};

// Error state component
export const ErrorState = ({
    error,
    onRetry,
    title = 'Something went wrong'
}: {
    error: string;
    onRetry?: () => void;
    title?: string;
}) => {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">{title}</p>
                        <p className="text-sm">{error}</p>
                    </div>
                    {onRetry && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRetry}
                            className="ml-4"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                    )}
                </div>
            </AlertDescription>
        </Alert>
    );
};

// Skeleton loading component
export const Skeleton = ({ className = 'h-4 w-full' }: { className?: string }) => {
    return (
        <div className={`animate-pulse bg-muted rounded ${className}`} />
    );
};

// Course card skeleton
export const CourseCardSkeleton = () => {
    return (
        <div className="bg-card rounded-lg border p-4 space-y-3">
            <div className="flex items-center space-x-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-20 rounded" />
            </div>
        </div>
    );
};

// Quiz card skeleton
export const QuizCardSkeleton = () => {
    return (
        <div className="bg-card rounded-lg border p-4 space-y-3">
            <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-24 rounded" />
            </div>
        </div>
    );
};

// Notification skeleton
export const NotificationSkeleton = () => {
    return (
        <div className="flex items-start space-x-3 p-3 border-b last:border-b-0">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/3" />
            </div>
        </div>
    );
};

// Dashboard stats skeleton
export const DashboardStatsSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card rounded-lg border p-4 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                </div>
            ))}
        </div>
    );
};

// Progress bar skeleton
export const ProgressBarSkeleton = () => {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
        </div>
    );
};

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }: {
    rows?: number;
    columns?: number;
}) => {
    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex space-x-4">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-20" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex space-x-4">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton key={colIndex} className="h-4 w-20" />
                    ))}
                </div>
            ))}
        </div>
    );
};

// Empty state component
export const EmptyState = ({
    title,
    description,
    icon: Icon,
    action
}: {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    action?: React.ReactNode;
}) => {
    return (
        <div className="text-center py-8">
            <Icon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{title}</h3>
            <p className="text-muted-foreground mb-4">{description}</p>
            {action && <div>{action}</div>}
        </div>
    );
}; 