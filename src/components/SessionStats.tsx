import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, CheckCircle, Calendar, TrendingUp } from 'lucide-react';
import { Session } from '@/services/types';
import { format, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SessionStatsProps {
    sessions: Session[];
}

const SessionStats: React.FC<SessionStatsProps> = ({ sessions }) => {
    // Safety check: ensure sessions is an array
    const safeSessions = Array.isArray(sessions) ? sessions : [];

    // Calculate statistics with safety checks
    const totalSessions = safeSessions.length;
    const completedSessions = safeSessions.filter(s => s.status === 'completed').length;
    const cancelledSessions = safeSessions.filter(s => s.status === 'cancelled').length;
    const scheduledSessions = safeSessions.filter(s => s.status === 'scheduled').length;
    const ongoingSessions = safeSessions.filter(s => s.status === 'ongoing').length;

    // Today's sessions
    const todaySessions = safeSessions.filter(s => isToday(new Date(s.startTime)));

    // This week's sessions
    const thisWeekSessions = safeSessions.filter(s => isThisWeek(new Date(s.startTime), { weekStartsOn: 1 }));

    // This month's sessions
    const thisMonthSessions = safeSessions.filter(s => isThisMonth(new Date(s.startTime)));

    // Total students enrolled
    const totalStudents = safeSessions.reduce((total, session) => total + (session.enrolled?.length || 0), 0);

    // Average session duration
    const totalDuration = safeSessions.reduce((total, session) => {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        return total + (end.getTime() - start.getTime()) / 60000; // Convert to minutes
    }, 0);
    const averageDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;

    // Completion rate
    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    // Upcoming sessions (next 7 days)
    const upcomingSessions = safeSessions.filter(s => {
        const sessionDate = new Date(s.startTime);
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        return sessionDate > today && sessionDate <= nextWeek && s.status === 'scheduled';
    });

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Sessions */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSessions}</div>
                        <p className="text-xs text-muted-foreground">
                            {thisMonthSessions.length} ce mois
                        </p>
                    </CardContent>
                </Card>

                {/* Completed Sessions */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sessions Terminées</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{completedSessions}</div>
                        <p className="text-xs text-muted-foreground">
                            {completionRate}% de taux de réussite
                        </p>
                    </CardContent>
                </Card>

                {/* Today's Sessions */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sessions Aujourd'hui</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{todaySessions.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {thisWeekSessions.length} cette semaine
                        </p>
                    </CardContent>
                </Card>

                {/* Total Students */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Étudiants</CardTitle>
                        <Users className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{totalStudents}</div>
                        <p className="text-xs text-muted-foreground">
                            {averageDuration} min en moyenne
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Session Status Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Répartition des Sessions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm">Programmées</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{scheduledSessions}</span>
                                    <Badge variant="secondary" className="text-xs">
                                        {totalSessions > 0 ? Math.round((scheduledSessions / totalSessions) * 100) : 0}%
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-sm">Terminées</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{completedSessions}</span>
                                    <Badge variant="secondary" className="text-xs">
                                        {totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0}%
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                    <span className="text-sm">En cours</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{ongoingSessions}</span>
                                    <Badge variant="secondary" className="text-xs">
                                        {totalSessions > 0 ? Math.round((ongoingSessions / totalSessions) * 100) : 0}%
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <span className="text-sm">Annulées</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{cancelledSessions}</span>
                                    <Badge variant="secondary" className="text-xs">
                                        {totalSessions > 0 ? Math.round((cancelledSessions / totalSessions) * 100) : 0}%
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Sessions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Prochaines Sessions (7 jours)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {upcomingSessions.length > 0 ? (
                            <div className="space-y-3">
                                {upcomingSessions
                                    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                                    .slice(0, 5)
                                    .map((session) => (
                                        <div key={session._id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-sm line-clamp-1">
                                                    {session.title || 'Session sans titre'}
                                                </h4>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(session.startTime), 'EEEE d MMM à HH:mm', { locale: fr })}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {session.enrolled.length} étudiant{session.enrolled.length > 1 ? 's' : ''}
                                            </Badge>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-muted-foreground">
                                <p className="text-sm">Aucune session programmée</p>
                                <p className="text-xs mt-1">pour les 7 prochains jours</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default SessionStats;
