import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppData } from '@/hooks/useAppData';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, User, CheckCircle, XCircle, Calendar as CalendarIcon } from 'lucide-react';

const SessionManagement = () => {
  const { sessions, users, courses, currentUser, respondToSession, disponibilites } = useAppData();
  const { toast } = useToast();
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showAlternativesModal, setShowAlternativesModal] = useState(false);
  const [selectedAlternatives, setSelectedAlternatives] = useState<Array<{ date: Date, heure: string }>>([]);

  // Get sessions for current teacher with safety checks
  const safeSessions = sessions && Array.isArray(sessions) ? sessions : [];
  const teacherSessions = safeSessions.filter(s => s.formateur_id === currentUser?.id);
  const pendingSessions = teacherSessions.filter(s => s.etat === 'en_attente');

  const safeDisponibilites = disponibilites && Array.isArray(disponibilites) ? disponibilites : [];
  const teacherDisponibilite = safeDisponibilites.find(d => d.formateur_id === currentUser?.id);

  const getDayName = (date: Date): string => {
    const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    return days[date.getDay()];
  };

  const getAvailableAlternatives = (): Array<{ date: Date, heure: string }> => {
    if (!teacherDisponibilite) return [];

    const alternatives: Array<{ date: Date, heure: string }> = [];
    const today = new Date();

    // Check next 4 weeks
    for (let week = 0; week < 4; week++) {
      const weekStart = addDays(startOfWeek(today, { weekStartsOn: 1 }), week * 7);

      for (let day = 0; day < 7; day++) {
        const currentDate = addDays(weekStart, day);
        const dayName = getDayName(currentDate);

        const dayAvailability = teacherDisponibilite.jours.find(j => j.jour === dayName);

        if (dayAvailability && currentDate >= today) {
          // Filter out already booked sessions
          const bookedTimes = safeSessions
            .filter(s => s.formateur_id === currentUser?.id &&
              s.date.toDateString() === currentDate.toDateString() &&
              s.etat !== 'refuse')
            .map(s => s.heure);

          const availableTimes = dayAvailability.heures.filter(heure =>
            !bookedTimes.includes(heure)
          );

          availableTimes.forEach(heure => {
            alternatives.push({ date: currentDate, heure });
          });
        }
      }
    }

    return alternatives;
  };

  const handleAcceptSession = (sessionId: number) => {
    respondToSession(sessionId, 'accepte');
    toast({
      title: "Session acceptée",
      description: "La session a été acceptée et l'élève a été notifié"
    });
  };

  const handleRefuseSession = (sessionId: number) => {
    respondToSession(sessionId, 'refuse');
    toast({
      title: "Session refusée",
      description: "La session a été refusée et l'élève a été notifié"
    });
  };

  const handleProposeAlternatives = (session: any) => {
    setSelectedSession(session);
    setShowAlternativesModal(true);
    setSelectedAlternatives([]);
  };

  const toggleAlternative = (alternative: { date: Date, heure: string }) => {
    setSelectedAlternatives(prev => {
      const exists = prev.some(alt =>
        alt.date.toDateString() === alternative.date.toDateString() &&
        alt.heure === alternative.heure
      );

      if (exists) {
        return prev.filter(alt =>
          !(alt.date.toDateString() === alternative.date.toDateString() &&
            alt.heure === alternative.heure)
        );
      } else {
        return [...prev, alternative];
      }
    });
  };

  const handleSendAlternatives = () => {
    if (selectedSession && selectedAlternatives.length > 0) {
      respondToSession(selectedSession.id, 'refuse', selectedAlternatives);
      toast({
        title: "Alternatives proposées",
        description: `${selectedAlternatives.length} créneaux alternatifs ont été proposés à l'élève`
      });
      setShowAlternativesModal(false);
      setSelectedSession(null);
      setSelectedAlternatives([]);
    }
  };

  const getStatusColor = (etat: string) => {
    switch (etat) {
      case 'en_attente': return 'secondary';
      case 'accepte': return 'default';
      case 'refuse': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (etat: string) => {
    switch (etat) {
      case 'en_attente': return 'En attente';
      case 'accepte': return 'Acceptée';
      case 'refuse': return 'Refusée';
      default: return etat;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Gestion des Sessions ({pendingSessions.length} en attente)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {teacherSessions.length > 0 ? (
                teacherSessions
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((session) => {
                    const student = users.find(u => u.id === session.eleve_id);
                    const course = courses.find(c => c.id === session.cours_id);

                    return (
                      <Card key={session.id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold">{course?.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Élève: {student?.name}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">
                                {format(new Date(session.date), 'EEEE d MMMM yyyy', { locale: fr })} à {session.heure}
                              </span>
                            </div>
                          </div>
                          <Badge variant={getStatusColor(session.etat)}>
                            {getStatusText(session.etat)}
                          </Badge>
                        </div>

                        {session.etat === 'en_attente' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAcceptSession(session.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accepter
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleProposeAlternatives(session)}
                            >
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              Proposer alternatives
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRefuseSession(session.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Refuser
                            </Button>
                          </div>
                        )}

                        {session.etat === 'accepte' && (
                          <div className="mt-2 p-2 bg-green-50 rounded border-l-4 border-green-500">
                            <p className="text-sm text-green-700">
                              Session confirmée - N'oubliez pas de préparer le lien Zoom
                            </p>
                          </div>
                        )}
                      </Card>
                    );
                  })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune demande de session</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Alternatives Modal */}
      <Dialog open={showAlternativesModal} onOpenChange={setShowAlternativesModal}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Proposer des créneaux alternatifs</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-muted-foreground">
              Sélectionnez les créneaux que vous souhaitez proposer à l'élève en remplacement.
            </p>

            <ScrollArea className="h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {getAvailableAlternatives().map((alternative, index) => {
                  const isSelected = selectedAlternatives.some(alt =>
                    alt.date.toDateString() === alternative.date.toDateString() &&
                    alt.heure === alternative.heure
                  );

                  return (
                    <Button
                      key={index}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleAlternative(alternative)}
                      className="justify-start"
                    >
                      <div className="text-left">
                        <div className="font-medium">
                          {format(alternative.date, 'EEE d MMM', { locale: fr })}
                        </div>
                        <div className="text-xs opacity-75">
                          {alternative.heure}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-4 w-4 ml-auto" />
                      )}
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>

            {selectedAlternatives.length > 0 && (
              <div className="p-3 bg-primary/10 rounded border border-primary/20">
                <p className="font-medium text-primary mb-2">
                  {selectedAlternatives.length} créneau(x) sélectionné(s)
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedAlternatives.map((alt, index) => (
                    <Badge key={index} variant="secondary">
                      {format(alt.date, 'dd/MM', { locale: fr })} à {alt.heure}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowAlternativesModal(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSendAlternatives}
              disabled={selectedAlternatives.length === 0}
            >
              Envoyer les alternatives ({selectedAlternatives.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SessionManagement;