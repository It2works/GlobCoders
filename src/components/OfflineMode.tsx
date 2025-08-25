import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    WifiOff,
    RefreshCw,
    AlertTriangle,
    BookOpen,
    Users,
    MessageCircle,
    Clock,
    CheckCircle
} from 'lucide-react';

interface OfflineModeProps {
    onRetry?: () => void;
    isOnline?: boolean;
}

export const OfflineMode: React.FC<OfflineModeProps> = ({ onRetry, isOnline = false }) => {
    const [offlineData, setOfflineData] = useState({
        courses: JSON.parse(localStorage.getItem('offline_courses') || '[]'),
        user: JSON.parse(localStorage.getItem('offline_user') || 'null'),
        lastSync: localStorage.getItem('last_sync') || null
    });

    const handleRetry = () => {
        onRetry?.();
    };

    const getLastSyncText = () => {
        if (!offlineData.lastSync) return 'Never';
        const date = new Date(offlineData.lastSync);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hours ago`;
        return date.toLocaleDateString();
    };

    if (isOnline) {
        return null;
    }

    return (
        <div className="space-y-4">
            <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="text-orange-800 font-medium">
                            You're currently in offline mode
                        </div>
                        <div className="text-orange-600 text-sm">
                            Some features may be limited. Your data will sync when connection is restored.
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRetry}
                        className="ml-2"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                    </Button>
                </AlertDescription>
            </Alert>

            {/* Offline Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Available Courses
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{offlineData.courses.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Courses cached offline
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            User Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">Logged in</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {offlineData.user?.firstName} {offlineData.user?.lastName}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            Messages
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-</div>
                        <p className="text-xs text-muted-foreground">
                            Not available offline
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Last Sync
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-medium">{getLastSyncText()}</div>
                        <p className="text-xs text-muted-foreground">
                            Data sync status
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Offline Features */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Available Offline Features</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">✅ Available</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• View cached courses</li>
                                <li>• Read course content</li>
                                <li>• View user profile</li>
                                <li>• Basic navigation</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">❌ Not Available</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Send messages</li>
                                <li>• Enroll in courses</li>
                                <li>• Take quizzes</li>
                                <li>• Real-time updates</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Connection Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <WifiOff className="h-5 w-5" />
                        Connection Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Internet Connection</span>
                            <Badge variant="destructive">Offline</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Backend Server</span>
                            <Badge variant="destructive">Unreachable</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Data Sync</span>
                            <Badge variant="secondary">Pending</Badge>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                        <Button
                            onClick={handleRetry}
                            className="w-full"
                            variant="outline"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Check Connection
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}; 