import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Calendar as CalendarIcon, Clock, Users, Copy, X } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface BulkSessionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (sessions: any[]) => void
  courses: any[]
}

const BulkSessionModal = ({ isOpen, onClose, onSave, courses }: BulkSessionModalProps) => {
  const { toast } = useToast()
  const [sessions, setSessions] = useState([{
    id: Date.now(),
    courseId: "",
    title: "",
    date: new Date(),
    startTime: "10:00",
    endTime: "11:00",
    maxStudents: 10,
    type: "individual"
  }])

  const addSession = () => {
    setSessions([...sessions, {
      id: Date.now(),
      courseId: "",
      title: "",
      date: new Date(),
      startTime: "10:00",
      endTime: "11:00",
      maxStudents: 10,
      type: "individual"
    }])
  }

  const removeSession = (id: number) => {
    setSessions(sessions.filter(s => s.id !== id))
  }

  const updateSession = (id: number, field: string, value: any) => {
    setSessions(sessions.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ))
  }

  const duplicateSession = (id: number) => {
    const sessionToDuplicate = sessions.find(s => s.id === id)
    if (sessionToDuplicate) {
      const newSession = {
        ...sessionToDuplicate,
        id: Date.now(),
        title: sessionToDuplicate.title + " (Copie)"
      }
      setSessions([...sessions, newSession])
    }
  }

  const handleSubmit = () => {
    // Validate sessions
    const invalidSessions = sessions.filter(s => 
      !s.courseId || !s.title || !s.date || !s.startTime || !s.endTime
    )

    if (invalidSessions.length > 0) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      })
      return
    }

    onSave(sessions)
    toast({
      title: "Sessions créées !",
      description: `${sessions.length} session(s) créée(s) avec succès`
    })
    onClose()
    setSessions([{
      id: Date.now(),
      courseId: "",
      title: "",
      date: new Date(),
      startTime: "10:00",
      endTime: "11:00",
      maxStudents: 10,
      type: "individual"
    }])
  }

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Création de Sessions en Lot</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {sessions.map((session, index) => (
            <div key={session.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Session {index + 1}</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => duplicateSession(session.id)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Dupliquer
                  </Button>
                  {sessions.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeSession(session.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cours *</Label>
                  <Select 
                    value={session.courseId} 
                    onValueChange={(value) => updateSession(session.id, 'courseId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un cours" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Titre de la session *</Label>
                  <Input
                    value={session.title}
                    onChange={(e) => updateSession(session.id, 'title', e.target.value)}
                    placeholder="Ex: Introduction aux variables"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Calendar
                    mode="single"
                    selected={session.date}
                    onSelect={(date) => date && updateSession(session.id, 'date', date)}
                    locale={fr}
                    className="rounded-md border"
                  />
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Heure de début *</Label>
                      <Select
                        value={session.startTime}
                        onValueChange={(value) => updateSession(session.id, 'startTime', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Heure de fin *</Label>
                      <Select
                        value={session.endTime}
                        onValueChange={(value) => updateSession(session.id, 'endTime', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Nombre max d'étudiants</Label>
                    <Input
                      type="number"
                      value={session.maxStudents}
                      onChange={(e) => updateSession(session.id, 'maxStudents', parseInt(e.target.value))}
                      min="1"
                      max="50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Type de session</Label>
                    <Select
                      value={session.type}
                      onValueChange={(value) => updateSession(session.id, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individuel</SelectItem>
                        <SelectItem value="group">Groupe</SelectItem>
                        <SelectItem value="workshop">Atelier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Session Preview */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-sm">
                  <strong>Aperçu:</strong> {session.title || "Titre non défini"} - {" "}
                  {session.date ? format(session.date, "dd/MM/yyyy", { locale: fr }) : "Date non définie"} de {session.startTime} à {session.endTime}
                  <Badge variant="outline" className="ml-2">
                    {session.type === "individual" ? "Individuel" : 
                     session.type === "group" ? "Groupe" : "Atelier"}
                  </Badge>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between">
            <Button variant="outline" onClick={addSession}>
              Ajouter une session
            </Button>
            
            <div className="text-sm text-muted-foreground">
              {sessions.length} session(s) à créer
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleSubmit}>
              Créer {sessions.length} session(s)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { BulkSessionModal }