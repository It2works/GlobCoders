import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { format, isSameDay, parseISO, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, User, Users, FileText, MapPin, Calendar as CalendarIcon, Plus, Eye, CalendarDays, Edit as EditIcon, Trophy, Lock, Unlock, Play, Pause, StopCircle, CheckCircle2 } from 'lucide-react';
import { Session, TeacherAvailability } from '@/services/types';
import { SessionService, TeacherAvailabilityService } from '@/services/sessions';
import { useAuth } from '@/contexts/AuthContext';
import WeeklySessionView from './WeeklySessionView';
import SessionStats from './SessionStats';

interface TeacherSessionCalendarProps {
    teacherId: string;
}

interface SessionWithDetails extends Session {
    courseDetails?: {
        title: string;
        thumbnail?: string;
    };
    studentDetails?: Array<{
        firstName: string;
        lastName: string;
        avatar?: string;
    }>;
    // Ensure TS knows this field exists on sessions
    quizAccessEnabled?: boolean;
}

const TeacherSessionCalendar: React.FC<TeacherSessionCalendarProps> = ({ teacherId }) => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
    const [availability, setAvailability] = useState<TeacherAvailability[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState<SessionWithDetails | null>(null);
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'calendar' | 'weekly'>('calendar');

    // Meeting link editing state
    const [editingSession, setEditingSession] = useState<SessionWithDetails | null>(null);
    const [isMeetingLinkModalOpen, setIsMeetingLinkModalOpen] = useState(false);
    const [newMeetingLink, setNewMeetingLink] = useState('');
    const [isUpdatingMeetingLink, setIsUpdatingMeetingLink] = useState(false);

    useEffect(() => {
        if (teacherId && teacherId.trim() !== '') {
            loadData();
        }
    }, [teacherId]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            console.log('🔍 Loading sessions for teacher:', teacherId);

            // Load teacher's sessions
            const sessionsResponse = await TeacherAvailabilityService.getTeacherSessions(teacherId, {
                limit: 100,
                page: 1
            });
            console.log('📅 Sessions response:', sessionsResponse);

            // Load teacher's availability
            const availabilityResponse = await TeacherAvailabilityService.getTeacherAvailability(teacherId);
            console.log('⏰ Availability response:', availabilityResponse);

            // Support both paginated response { data: { sessions: [] }} and direct array []
            const sessionsData = ((sessionsResponse as any)?.data?.sessions
                || (sessionsResponse as any)?.data
                || (Array.isArray(sessionsResponse) ? sessionsResponse : [])
                || []) as any[];
            console.log('📊 Sessions data:', sessionsData);
            console.log('🔢 Number of sessions:', sessionsData.length);

            setSessions(sessionsData);
            setAvailability(availabilityResponse?.availability || []);
        } catch (error) {
            console.error('❌ Error loading data:', error);
            // Set empty arrays as fallback instead of showing error
            setSessions([]);
            setAvailability([]);
            toast({
                title: "Information",
                description: "Aucune session trouvée pour le moment",
                variant: "default"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Get sessions for selected date with safety check
    const selectedDateSessions = sessions && Array.isArray(sessions) ? sessions.filter(session =>
        selectedDate && isSameDay(new Date(session.startTime), selectedDate)
    ) : [];

    // Get all dates with sessions for calendar highlighting with safety check
    const getSessionDates = () => {
        return sessions && Array.isArray(sessions) ? sessions.map(session => new Date(session.startTime)) : [];
    };

    // Get session status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'default';
            case 'ongoing': return 'secondary';
            // Badge does not support 'success' variant; use 'secondary' for completed
            case 'completed': return 'secondary';
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

    // Handle session selection
    const handleSessionSelect = (session: SessionWithDetails) => {
        setSelectedSession(session);
        setIsSessionModalOpen(true);
    };

    // Handle attendance update
    const handleUpdateAttendance = async (sessionId: string, studentId: string, attendance: 'pending' | 'present' | 'absent') => {
        try {
            // Service expects a request object rather than 3 params
            await SessionService.updateAttendance(sessionId, { sessionId, studentId, attendance });
            toast({
                title: "Succès",
                description: "Présence mise à jour avec succès",
            });
            loadData(); // Reload data
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de mettre à jour la présence",
                variant: "destructive"
            });
        }
    };

    // Handle meeting link editing
    const handleEditMeetingLink = (session: SessionWithDetails) => {
        setEditingSession(session);
        setNewMeetingLink(session.meetingLink || '');
        setIsMeetingLinkModalOpen(true);
    };

    // Handle meeting link update
    const handleUpdateMeetingLink = async () => {
        if (!editingSession || !newMeetingLink.trim()) {
            toast({
                title: "Erreur",
                description: "Veuillez saisir un lien de réunion valide",
                variant: "destructive"
            });
            return;
        }

        try {
            setIsUpdatingMeetingLink(true);

            // Call API to update session meeting link
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/sessions/${editingSession._id}/meeting-link`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ meetingLink: newMeetingLink.trim() })
            });

            if (response.ok) {
                toast({
                    title: "Succès",
                    description: "Lien de réunion mis à jour avec succès",
                });

                // Update local state
                setSessions(prevSessions =>
                    prevSessions.map(s =>
                        s._id === editingSession._id
                            ? { ...s, meetingLink: newMeetingLink.trim() }
                            : s
                    )
                );

                // Close modal and reset state
                setIsMeetingLinkModalOpen(false);
                setEditingSession(null);
                setNewMeetingLink('');
            } else {
                throw new Error('Failed to update meeting link');
            }
        } catch (error) {
            console.error('Error updating meeting link:', error);
            toast({
                title: "Erreur",
                description: "Impossible de mettre à jour le lien de réunion",
                variant: "destructive"
            });
        } finally {
            setIsUpdatingMeetingLink(false);
        }
    };

    // Update session status
    const handleUpdateStatus = async (sessionId: string, status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled') => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/sessions/${sessionId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            if (!response.ok) throw new Error('Failed to update status');
            toast({ title: 'Succès', description: 'Statut de session mis à jour' });
            loadData();
        } catch (error) {
            toast({ title: 'Erreur', description: "Impossible de mettre à jour le statut", variant: 'destructive' });
        }
    };

    // Toggle quiz access
    const handleToggleQuizAccess = async (sessionId: string, enabled: boolean) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/sessions/${sessionId}/quiz-access`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ enabled })
            });
            if (!response.ok) throw new Error('Failed to update quiz access');
            toast({ title: 'Succès', description: 'Accès au quiz mis à jour' });
            loadData();
        } catch (error) {
            toast({ title: 'Erreur', description: "Impossible de mettre à jour l'accès au quiz", variant: 'destructive' });
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        Calendrier des Sessions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Session Statistics */}
            <SessionStats sessions={sessions} />

            {/* View Mode Toggle */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5" />
                            Calendrier des Sessions
                        </CardTitle>

                        <div className="flex items-center gap-2">
                            <Button
                                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('calendar')}
                            >
                                <CalendarIcon className="h-4 w-4 mr-2" />
                                Vue Mensuelle
                            </Button>
                            <Button
                                variant={viewMode === 'weekly' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('weekly')}
                            >
                                <CalendarDays className="h-4 w-4 mr-2" />
                                Vue Hebdomadaire
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Calendar View */}
            {viewMode === 'calendar' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5" />
                            Vue Mensuelle
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            modifiers={{
                                hasSessions: getSessionDates()
                            }}
                            modifiersStyles={{
                                hasSessions: {
                                    backgroundColor: 'hsl(var(--primary))',
                                    color: 'hsl(var(--primary-foreground))',
                                    borderRadius: '50%',
                                    fontWeight: 'bold'
                                }
                            }}
                            locale={fr}
                            className="rounded-md border"
                        />
                    </CardContent>
                </Card>
            )}

            {/* Weekly View */}
            {viewMode === 'weekly' && (
                <WeeklySessionView
                    sessions={sessions}
                    onSessionSelect={(session) => {
                        setSelectedSession(session);
                        setIsSessionModalOpen(true);
                    }}
                />
            )}

            {/* Sessions for Selected Date */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Sessions du {selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }) : 'jour sélectionné'}
                        {selectedDateSessions.length > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {selectedDateSessions.length} session{selectedDateSessions.length > 1 ? 's' : ''}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {selectedDateSessions.length > 0 ? (
                        <ScrollArea className="h-96">
                            <div className="space-y-4">
                                {selectedDateSessions
                                    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                                    .map((session) => (
                                        <Card key={session._id} className="p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="font-semibold text-lg">
                                                            {session.title || 'Session sans titre'}
                                                        </h4>
                                                        <Badge variant={getStatusColor(session.status)}>
                                                            {getStatusText(session.status)}
                                                        </Badge>
                                                    </div>

                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        {session.description || 'Aucune description'}
                                                    </p>

                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            <span>
                                                                {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                                            </span>
                                                            <span className="ml-1">
                                                                ({getSessionDuration(session.startTime, session.endTime)} min)
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-1">
                                                            <Users className="h-4 w-4" />
                                                            <span>
                                                                {session.enrolled.length} étudiant{session.enrolled.length > 1 ? 's' : ''}
                                                            </span>
                                                        </div>


                                                    </div>
                                                </div>
                                            </div>

                                            {/* Students List */}
                                            {session.enrolled.length > 0 && (
                                                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                                    <h5 className="font-medium mb-2 text-sm">Étudiants inscrits :</h5>
                                                    <div className="space-y-2">
                                                        {session.enrolled.map((enrollment, index) => (
                                                            <div key={index} className="flex items-center justify-between text-sm">
                                                                <div className="flex items-center gap-2">
                                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                                    <span>
                                                                        {typeof enrollment.student === 'object' && enrollment.student ?
                                                                            `${(enrollment.student as any).firstName} ${(enrollment.student as any).lastName}` :
                                                                            'Étudiant inconnu'}
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    <Badge
                                                                        variant={enrollment.attendance === 'present' ? 'secondary' :
                                                                            enrollment.attendance === 'absent' ? 'destructive' : 'secondary'}
                                                                        className="text-xs"
                                                                    >
                                                                        {enrollment.attendance === 'present' ? 'Présent' :
                                                                            enrollment.attendance === 'absent' ? 'Absent' : 'En attente'}
                                                                    </Badge>

                                                                    {session.status === 'ongoing' && (
                                                                        <div className="flex gap-1">
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => handleUpdateAttendance(session._id, enrollment.student, 'present')}
                                                                                className="h-6 px-2 text-xs"
                                                                            >
                                                                                ✅
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => handleUpdateAttendance(session._id, enrollment.student, 'absent')}
                                                                                className="h-6 px-2 text-xs"
                                                                            >
                                                                                ❌
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Meeting Link Section */}
                                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h5 className="font-medium text-sm text-blue-800">Lien de réunion :</h5>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEditMeetingLink(session)}
                                                        className="h-6 px-2 text-xs text-blue-600 border-blue-300 hover:bg-blue-100"
                                                    >
                                                        <EditIcon className="h-3 w-3 mr-1" />
                                                        Modifier
                                                    </Button>
                                                </div>

                                                {session.meetingLink ? (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-blue-600" />
                                                        <a
                                                            href={session.meetingLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-blue-600 hover:underline break-all"
                                                        >
                                                            {session.meetingLink}
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-500 italic">
                                                        Aucun lien de réunion défini
                                                    </div>
                                                )}
                                            </div>

                                            {/* Status Actions */}
                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                {session.status !== 'ongoing' && session.status !== 'completed' && (
                                                    <Button size="sm" onClick={() => handleUpdateStatus(session._id, 'ongoing')}>
                                                        <Play className="h-4 w-4 mr-1" /> Démarrer
                                                    </Button>
                                                )}
                                                {session.status === 'ongoing' && (
                                                    <Button size="sm" variant="secondary" onClick={() => handleUpdateStatus(session._id, 'scheduled')}>
                                                        <Pause className="h-4 w-4 mr-1" /> Mettre en pause
                                                    </Button>
                                                )}
                                                {session.status !== 'completed' && (
                                                    <Button size="sm" variant="default" onClick={() => handleUpdateStatus(session._id, 'completed')}>
                                                        <CheckCircle2 className="h-4 w-4 mr-1" /> Terminer
                                                    </Button>
                                                )}
                                                {session.status !== 'cancelled' && (
                                                    <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(session._id, 'cancelled')}>
                                                        <StopCircle className="h-4 w-4 mr-1" /> Annuler
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Quiz Access Toggle - visible after completion */}
                                            <div className="mt-3 p-3 rounded border text-sm flex items-center justify-between" style={{ background: '#fff8e6', borderColor: '#facc15' }}>
                                                <div className="flex items-center gap-2">
                                                    <Trophy className="h-4 w-4 text-yellow-600" />
                                                    <span className="font-medium">Autoriser le quiz pour cette session</span>
                                                    {session.status !== 'completed' && (
                                                        <span className="text-xs text-muted-foreground">(Disponible après avoir marqué la session comme Terminée)</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" variant={session.quizAccessEnabled ? 'secondary' : 'outline'}
                                                        disabled={session.status !== 'completed'}
                                                        onClick={() => handleToggleQuizAccess(session._id, !session.quizAccessEnabled)}>
                                                        {session.quizAccessEnabled ? (
                                                            <><Unlock className="h-4 w-4 mr-1" /> Activé</>
                                                        ) : (
                                                            <><Lock className="h-4 w-4 mr-1" /> Désactivé</>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mt-3">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleSessionSelect(session)}
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Voir détails
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Aucune session programmée pour cette date</p>
                            <p className="text-sm mt-1">
                                Les sessions apparaîtront ici quand les étudiants s'inscriront à vos cours
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Session Details Modal */}
            <Dialog open={isSessionModalOpen} onOpenChange={setIsSessionModalOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Détails de la Session</DialogTitle>
                    </DialogHeader>

                    {selectedSession && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">{selectedSession.title}</h3>
                                <p className="text-muted-foreground">{selectedSession.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Date et heure</label>
                                    <p className="text-sm">
                                        {format(new Date(selectedSession.startTime), 'EEEE d MMMM yyyy à HH:mm', { locale: fr })}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Durée</label>
                                    <p className="text-sm">
                                        {getSessionDuration(selectedSession.startTime, selectedSession.endTime)} minutes
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Statut</label>
                                    <Badge variant={getStatusColor(selectedSession.status)}>
                                        {getStatusText(selectedSession.status)}
                                    </Badge>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Lien de réunion</label>
                                    <div className="text-sm">
                                        {selectedSession.meetingLink ? (
                                            <a
                                                href={selectedSession.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline break-all"
                                            >
                                                {selectedSession.meetingLink}
                                            </a>
                                        ) : (
                                            <span className="text-gray-500 italic">Aucun lien défini</span>
                                        )}
                                    </div>
                                </div>

                            </div>

                            {selectedSession.notes && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Notes</label>
                                    <p className="text-sm">{selectedSession.notes}</p>
                                </div>
                            )}

                            {selectedSession.materials && selectedSession.materials.length > 0 && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Matériaux</label>
                                    <div className="space-y-2">
                                        {selectedSession.materials.map((material, index) => (
                                            <div key={index} className="flex items-center gap-2 text-sm">
                                                <FileText className="h-4 w-4" />
                                                <a
                                                    href={material.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {material.name}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Meeting Link Edit Modal */}
            <Dialog open={isMeetingLinkModalOpen} onOpenChange={setIsMeetingLinkModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Modifier le lien de réunion</DialogTitle>
                    </DialogHeader>

                    {editingSession && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                    Session : {editingSession.title || 'Session sans titre'}
                                </label>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(editingSession.startTime), 'EEEE d MMMM yyyy à HH:mm', { locale: fr })}
                                </p>
                            </div>

                            <div>
                                <label htmlFor="meetingLink" className="text-sm font-medium text-muted-foreground mb-2 block">
                                    Lien de réunion
                                </label>
                                <input
                                    id="meetingLink"
                                    type="url"
                                    value={newMeetingLink}
                                    onChange={(e) => setNewMeetingLink(e.target.value)}
                                    placeholder="https://meet.google.com/..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Collez ici le lien de votre réunion Google Meet, Zoom, ou autre plateforme
                                </p>
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsMeetingLinkModalOpen(false);
                                        setEditingSession(null);
                                        setNewMeetingLink('');
                                    }}
                                    disabled={isUpdatingMeetingLink}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    onClick={handleUpdateMeetingLink}
                                    disabled={isUpdatingMeetingLink || !newMeetingLink.trim()}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {isUpdatingMeetingLink ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Mise à jour...
                                        </>
                                    ) : (
                                        'Enregistrer'
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TeacherSessionCalendar;
