import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, User, Plus, Video } from 'lucide-react';

interface Meeting {
  id: number;
  studentName: string;
  date: Date;
  startTime: string;
  duration: number; // en minutes
  type: 'individual' | 'group';
  subject: string;
  description?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const TeacherCalendar = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: 1,
      studentName: "Paul Martin",
      date: new Date(),
      startTime: "14:00",
      duration: 60,
      type: "individual",
      subject: "Révision Python - Variables",
      description: "Aide sur les concepts de base des variables en Python",
      status: "scheduled"
    },
    {
      id: 2,
      studentName: "Sophie Chen",
      date: new Date(),
      startTime: "16:00",
      duration: 45,
      type: "individual",
      subject: "Projet IA - Questions",
      description: "Discussion sur le projet d'intelligence artificielle",
      status: "scheduled"
    },
    {
      id: 3,
      studentName: "Groupe A",
      date: new Date(Date.now() + 86400000), // demain
      startTime: "10:00",
      duration: 90,
      type: "group",
      subject: "Atelier JavaScript",
      description: "Session de groupe sur les fonctions JavaScript",
      status: "scheduled"
    }
  ]);

  const [newMeeting, setNewMeeting] = useState({
    studentName: '',
    startTime: '',
    duration: 60,
    type: 'individual' as 'individual' | 'group',
    subject: '',
    description: ''
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const selectedMeetings = meetings.filter(meeting => 
    selectedDate && isSameDay(meeting.date, selectedDate)
  );

  const getMeetingDates = () => {
    return meetings.map(meeting => meeting.date);
  };

  const handleCreateMeeting = () => {
    if (!selectedDate || !newMeeting.studentName || !newMeeting.startTime || !newMeeting.subject) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const meeting: Meeting = {
      id: Date.now(),
      studentName: newMeeting.studentName,
      date: selectedDate,
      startTime: newMeeting.startTime,
      duration: newMeeting.duration,
      type: newMeeting.type,
      subject: newMeeting.subject,
      description: newMeeting.description,
      status: 'scheduled'
    };

    setMeetings([...meetings, meeting]);
    setNewMeeting({
      studentName: '',
      startTime: '',
      duration: 60,
      type: 'individual',
      subject: '',
      description: ''
    });
    setIsDialogOpen(false);

    toast({
      title: "Rendez-vous créé",
      description: "Le rendez-vous a été programmé avec succès"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programmé';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendrier */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Calendrier des rendez-vous
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau RDV
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Programmer un rendez-vous</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nom de l'élève/Groupe</Label>
                      <Input
                        value={newMeeting.studentName}
                        onChange={(e) => setNewMeeting(prev => ({ ...prev, studentName: e.target.value }))}
                        placeholder="Paul Martin"
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select 
                        value={newMeeting.type} 
                        onValueChange={(value: 'individual' | 'group') => setNewMeeting(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individuel</SelectItem>
                          <SelectItem value="group">Groupe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Heure de début</Label>
                      <Input
                        type="time"
                        value={newMeeting.startTime}
                        onChange={(e) => setNewMeeting(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Durée (minutes)</Label>
                      <Select 
                        value={newMeeting.duration.toString()} 
                        onValueChange={(value) => setNewMeeting(prev => ({ ...prev, duration: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 min</SelectItem>
                          <SelectItem value="45">45 min</SelectItem>
                          <SelectItem value="60">1 heure</SelectItem>
                          <SelectItem value="90">1h30</SelectItem>
                          <SelectItem value="120">2 heures</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Sujet</Label>
                    <Input
                      value={newMeeting.subject}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Révision Python - Variables"
                    />
                  </div>

                  <div>
                    <Label>Description (optionnel)</Label>
                    <Textarea
                      value={newMeeting.description}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Détails du rendez-vous..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleCreateMeeting}>
                      Programmer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{
              hasEvents: getMeetingDates()
            }}
            modifiersStyles={{
              hasEvents: { 
                backgroundColor: 'hsl(var(--primary))', 
                color: 'hsl(var(--primary-foreground))',
                borderRadius: '50%'
              }
            }}
            locale={fr}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Rendez-vous du jour sélectionné */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }) : 'Sélectionnez une date'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedMeetings.length > 0 ? (
            <div className="space-y-4">
              {selectedMeetings
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((meeting) => (
                <Card key={meeting.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Clock className="h-4 w-4" />
                        {meeting.startTime}
                      </div>
                      <Badge variant="outline">
                        {meeting.duration} min
                      </Badge>
                      <Badge variant={getStatusColor(meeting.status)}>
                        {getStatusText(meeting.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {meeting.type === 'individual' ? (
                        <User className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Video className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Badge variant={meeting.type === 'individual' ? 'default' : 'secondary'}>
                        {meeting.type === 'individual' ? 'Individuel' : 'Groupe'}
                      </Badge>
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-sm mb-1">{meeting.subject}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Avec: {meeting.studentName}
                  </p>
                  
                  {meeting.description && (
                    <p className="text-xs text-muted-foreground">
                      {meeting.description}
                    </p>
                  )}
                  
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">
                      Modifier
                    </Button>
                    <Button size="sm" variant="outline">
                      Annuler
                    </Button>
                    {meeting.status === 'scheduled' && (
                      <Button size="sm">
                        Rejoindre
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun rendez-vous programmé pour cette date</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Programmer un rendez-vous
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherCalendar;