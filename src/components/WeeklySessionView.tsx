import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, User, Users, Video, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Session } from '@/services/types';

interface WeeklySessionViewProps {
    sessions: Session[];
    onSessionSelect: (session: Session) => void;
}

const WeeklySessionView: React.FC<WeeklySessionViewProps> = ({ sessions, onSessionSelect }) => {
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [currentWeekEnd, setCurrentWeekEnd] = useState(endOfWeek(new Date(), { weekStartsOn: 1 }));

    // Generate week days
    const weekDays = eachDayOfInterval({
        start: currentWeekStart,
        end: currentWeekEnd
    });

    // Navigate to previous week
    const goToPreviousWeek = () => {
        const newStart = addDays(currentWeekStart, -7);
        setCurrentWeekStart(newStart);
        setCurrentWeekEnd(addDays(newStart, 6));
    };

    // Navigate to next week
    const goToNextWeek = () => {
        const newStart = addDays(currentWeekStart, 7);
        setCurrentWeekStart(newStart);
        setCurrentWeekEnd(addDays(newStart, 6));
    };

    // Get sessions for a specific day with safety check
    const getSessionsForDay = (date: Date) => {
        return sessions && Array.isArray(sessions) ? sessions.filter(session =>
            isSameDay(new Date(session.startTime), date)
        ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()) : [];
    };

    // Get session status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'default';
            case 'ongoing': return 'secondary';
            case 'completed': return 'success';
            case 'cancelled': return 'destructive';
            default: return 'outline';
        }
    };

    // Get session status text in French
    const getStatusText = (status: string) => {
        switch (status) {
            case 'scheduled': return 'Programmée';
            case 'ongoing': return 'En cours';
            case 'completed': return 'Terminée';
            case 'cancelled': return 'Annulée';
            default: return status;
        }
    };

    // Format time for display
    const formatTime = (date: Date) => {
        return format(new Date(date), 'HH:mm');
    };

    // Get session duration
    const getSessionDuration = (startTime: Date, endTime: Date) => {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const diffMs = end.getTime() - start.getTime();
        const diffMins = Math.round(diffMs / 60000);
        return diffMins;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        Vue Hebdomadaire des Sessions
                    </CardTitle>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToPreviousWeek}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <span className="text-sm font-medium">
                            {format(currentWeekStart, 'd MMM', { locale: fr })} - {format(currentWeekEnd, 'd MMM yyyy', { locale: fr })}
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToNextWeek}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <ScrollArea className="h-[600px]">
                    <div className="grid grid-cols-7 gap-4">
                        {/* Day Headers */}
                        {weekDays.map((day) => (
                            <div key={day.toISOString()} className="text-center">
                                <div className="font-medium text-sm text-muted-foreground mb-2">
                                    {format(day, 'EEE', { locale: fr })}
                                </div>
                                <div className={`text-lg font-bold ${isSameDay(day, new Date()) ? 'text-primary' : 'text-foreground'
                                    }`}>
                                    {format(day, 'd', { locale: fr })}
                                </div>
                            </div>
                        ))}

                        {/* Day Content */}
                        {weekDays.map((day) => {
                            const daySessions = getSessionsForDay(day);

                            return (
                                <div key={day.toISOString()} className="min-h-[500px] border rounded-lg p-2">
                                    {daySessions.length > 0 ? (
                                        <div className="space-y-2">
                                            {daySessions.map((session) => (
                                                <Card
                                                    key={session._id}
                                                    className="p-2 cursor-pointer hover:shadow-md transition-shadow"
                                                    onClick={() => onSessionSelect(session)}
                                                >
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <Badge
                                                                variant={getStatusColor(session.status)}
                                                                className="text-xs"
                                                            >
                                                                {getStatusText(session.status)}
                                                            </Badge>
                                                        </div>

                                                        <h4 className="font-medium text-xs line-clamp-2">
                                                            {session.title || 'Session sans titre'}
                                                        </h4>

                                                        <div className="text-xs text-muted-foreground space-y-1">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                <span>
                                                                    {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-1">
                                                                <Users className="h-3 w-3" />
                                                                <span>{session.enrolled.length} étudiant{session.enrolled.length > 1 ? 's' : ''}</span>
                                                            </div>

                                                            {session.meetingLink && (
                                                                <div className="flex items-center gap-1">
                                                                    <Video className="h-3 w-3" />
                                                                    <span>Réunion</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted-foreground text-xs py-4">
                                            Aucune session
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default WeeklySessionView;
