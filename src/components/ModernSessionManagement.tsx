import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, User, Calendar as CalendarIcon, Trophy, Lock, Unlock } from 'lucide-react';
import { Session, TeacherAvailability } from '@/services/types';
import { SessionService, TeacherAvailabilityService } from '@/services/sessions';
import { useAuth } from '@/contexts/AuthContext';

interface ModernSessionManagementProps {
    teacherId: string;
}

const ModernSessionManagement: React.FC<ModernSessionManagementProps> = ({ teacherId }) => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [availability, setAvailability] = useState<TeacherAvailability[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [quizAccessSettings, setQuizAccessSettings] = useState<Record<string, boolean>>({});

    useEffect(() => {
        loadData();
    }, [teacherId]);

    // Load quiz access settings from localStorage or API
    useEffect(() => {
        const savedSettings = localStorage.getItem(`quizAccess_${teacherId}`);
        if (savedSettings) {
            try {
                setQuizAccessSettings(JSON.parse(savedSettings));
            } catch (error) {
                console.error('Error loading quiz access settings:', error);
            }
        }
    }, [teacherId]);

    const loadData = async () => {
        try {
            setIsLoading(true);

            // Load teacher's booked sessions (created by students)
            const sessionsResponse = await TeacherAvailabilityService.getTeacherSessions(teacherId, {
                limit: 50,
                page: 1
            });
            // Handle both paginated and direct response formats
            const sessionsData = sessionsResponse.data || sessionsResponse;
            setSessions(Array.isArray(sessionsData) ? sessionsData : []);

            // Load teacher's availability settings
            const availabilityResponse = await TeacherAvailabilityService.getTeacherAvailability(teacherId);
            setAvailability(availabilityResponse.availability);
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de charger les sessions et disponibilités",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle quiz access toggle for a session
    const handleQuizAccessToggle = async (sessionId: string, enabled: boolean) => {
        try {
            // Update local state
            const newSettings = { ...quizAccessSettings, [sessionId]: enabled };
            setQuizAccessSettings(newSettings);

            // Save to localStorage
            localStorage.setItem(`quizAccess_${teacherId}`, JSON.stringify(newSettings));

            // Update session in backend (optional - you can implement this API endpoint)
            try {
                // For now, just log the change - implement backend API later
                console.log(`Quiz access ${enabled ? 'enabled' : 'disabled'} for session ${sessionId}`);
            } catch (error) {
                console.log('Backend update not implemented yet, using local storage only');
            }

            toast({
                title: enabled ? "Quiz activé" : "Quiz désactivé",
                description: enabled
                    ? "Les étudiants pourront passer le quiz après cette session"
                    : "Les étudiants ne pourront plus passer le quiz après cette session",
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de modifier l'accès au quiz",
                variant: "destructive"
            });
        }
    };

    const handleUpdateAttendance = async (sessionId: string, studentId: string, attendance: 'pending' | 'present' | 'absent') => {
        try {
            await SessionService.updateAttendance(sessionId, {
                sessionId,
                studentId,
                attendance
            });
            // Update local state
            setSessions(prev => prev.map(session => {
                if (session._id === sessionId) {
                    return {
                        ...session,
                        enrolled: session.enrolled.map(enrollment =>
                            enrollment.student === studentId
                                ? { ...enrollment, attendance }
                                : enrollment
                        )
                    };
                }
                return session;
            }));

            toast({
                title: "Présence mise à jour",
                description: "La présence de l'étudiant a été mise à jour"
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de mettre à jour la présence",
                variant: "destructive"
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'default';
            case 'ongoing': return 'secondary';
            case 'completed': return 'default';
            case 'cancelled': return 'destructive';
            default: return 'secondary';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'scheduled': return 'Planifiée';
            case 'ongoing': return 'En cours';
            case 'completed': return 'Terminée';
            case 'cancelled': return 'Annulée';
            default: return status;
        }
    };

    const getAttendanceColor = (attendance: string) => {
        switch (attendance) {
            case 'present': return 'default';
            case 'absent': return 'destructive';
            case 'pending': return 'secondary';
            default: return 'secondary';
        }
    };

    const getAttendanceText = (attendance: string) => {
        switch (attendance) {
            case 'present': return 'Présent';
            case 'absent': return 'Absent';
            case 'pending': return 'En attente';
            default: return attendance;
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Chargement des sessions...</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-muted rounded"></div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        Sessions Réservées ({sessions.length})
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                        Les étudiants réservent des sessions selon votre disponibilité
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96">
                    <div className="space-y-4">
                        {sessions.length > 0 ? (
                            sessions
                                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                                .map((session) => (
                                    <Card key={session._id} className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{session.title}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {session.description}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Clock className="h-4 w-4" />
                                                    <span className="text-sm">
                                                        {format(new Date(session.startTime), 'EEEE d MMMM yyyy', { locale: fr })}
                                                        de {format(new Date(session.startTime), 'HH:mm')} à {format(new Date(session.endTime), 'HH:mm')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <User className="h-4 w-4" />
                                                    <span className="text-sm text-muted-foreground">
                                                        {session.enrolled.length} / {session.capacity} étudiants inscrits
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={getStatusColor(session.status)}>
                                                    {getStatusText(session.status)}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Enrolled Students */}
                                        {session.enrolled.length > 0 && (
                                            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                                                <h5 className="font-medium mb-2">Étudiants inscrits</h5>
                                                <div className="space-y-2">
                                                    {session.enrolled.map((enrollment, index) => (
                                                        <div key={index} className="flex items-center justify-between">
                                                            <span className="text-sm">Étudiant {enrollment.student}</span>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant={getAttendanceColor(enrollment.attendance)}>
                                                                    {getAttendanceText(enrollment.attendance)}
                                                                </Badge>
                                                                <select
                                                                    value={enrollment.attendance}
                                                                    onChange={(e) => handleUpdateAttendance(
                                                                        session._id,
                                                                        enrollment.student,
                                                                        e.target.value as 'pending' | 'present' | 'absent'
                                                                    )}
                                                                    className="text-xs border rounded px-2 py-1"
                                                                >
                                                                    <option value="pending">En attente</option>
                                                                    <option value="present">Présent</option>
                                                                    <option value="absent">Absent</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Session Details */}
                                        <div className="mt-3 text-sm text-muted-foreground">
                                            <p>Type: {session.sessionType}</p>
                                            {session.meetingLink && (
                                                <p>Lien: <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{session.meetingLink}</a></p>
                                            )}
                                            {session.notes && <p>Notes: {session.notes}</p>}
                                        </div>

                                        {/* Quiz Access Control */}
                                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Trophy className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm font-medium text-blue-800">
                                                        Accès au Quiz
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={quizAccessSettings[session._id] || false}
                                                        onCheckedChange={(enabled) => handleQuizAccessToggle(session._id, enabled)}
                                                        className="data-[state=checked]:bg-blue-600"
                                                    />
                                                    <span className="text-xs text-blue-600">
                                                        {quizAccessSettings[session._id] ? (
                                                            <span className="flex items-center gap-1">
                                                                <Unlock className="h-3 w-3" />
                                                                Activé
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1">
                                                                <Lock className="h-3 w-3" />
                                                                Désactivé
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-blue-600 mt-2">
                                                {quizAccessSettings[session._id]
                                                    ? "Les étudiants pourront passer le quiz après cette session"
                                                    : "Les étudiants ne pourront pas passer le quiz après cette session"
                                                }
                                            </p>
                                        </div>
                                    </Card>
                                ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Aucune session réservée</p>
                                <p className="text-sm">Les étudiants réserveront des sessions selon votre disponibilité</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default ModernSessionManagement;
